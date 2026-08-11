'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Loader2, Search, Check, Zap, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Agency {
  id: string;
  name: string;
  slug: string;
  agencyType: string;
  email: string | null;
}

interface Plan {
  id: string;
  name: string;
  badge: string | null;
  priceMonthly: number;
  priceYearly: number;
  maxProperties: number;
  maxQRCodes: number;
  maxUsers: number;
}

interface SubscriptionInfo {
  planId: string;
  planName: string;
  badge: string | null;
  status: string;
  maxProperties: number;
  maxQRCodes: number;
  maxUsers: number;
  endDate: string | null;
}

export default function AdminAbonnementsPage() {
  const { toast } = useToast();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [search, setSearch] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [trialDays, setTrialDays] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/agencies').then((r) => r.json()),
      fetch('/api/plans').then((r) => r.json()),
    ]).then(([agenciesData, plansData]) => {
      if (agenciesData.success || agenciesData.agencies) setAgencies(agenciesData.agencies || []);
      if (plansData.success) setPlans(plansData.plans);
    }).finally(() => setLoading(false));
  }, []);

  const fetchSubscription = async (agencyId: string) => {
    setSelectedAgency(agencyId);
    try {
      const res = await fetch(`/api/subscription?agencyId=${agencyId}`);
      const data = await res.json();
      if (data.success) setSubscription(data.subscription);
    } catch (e) { console.error(e); }
  };

  const assignPlan = async (planId: string) => {
    if (!selectedAgency) return;
    setAssigning(true);
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId: selectedAgency,
          planId,
          billingCycle,
          trialDays,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Abonnement mis à jour', description: 'Plan assigné + modules activés automatiquement' });
        fetchSubscription(selectedAgency);
      } else {
        toast({ title: 'Erreur', description: data.error, variant: 'destructive' });
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur réseau', variant: 'destructive' });
    } finally {
      setAssigning(false);
    }
  };

  const filteredAgencies = agencies.filter((a) =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.slug.includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Abonnements</h1>
          <p className="text-sm text-slate-500">Assignez des plans aux tenants</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LISTE TENANTS */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border p-4">
            <h2 className="text-sm font-bold text-slate-700 mb-3">Tenants ({agencies.length})</h2>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-lg text-sm outline-none focus:border-violet-400"
              />
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {filteredAgencies.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => fetchSubscription(a.id)}
                    className={`w-full text-left p-3 rounded-xl transition ${
                      selectedAgency === a.id ? 'bg-violet-600 text-white' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <p className="font-semibold text-sm truncate">{a.name}</p>
                    <p className={`text-xs ${selectedAgency === a.id ? 'text-violet-100' : 'text-slate-500'}`}>
                      {a.agencyType === 'airbnb' ? '🏠 Airbnb' : '🏨 Hôtel'}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PLAN ACTUEL + ASSIGNATION */}
        <div className="lg:col-span-2">
          {!selectedAgency ? (
            <div className="bg-white rounded-2xl border p-12 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600">Sélectionnez un tenant pour gérer son abonnement</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* PLAN ACTUEL */}
              <div className="bg-white rounded-2xl border p-5">
                <h2 className="text-sm font-bold text-slate-700 mb-3">Plan actuel</h2>
                {subscription ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {subscription.badge && <span className="text-3xl">{subscription.badge}</span>}
                      <div>
                        <p className="text-xl font-bold text-slate-900">{subscription.planName}</p>
                        <p className="text-sm text-slate-500">
                          Statut: <span className="font-medium capitalize">{subscription.status}</span>
                          {subscription.endDate && ` · jusqu'au ${new Date(subscription.endDate).toLocaleDateString('fr-FR')}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>{subscription.maxProperties} logements</p>
                      <p>{subscription.maxQRCodes} QR codes</p>
                      <p>{subscription.maxUsers} users</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-slate-500">Aucun abonnement actif</p>
                    <p className="text-xs text-slate-400 mt-1">Sélectionnez un plan ci-dessous pour l'activer</p>
                  </div>
                )}
              </div>

              {/* OPTIONS DE FACTURATION */}
              <div className="bg-white rounded-2xl border p-5">
                <h2 className="text-sm font-bold text-slate-700 mb-3">Options de facturation</h2>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`py-2 rounded-lg text-sm font-medium border-2 ${billingCycle === 'monthly' ? 'border-violet-500 bg-violet-50' : 'border-slate-200'}`}
                  >
                    Mensuel
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`py-2 rounded-lg text-sm font-medium border-2 ${billingCycle === 'yearly' ? 'border-violet-500 bg-violet-50' : 'border-slate-200'}`}
                  >
                    Annuel (-17%)
                  </button>
                </div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Période d'essai (jours, 0 = aucun)</label>
                <input
                  type="number"
                  value={trialDays}
                  onChange={(e) => setTrialDays(parseInt(e.target.value) || 0)}
                  min={0}
                  max={90}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              {/* PLANS DISPONIBLES */}
              <div className="bg-white rounded-2xl border p-5">
                <h2 className="text-sm font-bold text-slate-700 mb-3">Changer de plan</h2>
                <div className="space-y-3">
                  {plans.map((p) => {
                    const isCurrent = subscription?.planId === p.id;
                    const price = billingCycle === 'yearly' ? p.priceYearly : p.priceMonthly;
                    return (
                      <div
                        key={p.id}
                        className={`p-4 rounded-xl border-2 flex items-center justify-between ${
                          isCurrent ? 'border-green-500 bg-green-50' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {p.badge && <span className="text-2xl">{p.badge}</span>}
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <p className="text-xs text-slate-500">
                              {price.toLocaleString('fr-FR')} FCFA/{billingCycle === 'yearly' ? 'an' : 'mois'} · {p.maxProperties} logements · {p.maxQRCodes} QR · {p.maxUsers} users
                            </p>
                          </div>
                        </div>
                        {isCurrent ? (
                          <span className="flex items-center gap-1 text-green-700 font-medium text-sm">
                            <Check className="w-4 h-4" /> Actuel
                          </span>
                        ) : (
                          <button
                            onClick={() => assignPlan(p.id)}
                            disabled={assigning}
                            className="px-4 py-2 bg-violet-600 text-white text-sm font-bold rounded-lg hover:bg-violet-700 disabled:opacity-60 flex items-center gap-1.5"
                          >
                            {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Activer
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
