'use client';

import { useState, useEffect } from 'react';
import { Star, Loader2, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';
import { useAgency } from '../layout';

interface Feedback {
  id: string;
  rating: number;
  comment: string | null;
  routing: string;
  status: string;
  createdAt: string;
  handledBy?: string | null;
  handledAt?: string | null;
  baggage?: { reference: string } | null;
  complaint: {
    id: string;
    category: string;
    description: string;
    urgency: string;
    status: string;
    resolution?: string | null;
  } | null;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  cleanliness: { label: 'Propreté', emoji: '🧹' },
  noise: { label: 'Bruit', emoji: '🔊' },
  service: { label: 'Service', emoji: '🛎️' },
  comfort: { label: 'Confort', emoji: '🛏️' },
  billing: { label: 'Facturation', emoji: '💰' },
  other: { label: 'Autre', emoji: '📋' },
};

const URGENCY_COLORS: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
};

export default function AvisPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'high'>('all');
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    if (agencyId) loadFeedbacks();
  }, [agencyId]);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      if (!agencyId) return;
      const res = await fetch(`/api/feedback?agencyId=${agencyId}`);
      const data = await res.json();
      if (data.success) setFeedbacks(data.feedbacks);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleResolve = async (complaintId: string) => {
    if (!resolution.trim()) return;
    setResolving(complaintId);
    try {
      const res = await fetch('/api/feedback/complaint', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: complaintId,
          status: 'resolved',
          resolution: resolution,
          resolvedBy: 'Manager',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResolution('');
        loadFeedbacks();
      }
    } catch (e) { console.error(e); }
    finally { setResolving(null); }
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (filter === 'low') return f.rating <= 3;
    if (filter === 'high') return f.rating >= 4;
    return true;
  });

  const stats = {
    total: feedbacks.length,
    average: feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : '—',
    low: feedbacks.filter((f) => f.rating <= 3).length,
    high: feedbacks.filter((f) => f.rating >= 4).length,
    open: feedbacks.filter((f) => f.complaint && f.complaint.status === 'open').length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
          <Star className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Avis & Réclamations</h1>
          <p className="text-sm text-slate-500">Anti-Bad Review — interceptez les mauvais avis avant qu'ils soient publics</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500">Total avis</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-amber-600">{stats.average}</p>
          <p className="text-xs text-slate-500">Note moyenne</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-green-600">{stats.high}</p>
          <p className="text-xs text-slate-500">Avis positifs (4-5⭐)</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-red-600">{stats.low}</p>
          <p className="text-xs text-slate-500">Réclamations (1-3⭐)</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-amber-600">{stats.open}</p>
          <p className="text-xs text-slate-500">Tickets ouverts</p>
        </div>
      </div>

      {/* FILTRES */}
      <div className="flex gap-2 mb-4">
        {[
          { value: 'all', label: 'Tous' },
          { value: 'low', label: '🔴 Réclamations' },
          { value: 'high', label: '🟢 Avis positifs' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as 'all' | 'low' | 'high')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === f.value ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LISTE */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Aucun avis pour l'instant</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFeedbacks.map((f) => (
            <div key={f.id} className="bg-white rounded-2xl border p-5">
              <div className="flex items-start gap-4">
                {/* Note */}
                <div className="flex flex-col items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= f.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-full ${
                    f.rating >= 4 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {f.rating >= 4 ? 'Public' : 'Privé'}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {f.comment && (
                    <p className="text-sm text-slate-700 mb-2 italic">"{f.comment}"</p>
                  )}

                  {f.complaint && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{CATEGORY_LABELS[f.complaint.category]?.emoji || '📋'}</span>
                        <span className="text-sm font-semibold text-slate-900">
                          {CATEGORY_LABELS[f.complaint.category]?.label || f.complaint.category}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${URGENCY_COLORS[f.complaint.urgency] || URGENCY_COLORS.normal}`}>
                          {f.complaint.urgency}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          f.complaint.status === 'open' ? 'bg-red-100 text-red-700' :
                          f.complaint.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {f.complaint.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{f.complaint.description}</p>

                      {f.complaint.resolution && (
                        <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
                          <p className="text-xs font-semibold text-green-700">Résolution:</p>
                          <p className="text-sm text-green-800">{f.complaint.resolution}</p>
                        </div>
                      )}

                      {f.complaint.status === 'open' && (
                        <div className="mt-3">
                          <textarea
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            placeholder="Décrivez la résolution apportée…"
                            rows={2}
                            className="w-full p-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:border-amber-400 mb-2"
                          />
                          <button
                            onClick={() => handleResolve(f.complaint!.id)}
                            disabled={resolving === f.complaint!.id || !resolution.trim()}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {resolving === f.complaint!.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Marquer résolu
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span>{new Date(f.createdAt).toLocaleString('fr-FR')}</span>
                    {f.baggage && <span>· Bracelet: {f.baggage.reference}</span>}
                    {f.handledBy && <span>· Traité par {f.handledBy}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
