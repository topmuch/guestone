'use client';

import Link from 'next/link';
import { QrCode, Smartphone, Check, ArrowRight, Clock, Wifi, Zap } from 'lucide-react';

const EMERALD = '#10B981';
const BLUE = '#2563EB';

export default function SolutionScanPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F8FAFC 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/#solution" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block">← Retour</Link>

        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${EMERALD}15` }}>
            <QrCode className="w-10 h-10" style={{ color: EMERALD }} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Le client scanne</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Un QR code sur le bracelet ou dans la chambre ouvre la WebApp instantanément. Pas de téléchargement, pas d'inscription, pas de friction.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Comment ça se passe</h2>
          <div className="space-y-6">
            {[
              { icon: QrCode, title: 'Le QR code est partout', desc: 'Sur le bracelet du client, sur la carte de la chambre, sur le sticker du logement Airbnb. Chaque QR est unique et sécurisé.' },
              { icon: Smartphone, title: 'Le client ouvre l\'appareil photo', desc: 'Pas besoin d\'application tierce. L\'appareil photo natif de iOS ou Android détecte le QR code automatiquement.' },
              { icon: Zap, title: 'La WebApp s\'ouvre instantanément', desc: 'En moins de 2 secondes, le client voit l\'accueil personnalisé avec le nom de l\'hôtel, sa chambre et tous les services disponibles.' },
              { icon: Check, title: 'Aucune inscription requise', desc: 'Le client n\'a pas à créer de compte, saisir un email ou un mot de passe. Le QR code est son passeport pour le séjour.' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${EMERALD}15` }}>
                  <step.icon className="w-6 h-6" style={{ color: EMERALD }} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-slate-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Clock, value: '< 2 sec', label: 'Temps d\'ouverture' },
            { icon: Wifi, value: '0 Mo', label: 'Téléchargement' },
            { icon: Check, value: '0 formulaire', label: 'Inscription' },
          ].map((b, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 text-center border border-slate-100">
              <b.icon className="w-8 h-8 mx-auto mb-2" style={{ color: EMERALD }} />
              <p className="text-2xl font-bold text-slate-900">{b.value}</p>
              <p className="text-sm text-slate-500">{b.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-3xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}>
          <h2 className="text-2xl font-bold text-white mb-4">Voulez-vous voir ça en action ?</h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/demo" className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-xl font-bold text-slate-900">
              Essayer la démo <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/demande-demo" className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur rounded-xl font-bold text-white border-2 border-white/30">
              Demander une démo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
