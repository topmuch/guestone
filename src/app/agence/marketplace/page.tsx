'use client';

import { useState, useEffect } from 'react';
import { Loader2, Store, CheckCircle2, XCircle, TrendingUp, Package } from 'lucide-react';

interface MarketplaceOrder {
  id: string;
  guestName: string | null;
  roomNumber: string | null;
  totalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  merchantAmount: number;
  deliveryMode: string;
  deliveryAddress: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  merchant: { name: string; category: string };
  items: { id: string; name: string; price: number; quantity: number }[];
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  accepted: { label: 'Acceptée', color: 'bg-blue-100 text-blue-700' },
  preparing: { label: 'Préparation', color: 'bg-violet-100 text-violet-700' },
  ready: { label: 'Prête', color: 'bg-teal-100 text-teal-700' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-700' },
  refused: { label: 'Refusée', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Annulée', color: 'bg-slate-100 text-slate-700' },
};

const NEXT_STATUS: Record<string, string | null> = {
  pending: 'accepted',
  accepted: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
  delivered: null,
  refused: null,
  cancelled: null,
};

export default function MarketplaceDashboardPage() {
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'all'>('active');

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      const user = sessionData.user;
      if (!user?.agencyId) return;
      const res = await fetch(`/api/marketplace/order?agencyId=${user.agencyId}`);
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/marketplace/order?id=${id}&status=${status}&handledBy=Staff`, { method: 'PATCH' });
    loadOrders();
  };

  const filtered = filter === 'active'
    ? orders.filter((o) => o.status !== 'delivered' && o.status !== 'refused' && o.status !== 'cancelled')
    : orders;

  const totalCommissions = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + o.commissionAmount, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center">
          <Store className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketplace Locale</h1>
          <p className="text-sm text-slate-500">Commandes commerçants + commissions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
          <p className="text-xs text-slate-500">Commandes</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-green-600">
            {orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.totalAmount, 0).toLocaleString('fr-FR')}
          </p>
          <p className="text-xs text-slate-500">CA livré (FCFA)</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-orange-600">{totalCommissions.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-slate-500">Commissions (FCFA)</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { value: 'active', label: '🟠 Actives' },
          { value: 'all', label: '📋 Toutes' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as 'active' | 'all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f.value ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <Store className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Aucune commande pour l'instant</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const meta = STATUS_META[o.status] || STATUS_META.pending;
            const next = NEXT_STATUS[o.status];
            return (
              <div key={o.id} className="bg-white rounded-2xl border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{o.merchant.name}</h3>
                    <p className="text-sm text-slate-500">
                      {o.guestName || 'Client'} {o.roomNumber && `· Ch. ${o.roomNumber}`} · {new Date(o.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${meta.color}`}>{meta.label}</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 mb-3">
                  {o.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm py-0.5">
                      <span>{item.quantity}× {item.name}</span>
                      <span className="font-medium">{(item.price * item.quantity).toLocaleString('fr-FR')}</span>
                    </div>
                  ))}
                  <div className="border-t mt-2 pt-2 space-y-0.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Total</span>
                      <span className="font-bold">{o.totalAmount.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between text-xs text-orange-600">
                      <span>Commission hôtel ({o.commissionRate || 0}%)</span>
                      <span>+{o.commissionAmount.toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Net commerçant</span>
                      <span>{o.merchantAmount.toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <Package className="w-3.5 h-3.5" />
                  {o.deliveryMode === 'delivery' ? `Livraison: ${o.deliveryAddress || '—'}` : 'Retrait sur place'}
                </div>

                {o.notes && <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded-lg mb-3">📝 {o.notes}</p>}

                {next && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(o.id, next)} className="flex-1 py-2 bg-orange-600 text-white text-sm font-bold rounded-lg hover:bg-orange-700">
                      → {STATUS_META[next]?.label}
                    </button>
                    {o.status === 'pending' && (
                      <button onClick={() => updateStatus(o.id, 'refused')} className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
