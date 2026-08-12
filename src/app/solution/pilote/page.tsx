'use client';

import Link from 'next/link';
import { TrendingUp, Bell, Star, Check, ArrowRight, Clock, Users, BarChart3 } from 'lucide-react';

const EMERALD = '#10B981';
const BLUE = '#2563EB';

export default function SolutionPilotePage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F8FAFC 50%, #EFF6FF 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/#solution" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block">← Retour</Link>

        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${EMERALD}15` }}>
            <TrendingUp className="w-10 h-10" style={{ color: EMERALD }} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Vous pilotez tout</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Un dashboard simple pour gérer les demandes, commandes, réservations et avis. Les notifications arrivent en temps réel.
          </p>
        </div>

        {/* Dashboard preview */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Le dashboard staff</h2>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Nouvelles', value: 3, color: BLUE },
              { label: 'En cours', value: 7, color: EMERALD },
              { label: 'Livrées', value: 24, color: '#94a3b8' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[
              { icon: Bell, text: 'Serviettes — Ch. 204', time: 'il y a 2 min', status: 'Nouvelle' },
              { icon: Bell, text: 'Room Service — Ch. 102', time: 'il y a 5 min', status: 'En cours' },
              { icon: Star, text: 'Avis 5★ — Ch. 301', time: 'il y a 12 min', status: 'Traité' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <item.icon className="w-5 h-5 shrink-0" style={{ color: EMERALD }} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{item.text}</p>
                  <p className="text-xs text-slate-400">{item.time}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-bold" style={{
                  backgroundColor: item.status === 'Nouvelle' ? `${BLUE}15` : item.status === 'En cours' ? `${EMERALD}15` : '#f1f5f9',
                  color: item.status === 'Nouvelle' ? BLUE : item.status === 'En cours' ? EMERALD : '#64748b',
                }}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {[
            { icon: Bell, title: 'Notifications temps réel', desc: 'Email + push notifications. Chaque demande arrive instantanément sur le téléphone du staff.' },
            { icon: Clock, title: 'Escalade automatique', desc: 'Une demande non traitée après 15 min ? Le manager est alerté automatiquement par email.' },
            { icon: Users, title: 'Gestion des équipes', desc: '1 email par catégorie (réception, ménage, cuisine, spa). Les demandes sont routées automatiquement.' },
            { icon: BarChart3, title: 'Statistiques', desc: 'Temps de réponse, demandes par service, taux de résolution, scans, revenus additionnels.' },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${EMERALD}15` }}>
                  <f.icon className="w-5 h-5" style={{ color: EMERALD }} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-600">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-3xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}>
          <h2 className="text-2xl font-bold text-white mb-4">Prêt à piloter votre établissement ?</h2>
          <Link href="/demande-demo" className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-xl font-bold text-slate-900">
            Demander une démo <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
