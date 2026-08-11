'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Loader2, TrendingUp, Store, Building2 } from 'lucide-react';

interface Order {
  id: string;
  totalAmount: number;
  commissionAmount: number;
  merchantAmount: number;
  platformAmount: number;
  agencyNetAmount: number;
  commissionRate: number;
  platformRate: number;
  status: string;
  createdAt: string;
  merchant: { name: string };
}

export default function AdminCommissionsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Récupère toutes les commandes livrées (commissions réalisées)
      const res = await fetch('/api/admin/commissions');
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const stats = {
    totalRevenue: orders.reduce((s, o) => s + o.totalAmount, 0),
    platformRevenue: orders.reduce((s, o) => s + o.platformAmount, 0),
    agencyRevenue: orders.reduce((s, o) => s + o.agencyNetAmount, 0),
    merchantRevenue: orders.reduce((s, o) => s + o.merchantAmount, 0),
    totalOrders: orders.length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commissions Plateforme</h1>
          <p className="text-sm text-slate-500">V3 — Suivi des commissions multi-niveaux (plateforme + hôtel + commerçant)</p>
        </div>
      </div>

      {/* STATS GLOBALES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <p className="text-xs text-slate-500">Volume total</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalRevenue.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-slate-400">FCFA · {stats.totalOrders} commandes</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <p className="text-xs text-slate-500">Commission plateforme</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{stats.platformRevenue.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-slate-400">FCFA · Votre revenu</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-blue-500" />
            <p className="text-xs text-slate-500">Net hôtels</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.agencyRevenue.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-slate-400">FCFA</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-4 h-4 text-orange-500" />
            <p className="text-xs text-slate-500">Net commerçants</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.merchantRevenue.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-slate-400">FCFA</p>
        </div>
      </div>

      {/* LISTE COMMANDES */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <DollarSign className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Aucune commission pour l'instant</p>
          <p className="text-xs text-slate-400 mt-1">Les commandes marketplace livrées apparaîtront ici</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Commerçant</th>
                <th className="text-right p-3">Total</th>
                <th className="text-right p-3">Commerçant</th>
                <th className="text-right p-3">Hôtel</th>
                <th className="text-right p-3">Plateforme</th>
                <th className="text-center p-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 50).map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="p-3 text-xs text-slate-500">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="p-3 font-medium text-slate-900">{o.merchant.name}</td>
                  <td className="p-3 text-right font-bold">{o.totalAmount.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right text-orange-600">{o.merchantAmount.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right text-blue-600">{o.agencyNetAmount.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-right text-emerald-600 font-bold">{o.platformAmount.toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      o.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
