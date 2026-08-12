'use client';

import { useState, useEffect } from 'react';
import { Loader2, Utensils, CheckCircle2, Clock, Package, XCircle, Plus, Edit, Trash2 } from 'lucide-react';

interface Order {
  id: string;
  guestName: string | null;
  roomNumber: string | null;
  totalAmount: number;
  notes: string | null;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: { id: string; name: string; price: number; quantity: number }[];
}

const STATUS_META: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700', icon: Clock },
  confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  preparing: { label: 'En préparation', color: 'bg-violet-100 text-violet-700', icon: Package },
  ready: { label: 'Prête', color: 'bg-teal-100 text-teal-700', icon: CheckCircle2 },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const NEXT_STATUS: Record<string, string | null> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
  delivered: null,
  cancelled: null,
};

export default function RoomServiceDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'all'>('active');

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15_000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      const user = sessionData.user;
      if (!user?.agencyId) return;
      const res = await fetch(`/api/orders?agencyId=${user.agencyId}`);
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders?id=${id}&status=${status}&handledBy=Staff`, { method: 'PATCH' });
    loadOrders();
  };

  const filteredOrders = filter === 'active'
    ? orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled')
    : orders;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
          <Utensils className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Room Service</h1>
          <p className="text-sm text-slate-500">Suivi des commandes en temps réel</p>
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
          <Loader2 className="w-6 h-6 animate-spin text-green-500" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <Utensils className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Aucune commande pour l'instant</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((o) => {
            const meta = STATUS_META[o.status] || STATUS_META.pending;
            const nextStatus = NEXT_STATUS[o.status];
            const Icon = meta.icon;
            return (
              <div key={o.id} className="bg-white rounded-2xl border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-5 h-5 text-slate-700" />
                      <h3 className="font-bold text-slate-900">
                        {o.guestName || 'Client'} {o.roomNumber && `· Ch. ${o.roomNumber}`}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${meta.color}`}>
                    {meta.label}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 mb-3">
                  {o.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm py-1">
                      <span>{item.quantity}× {item.name}</span>
                      <span className="font-medium">{(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  ))}
                  <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>{o.totalAmount.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>

                {o.notes && (
                  <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded-lg mb-3">📝 {o.notes}</p>
                )}

                <div className="flex gap-2">
                  {nextStatus && (
                    <button
                      onClick={() => updateStatus(o.id, nextStatus)}
                      className="flex-1 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700"
                    >
                      → {STATUS_META[nextStatus]?.label}
                    </button>
                  )}
                  {o.status !== 'cancelled' && o.status !== 'delivered' && (
                    <button
                      onClick={() => updateStatus(o.id, 'cancelled')}
                      className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
