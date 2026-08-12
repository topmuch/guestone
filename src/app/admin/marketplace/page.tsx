'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Edit, Trash2, X, Save, Store, Package, ChevronDown, ChevronRight, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product { id: string; name: string; description: string | null; price: number; photoUrl: string | null; isAvailable: boolean; }
interface Merchant {
  id: string; name: string; description: string | null; category: string; phone: string | null;
  whatsapp: string | null; address: string | null; latitude: number | null; longitude: number | null;
  commissionRate: number; isActive: boolean;
  products: Product[]; agencies: { id: string; name: string }[];
}

const CATEGORIES = [
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { value: 'artisanat', label: 'Artisanat', icon: '🎨' },
  { value: 'souvenirs', label: 'Souvenirs', icon: '🎁' },
  { value: 'food', label: 'Produits locaux', icon: '🥖' },
  { value: 'cosmetics', label: 'Cosmétiques', icon: '💄' },
  { value: 'excursions', label: 'Excursions', icon: '🚌' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'other', label: 'Autre', icon: '📦' },
];

export default function AdminMarketplacePage() {
  const { toast } = useToast();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [agencies, setAgencies] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Merchant | null>(null);
  const [showProductForm, setShowProductForm] = useState<{ merchantId: string } | null>(null);

  const [form, setForm] = useState({ name: '', description: '', category: 'restaurant', phone: '', whatsapp: '', address: '', latitude: '', longitude: '', commissionRate: 10 });
  const [productForm, setProductForm] = useState({ name: '', description: '', price: 0, photoUrl: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mRes, aRes] = await Promise.all([
        fetch('/api/admin/marketplace/manage'),
        fetch('/api/admin/agencies'),
      ]);
      const mData = await mRes.json();
      const aData = await aRes.json();
      if (mData.success) setMerchants(mData.merchants || []);
      if (aData.success || aData.agencies) setAgencies(aData.agencies || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const saveMerchant = async () => {
    if (!form.name) return;
    try {
      const method = editing ? 'PATCH' : 'POST';
      const body = editing ? { id: editing.id, ...form } : form;
      const res = await fetch('/api/admin/marketplace/manage', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json().catch(() => ({})); toast({ title: 'Erreur', description: err.error || 'Échec', variant: 'destructive' }); return; }
      setShowForm(false); setEditing(null);
      setForm({ name: '', description: '', category: 'restaurant', phone: '', whatsapp: '', address: '', latitude: '', longitude: '', commissionRate: 10 });
      loadData();
      toast({ title: 'Commerçant sauvegardé' });
    } catch (e) { toast({ title: 'Erreur réseau', variant: 'destructive' }); }
  };

  const saveProduct = async (merchantId: string) => {
    if (!productForm.name) return;
    try {
      const res = await fetch('/api/admin/marketplace/manage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'product', merchantId, ...productForm }) });
      if (!res.ok) { const err = await res.json().catch(() => ({})); toast({ title: 'Erreur', description: err.error, variant: 'destructive' }); return; }
      setShowProductForm(null);
      setProductForm({ name: '', description: '', price: 0, photoUrl: '' });
      loadData();
      toast({ title: 'Produit créé' });
    } catch (e) { toast({ title: 'Erreur réseau', variant: 'destructive' }); }
  };

  const del = async (id: string, type: 'merchant' | 'product') => {
    if (!confirm(`Supprimer ce ${type === 'merchant' ? 'commerçant' : 'produit'} ?`)) return;
    await fetch(`/api/admin/marketplace/manage?id=${id}&type=${type}`, { method: 'DELETE' });
    loadData();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center"><Store className="w-6 h-6 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-slate-900">Marketplace</h1><p className="text-sm text-slate-500">Gérez les commerçants et produits (superadmin)</p></div>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', description: '', category: 'restaurant', phone: '', whatsapp: '', address: '', latitude: '', longitude: '', commissionRate: 10 }); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700"><Plus className="w-4 h-4" /> Commerçant</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
      ) : merchants.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center"><Store className="w-12 h-12 mx-auto text-slate-300 mb-3" /><p className="text-slate-500">Aucun commerçant. Ajoutez votre premier partenaire !</p></div>
      ) : (
        <div className="space-y-3">
          {merchants.map((m) => {
            const cat = CATEGORIES.find((c) => c.value === m.category) || CATEGORIES[7];
            return (
              <div key={m.id} className="bg-white rounded-2xl border overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                  <button onClick={() => setExpanded(expanded === m.id ? null : m.id)} className="p-1">
                    {expanded === m.id ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl">{cat.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-500">{cat.label} · {m.products.length} produit(s) · {m.whatsapp ? 'WhatsApp: ' + m.whatsapp : 'Pas de WhatsApp'}</p>
                  </div>
                  <button onClick={() => { setEditing(m); setForm({ name: m.name, description: m.description || '', category: m.category, phone: m.phone || '', whatsapp: m.whatsapp || '', address: m.address || '', latitude: m.latitude?.toString() || '', longitude: m.longitude?.toString() || '', commissionRate: m.commissionRate }); setShowForm(true); }} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => del(m.id, 'merchant')} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 className="w-4 h-4" /></button>
                </div>
                {expanded === m.id && (
                  <div className="border-t bg-slate-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-slate-700">Produits ({m.products.length})</p>
                      <button onClick={() => { setProductForm({ name: '', description: '', price: 0, photoUrl: '' }); setShowProductForm({ merchantId: m.id }); }} className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700"><Plus className="w-3 h-3" /> Produit</button>
                    </div>
                    <div className="space-y-2">
                      {m.products.length === 0 ? <p className="text-sm text-slate-400 text-center py-4">Aucun produit</p> : m.products.map((p) => (
                        <div key={p.id} className="bg-white rounded-xl p-3 flex items-center gap-3">
                          {p.photoUrl ? <img src={p.photoUrl} alt="" className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center"><Package className="w-5 h-5 text-slate-400" /></div>}
                          <div className="flex-1"><p className="font-medium text-sm text-slate-900">{p.name}</p><p className="text-xs text-slate-500">{(p.price || 0).toLocaleString('fr-FR')} FCFA</p></div>
                          <button onClick={() => del(p.id, 'product')} className="p-1.5 bg-red-100 text-red-600 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Merchant form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">{editing ? 'Modifier' : 'Nouveau'} commerçant</h2><button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button></div>
            <div className="space-y-3">
              <input type="text" placeholder="Nom *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl text-sm">{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}</select>
              <div className="grid grid-cols-2 gap-3">
                <input type="tel" placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="p-3 border border-slate-200 rounded-xl text-sm" />
                <input type="tel" placeholder="WhatsApp (ex: 22177...)" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="p-3 border border-slate-200 rounded-xl text-sm" />
              </div>
              <input type="text" placeholder="Adresse" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="p-3 border border-slate-200 rounded-xl text-sm" />
                <input type="text" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="p-3 border border-slate-200 rounded-xl text-sm" />
              </div>
              <input type="number" placeholder="Commission %" value={form.commissionRate} onChange={(e) => setForm({ ...form, commissionRate: parseFloat(e.target.value) || 10 })} className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
            </div>
            <button onClick={saveMerchant} className="w-full mt-4 py-3 bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-700"><Save className="w-4 h-4" /> {editing ? 'Mettre à jour' : 'Créer'}</button>
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
              <input type="number" placeholder="Prix FCFA" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: parseInt(e.target.value) || 0 })} className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
            </div>
            <button onClick={() => saveProduct(showProductForm.merchantId)} className="w-full mt-4 py-3 bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-700"><Save className="w-4 h-4" /> Créer le produit</button>
          </div>
        </div>
      )}
    </div>
  );
}
