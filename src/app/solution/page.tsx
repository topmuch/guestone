'use client';

import Link from 'next/link';
import { QrCode, Smartphone, TrendingUp, ArrowRight } from 'lucide-react';

const EMERALD = '#10B981';
const BLUE = '#2563EB';

export default function SolutionIndexPage() {
  const steps = [
    {
      href: '/solution/scan',
      icon: QrCode,
      title: 'Le client scanne',
      desc: 'Un QR code ouvre la WebApp instantanément. Sans installation, sans inscription.',
      color: EMERALD,
    },
    {
      href: '/solution/accede',
      icon: Smartphone,
      title: 'Il accède aux services',
      desc: 'Room service, spa, ménage, tourisme, assistance. Tout est centralisé et multilingue.',
      color: BLUE,
    },
    {
      href: '/solution/pilote',
      icon: TrendingUp,
      title: 'Vous pilotez tout',
      desc: 'Un dashboard pour gérer demandes, commandes, avis et revenus en temps réel.',
      color: EMERALD,
    },
  ];

  return (
    <div className="min-h-screen pt-20" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F8FAFC 50%, #EFF6FF 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Guest One : un QR code, tout le séjour.
          </h1>
          <p className="text-lg text-slate-600">
            Trois étapes simples pour transformer l'expérience de vos clients.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {steps.map((step, i) => (
            <Link
              key={i}
              href={step.href}
              className="group bg-white rounded-3xl p-8 border-2 border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${step.color}15` }}>
                  <step.icon className="w-7 h-7" style={{ color: step.color }} />
                </div>
                <div className="absolute top-0 right-0 text-6xl font-bold text-slate-100">{i + 1}</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">{step.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm font-bold group-hover:gap-2 transition-all" style={{ color: step.color }}>
                En savoir plus <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
