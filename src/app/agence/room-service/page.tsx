'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Edit, Trash2, X, Save, Utensils } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  photoUrl: string | null;
  stock: number;
  isAvailable: boolean;
}

const CATEGORIES = [
  { value: 'breakfast', label: 'Petit-déjeuner', icon: '🥐' },
  { value: 'mains', label: 'Plats', icon: '🍽️' },
  { value: 'desserts', label: 'Desserts', icon: '🍰' },
  { value: 'drinks', label: 'Boissons', icon: '🥤' },
  { value: 'snacks', label: 'Snacks', icon: '🥪' },
];

export default function RoomServiceManagePage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [tab, setTab] = useState<'menu' | 'orders'>('menu');

  const [form, setForm] = useState({ name: '', description: '', category: 'mains', price: 0, photoUrl: '', stock: 0, isAvailable: true });

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menu/manage');
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      } else {
        console.error('loadItems error:', data.error);
      }
    } catch (e) { console.error('loadItems fetch error:', e); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', category: 'mains', price: 0, photoUrl: '', stock: 0, isAvailable: true });
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.name) return;
    const method = editing ? 'PATCH' : 'POST';
    const body = editing ? { id: editing.id, ...form } : form;
    try {
      const res = await fetch('/api/menu/manage', {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erreur' }));
        alert(err.error || 'Erreur lors de la sauvegarde');
        return;
      }
      setShowForm(false);
      resetForm();
      loadItems();
    } catch (e) {
      alert('Erreur réseau');
      console.error(e);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditing(item);
    setForm({ name: item.name, description: item.description || '', category: item.category, price: item.price, photoUrl: item.photoUrl || '', stock: item.stock, isAvailable: item.isAvailable });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;
    await fetch(`/api/menu/manage?id=${id}`, { method: 'DELETE' });
    loadItems();
  };

  const toggleAvailable = async (item: MenuItem) => {
    await fetch('/api/menu/manage', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, isAvailable: !item.isAvailable }),
    });
    loadItems();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Compression: redimensionne à max 400x400 et convertit en JPEG qualité 0.7
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result as string;
    };
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxSize = 400;
      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
      } else {
        if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        setForm({ ...form, photoUrl: compressed });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Room Service</h1>
            <p className="text-sm text-slate-500">Gérez votre menu et suivez les commandes</p>
          </div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">
          <Plus className="w-4 h-4" /> Ajouter un article
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('menu')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'menu' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border'}`}>📋 Menu ({items.length})</button>
        <button onClick={() => setTab('orders')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'orders' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border'}`}>📦 Commandes</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-green-500" /></div>
      ) : tab === 'menu' ? (
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border p-12 text-center">
              <Utensils className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Aucun article dans le menu. Ajoutez votre premier plat !</p>
            </div>
          ) : items.map((item) => {
            const cat = CATEGORIES.find((c) => c.value === item.category) || CATEGORIES[1];
            return (
              <div key={item.id} className={`bg-white rounded-2xl border p-4 flex items-center gap-4 ${!item.isAvailable ? 'opacity-60' : ''}`}>
                {item.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.photoUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">{cat.icon}</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{cat.label} · Stock: {item.stock}</p>
                  {item.description && <p className="text-xs text-slate-400 truncate">{item.description}</p>}
                  <p className="text-sm font-bold text-green-700 mt-1">{item.price.toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleAvailable(item)} className={`px-2 py-1 rounded-lg text-xs font-medium ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                    {item.isAvailable ? 'Dispo' : 'Indispo'}
                  </button>
                  <button onClick={() => handleEdit(item)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <OrdersList />
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editing ? 'Modifier' : 'Nouvel'} article</h2>
              <button onClick={() => { setShowForm(false); resetForm(); }}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Nom *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="p-3 border border-slate-200 rounded-xl text-sm">
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                </select>
                <input type="number" placeholder="Prix FCFA" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} className="p-3 border border-slate-200 rounded-xl text-sm" />
              </div>
              <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Photo</label>
                {form.photoUrl ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.photoUrl} alt="" className="w-full h-32 rounded-xl object-cover" />
                    <button onClick={() => setForm({ ...form, photoUrl: '' })} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <label className="block w-full p-4 border-2 border-dashed border-slate-200 rounded-xl text-center cursor-pointer hover:border-green-400">
                    <span className="text-sm text-slate-500">📷 Cliquer pour ajouter une photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm">Disponible à la commande</span>
              </label>
            </div>
            <button onClick={handleSave} className="w-full mt-4 py-3 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-green-700">
              <Save className="w-4 h-4" /> {editing ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        if (!sessionData.user?.agencyId) return;
        const res = await fetch(`/api/orders?agencyId=${sessionData.user.agencyId}`);
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-green-500" /></div>;
  if (orders.length === 0) return <div className="bg-white rounded-2xl border p-12 text-center"><p className="text-slate-500">Aucune commande pour l'instant</p></div>;

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders?id=${id}&status=${status}&handledBy=Staff`, { method: 'PATCH' });
    const sessionRes = await fetch('/api/auth/session');
    const sessionData = await sessionRes.json();
    const res = await fetch(`/api/orders?agencyId=${sessionData.user.agencyId}`);
    const data = await res.json();
    if (data.success) setOrders(data.orders);
  };

  const STATUS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
  const LABELS: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmée', preparing: 'En préparation', ready: 'Prête', delivered: 'Livrée', cancelled: 'Annulée' };

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="bg-white rounded-2xl border p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-bold text-slate-900">{o.guestName || 'Client'} {o.roomNumber && `· Ch. ${o.roomNumber}`}</p>
              <p className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleString('fr-FR')}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-bold bg-amber-100 text-amber-700">{LABELS[o.status] || o.status}</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 mb-2 text-sm">
            {o.items?.map((i: any) => <div key={i.id} className="flex justify-between"><span>{i.quantity}× {i.name}</span><span>{(i.price * i.quantity).toLocaleString('fr-FR')}</span></div>)}
            <div className="border-t mt-1 pt-1 flex justify-between font-bold"><span>Total</span><span>{o.totalAmount?.toLocaleString('fr-FR')} FCFA</span></div>
          </div>
          {o.status !== 'delivered' && o.status !== 'cancelled' && (
            <button onClick={() => updateStatus(o.id, STATUS[STATUS.indexOf(o.status) + 1] || 'delivered')} className="w-full py-2 bg-green-600 text-white text-sm font-bold rounded-lg">
              → {LABELS[STATUS[STATUS.indexOf(o.status) + 1]] || 'Livrer'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
