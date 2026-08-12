'use client';

import Link from 'next/link';
import { Smartphone, Bell, ShoppingCart, Sparkles, MapPin, Star, Check, ArrowRight, Globe } from 'lucide-react';

const EMERALD = '#10B981';
const BLUE = '#2563EB';

export default function SolutionAccedePage() {
  const services = [
    { icon: Bell, label: 'Demandes', color: EMERALD },
    { icon: ShoppingCart, label: 'Room Service', color: BLUE },
    { icon: Sparkles, label: 'Spa', color: EMERALD },
    { icon: MapPin, label: 'Tourisme', color: BLUE },
    { icon: Star, label: 'Avis', color: EMERALD },
    { icon: Globe, label: 'Multilingue', color: BLUE },
  ];

  return (
    <div className="min-h-screen pt-20" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/#solution" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block">← Retour</Link>

        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${BLUE}15` }}>
            <Smartphone className="w-10 h-10" style={{ color: BLUE }} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Il accède aux services</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tout est centralisé dans une interface élégante et multilingue. Le client trouve immédiatement ce qu'il cherche.
          </p>
        </div>

        {/* WebApp mockup */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">L'interface client</h2>
          <div className="max-w-xs mx-auto">
            <div className="rounded-[2rem] border-8 border-slate-900 bg-white shadow-2xl overflow-hidden">
              <div className="pt-8 pb-6 px-4 text-center" style={{ background: `linear-gradient(135deg, ${EMERALD}15, ${BLUE}15)` }}>
                <p className="text-xs text-slate-500">Bonjour</p>
                <h3 className="font-bold text-slate-900">Hôtel Baobab</h3>
                <p className="text-xs text-slate-400">Chambre 204</p>
              </div>
              <div className="p-4 grid grid-cols-3 gap-2">
                {services.map((s, i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1" style={{ backgroundColor: `${s.color}15` }}>
                      <s.icon className="w-5 h-5" style={{ color: s.color }} />
                    </div>
                    <span className="text-[9px] font-semibold text-slate-700 text-center">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {[
            { title: 'Interface mobile-first', desc: 'Pensée pour le téléphone du client. Gros boutons, navigation en 1 tap, lecture en Z.' },
            { title: 'Multilingue automatique', desc: 'FR, EN, ES. La langue se détecte automatiquement selon le navigateur du client.' },
            { title: 'Personnalisée', desc: 'Le client voit son nom, sa chambre, ses dates de séjour. Un accueil sur-mesure.' },
            { title: 'Geofencing intelligent', desc: 'L\'onglet "Autour de moi" s\'active automatiquement quand le client sort de l\'hôtel.' },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Check className="w-5 h-5" style={{ color: BLUE }} /> {f.title}
              </h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-3xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${BLUE}, ${EMERALD})` }}>
          <h2 className="text-2xl font-bold text-white mb-4">Voyez l'interface par vous-même</h2>
          <Link href="/demo" className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-xl font-bold text-slate-900">
            Essayer la démo <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
