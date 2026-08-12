'use client';

import { useState, useEffect } from 'react';
import { Store, Loader2, Plus, Edit, Trash2, Package, ShoppingCart, TrendingUp, LogOut, X, Check } from 'lucide-react';

interface Merchant {
  id: string;
  name: string;
  category: string;
  commissionRate: number;
  agencyName: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  stock: number;
  photoUrl: string | null;
  isAvailable: boolean;
  deliveryMode: string;
}

interface Order {
  id: string;
  guestName: string | null;
  roomNumber: string | null;
  totalAmount: number;
  merchantAmount: number;
  commissionAmount: number;
  deliveryMode: string;
  notes: string | null;
  status: string;
  createdAt: string;
  items: { id: string; name: string; price: number; quantity: number }[];
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: 'À traiter', color: 'bg-amber-100 text-amber-700' },
  accepted: { label: 'Acceptée', color: 'bg-blue-100 text-blue-700' },
  preparing: { label: 'En préparation', color: 'bg-violet-100 text-violet-700' },
  ready: { label: 'Prête', color: 'bg-teal-100 text-teal-700' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-700' },
  refused: { label: 'Refusée', color: 'bg-red-100 text-red-700' },
};

const NEXT_STATUS: Record<string, string | null> = {
  pending: 'accepted',
  accepted: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
};

export default function CommercantPortalPage() {
  const [token, setToken] = useState<string | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<'orders' | 'products' | 'stats'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Restaure la session au chargement
  useEffect(() => {
    const saved = sessionStorage.getItem('commercant_token');
    const savedMerchant = sessionStorage.getItem('commercant_merchant');
    if (saved && savedMerchant) {
      setToken(saved);
      setMerchant(JSON.parse(savedMerchant));
    }
  }, []);

  const login = async () => {
    setLoggingIn(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/commercant/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode }),
      });
      const data = await res.json();
      if (data.success) {
        // V3: token est un hash sécurisé stocké en DB
        setToken(data.token);
        setMerchant(data.merchant);
        sessionStorage.setItem('commercant_token', data.token);
        sessionStorage.setItem('commercant_merchant', JSON.stringify(data.merchant));
      } else {
        setAuthError(data.error);
      }
    } catch (e) { console.error(e); setAuthError('Erreur réseau'); }
    finally { setLoggingIn(false); }
  };

  const logout = () => {
    setToken(null);
    setMerchant(null);
    sessionStorage.removeItem('commercant_token');
    sessionStorage.removeItem('commercant_merchant');
  };

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/commercant/orders', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/commercant/products', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [ordersData, productsData] = await Promise.all([ordersRes.json(), productsRes.json()]);
      if (ordersData.success) setOrders(ordersData.orders);
      if (productsData.success) setProducts(productsData.products);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (token) loadData(); }, [token]);

  const updateOrderStatus = async (id: string, status: string) => {
    await fetch(`/api/commercant/orders?id=${id}&status=${status}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadData();
  };

  const toggleProductAvailability = async (p: Product) => {
    await fetch('/api/commercant/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: p.id, isAvailable: !p.isAvailable }),
    });
    loadData();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await fetch(`/api/commercant/products?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadData();
  };

  // ─── LOGIN SCREEN ───
  if (!token || !merchant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto bg-orange-500 rounded-2xl flex items-center justify-center mb-3">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Portail Commerçant</h1>
            <p className="text-sm text-slate-500 mt-1">Espace partenaire Guest One</p>
          </div>

          <label className="block text-xs font-bold text-slate-600 mb-1">Code d'accès</label>
          <input
            type="text"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
            placeholder="Entrez votre code commerçant"
            className="w-full p-3 border-2 border-slate-200 rounded-xl text-center font-mono text-lg tracking-wider focus:outline-none focus:border-orange-400"
          />
          {authError && <p className="text-sm text-red-500 mt-2 text-center">⚠️ {authError}</p>}

          <button
            onClick={login}
            disabled={loggingIn || !accessCode}
            className="w-full mt-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
            Accéder
          </button>

          <p className="text-xs text-slate-400 text-center mt-4">
            Code fourni par l'hôtel ou la conciergerie partenaire.
          </p>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ───
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    revenue: orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.merchantAmount, 0),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{merchant.name}</p>
              <p className="text-xs text-slate-500">Partenaire · {merchant.agencyName}</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500" title="Déconnexion">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4">
        {/* STATS */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-white rounded-xl border p-3 text-center">
            <p className="text-xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-[10px] text-slate-500 uppercase">Commandes</p>
          </div>
          <div className="bg-white rounded-xl border p-3 text-center">
            <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-[10px] text-slate-500 uppercase">À traiter</p>
          </div>
          <div className="bg-white rounded-xl border p-3 text-center">
            <p className="text-xl font-bold text-green-600">{stats.delivered}</p>
            <p className="text-[10px] text-slate-500 uppercase">Livrées</p>
          </div>
          <div className="bg-white rounded-xl border p-3 text-center">
            <p className="text-xl font-bold text-orange-600">{stats.revenue.toLocaleString('fr-FR')}</p>
            <p className="text-[10px] text-slate-500 uppercase">Revenu FCFA</p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'orders', label: 'Commandes', icon: ShoppingCart },
            { key: 'products', label: 'Produits', icon: Package },
            { key: 'stats', label: 'Revenus', icon: TrendingUp },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as 'orders' | 'products' | 'stats')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 ${
                  tab === t.key ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        ) : tab === 'orders' ? (
          // ─── COMMANDES ───
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border p-12 text-center">
                <ShoppingCart className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">Aucune commande pour l'instant</p>
              </div>
            ) : (
              orders.map((o) => {
                const meta = STATUS_META[o.status] || STATUS_META.pending;
                const next = NEXT_STATUS[o.status];
                return (
                  <div key={o.id} className="bg-white rounded-2xl border p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-slate-900">{o.guestName || 'Client'} {o.roomNumber && `· Ch. ${o.roomNumber}`}</p>
                        <p className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleString('fr-FR')}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${meta.color}`}>{meta.label}</span>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 mb-2 text-sm">
                      {o.items.map((i) => (
                        <div key={i.id} className="flex justify-between">
                          <span>{i.quantity}× {i.name}</span>
                          <span>{(i.price * i.quantity).toLocaleString('fr-FR')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span>Votre net (après commission)</span>
                      <span className="text-green-600">{o.merchantAmount.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    {o.notes && <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded mb-2">📝 {o.notes}</p>}
                    {next && (
                      <button
                        onClick={() => updateOrderStatus(o.id, next)}
                        className="w-full py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600"
                      >
                        → {STATUS_META[next]?.label}
                      </button>
                    )}
                    {o.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(o.id, 'refused')}
                        className="w-full py-2 mt-1 bg-red-100 text-red-700 text-sm font-medium rounded-lg"
                      >
                        Refuser
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : tab === 'products' ? (
          // ─── PRODUITS ───
          <div>
            <button
              onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
              className="w-full mb-3 py-3 bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600"
            >
              <Plus className="w-4 h-4" /> Ajouter un produit
            </button>
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className={`bg-white rounded-xl border p-3 ${!p.isAvailable ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-3">
                    {p.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.photoUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-2xl">📦</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.price.toLocaleString('fr-FR')} FCFA · Stock: {p.stock}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleProductAvailability(p)}
                        className={`p-2 rounded-lg ${p.isAvailable ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}
                        title={p.isAvailable ? 'Disponible' : 'Indisponible'}
                      >
                        {p.isAvailable ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => { setEditingProduct(p); setShowProductForm(true); }}
                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showProductForm && (
              <ProductForm
                product={editingProduct}
                token={token!}
                onClose={() => { setShowProductForm(false); setEditingProduct(null); }}
                onSaved={() => { setShowProductForm(false); setEditingProduct(null); loadData(); }}
              />
            )}
          </div>
        ) : (
          // ─── STATS / REVENUS ───
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" /> Revenus
            </h3>
            <div className="space-y-3">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-xs text-slate-500">Revenu net (commandes livrées)</p>
                <p className="text-3xl font-bold text-green-600">{stats.revenue.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Commandes livrées</p>
                  <p className="text-xl font-bold">{stats.delivered}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Panier moyen</p>
                  <p className="text-xl font-bold">{stats.delivered > 0 ? Math.round(stats.revenue / stats.delivered).toLocaleString('fr-FR') : '—'}</p>
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-4">
                Commission appliquée: {merchant.commissionRate}% par l'établissement partenaire.
                Les revenus ci-dessus sont nets de commission.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductForm({ product, token, onClose, onSaved }: { product: Product | null; token: string; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || 'other',
    price: product?.price || 0,
    stock: product?.stock || 0,
    photoUrl: product?.photoUrl || '',
    deliveryMode: product?.deliveryMode || 'pickup',
  });

  const save = async () => {
    setSaving(true);
    try {
      const method = product ? 'PATCH' : 'POST';
      const body = product ? { id: product.id, ...form } : form;
      const res = await fetch('/api/commercant/products', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) onSaved();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">{product ? 'Modifier' : 'Nouveau'} produit</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <input type="text" placeholder="Nom *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2} className="w-full p-2 border border-slate-200 rounded-lg text-sm resize-none" />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Prix FCFA" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
              className="p-2 border border-slate-200 rounded-lg text-sm" />
            <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
              className="p-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <input type="url" placeholder="URL photo" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
            className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
          <select value={form.deliveryMode} onChange={(e) => setForm({ ...form, deliveryMode: e.target.value })}
            className="w-full p-2 border border-slate-200 rounded-lg text-sm">
            <option value="pickup">Retrait sur place</option>
            <option value="delivery">Livraison</option>
            <option value="both">Les deux</option>
          </select>
        </div>
        <button onClick={save} disabled={saving || !form.name}
          className="w-full mt-4 py-2.5 bg-orange-500 text-white font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {product ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </div>
  );
}
