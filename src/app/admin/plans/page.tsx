'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Loader2, Check, Plus, Edit, X, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  maxProperties: number;
  maxQRCodes: number;
  maxUsers: number;
  includedModules: string | null;
  badge: string | null;
  isPopular: boolean;
  sortOrder: number;
  _count?: { subscriptions: number };
}

export default function AdminPlansPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/plans');
      const data = await res.json();
      if (data.success) setPlans(data.plans);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const togglePopular = async (id: string, isPopular: boolean) => {
    // TODO: API PATCH
    toast({ title: 'Bientôt disponible', description: 'Édition via formulaire' });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Plans & Tarifs</h1>
            <p className="text-sm text-slate-500">Gérez les offres d'abonnement</p>
          </div>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700"
        >
          <Plus className="w-4 h-4" /> Nouveau plan
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-2xl border-2 p-6 relative ${
                p.isPopular ? 'border-violet-500 shadow-lg' : 'border-slate-200'
              }`}
            >
              {p.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAIRE
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                {p.badge && <span className="text-3xl">{p.badge}</span>}
                <h2 className="text-xl font-bold text-slate-900">{p.name}</h2>
              </div>
              {p.description && <p className="text-sm text-slate-500 mb-4">{p.description}</p>}

              <div className="mb-4">
                <p className="text-3xl font-bold text-slate-900">
                  {p.priceMonthly.toLocaleString('fr-FR')}
                  <span className="text-base font-normal text-slate-500"> FCFA/mois</span>
                </p>
                <p className="text-sm text-slate-500">
                  {p.priceYearly.toLocaleString('fr-FR')} FCFA/an
                </p>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{p.maxProperties} logement(s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{p.maxQRCodes} QR codes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{p.maxUsers} utilisateurs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <span>
                    {p.includedModules ? `${JSON.parse(p.includedModules).length} modules` : 'Tous les modules'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-400 pt-3 border-t">
                {p._count?.subscriptions || 0} tenant(s) abonné(s)
              </div>

              <button
                onClick={() => { setEditing(p); setShowForm(true); }}
                className="w-full mt-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 flex items-center justify-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" /> Modifier
              </button>
            </div>
          ))}
        </div>
      )}

      {/* FORM MODAL */}
      {showForm && (
        <PlanFormModal
          plan={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); loadPlans(); }}
        />
      )}
    </div>
  );
}

function PlanFormModal({ plan, onClose, onSaved }: { plan: Plan | null; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    priceMonthly: plan?.priceMonthly || 0,
    priceYearly: plan?.priceYearly || 0,
    maxProperties: plan?.maxProperties || 1,
    maxQRCodes: plan?.maxQRCodes || 50,
    maxUsers: plan?.maxUsers || 3,
    badge: plan?.badge || '',
    isPopular: plan?.isPopular || false,
    sortOrder: plan?.sortOrder || 0,
    includedModules: plan?.includedModules ? JSON.parse(plan.includedModules).join(', ') : '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        includedModules: form.includedModules
          ? form.includedModules.split(',').map((s) => s.trim()).filter(Boolean)
          : null,
      };
      // Pour MVP on crée seulement (pas d'édition)
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Plan créé', description: form.name });
        onSaved();
      } else {
        toast({ title: 'Erreur', description: data.error, variant: 'destructive' });
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur réseau', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{plan ? 'Modifier' : 'Nouveau'} plan</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nom *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Badge (emoji)</label>
              <input type="text" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Prix mensuel (FCFA)</label>
              <input type="number" value={form.priceMonthly} onChange={(e) => setForm({ ...form, priceMonthly: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Prix annuel (FCFA)</label>
              <input type="number" value={form.priceYearly} onChange={(e) => setForm({ ...form, priceYearly: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Max logements</label>
              <input type="number" value={form.maxProperties} onChange={(e) => setForm({ ...form, maxProperties: parseInt(e.target.value) || 1 })}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Max QR codes</label>
              <input type="number" value={form.maxQRCodes} onChange={(e) => setForm({ ...form, maxQRCodes: parseInt(e.target.value) || 50 })}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Max users</label>
              <input type="number" value={form.maxUsers} onChange={(e) => setForm({ ...form, maxUsers: parseInt(e.target.value) || 3 })}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Modules inclus (clés séparées par virgule, vide = tous)</label>
            <textarea value={form.includedModules} onChange={(e) => setForm({ ...form, includedModules: e.target.value })}
              rows={2} placeholder="core_access, qr_bracelet, room_service, spa_booking…"
              className="w-full p-2 border border-slate-200 rounded-lg text-sm font-mono" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} />
            <span className="text-sm">Plan populaire (mis en avant)</span>
          </label>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium">Annuler</button>
          <button onClick={handleSave} disabled={saving || !form.name}
            className="flex-1 py-2 bg-violet-600 text-white rounded-lg font-bold disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {plan ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}
