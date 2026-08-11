'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Puzzle, Loader2, Search, Building2, CheckCircle2, XCircle, AlertCircle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ModuleItem {
  key: string;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  dependencies: string | null;
  isRequired: boolean;
  phase: string;
  effectiveEnabled: boolean;
  tenantOverride: boolean | null;
  config: Record<string, unknown> | null;
}

interface Agency {
  id: string;
  name: string;
  slug: string;
  agencyType: string;
  email: string | null;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  core: { label: 'Core', color: 'bg-slate-100 text-slate-700' },
  hotel: { label: 'Hôtel', color: 'bg-blue-100 text-blue-700' },
  airbnb: { label: 'Airbnb', color: 'bg-amber-100 text-amber-700' },
  business: { label: 'Business', color: 'bg-violet-100 text-violet-700' },
  premium: { label: 'Premium', color: 'bg-rose-100 text-rose-700' },
};

const PHASE_LABELS: Record<string, string> = {
  mvp: 'MVP',
  v2: 'V2',
  v3: 'V3',
};

export default function AdminModulesPage() {
  const { toast } = useToast();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingModules, setLoadingModules] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      // Récupère toutes les agences via l'API admin existante
      const res = await fetch('/api/admin/agencies');
      const data = await res.json();
      if (data.success || data.agencies) {
        setAgencies(data.agencies || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchModules = async (agencyId: string) => {
    setLoadingModules(true);
    setSelectedAgency(agencyId);
    try {
      const res = await fetch(`/api/modules/tenant?agencyId=${agencyId}`);
      const data = await res.json();
      if (data.success) setModules(data.modules);
    } catch (e) { console.error(e); }
    finally { setLoadingModules(false); }
  };

  const toggleModule = async (moduleKey: string, enabled: boolean) => {
    if (!selectedAgency) return;
    setSaving(moduleKey);
    try {
      const res = await fetch('/api/modules/tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId: selectedAgency, moduleKey, enabled }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setModules((prev) =>
          prev.map((m) =>
            m.key === moduleKey
              ? { ...m, effectiveEnabled: enabled, tenantOverride: enabled }
              : m
          )
        );
        toast({
          title: enabled ? 'Module activé' : 'Module désactivé',
          description: `${moduleKey} ${enabled ? 'activé' : 'désactivé'}`,
        });
      } else {
        toast({ title: 'Erreur', description: data.error, variant: 'destructive' });
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur réseau', variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const filteredAgencies = agencies.filter((a) =>
    !search ||
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.slug.toLowerCase().includes(search.toLowerCase()) ||
    (a.email || '').toLowerCase().includes(search.toLowerCase())
  );

  // Group modules by category
  const groupedModules = modules.reduce((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {} as Record<string, ModuleItem[]>);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#134288] flex items-center justify-center">
            <Puzzle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Module Activation Engine</h1>
            <p className="text-sm text-slate-500">
              Activez ou désactivez les modules pour chaque tenant (PRD §19)
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ─── LISTE TENANTS ─── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Tenants ({agencies.length})
              </h2>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher…"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-lg text-sm outline-none focus:border-[#134288]"
                />
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="space-y-1 max-h-[600px] overflow-y-auto">
                  {filteredAgencies.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => fetchModules(a.id)}
                      className={`w-full text-left p-3 rounded-xl transition ${
                        selectedAgency === a.id
                          ? 'bg-[#134288] text-white'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{a.name}</p>
                          <p className={`text-xs ${selectedAgency === a.id ? 'text-blue-100' : 'text-slate-500'}`}>
                            {a.agencyType === 'airbnb' ? '🏠 Airbnb' : a.agencyType === 'hotel' ? '🏨 Hôtel' : '📦 ' + a.agencyType}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── MODULES DU TENANT SÉLECTIONNÉ ─── */}
          <div className="lg:col-span-2">
            {!selectedAgency ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Puzzle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600">Sélectionnez un tenant pour gérer ses modules</p>
              </div>
            ) : loadingModules ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#134288]" />
              </div>
            ) : (
              <div className="space-y-5">
                {Object.entries(groupedModules).map(([category, mods]) => {
                  const meta = CATEGORY_LABELS[category] || { label: category, color: 'bg-slate-100 text-slate-700' };
                  return (
                    <div key={category} className="bg-white rounded-2xl border border-slate-200 p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className="text-xs text-slate-400">({mods.filter((m) => m.effectiveEnabled).length}/{mods.length} actifs)</span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {mods.map((m) => (
                          <div
                            key={m.key}
                            className={`p-4 rounded-xl border-2 transition ${
                              m.effectiveEnabled
                                ? 'border-green-200 bg-green-50/50'
                                : 'border-slate-200 bg-slate-50/50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{m.icon}</span>
                                <div>
                                  <h3 className="font-semibold text-slate-900 text-sm">{m.name}</h3>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                      m.phase === 'mvp' ? 'bg-green-100 text-green-700' :
                                      m.phase === 'v2' ? 'bg-amber-100 text-amber-700' :
                                      'bg-rose-100 text-rose-700'
                                    }`}>
                                      {PHASE_LABELS[m.phase] || m.phase}
                                    </span>
                                    {m.isRequired && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold flex items-center gap-0.5">
                                        <Lock className="w-2.5 h-2.5" /> Requis
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => toggleModule(m.key, !m.effectiveEnabled)}
                                disabled={m.isRequired || saving === m.key}
                                className={`relative w-11 h-6 rounded-full transition ${
                                  m.effectiveEnabled ? 'bg-green-500' : 'bg-slate-300'
                                } ${m.isRequired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                title={m.isRequired ? 'Module obligatoire' : ''}
                              >
                                <span
                                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                    m.effectiveEnabled ? 'translate-x-5' : ''
                                  }`}
                                />
                                {saving === m.key && (
                                  <Loader2 className="absolute inset-0 m-auto w-3 h-3 animate-spin text-white" />
                                )}
                              </button>
                            </div>
                            {m.description && (
                              <p className="text-xs text-slate-600 mb-2">{m.description}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs">
                              {m.effectiveEnabled ? (
                                <span className="flex items-center gap-1 text-green-700 font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Activé
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-slate-500 font-medium">
                                  <XCircle className="w-3.5 h-3.5" /> Désactivé
                                </span>
                              )}
                              {m.tenantOverride !== null && (
                                <span className="text-[10px] text-amber-600">• personnalisé</span>
                              )}
                            </div>
                            {m.dependencies && (
                              <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Dépend de: {m.dependencies}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
