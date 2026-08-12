'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Edit, Trash2, X, Save, Store, Package, ChevronDown, ChevronRight } from 'lucide-react';

interface Product { id: string; name: string; description: string | null; price: number; photoUrl: string | null; stock: number; isAvailable: boolean; }
interface Merchant {
  id: string; name: string; description: string | null; category: string; phone: string | null;
  email: string | null; commissionRate: number; accessCode: string | null; isActive: boolean;
  products: Product[]; _count?: { marketplaceOrders: number };
}

const MERCHANT_CATEGORIES = [
  { value: 'artisanat', label: 'Artisanat', icon: '🎨' },
  { value: 'souvenirs', label: 'Souvenirs', icon: '🎁' },
  { value: 'food', label: 'Produits locaux', icon: '🥖' },
  { value: 'cosmetics', label: 'Cosmétiques', icon: '💄' },
  { value: 'excursions', label: 'Excursions', icon: '🚌' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'other', label: 'Autre', icon: '📦' },
];

export default function MarketplaceManagePage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showMerchantForm, setShowMerchantForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState<{ merchantId: string } | null>(null);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [tab, setTab] = useState<'merchants' | 'orders'>('merchants');

  const [merchantForm, setMerchantForm] = useState({ name: '', description: '', category: 'other', phone: '', email: '', commissionRate: 10 });
  const [productForm, setProductForm] = useState({ name: '', description: '', price: 0, stock: 0, photoUrl: '' });

  useEffect(() => { loadMerchants(); }, []);

  const loadMerchants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace/manage');
      const data = await res.json();
      if (data.success) {
        setMerchants(data.merchants || []);
      } else {
        console.error('loadMerchants error:', data.error);
      }
    } catch (e) { console.error('loadMerchants fetch error:', e); }
    finally { setLoading(false); }
  };

  const saveMerchant = async () => {
    if (!merchantForm.name) return;
    try {
      const method = editingMerchant ? 'PATCH' : 'POST';
      const body = editingMerchant ? { type: 'merchant', id: editingMerchant.id, ...merchantForm } : { type: 'merchant', ...merchantForm };
      const res = await fetch('/api/marketplace/manage', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erreur' }));
        alert(err.error || 'Erreur lors de la sauvegarde');
        return;
      }
      setShowMerchantForm(false); setEditingMerchant(null);
      setMerchantForm({ name: '', description: '', category: 'other', phone: '', email: '', commissionRate: 10 });
      loadMerchants();
    } catch (e) {
      alert('Erreur réseau');
      console.error(e);
    }
  };

  const saveProduct = async (merchantId: string) => {
    if (!productForm.name) return;
    try {
      const res = await fetch('/api/marketplace/manage', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'product', merchantId, ...productForm }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erreur' }));
        alert(err.error || 'Erreur lors de la création du produit');
        return;
      }
      setShowProductForm(null);
      setProductForm({ name: '', description: '', price: 0, stock: 0, photoUrl: '' });
      loadMerchants();
    } catch (e) {
      alert('Erreur réseau');
      console.error(e);
    }
  };

  const deleteMerchant = async (id: string) => {
    if (!confirm('Supprimer ce commerçant et tous ses produits ?')) return;
    await fetch(`/api/marketplace/manage?id=${id}&type=merchant`, { method: 'DELETE' });
    loadMerchants();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await fetch(`/api/marketplace/manage?id=${id}&type=product`, { method: 'DELETE' });
    loadMerchants();
  };

  const toggleProduct = async (p: Product) => {
    await fetch('/api/marketplace/manage', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'product', id: p.id, isAvailable: !p.isAvailable }) });
    loadMerchants();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    // Compression: redimensionne à max 400x400 et convertit en JPEG qualité 0.7
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result as string; };
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxSize = 400;
      let { width, height } = img;
      if (width > height) { if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; } }
      else { if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; } }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.drawImage(img, 0, 0, width, height); setProductForm({ ...productForm, photoUrl: canvas.toDataURL('image/jpeg', 0.7) }); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center"><Store className="w-6 h-6 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-slate-900">Marketplace</h1><p className="text-sm text-slate-500">Gérez vos commerçants et produits</p></div>
        </div>
        <button onClick={() => { setEditingMerchant(null); setMerchantForm({ name: '', description: '', category: 'other', phone: '', email: '', commissionRate: 10 }); setShowMerchantForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700"><Plus className="w-4 h-4" /> Ajouter un commerçant</button>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('merchants')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'merchants' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border'}`}>🏪 Commerçants ({merchants.length})</button>
        <button onClick={() => setTab('orders')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'orders' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border'}`}>📦 Commandes</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
      ) : tab === 'merchants' ? (
        <div className="space-y-3">
          {merchants.length === 0 ? (
            <div className="bg-white rounded-2xl border p-12 text-center"><Store className="w-12 h-12 mx-auto text-slate-300 mb-3" /><p className="text-slate-500">Aucun commerçant. Ajoutez votre premier partenaire !</p></div>
          ) : merchants.map((m) => {
            const cat = MERCHANT_CATEGORIES.find((c) => c.value === m.category) || MERCHANT_CATEGORIES[6];
            return (
              <div key={m.id} className="bg-white rounded-2xl border overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                  <button onClick={() => setExpanded(expanded === m.id ? null : m.id)} className="p-1">
                    {expanded === m.id ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl">{cat.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-500">{cat.label} · {m.products.length} produit(s) · {m._count?.marketplaceOrders || 0} commande(s) · Commission: {m.commissionRate}%</p>
                  </div>
                  {m.accessCode && <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded-lg text-slate-600" title="Code d'accès portail commerçant">🔑 {m.accessCode}</span>}
                  <button onClick={() => { setEditingMerchant(m); setMerchantForm({ name: m.name, description: m.description || '', category: m.category, phone: m.phone || '', email: m.email || '', commissionRate: m.commissionRate }); setShowMerchantForm(true); }} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteMerchant(m.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 className="w-4 h-4" /></button>
                </div>
                {expanded === m.id && (
                  <div className="border-t bg-slate-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-slate-700">Produits ({m.products.length})</p>
                      <button onClick={() => { setProductForm({ name: '', description: '', price: 0, stock: 0, photoUrl: '' }); setShowProductForm({ merchantId: m.id }); }} className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700"><Plus className="w-3 h-3" /> Produit</button>
                    </div>
                    <div className="space-y-2">
                      {m.products.length === 0 ? <p className="text-sm text-slate-400 text-center py-4">Aucun produit. Ajoutez-en un !</p> : m.products.map((p) => (
                        <div key={p.id} className="bg-white rounded-xl p-3 flex items-center gap-3">
                          {p.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.photoUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center"><Package className="w-5 h-5 text-slate-400" /></div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm text-slate-900">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.price.toLocaleString('fr-FR')} FCFA · Stock: {p.stock}</p>
                          </div>
                          <button onClick={() => toggleProduct(p)} className={`px-2 py-1 rounded-lg text-xs font-medium ${p.isAvailable ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>{p.isAvailable ? 'Dispo' : 'Indispo'}</button>
                          <button onClick={() => deleteProduct(p.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <MarketplaceOrders />
      )}

      {/* Merchant form */}
      {showMerchantForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">{editingMerchant ? 'Modifier' : 'Nouveau'} commerçant</h2><button onClick={() => setShowMerchantForm(false)}><X className="w-5 h-5" /></button></div>
            <div className="space-y-3">
              <input type="text" placeholder="Nom *" value={merchantForm.name} onChange={(e) => setMerchantForm({ ...merchantForm, name: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
              <textarea placeholder="Description" value={merchantForm.description} onChange={(e) => setMerchantForm({ ...merchantForm, description: e.target.value })} rows={2} className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={merchantForm.category} onChange={(e) => setMerchantForm({ ...merchantForm, category: e.target.value })} className="p-3 border border-slate-200 rounded-xl text-sm">{MERCHANT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}</select>
                <input type="number" placeholder="Commission %" value={merchantForm.commissionRate} onChange={(e) => setMerchantForm({ ...merchantForm, commissionRate: parseFloat(e.target.value) || 10 })} className="p-3 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="tel" placeholder="Téléphone" value={merchantForm.phone} onChange={(e) => setMerchantForm({ ...merchantForm, phone: e.target.value })} className="p-3 border border-slate-200 rounded-xl text-sm" />
                <input type="email" placeholder="Email" value={merchantForm.email} onChange={(e) => setMerchantForm({ ...merchantForm, email: e.target.value })} className="p-3 border border-slate-200 rounded-xl text-sm" />
              </div>
            </div>
            <button onClick={saveMerchant} className="w-full mt-4 py-3 bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-700"><Save className="w-4 h-4" /> {editingMerchant ? 'Mettre à jour' : 'Créer'}</button>
          </div>
        </div>
      )}

      {/* Product form */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">Nouveau produit</h2><button onClick={() => setShowProductForm(null)}><X className="w-5 h-5" /></button></div>
            <div className="space-y-3">
              <input type="text" placeholder="Nom *" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
              <textarea placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={2} className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Prix FCFA" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: parseInt(e.target.value) || 0 })} className="p-3 border border-slate-200 rounded-xl text-sm" />
                <input type="number" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })} className="p-3 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Photo</label>
                {productForm.photoUrl ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={productForm.photoUrl} alt="" className="w-full h-32 rounded-xl object-cover" />
                    <button onClick={() => setProductForm({ ...productForm, photoUrl: '' })} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <label className="block w-full p-4 border-2 border-dashed border-slate-200 rounded-xl text-center cursor-pointer hover:border-orange-400"><span className="text-sm text-slate-500">📷 Ajouter une photo</span><input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" /></label>
                )}
              </div>
            </div>
            <button onClick={() => saveProduct(showProductForm.merchantId)} className="w-full mt-4 py-3 bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-700"><Save className="w-4 h-4" /> Créer le produit</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MarketplaceOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        if (!sessionData.user?.agencyId) return;
        const res = await fetch(`/api/marketplace/order?agencyId=${sessionData.user.agencyId}`);
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>;
  if (orders.length === 0) return <div className="bg-white rounded-2xl border p-12 text-center"><p className="text-slate-500">Aucune commande pour l'instant</p></div>;

  const LABELS: Record<string, string> = { pending: 'En attente', accepted: 'Acceptée', preparing: 'Préparation', ready: 'Prête', delivered: 'Livrée', refused: 'Refusée', cancelled: 'Annulée' };
  const NEXT: Record<string, string | null> = { pending: 'accepted', accepted: 'preparing', preparing: 'ready', ready: 'delivered', delivered: null, refused: null, cancelled: null };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/marketplace/order?id=${id}&status=${status}&handledBy=Staff`, { method: 'PATCH' });
    const sessionRes = await fetch('/api/auth/session');
    const sessionData = await sessionRes.json();
    const res = await fetch(`/api/marketplace/order?agencyId=${sessionData.user.agencyId}`);
    const data = await res.json();
    if (data.success) setOrders(data.orders);
  };

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="bg-white rounded-2xl border p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-bold text-slate-900">{o.merchant?.name || 'Commerçant'}</p>
              <p className="text-sm text-slate-600">{o.guestName || 'Client'} {o.roomNumber && `· Ch. ${o.roomNumber}`}</p>
              <p className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleString('fr-FR')}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-bold bg-amber-100 text-amber-700">{LABELS[o.status] || o.status}</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 mb-2 text-sm">
            {o.items?.map((i: any) => <div key={i.id} className="flex justify-between"><span>{i.quantity}× {i.name}</span><span>{(i.price * i.quantity).toLocaleString('fr-FR')}</span></div>)}
            <div className="border-t mt-1 pt-1 flex justify-between font-bold"><span>Total</span><span>{o.totalAmount?.toLocaleString('fr-FR')} FCFA</span></div>
          </div>
          {NEXT[o.status] && <button onClick={() => updateStatus(o.id, NEXT[o.status]!)} className="w-full py-2 bg-orange-600 text-white text-sm font-bold rounded-lg">→ {LABELS[NEXT[o.status]!]}</button>}
        </div>
      ))}
    </div>
  );
}
