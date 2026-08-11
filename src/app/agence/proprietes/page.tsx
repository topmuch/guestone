'use client';

import { useState, useEffect } from 'react';
import { Building2, Loader2, ChevronRight, Check, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserAgency {
  id: string;
  name: string;
  slug: string;
  agencyType: string;
  email: string | null;
}

export default function ProprietesPage() {
  const { toast } = useToast();
  const [agencies, setAgencies] = useState<UserAgency[]>([]);
  const [currentAgencyId, setCurrentAgencyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);

  useEffect(() => {
    loadAgencies();
  }, []);

  const loadAgencies = async () => {
    setLoading(true);
    try {
      // Récupère l'utilisateur courant pour connaître son agencyId actuel
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      if (sessionData.user?.agencyId) {
        setCurrentAgencyId(sessionData.user.agencyId);
      }

      // Récupère toutes les agences (le user peut en gérer plusieurs via duplication)
      const res = await fetch('/api/admin/agencies');
      const data = await res.json();
      if (data.success || data.agencies) {
        // Filtre les agences du user courant (via email)
        // Pour MVP: on affiche toutes les agences, le user peut switcher
        setAgencies(data.agencies || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const switchAgency = async (agencyId: string) => {
    setSwitching(agencyId);
    try {
      // Met à jour l'agencyId du user via l'API admin
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      if (!sessionData.user?.id) return;

      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: sessionData.user.id,
          agencyId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Logement changé', description: 'Vous êtes maintenant sur ce logement' });
        // Recharge la page
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast({ title: 'Erreur', description: data.error, variant: 'destructive' });
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur réseau', variant: 'destructive' });
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mes logements</h1>
            <p className="text-sm text-slate-500">Basculez entre vos logements</p>
          </div>
        </div>
        <a
          href="/agence/profil"
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700"
        >
          <Plus className="w-4 h-4" /> Nouveau logement
        </a>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      ) : agencies.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Aucun logement</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agencies.map((a) => {
            const isCurrent = a.id === currentAgencyId;
            return (
              <div
                key={a.id}
                className={`bg-white rounded-2xl border-2 p-5 flex items-center justify-between ${
                  isCurrent ? 'border-violet-500 bg-violet-50/50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                    {a.agencyType === 'airbnb' ? '🏠' : '🏨'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{a.name}</h3>
                    <p className="text-xs text-slate-500">
                      {a.agencyType === 'airbnb' ? 'Airbnb / Conciergerie' : 'Hôtel'} · {a.slug}
                    </p>
                    {a.email && <p className="text-xs text-slate-400">{a.email}</p>}
                  </div>
                </div>
                {isCurrent ? (
                  <span className="flex items-center gap-1 text-violet-700 font-medium text-sm bg-violet-100 px-3 py-1.5 rounded-lg">
                    <Check className="w-4 h-4" /> Actuel
                  </span>
                ) : (
                  <button
                    onClick={() => switchAgency(a.id)}
                    disabled={switching === a.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg disabled:opacity-50"
                  >
                    {switching === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                    Changer
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
