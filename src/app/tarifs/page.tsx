'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';

const EMERALD = '#10B981';
const BLUE = '#2563EB';

export default function TarifsPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Starter', badge: '🚀',
      monthly: 15000, yearly: 150000,
      desc: 'Essentiel pour démarrer',
      features: [
        '1 logement', '30 QR codes', '2 utilisateurs',
        'Demandes de services', 'Aide & contact', 'Retour à l\'hôtel',
        'Anti-bad review', 'Check-in / Check-out',
        'Guide maison', 'Wi-Fi', 'Contact concierge',
      ],
      color: EMERALD, popular: false,
    },
    {
      name: 'Pro', badge: '⭐',
      monthly: 35000, yearly: 350000,
      desc: 'Services, commandes, avis',
      features: [
        '5 logements', '200 QR codes', '8 utilisateurs',
        'Tout Starter +', 'Room service', 'Spa booking',
        'Mode dernier jour', 'Bracelet personne',
        'Tourisme géolocalisé', 'Escalade auto',
        'Push notifications',
      ],
      color: BLUE, popular: true,
    },
    {
      name: 'Premium', badge: '💎',
      monthly: 75000, yearly: 750000,
      desc: 'Spa, marketplace, assistance',
      features: [
        '20 logements', '1000 QR codes', '50 utilisateurs',
        'Tout Pro +', 'Marketplace locale',
        'Commissions multi-niveaux', 'SOS GPS temps réel',
        'PMS integration', 'RGPD complet', 'Audit logs',
        'Support prioritaire 24/7',
      ],
      color: EMERALD, popular: false,
    },
  ];

  const faqs = [
    { q: 'Puis-je changer de plan à tout moment ?', a: 'Oui, vous pouvez upgrader ou downgrader à tout moment. Le prorata est calculé automatiquement.' },
    { q: 'Y a-t-il un essai gratuit ?', a: 'Oui, tous les plans incluent 14 jours d\'essai gratuit, sans carte bancaire.' },
    { q: 'Les QR codes sont-ils inclus ?', a: 'Chaque plan inclut un quota de QR codes. Vous pouvez en commander d\'autres séparément.' },
    { q: 'Comment se passe le paiement ?', a: 'Par virement bancaire ou mobile money (Orange Money, Wave). Facturation mensuelle ou annuelle.' },
  ];

  return (
    <div className="min-h-screen pt-20" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F8FAFC 50%, #EFF6FF 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Des tarifs simples et transparents
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Choisissez l'offre qui correspond à votre établissement. Changez à tout moment.
          </p>

          {/* Toggle monthly/yearly */}
          <div className="inline-flex items-center gap-2 bg-white rounded-2xl p-1 border border-slate-200">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition ${billing === 'monthly' ? 'text-white' : 'text-slate-600'}`}
              style={billing === 'monthly' ? { background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` } : {}}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition ${billing === 'yearly' ? 'text-white' : 'text-slate-600'}`}
              style={billing === 'yearly' ? { background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` } : {}}
            >
              Annuel <span className="text-xs opacity-75">(-17%)</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => {
            const price = billing === 'yearly' ? plan.yearly : plan.monthly;
            return (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 border-2 ${plan.popular ? 'border-blue-500 shadow-xl md:scale-105' : 'border-slate-200 bg-white'}`}
                style={plan.popular ? { background: 'white' } : {}}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE})` }}>
                    POPULAIRE
                  </div>
                )}
                <div className="text-center mb-6">
                  <span className="text-4xl">{plan.badge}</span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-2">{plan.name}</h3>
                  <p className="text-sm text-slate-500">{plan.desc}</p>
                </div>
                <div className="text-center mb-8">
                  <span className="text-4xl font-bold text-slate-900">{price.toLocaleString('fr-FR')}</span>
                  <span className="text-slate-500"> FCFA / {billing === 'yearly' ? 'an' : 'mois'}</span>
                  {billing === 'yearly' && (
                    <p className="text-xs text-emerald-600 mt-1">Économisez {(plan.monthly * 12 - plan.yearly).toLocaleString('fr-FR')} FCFA/an</p>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: plan.color }} />
                      <span className="text-slate-700">{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/demande-demo"
                  className={`block w-full py-3 rounded-xl font-bold text-center transition-all ${plan.popular ? 'text-white' : 'border-2 border-slate-200 text-slate-900 hover:border-slate-300'}`}
                  style={plan.popular ? { background: `linear-gradient(135deg, ${BLUE}, ${BLUE})` } : {}}
                >
                  Choisir {plan.name}
                </a>
              </div>
            );
          })}
        </div>

        {/* Comparison table */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Comparaison détaillée</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold text-slate-700">Fonctionnalité</th>
                  <th className="text-center p-3 font-semibold text-slate-700">Starter</th>
                  <th className="text-center p-3 font-semibold" style={{ color: BLUE }}>Pro</th>
                  <th className="text-center p-3 font-semibold text-slate-700">Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Logements', '1', '5', '20'],
                  ['QR codes', '30', '200', '1000'],
                  ['Utilisateurs', '2', '8', '50'],
                  ['Demandes de services', '✓', '✓', '✓'],
                  ['Room service', '—', '✓', '✓'],
                  ['Spa booking', '—', '✓', '✓'],
                  ['Marketplace locale', '—', '—', '✓'],
                  ['SOS GPS temps réel', '—', '—', '✓'],
                  ['Bracelet personne', '—', '✓', '✓'],
                  ['Push notifications', '—', '✓', '✓'],
                  ['PMS integration', '—', '—', '✓'],
                  ['Audit logs', '—', '—', '✓'],
                  ['Support prioritaire', '—', '—', '✓'],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="p-3 font-medium text-slate-700">{row[0]}</td>
                    <td className="p-3 text-center text-slate-600">{row[1]}</td>
                    <td className="p-3 text-center font-medium" style={{ color: BLUE }}>{row[2]}</td>
                    <td className="p-3 text-center text-slate-600">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Questions sur les tarifs</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: EMERALD }} />
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">{faq.q}</p>
                    <p className="text-sm text-slate-600">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}>
          <h2 className="text-2xl font-bold text-white mb-4">Besoin d'aide pour choisir ?</h2>
          <p className="text-blue-50 mb-6">Notre équipe vous conseille l'offre la plus adaptée à votre établissement.</p>
          <a href="/demande-demo" className="inline-block px-8 py-3 bg-white rounded-xl font-bold text-slate-900">
            Parler à un expert
          </a>
        </div>
      </div>
    </div>
  );
}
