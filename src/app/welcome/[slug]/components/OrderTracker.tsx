'use client';

import { useState, useEffect } from 'react';
import { Loader2, Clock, ChefHat, Truck, CheckCircle2, XCircle, Package, RefreshCw } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface TrackedItem {
  name: string;
  quantity: number;
  price: number;
}

interface TrackedOrder {
  id: string;
  type: 'roomservice' | 'marketplace';
  status: string;
  totalAmount: number;
  createdAt: string;
  items: TrackedItem[];
  merchantName?: string | null;
  merchantLogo?: string | null;
  deliveryMode?: string;
  deliveryAddress?: string | null;
}

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_STEPS: Record<string, { step: number; label: string; labelEn: string; icon: string; color: string }> = {
  pending:    { step: 0, label: 'En attente',       labelEn: 'Pending',      icon: '⏳', color: '#f59e0b' },
  confirmed:  { step: 1, label: 'Confirmé',         labelEn: 'Confirmed',    icon: '✅', color: '#3b82f6' },
  accepted:   { step: 1, label: 'Accepté',          labelEn: 'Accepted',     icon: '✅', color: '#3b82f6' },
  preparing:  { step: 2, label: 'En préparation',   labelEn: 'Preparing',    icon: '👨‍🍳', color: '#8b5cf6' },
  ready:      { step: 3, label: 'Prêt',             labelEn: 'Ready',        icon: '📦', color: '#06b6d4' },
  delivered:  { step: 4, label: 'Livré',            labelEn: 'Delivered',    icon: '✅', color: '#16a34a' },
  cancelled:  { step: -1, label: 'Annulé',          labelEn: 'Cancelled',    icon: '❌', color: '#ef4444' },
  refused:    { step: -1, label: 'Refusé',          labelEn: 'Refused',      icon: '❌', color: '#ef4444' },
};

const TIMELINE_STEPS = [
  { key: 'pending',   emoji: '⏳', label: 'Commandé',    labelEn: 'Ordered' },
  { key: 'confirmed', emoji: '✅', label: 'Confirmé',    labelEn: 'Confirmed' },
  { key: 'preparing', emoji: '👨‍🍳', label: 'Préparation', labelEn: 'Preparing' },
  { key: 'ready',     emoji: '📦', label: 'Prêt',        labelEn: 'Ready' },
  { key: 'delivered', emoji: '🟢', label: 'Livré',       labelEn: 'Delivered' },
];

interface OrderTrackerProps {
  agencyId: string;
  baggageId?: string;
  reference?: string;
  lang?: string;
  onReorder?: (order: TrackedOrder) => void;
}

export default function OrderTracker({ agencyId, baggageId, reference, lang = 'fr', onReorder }: OrderTrackerProps) {
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isFr = lang !== 'en';

  // Polling toutes les 15s
  useEffect(() => {
    let cancelled = false;
    const fetchOrders = async () => {
      let url = `/api/orders/tracking?agencyId=${agencyId}`;
      if (baggageId) url += `&baggageId=${baggageId}`;
      else if (reference) url += `&reference=${reference}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (!cancelled && data.success) setOrders(data.orders);
      } catch (e) { console.error(e); }
      finally { if (!cancelled) setLoading(false); }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [agencyId, baggageId, reference]);

  // Auto-expand first active order
  useEffect(() => {
    if (orders.length > 0 && !expandedId) {
      const active = orders.find((o) => !['delivered', 'cancelled', 'refused'].includes(o.status));
      if (active) setExpandedId(active.id);
    }
  }, [orders, expandedId]);

  // Shared mobile palette
  const OP = { text: '#1C1C1E', text2: '#8E8E93', accent: '#C9A961', accentDark: '#A8884A', accentBg: '#FFF9EE', card: '#FFFFFF', cardShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)', sep: '#E5E5EA' };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-4 h-4 animate-spin" style={{ color: OP.accent }} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 text-center" style={{ boxShadow: OP.cardShadow }}>
        <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
        <p className="text-[13px]" style={{ color: OP.text2 }}>
          {isFr ? 'Aucune commande pour l\'instant' : 'No orders yet'}
        </p>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => !['delivered', 'cancelled', 'refused'].includes(o.status));
  const pastOrders = orders.filter((o) => ['delivered', 'cancelled', 'refused'].includes(o.status));

  const renderTimeline = (order: TrackedOrder) => {
    const statusConfig = STATUS_STEPS[order.status] || STATUS_STEPS.pending;
    const currentStep = Math.max(0, statusConfig.step);

    return (
      <div className="flex items-center justify-between mt-3 px-1">
        {TIMELINE_STEPS.map((step, i) => {
          const isCompleted = i <= currentStep && currentStep >= 0;
          const isCurrent = i === currentStep && currentStep >= 0;
          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                  isCurrent ? 'ring-2 ring-offset-1' : ''
                }`}
                style={{
                  backgroundColor: isCompleted ? statusConfig.color : '#f3f4f6',
                  color: isCompleted ? 'white' : '#9ca3af',
                  ...(isCurrent ? { boxShadow: `0 0 0 2px white, 0 0 0 4px ${statusConfig.color}` } : {}),
                }}
              >
                {isCompleted ? step.emoji : (i + 1)}
              </div>
              <span
                className="text-[9px] mt-1 text-center leading-tight"
                style={{ color: isCompleted ? '#2C2C2C' : '#9ca3af' }}
              >
                {isFr ? step.label : step.labelEn}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderOrder = (order: TrackedOrder, isPast: boolean) => {
    const statusConfig = STATUS_STEPS[order.status] || STATUS_STEPS.pending;
    const isExpanded = expandedId === order.id;
    const timeAgo = getTimeAgo(order.createdAt, isFr);

    return (
      <div
        key={order.id}
        className="bg-white rounded-2xl overflow-hidden active:scale-[0.98] transition-transform"
        style={{ boxShadow: OP.cardShadow, opacity: isPast && !isExpanded ? 0.7 : 1 }}
      >
        <button
          onClick={() => setExpandedId(isExpanded ? null : order.id)}
          className="w-full p-3.5 text-left"
        >
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ backgroundColor: `${statusConfig.color}15` }}
            >
              {order.type === 'roomservice' ? '🍽️' : '🛍️'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm truncate" style={{ color: '#2C2C2C' }}>
                  {order.type === 'roomservice'
                    ? (isFr ? 'Room Service' : 'Room Service')
                    : order.merchantName || (isFr ? 'Marketplace' : 'Marketplace')}
                </p>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                  style={{ backgroundColor: `${statusConfig.color}15`, color: statusConfig.color }}
                >
                  {isFr ? statusConfig.label : statusConfig.labelEn}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs" style={{ color: '#6B6B6B' }}>{timeAgo}</span>
                <span className="text-xs font-bold" style={{ color: '#A8884A' }}>
                  {order.totalAmount.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              {/* Preview items */}
              <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#9ca3af' }}>
                {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
              </p>
            </div>
          </div>
        </button>

        {/* Expanded: timeline + items + reorder */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t" style={{ borderColor: '#E8E4DD' }}>
            {/* Timeline */}
            {!isPast && renderTimeline(order)}

            {/* Active status message */}
            {!isPast && (
              <div
                className="mt-3 p-3 rounded-xl text-sm"
                style={{ backgroundColor: `${statusConfig.color}10`, color: statusConfig.color }}
              >
                {order.status === 'preparing' && (isFr ? '👨‍🍳 Votre commande est en préparation…' : '👨‍🍳 Your order is being prepared…')}
                {order.status === 'ready' && (isFr ? '📦 Votre commande est prête !' : '📦 Your order is ready!')}
                {order.status === 'confirmed' && (isFr ? '✅ Commande confirmée par l\'établissement' : '✅ Order confirmed by the establishment')}
                {order.status === 'accepted' && (isFr ? '✅ Commande acceptée par le commerçant' : '✅ Order accepted by the merchant')}
                {order.status === 'pending' && (isFr ? '⏳ En attente de confirmation…' : '⏳ Waiting for confirmation…')}
              </div>
            )}

            {/* Items detail */}
            <div className="mt-3 space-y-1">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span style={{ color: '#2C2C2C' }}>{item.quantity}x {item.name}</span>
                  <span className="font-medium" style={{ color: '#6B6B6B' }}>{(item.price * item.quantity).toLocaleString('fr-FR')}</span>
                </div>
              ))}
            </div>

            {/* Re-order */}
            {isPast && order.status === 'delivered' && onReorder && (
              <button
                onClick={() => onReorder(order)}
                className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition border-2"
                style={{ borderColor: '#C9A961', color: '#A8884A' }}
              >
                <RefreshCw className="w-4 h-4" />
                {isFr ? 'Recommander' : 'Reorder'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Active orders */}
      {activeOrders.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: OP.accentDark }}>
            🔥 {isFr ? 'En cours' : 'Active'} ({activeOrders.length})
          </p>
          <div className="space-y-2">
            {activeOrders.map((o) => renderOrder(o, false))}
          </div>
        </div>
      )}

      {/* Past orders */}
      {pastOrders.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: OP.text2 }}>
            📋 {isFr ? 'Historique' : 'History'} ({pastOrders.length})
          </p>
          <div className="space-y-2">
            {pastOrders.slice(0, 5).map((o) => renderOrder(o, true))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Time ago helper ───────────────────────────────────────────────────────
function getTimeAgo(dateStr: string, isFr: boolean): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return isFr ? 'À l\'instant' : 'Just now';
  if (mins < 60) return isFr ? `Il y a ${mins}min` : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return isFr ? `Il y a ${hours}h` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return isFr ? `Il y a ${days}j` : `${days}d ago`;
}
