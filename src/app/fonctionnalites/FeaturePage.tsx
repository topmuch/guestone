'use client';

import Link from 'next/link';
import { Check, ArrowRight, Star } from 'lucide-react';

const EMERALD = '#10B981';
const BLUE = '#2563EB';

interface FeaturePageProps {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  features: { title: string; desc: string }[];
  testimonials?: { name: string; role: string; text: string }[];
  color?: string;
}

export default function FeaturePage({ image, title, subtitle, description, features, testimonials, color = EMERALD }: FeaturePageProps) {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F8FAFC 50%, #EFF6FF 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/fonctionnalites" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block">← Toutes les fonctionnalités</Link>

        {/* Hero */}
        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <p className="text-sm font-bold mb-2" style={{ color }}>{subtitle}</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{title}</h1>
            <p className="text-lg text-slate-600 mb-6">{description}</p>
            <Link href="/demande-demo" className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl" style={{ background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}>
              Demander une démo <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={title} className="rounded-3xl shadow-xl w-full h-auto object-cover" />
        </div>

        {/* Features */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Comment ça marche</h2>
          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${color}15` }}>
                  <Check className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
                  <p className="text-slate-600">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        {testimonials && testimonials.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Ce qu'en disent nos clients</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-slate-700 italic mb-4">"{t.text}"</p>
                  <p className="font-semibold text-slate-900">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-3xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}>
          <h2 className="text-2xl font-bold text-white mb-4">Prêt à l'essayer ?</h2>
          <Link href="/demo" className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-xl font-bold text-slate-900 mr-3">
            Voir la démo <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/demande-demo" className="inline-flex items-center gap-2 px-8 py-3 bg-white/20 backdrop-blur rounded-xl font-bold text-white border-2 border-white/30">
            Demander une démo
          </Link>
        </div>
      </div>
    </div>
  );
}
