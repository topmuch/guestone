'use client';

import { useState } from 'react';
import { Shield, Download, Trash2, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminRgpdPage() {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/rgpd/export?agencyId=current', { method: 'GET' });
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      // Télécharge en JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rgpd-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Export téléchargé', description: 'Toutes les données ont été exportées' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur', description: 'Échec de l\'export', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/rgpd/delete?agencyId=current', {
        method: 'DELETE',
        headers: { 'x-confirm': 'DELETE-MY-DATA' },
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Données supprimées', description: 'Toutes les données personnelles ont été anonymisées' });
        setShowConfirm(false);
      } else {
        toast({ title: 'Erreur', description: data.error, variant: 'destructive' });
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur réseau', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">RGPD — Données personnelles</h1>
          <p className="text-sm text-slate-500">Export et suppression des données (droit à l'oubli)</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-900">
        <p className="font-semibold mb-1">📋 Conformité RGPD</p>
        <p>Le RGPD (Règlement Général sur la Protection des Données) accorde aux utilisateurs les droits suivants :</p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
          <li><strong>Droit d'accès</strong> : exporter toutes les données stockées</li>
          <li><strong>Droit à l'oubli</strong> : supprimer/anonymiser les données personnelles</li>
          <li><strong>Traçabilité</strong> : tous les exports et suppressions sont journalisés</li>
        </ul>
      </div>

      {/* EXPORT */}
      <div className="bg-white rounded-2xl border p-6 mb-4">
        <h2 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-500" />
          Exporter les données
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Téléchargez toutes les données personnelles stockées pour ce compte au format JSON.
          Inclut : séjours, demandes, avis, commandes, messages, etc.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 flex items-center gap-2"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Télécharger l'export
        </button>
      </div>

      {/* DELETE */}
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
        <h2 className="font-bold text-red-900 mb-2 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-500" />
          Supprimer les données (droit à l'oubli)
        </h2>
        <p className="text-sm text-red-700 mb-4">
          <strong>Action irréversible.</strong> Toutes les données personnelles seront anonymisées.
          Les noms, emails, téléphones seront remplacés par "[Deleted]".
          Les enregistrements sont conservés pour audit mais sans données personnelles.
        </p>

        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            Cette action supprimera : séjours, demandes, avis, commandes, messages, bracelets.
            Les services configurés et les équipes resteront (données business, pas personnelles).
          </p>
        </div>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer mes données
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-bold text-red-900">⚠️ Confirmer la suppression définitive ?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Oui, supprimer tout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
