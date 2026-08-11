'use client';

import { useState, useEffect } from 'react';
import { ScrollText, Loader2, Search, Filter, Info, AlertTriangle, AlertCircle, XCircle } from 'lucide-react';

interface Log {
  id: string;
  level: string;
  message: string;
  source: string;
  metadata: string | null;
  createdAt: string;
}

const LEVEL_META: Record<string, { label: string; color: string; icon: typeof Info }> = {
  info: { label: 'Info', color: 'bg-blue-100 text-blue-700', icon: Info },
  warn: { label: 'Attention', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  error: { label: 'Erreur', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  fatal: { label: 'Critique', color: 'bg-rose-100 text-rose-700', icon: XCircle },
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, info: 0, warn: 0, error: 0, fatal: 0 });
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Log | null>(null);

  useEffect(() => { loadLogs(); }, [filterLevel, filterSource]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterLevel !== 'all') params.set('level', filterLevel);
      if (filterSource !== 'all') params.set('source', filterSource);
      params.set('limit', '200');
      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
        setStats(data.stats);
        setSources(data.sources);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filteredLogs = logs.filter((l) =>
    !search || l.message.toLowerCase().includes(search.toLowerCase()) || l.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
          <ScrollText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-sm text-slate-500">Journal complet des actions (PRD §12.7)</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { key: 'total', label: 'Total', value: stats.total, color: 'text-slate-900' },
          { key: 'info', label: 'Info', value: stats.info, color: 'text-blue-600' },
          { key: 'warn', label: 'Warn', value: stats.warn, color: 'text-amber-600' },
          { key: 'error', label: 'Error', value: stats.error, color: 'text-red-600' },
          { key: 'fatal', label: 'Fatal', value: stats.fatal, color: 'text-rose-600' },
        ].map((s) => (
          <div key={s.key} className="bg-white rounded-xl border p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* FILTRES */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
        >
          <option value="all">Tous les niveaux</option>
          <option value="info">Info</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
          <option value="fatal">Fatal</option>
        </select>
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
        >
          <option value="all">Toutes les sources</option>
          {sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher dans les messages…"
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* LISTE */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <ScrollText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Aucun log trouvé</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredLogs.slice(0, 100).map((log) => {
            const meta = LEVEL_META[log.level] || LEVEL_META.info;
            const Icon = meta.icon;
            return (
              <button
                key={log.id}
                onClick={() => setSelected(log)}
                className="w-full text-left bg-white rounded-lg border p-3 hover:shadow-sm transition flex items-start gap-3"
              >
                <Icon className={`w-4 h-4 mt-0.5 ${meta.color.split(' ')[1]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{log.message}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString('fr-FR')}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">{log.source}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* MODAL DETAILS */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Détail du log</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-500">Niveau</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${LEVEL_META[selected.level]?.color || ''}`}>
                  {LEVEL_META[selected.level]?.label || selected.level}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Source</p>
                <p className="font-mono text-slate-900">{selected.source}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Message</p>
                <p className="text-slate-900">{selected.message}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Date</p>
                <p className="text-slate-900">{new Date(selected.createdAt).toLocaleString('fr-FR')}</p>
              </div>
              {selected.metadata && (
                <div>
                  <p className="text-xs font-bold text-slate-500">Métadonnées</p>
                  <pre className="bg-slate-50 p-3 rounded-lg text-xs font-mono overflow-x-auto">{selected.metadata}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
