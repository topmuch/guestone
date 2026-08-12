'use client';

import Link from 'next/link';
import { QrCode, Smartphone, TrendingUp, Check, ArrowRight, Clock, Settings, Bell } from 'lucide-react';

const EMERALD = '#10B981';
const BLUE = '#2563EB';

export default function CommentCaMarchePage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F8FAFC 50%, #EFF6FF 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Comment ça marche
          </h1>
          <p className="text-lg text-slate-600">
            De la création à la première utilisation par vos clients — en moins de 24 heures.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12 mb-16">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/3">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto" style={{ backgroundColor: `${EMERALD}15` }}>
                <Settings className="w-10 h-10" style={{ color: EMERALD }} />
              </div>
              <div className="text-center mt-3">
                <span className="text-6xl font-bold text-slate-100">1</span>
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Créez votre espace</h2>
              <p className="text-slate-600 mb-4">
                Inscrivez-vous en 2 minutes. Configurez votre établissement (hôtel ou Airbnb), personnalisez votre profil, activez les modules dont vous avez besoin.
              </p>
              <ul className="space-y-2">
                {['Choisissez votre type d\'établissement', 'Activez les modules (services, spa, room service…)', 'Configurez vos équipes et notifications'].map((t, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4" style={{ color: EMERALD }} /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="md:w-1/3">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto" style={{ backgroundColor: `${BLUE}15` }}>
                <QrCode className="w-10 h-10" style={{ color: BLUE }} />
              </div>
              <div className="text-center mt-3">
                <span className="text-6xl font-bold text-slate-100">2</span>
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Générez vos QR codes</h2>
              <p className="text-slate-600 mb-4">
                Créez des QR codes pour vos chambres, bracelets pour vos clients, stickers pour vos logements Airbnb. Chaque QR est unique et sécurisé.
              </p>
              <ul className="space-y-2">
                {['QR codes pour chambres (carte)', 'Bracelets connectés pour clients', 'Stickers pour logements Airbnb', 'Livret digital pour le guide maison'].map((t, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4" style={{ color: BLUE }} /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/3">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto" style={{ backgroundColor: `${EMERALD}15` }}>
                <Smartphone className="w-10 h-10" style={{ color: EMERALD }} />
              </div>
              <div className="text-center mt-3">
                <span className="text-6xl font-bold text-slate-100">3</span>
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Vos clients scannent</h2>
              <p className="text-slate-600 mb-4">
                Le client scanne le QR code avec son téléphone. La WebApp s'ouvre instantanément — sans téléchargement, sans inscription. Tout est prêt.
              </p>
              <ul className="space-y-2">
                {['WebApp mobile-first, sans installation', 'Multilingue (FR, EN, ES)', 'Accès à tous les services activés', 'Interface élégante et intuitive'].map((t, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4" style={{ color: EMERALD }} /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="md:w-1/3">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto" style={{ backgroundColor: `${BLUE}15` }}>
                <TrendingUp className="w-10 h-10" style={{ color: BLUE }} />
              </div>
              <div className="text-center mt-3">
                <span className="text-6xl font-bold text-slate-100">4</span>
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Vous pilotez tout</h2>
              <p className="text-slate-600 mb-4">
                Depuis votre dashboard, gérez les demandes, commandes, réservations et avis. Les notifications arrivent en temps réel par email et push.
              </p>
              <ul className="space-y-2">
                {['Dashboard temps réel (demandes, commandes, SOS)', 'Notifications email + push', 'Statistiques et analytics', 'Gestion des équipes et du personnel'].map((t, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4" style={{ color: BLUE }} /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Combien de temps ?</h2>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { time: '2 min', label: 'Inscription', icon: Settings },
              { time: '10 min', label: 'Configuration', icon: Settings },
              { time: '30 min', label: 'Génération QR', icon: QrCode },
              { time: '24h', label: 'Premier client', icon: Smartphone },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${EMERALD}15` }}>
                  <step.icon className="w-6 h-6" style={{ color: EMERALD }} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{step.time}</p>
                <p className="text-sm text-slate-500">{step.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}>
          <h2 className="text-2xl font-bold text-white mb-4">Prêt à démarrer ?</h2>
          <p className="text-blue-50 mb-6">Créez votre espace Guest One aujourd'hui.</p>
          <a href="/demande-demo" className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-xl font-bold text-slate-900">
            Demander une démo <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
