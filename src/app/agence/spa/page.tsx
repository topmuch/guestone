'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Edit, Trash2, X, Save, Sparkles, Clock } from 'lucide-react';

interface SpaService {
  id: string;
  name: string;
  description: string | null;
  category: string;
  duration: number;
  price: number;
  photoUrl: string | null;
  practitioner: string | null;
  isActive: boolean;
  _count?: { appointments: number };
}

const CATEGORIES = [
  { value: 'massage', label: 'Massage', icon: '💆' },
  { value: 'facial', label: 'Soin visage', icon: '✨' },
  { value: 'body', label: 'Soin corps', icon: '🧖' },
  { value: 'wellness', label: 'Bien-être', icon: '🌸' },
  { value: 'couple', label: 'Couple', icon: '💑' },
];

export default function SpaManagePage() {
  const [services, setServices] = useState<SpaService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SpaService | null>(null);
  const [tab, setTab] = useState<'services' | 'appointments'>('services');
  const [form, setForm] = useState({ name: '', description: '', category: 'massage', duration: 60, price: 0, photoUrl: '', practitioner: '', isActive: true });

  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/spa/manage');
      const data = await res.json();
      if (data.success) setServices(data.services);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const resetForm = () => { setForm({ name: '', description: '', category: 'massage', duration: 60, price: 0, photoUrl: '', practitioner: '', isActive: true }); setEditing(null); };

  const handleSave = async () => {
    if (!form.name) return;
    const method = editing ? 'PATCH' : 'POST';
    const body = editing ? { id: editing.id, ...form } : form;
    await fetch('/api/spa/manage', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setShowForm(false); resetForm(); loadServices();
  };

  const handleEdit = (s: SpaService) => {
    setEditing(s);
    setForm({ name: s.name, description: s.description || '', category: s.category, duration: s.duration, price: s.price, photoUrl: s.photoUrl || '', practitioner: s.practitioner || '', isActive: s.isActive });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce soin ?')) return;
    await fetch(`/api/spa/manage?id=${id}`, { method: 'DELETE' });
    loadServices();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, photoUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center"><Sparkles className="w-6 h-6 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-slate-900">Spa</h1><p className="text-sm text-slate-500">Gérez vos soins et réservations</p></div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"><Plus className="w-4 h-4" /> Ajouter un soin</button>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('services')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'services' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border'}`}>💆 Soins ({services.length})</button>
        <button onClick={() => setTab('appointments')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'appointments' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border'}`}>📅 Réservations</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>
      ) : tab === 'services' ? (
        <div className="space-y-3">
          {services.length === 0 ? (
            <div className="bg-white rounded-2xl border p-12 text-center"><Sparkles className="w-12 h-12 mx-auto text-slate-300 mb-3" /><p className="text-slate-500">Aucun soin configuré. Ajoutez votre premier soin !</p></div>
          ) : services.map((s) => {
            const cat = CATEGORIES.find((c) => c.value === s.category) || CATEGORIES[0];
            return (
              <div key={s.id} className={`bg-white rounded-2xl border p-4 flex items-center gap-4 ${!s.isActive ? 'opacity-60' : ''}`}>
                {s.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.photoUrl} alt={s.name} className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">{cat.icon}</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-500">{cat.label} · {s.duration} min · {s._count?.appointments || 0} RDV</p>
                  {s.practitioner && <p className="text-xs text-slate-400">Praticien: {s.practitioner}</p>}
                  <p className="text-sm font-bold text-purple-700 mt-1">{s.price.toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(s)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <AppointmentsList />
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">{editing ? 'Modifier' : 'Nouveau'} soin</h2><button onClick={() => { setShowForm(false); resetForm(); }}><X className="w-5 h-5" /></button></div>
            <div className="space-y-3">
              <input type="text" placeholder="Nom *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="p-3 border border-slate-200 rounded-xl text-sm">{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}</select>
                <input type="number" placeholder="Durée (min)" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 60 })} className="p-3 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Prix FCFA" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} className="p-3 border border-slate-200 rounded-xl text-sm" />
                <input type="text" placeholder="Praticien" value={form.practitioner} onChange={(e) => setForm({ ...form, practitioner: e.target.value })} className="p-3 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Photo</label>
                {form.photoUrl ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.photoUrl} alt="" className="w-full h-32 rounded-xl object-cover" />
                    <button onClick={() => setForm({ ...form, photoUrl: '' })} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <label className="block w-full p-4 border-2 border-dashed border-slate-200 rounded-xl text-center cursor-pointer hover:border-purple-400"><span className="text-sm text-slate-500">📷 Ajouter une photo</span><input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" /></label>
                )}
              </div>
            </div>
            <button onClick={handleSave} className="w-full mt-4 py-3 bg-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-purple-700"><Save className="w-4 h-4" /> {editing ? 'Mettre à jour' : 'Créer'}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentsList() {
  const [appts, setAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        if (!sessionData.user?.agencyId) return;
        const res = await fetch(`/api/spa/appointment?agencyId=${sessionData.user.agencyId}`);
        const data = await res.json();
        if (data.success) setAppts(data.appointments);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>;
  if (appts.length === 0) return <div className="bg-white rounded-2xl border p-12 text-center"><p className="text-slate-500">Aucune réservation pour l'instant</p></div>;

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/spa/appointment?id=${id}&status=${status}&handledBy=Staff`, { method: 'PATCH' });
    const sessionRes = await fetch('/api/auth/session');
    const sessionData = await sessionRes.json();
    const res = await fetch(`/api/spa/appointment?agencyId=${sessionData.user.agencyId}`);
    const data = await res.json();
    if (data.success) setAppts(data.appointments);
  };

  const LABELS: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmé', completed: 'Terminé', cancelled: 'Annulé', no_show: 'No-show' };

  return (
    <div className="space-y-3">
      {appts.map((a) => (
        <div key={a.id} className="bg-white rounded-2xl border p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-bold text-slate-900">{a.spaService?.name || 'Soin'}</p>
              <p className="text-sm text-slate-600">{a.guestName || 'Client'} {a.roomNumber && `· Ch. ${a.roomNumber}`}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> {new Date(a.date).toLocaleString('fr-FR')} · {a.duration} min · {a.price?.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-bold bg-amber-100 text-amber-700">{LABELS[a.status] || a.status}</span>
          </div>
          {a.status === 'pending' && <button onClick={() => updateStatus(a.id, 'confirmed')} className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-lg">Confirmer</button>}
          {(a.status === 'pending' || a.status === 'confirmed') && <button onClick={() => updateStatus(a.id, 'completed')} className="w-full py-2 mt-1 bg-green-600 text-white text-sm font-bold rounded-lg">Terminer</button>}
        </div>
      ))}
    </div>
  );
}
