'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Smartphone, QrCode, Bell, ShoppingCart, Sparkles, MapPin, LifeBuoy,
  Star, Luggage, Hotel, Home, Puzzle, TrendingUp, Smile, Shield,
  Check, ArrowRight, Menu, X, Wifi, MessageSquare, ChevronDown,
} from 'lucide-react';

const EMERALD = '#10B981';
const EMERALD_DARK = '#059669';
const BLUE = '#2563EB';
const BLUE_DARK = '#1D4ED8';

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-guest-one.png" alt="Guest One" className="h-12 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#solution" className="text-sm font-medium text-slate-600 hover:text-slate-900">Solution</a>
              <a href="/fonctionnalites" className="text-sm font-medium text-slate-600 hover:text-slate-900">Fonctionnalités</a>
              <a href="/fonctionnalites/hotel" className="text-sm font-medium text-slate-600 hover:text-slate-900">Hôtels</a>
              <a href="/fonctionnalites/airbnb" className="text-sm font-medium text-slate-600 hover:text-slate-900">Airbnb</a>
              <a href="/tarifs" className="text-sm font-medium text-slate-600 hover:text-slate-900">Tarifs</a>
              <a href="/comment-ca-marche" className="text-sm font-medium text-slate-600 hover:text-slate-900">Comment ça marche</a>
              <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-slate-900">FAQ</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/agence/connexion" className="text-sm font-medium text-slate-600 hover:text-slate-900">Connexion</Link>
              <a href="#cta" className="px-4 py-2 rounded-xl text-white text-sm font-bold shadow-sm hover:shadow-md transition-all" style={{ background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}>
                Demander une démo
              </a>
            </div>

            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2">
              {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3">
            <a href="#solution" onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-slate-600">Solution</a>
            <a href="/fonctionnalites" onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-slate-600">Fonctionnalités</a>
            <a href="/fonctionnalites/hotel" onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-slate-600">Hôtels</a>
            <a href="/fonctionnalites/airbnb" onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-slate-600">Airbnb</a>
            <a href="/tarifs" onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-slate-600">Tarifs</a>
            <a href="/comment-ca-marche" onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-slate-600">Comment ça marche</a>
            <a href="#cta" onClick={() => setMobileMenu(false)} className="block px-4 py-2 rounded-xl text-white text-sm font-bold text-center" style={{ background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}>
              Demander une démo
            </a>
          </div>
        )}
      </nav>

      {/* ─── 1. HERO ─── */}
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F8FAFC 50%, #EFF6FF 100%)' }}>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-30">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl" style={{ background: EMERALD }} />
          <div className="absolute bottom-20 right-40 w-96 h-96 rounded-full blur-3xl" style={{ background: BLUE }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ backgroundColor: `${EMERALD}15` }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: EMERALD }} />
                <span className="text-sm font-semibold" style={{ color: EMERALD_DARK }}>Sans application · Activation en 24h</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Offrez à vos clients une{' '}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}>
                  expérience de séjour connectée
                </span>
                , sans application.
              </h1>

              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Guest One transforme un simple QR code ou bracelet en assistant de séjour : services, room service, spa, tourisme, assistance et avis clients.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#cta" className="px-8 py-4 rounded-2xl text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}>
                  Demander une démo
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a href="/demo" className="px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold border-2 border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
                  <Smartphone className="w-5 h-5" style={{ color: EMERALD }} />
                  Essayer la démo
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4" style={{ color: EMERALD }} /> Sans installation</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4" style={{ color: EMERALD }} /> Multilingue FR/EN/ES</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4" style={{ color: EMERALD }} /> Activation rapide</span>
              </div>
            </div>

            {/* Visuel smartphone + QR */}
            <div className="relative flex justify-center">
              <div className="relative">
                {/* Phone mockup */}
                <div className="w-64 h-[500px] rounded-[3rem] border-8 border-slate-900 bg-white shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-2xl z-10" />
                  <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="pt-10 pb-6 px-4 text-center" style={{ background: `linear-gradient(135deg, ${EMERALD}15, ${BLUE}15)` }}>
                      <div className="w-16 h-16 rounded-2xl mx-auto mb-2 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}>
                        <Hotel className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-xs text-slate-500">Bonjour</p>
                      <h3 className="font-bold text-slate-900 text-sm">Hôtel Baobab</h3>
                      <p className="text-xs text-slate-400">Chambre 204</p>
                    </div>
                    {/* Services grid */}
                    <div className="flex-1 p-3 grid grid-cols-2 gap-2">
                      {[
                        { icon: '🍽️', label: 'Room Service', color: EMERALD },
                        { icon: '💆', label: 'Spa', color: BLUE },
                        { icon: '🧹', label: 'Ménage', color: EMERALD },
                        { icon: '🛍️', label: 'Boutique', color: BLUE },
                        { icon: '🗺️', label: 'Tourisme', color: EMERALD },
                        { icon: '🆘', label: 'SOS', color: BLUE },
                      ].map((s, i) => (
                        <div key={i} className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center justify-center">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-1" style={{ backgroundColor: `${s.color}15` }}>
                            {s.icon}
                          </div>
                          <span className="text-[10px] font-semibold text-slate-700">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* QR code floating */}
                <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center">
                  <QrCode className="w-20 h-20" style={{ color: BLUE_DARK }} />
                </div>

                {/* Badge "Sans app" */}
                <div className="absolute -top-4 -right-4 px-3 py-2 rounded-xl shadow-lg" style={{ background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}>
                  <p className="text-white text-xs font-bold flex items-center gap-1">
                    <Smartphone className="w-3 h-3" /> Sans app
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. PREUVE SOCIALE ─── */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wide mb-6">
            Conçu pour les hôtels indépendants, Airbnb et conciergeries
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
            {[
              { icon: Smartphone, label: 'Sans installation' },
              { icon: Check, label: 'Activation en 24h' },
              { icon: MessageSquare, label: 'Interface multilingue' },
              { icon: Shield, label: 'Données sécurisées' },
              { icon: QrCode, label: 'QR code + bracelet' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-600">
                <item.icon className="w-5 h-5" style={{ color: EMERALD }} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. PROBLÈME ─── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Les voyageurs attendent plus. Les hôtels manquent d'outils simples.
          </h2>
          <p className="text-lg text-slate-600 mb-12">
            Vos clients veulent une expérience moderne. Vos équipes sont saturées de tâches répétitives.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: '📞', text: 'Clients qui appellent la réception pour tout' },
              { icon: '⭐', text: 'Mauvais avis difficiles à rattraper' },
              { icon: '💰', text: 'Manque de revenus additionnels' },
              { icon: '🔁', text: 'Informations répétées : Wi-Fi, check-in, règles' },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 flex items-start gap-4 text-left">
                <span className="text-3xl">{p.icon}</span>
                <p className="text-slate-700 font-medium">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. SOLUTION ─── */}
      <section id="solution" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Guest One : un QR code, tout le séjour.
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Trois étapes simples pour transformer l'expérience de vos clients.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: '1', icon: QrCode, title: 'Le client scanne', desc: 'Un QR code sur le bracelet ou dans la chambre ouvre la WebApp instantanément. Pas de téléchargement, pas d\'inscription.',
                color: EMERALD, href: '/solution/scan',
              },
              {
                num: '2', icon: Smartphone, title: 'Il accède aux services', desc: 'Room service, spa, ménage, tourisme, assistance. Tout est centralisé dans une interface élégante et multilingue.',
                color: BLUE, href: '/solution/accede',
              },
              {
                num: '3', icon: TrendingUp, title: 'Vous pilotez tout', desc: 'Un dashboard simple pour gérer les demandes, commandes, avis et revenus. Les notifications arrivent en temps réel.',
                color: EMERALD, href: '/solution/pilote',
              },
            ].map((step, i) => (
              <a key={i} href={step.href} className="relative group block">
                <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 hover:shadow-lg transition-all h-full">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${step.color}15` }}>
                    <step.icon className="w-7 h-7" style={{ color: step.color }} />
                  </div>
                  <div className="absolute top-8 right-8 text-6xl font-bold text-slate-100">{step.num}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-bold mt-4 group-hover:gap-2 transition-all" style={{ color: step.color }}>
                    En savoir plus <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 z-10">
                    <ArrowRight className="w-6 h-6 text-slate-300" />
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. FONCTIONNALITÉS ─── */}
      <section id="fonctionnalites" className="py-20" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #EFF6FF 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Tout ce dont vos clients ont besoin, au même endroit
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              9 modules prêts à l'emploi, activables selon vos besoins.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { slug: 'demandes-services', title: 'Demandes de services', desc: 'Ménage, serviettes, repassage, assistance. Le client demande en 1 tap, le staff est notifié.', image: '/images/features/demandes-services.png' },
              { slug: 'room-service', title: 'Room service & commandes', desc: 'Menu digital, panier, suivi en temps réel. Facturation sur la chambre.', image: '/images/features/room-service.png' },
              { slug: 'spa', title: 'Réservation spa', desc: 'Calendrier interactif, créneaux, tarifs. Confirmation instantanée.', image: '/images/features/spa.png' },
              { slug: 'guide-maison-airbnb', title: 'Guide maison Airbnb', desc: 'Check-in, check-out, Wi-Fi, règles. Tout centralisé dans un livret digital.', image: '/images/features/guide-maison.png' },
              { slug: 'tourisme', title: 'Tourisme local géolocalisé', desc: 'Recommandations à proximité : restaurants, activités, transports. Tri par distance.', image: '/images/features/tourisme.png' },
              { slug: 'retour-hotel', title: 'Retour à l\'hôtel', desc: 'Bouton "Retour" avec itinéraire Google Maps. Plus jamais de client perdu.', image: '/images/features/retour-hotel.png' },
              { slug: 'sos', title: 'Assistance / SOS', desc: 'Bouton SOS avec partage GPS. Le staff voit la position en temps réel.', image: '/images/features/sos.png' },
              { slug: 'avis', title: 'Gestion des avis', desc: 'Note avant départ : 4-5★ → Google, 1-3★ → formulaire privé. Protégez votre réputation.', image: '/images/features/avis.png' },
              { slug: 'consigne', title: 'Consigne & dernier jour', desc: 'Dépôt bagages avec code de retrait, réservation douche, transfert aéroport.', image: '/images/features/consigne.png' },
            ].map((f, i) => (
              <a key={i} href={`/fonctionnalites/${f.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all">
                <div className="aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.image} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. SECTION HÔTELS ─── */}
      <section id="hotels" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ backgroundColor: `${BLUE}15` }}>
                <Hotel className="w-4 h-4" style={{ color: BLUE }} />
                <span className="text-sm font-semibold" style={{ color: BLUE_DARK }}>Pour les hôtels</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Une solution pensée pour les hôtels.
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                De la petite auberge au boutique hôtel, Guest One s'adapte à votre établissement.
              </p>

              <div className="space-y-4">
                {[
                  { icon: '📞', title: 'Moins d\'appels à la réception', desc: 'Les demandes passent par la WebApp, le staff est notifié automatiquement.' },
                  { icon: '💰', title: 'Plus de ventes additionnelles', desc: 'Room service, spa, boutique locale : de nouvelles sources de revenus.' },
                  { icon: '😊', title: 'Meilleure expérience client', desc: 'Vos clients se sentent choyés, 24/7, sans effort pour vos équipes.' },
                  { icon: '⭐', title: 'Protection contre les mauvais avis', desc: 'Interceptez les réclamations avant qu\'elles arrivent sur Google.' },
                  { icon: '✨', title: 'Image moderne et premium', desc: 'Un établissement connecté attire une clientèle exigeante.' },
                ].map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">{b.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-900">{b.title}</p>
                      <p className="text-sm text-slate-600">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BLUE}15, ${EMERALD}15)` }}>
                  <div className="text-center p-8">
                    <Hotel className="w-24 h-24 mx-auto mb-4" style={{ color: BLUE }} />
                    <p className="text-slate-500 text-sm">Dashboard hôtelier — temps réel</p>
                    <div className="grid grid-cols-3 gap-2 mt-6">
                      {['Nouvelles', 'En cours', 'Livrées'].map((s, i) => (
                        <div key={i} className="bg-white rounded-xl p-3">
                          <p className="text-2xl font-bold" style={{ color: i === 0 ? BLUE : i === 1 ? EMERALD_DARK : EMERALD }}>{[3, 7, 24][i]}</p>
                          <p className="text-xs text-slate-500">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. SECTION AIRBNB ─── */}
      <section id="airbnb" className="py-20" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F8FAFC 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ backgroundColor: `${EMERALD}15` }}>
                <Home className="w-4 h-4" style={{ color: EMERALD }} />
                <span className="text-sm font-semibold" style={{ color: EMERALD_DARK }}>Pour Airbnb & conciergeries</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Une version dédiée aux Airbnb et conciergeries.
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Le guide digital parfait pour vos voyageurs, sans effort de gestion.
              </p>

              <div className="space-y-4">
                {[
                  { icon: '📖', title: 'Guide digital automatique', desc: 'Wi-Fi, électroménager, règles : tout est dans le QR code du logement.' },
                  { icon: '📶', title: 'Codes Wi-Fi centralisés', desc: 'Plus besoin de les envoyer manuellement à chaque arrivée.' },
                  { icon: '🤝', title: 'Assistance voyageurs', desc: 'Bouton conciergerie : le voyageur vous alerte en 1 tap.' },
                  { icon: '🗺️', title: 'Tourisme local', desc: 'Recommandations géolocalisées autour du logement.' },
                  { icon: '🔑', title: 'Arrivées et départs simplifiés', desc: 'Instructions de check-in/out accessibles 24/7.' },
                ].map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">{b.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-900">{b.title}</p>
                      <p className="text-sm text-slate-600">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:order-1 relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${EMERALD}15, ${BLUE}15)` }}>
                  <div className="text-center p-8">
                    <Home className="w-24 h-24 mx-auto mb-4" style={{ color: EMERALD }} />
                    <p className="text-slate-500 text-sm">Guide maison digital</p>
                    <div className="grid grid-cols-2 gap-2 mt-6">
                      {[
                        { icon: Wifi, label: 'Wi-Fi' },
                        { icon: Check, label: 'Check-in' },
                        { icon: MapPin, label: 'Tourisme' },
                        { icon: Bell, label: 'Concierge' },
                      ].map((s, i) => (
                        <div key={i} className="bg-white rounded-xl p-3 flex items-center gap-2">
                          <s.icon className="w-4 h-4" style={{ color: EMERALD }} />
                          <span className="text-xs font-medium text-slate-700">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. MODULES ACTIVABLES ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ backgroundColor: `${EMERALD}15` }}>
            <Puzzle className="w-4 h-4" style={{ color: EMERALD }} />
            <span className="text-sm font-semibold" style={{ color: EMERALD_DARK }}>Modulaire</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Activez uniquement les modules dont vous avez besoin.
          </h2>
          <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
            Guest One est 100% modulaire. Chaque établissement active les fonctionnalités qui lui correspondent. Vous pouvez évoluer à votre rythme.
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Demandes service', on: true },
              { label: 'Room service', on: true },
              { label: 'Spa booking', on: false },
              { label: 'Guide maison', on: true },
              { label: 'Tourisme géolocalisé', on: true },
              { label: 'Marketplace locale', on: false },
              { label: 'SOS avancé', on: false },
              { label: 'Anti-bad review', on: true },
              { label: 'Consigne dernier jour', on: false },
            ].map((m, i) => (
              <div key={i} className={`rounded-2xl p-4 border-2 flex items-center justify-between ${m.on ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}>
                <span className="text-sm font-medium text-slate-700">{m.label}</span>
                <div className={`w-10 h-6 rounded-full p-0.5 transition ${m.on ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition ${m.on ? 'translate-x-4' : ''}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 9. COMMENT ÇA MARCHE ─── */}
      <section className="py-20" style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE_DARK})` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Comment ça marche
            </h2>
            <p className="text-lg text-blue-100">
              Démarrez en moins de 24 heures.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Créez votre espace', desc: 'Hôtel ou Airbnb, créez votre compte et configurez votre établissement en quelques minutes.' },
              { num: '2', title: 'Générez vos QR codes', desc: 'QR codes pour chambres, bracelets pour clients, stickers pour logements. Tout est fourni.' },
              { num: '3', title: 'Vos clients scannent', desc: 'Ils accèdent instantanément à tous les services. Vous pilotez depuis le dashboard.' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">{step.num}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-blue-100 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 10. BÉNÉFICES BUSINESS ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Pourquoi les hôteliers choisissent Guest One
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: TrendingUp, title: '+30% de revenus', desc: 'Room service, spa, boutique locale : de nouvelles sources de revenus.', color: EMERALD },
              { icon: Smile, title: '+45% satisfaction', desc: 'Vos clients se sentent choyés 24/7, sans surcharge pour vos équipes.', color: BLUE },
              { icon: Shield, title: '-60% d\'appels', desc: 'Les demandes passent par la WebApp, la réception respire.', color: EMERALD },
              { icon: Star, title: 'Réputation protégée', desc: 'Interceptez les mauvais avis avant qu\'ils soient publics.', color: BLUE },
            ].map((b, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${b.color}15` }}>
                  <b.icon className="w-8 h-8" style={{ color: b.color }} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{b.title}</h3>
                <p className="text-sm text-slate-600">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 11. TÉMOIGNAGES ─── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Ils nous font confiance
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Aminata Diallo', role: 'Directrice, Hôtel Baobab', city: 'Dakar, Sénégal',
                text: 'Guest One a transformé notre rapport aux clients. Les demandes de serviettes ou de room service arrivent directement sur le téléphone du staff. Plus d\'appels à la réception, plus de confusion.',
                avatar: 'AD', color: EMERALD,
              },
              {
                name: 'Karim Benali', role: 'Concierge, Saly Properties', city: 'Saly, Sénégal',
                text: 'La version Airbnb est parfaite. Mes voyageurs trouvent le Wi-Fi, les instructions et les recommandations touristiques en scannant un QR. Je gère 12 appartements sans effort.',
                avatar: 'KB', color: BLUE,
              },
              {
                name: 'Sophie Martin', role: 'Gérante, Villa Téranga', city: 'Cap Skirring, Sénégal',
                text: 'Le module anti-bad review a sauvé notre réputation. Les clients mécontents nous écrivent en privé au lieu de poster un avis négatif. On a résolu 90% des problèmes avant départ.',
                avatar: 'SM', color: EMERALD,
              },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: t.color }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role} · {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 12. TARIFS ─── */}
      <section id="tarifs" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Des offres simples et transparentes
            </h2>
            <p className="text-lg text-slate-600">
              Commencez aujourd'hui, évoluez quand vous voulez.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter', badge: '🚀', price: '15 000', period: '/mois',
                desc: 'Essentiel pour démarrer',
                features: [
                  '1 logement',
                  '30 QR codes',
                  '2 utilisateurs',
                  'Demandes de services',
                  'Aide & contact',
                  'Retour à l\'hôtel',
                  'Anti-bad review',
                ],
                color: EMERALD, popular: false,
              },
              {
                name: 'Pro', badge: '⭐', price: '35 000', period: '/mois',
                desc: 'Services, commandes, avis',
                features: [
                  '5 logements',
                  '200 QR codes',
                  '8 utilisateurs',
                  'Tout Starter +',
                  'Room service',
                  'Spa booking',
                  'Mode dernier jour',
                  'Bracelet personne',
                  'Escalade auto',
                ],
                color: BLUE, popular: true,
              },
              {
                name: 'Premium', badge: '💎', price: '75 000', period: '/mois',
                desc: 'Spa, marketplace, assistance',
                features: [
                  '20 logements',
                  '1000 QR codes',
                  '50 utilisateurs',
                  'Tout Pro +',
                  'Marketplace locale',
                  'Commissions multi-niveaux',
                  'SOS GPS temps réel',
                  'Push notifications',
                  'PMS integration',
                  'RGPD complet',
                ],
                color: EMERALD, popular: false,
              },
            ].map((plan, i) => (
              <div key={i} className={`relative rounded-3xl p-8 border-2 ${plan.popular ? 'border-blue-500 shadow-xl scale-105' : 'border-slate-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE_DARK})` }}>
                    POPULAIRE
                  </div>
                )}
                <div className="text-center mb-6">
                  <span className="text-3xl">{plan.badge}</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">{plan.name}</h3>
                  <p className="text-sm text-slate-500">{plan.desc}</p>
                </div>
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500"> FCFA {plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: plan.color }} />
                      <span className="text-slate-700">{f}</span>
                    </li>
                  ))}
                </ul>
                <a href="#cta" className={`block w-full py-3 rounded-xl font-bold text-center transition-all ${plan.popular ? 'text-white' : 'border-2 border-slate-200 text-slate-900 hover:border-slate-300'}`} style={plan.popular ? { background: `linear-gradient(135deg, ${BLUE}, ${BLUE_DARK})` } : {}}>
                  Choisir {plan.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 13. FAQ ─── */}
      <section id="faq" className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Questions fréquentes
            </h2>
          </div>

          <div className="space-y-3">
            {[
              { q: 'Faut-il installer une application ?', a: 'Non. Guest One est une WebApp : le client scanne le QR code et accède directement aux services dans son navigateur. Aucun téléchargement, aucune inscription.' },
              { q: 'Comment fonctionnent les QR codes ?', a: 'Chaque QR code est unique et lié à un logement ou un bracelet. Vous les générez depuis le dashboard, les imprimez ou les collez. Le scan ouvre la WebApp instantanément.' },
              { q: 'Est-ce adapté aux petits hôtels ?', a: 'Absolument. Guest One est conçu pour les petits hôtels et boutique hôtels. L\'offre Starter à 15 000 FCFA/mois suffit pour démarrer avec 1 logement et 30 QR codes.' },
              { q: 'Peut-on activer uniquement certains modules ?', a: 'Oui, Guest One est 100% modulaire. Vous activez uniquement les fonctionnalités dont vous avez besoin. Vous pouvez en ajouter ou retirer à tout moment.' },
              { q: 'Est-ce compatible avec les Airbnb ?', a: 'Oui, Guest One a une version dédiée Airbnb avec guide maison, Wi-Fi, check-in/out, tourisme local et bouton conciergerie. Parfait pour les propriétaires et conciergeries.' },
              { q: 'Combien de temps faut-il pour démarrer ?', a: 'Moins de 24 heures. Créez votre compte, générez vos QR codes, configurez vos services. Vos clients peuvent scanner dès le lendemain.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-slate-900">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-4 text-slate-600 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 14. CTA FINAL ─── */}
      <section id="cta" className="py-24 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}>
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20 bg-white" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 bg-white" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Prêt à moderniser l'expérience de vos clients ?
          </h2>
          <p className="text-xl text-blue-50 mb-10 leading-relaxed">
            Créez votre espace Guest One et offrez un séjour connecté dès aujourd'hui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/demande-demo" className="px-8 py-4 bg-white rounded-2xl font-bold text-slate-900 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
              Demander une démo
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="/agence/connexion" className="px-8 py-4 bg-white/20 backdrop-blur rounded-2xl font-bold text-white border-2 border-white/30 hover:bg-white/30 transition-all flex items-center justify-center gap-2">
              Commencer maintenant
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-blue-50">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Sans engagement</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Activation en 24h</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Annulable à tout moment</span>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-guest-one.png" alt="Guest One" className="h-12 w-auto brightness-0 invert" />
              </div>
              <p className="text-sm">La plateforme SaaS pour hôtels, Airbnb et conciergeries. Un QR code, tout le séjour.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#solution" className="hover:text-white">Solution</a></li>
                <li><a href="#fonctionnalites" className="hover:text-white">Fonctionnalités</a></li>
                <li><a href="#tarifs" className="hover:text-white">Tarifs</a></li>
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Solutions</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/fonctionnalites/hotel" className="hover:text-white">Pour les hôtels</a></li>
                <li><a href="/fonctionnalites/airbnb" className="hover:text-white">Pour les Airbnb</a></li>
                <li><a href="#cta" className="hover:text-white">Pour les conciergeries</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/demande-demo" className="hover:text-white">Demander une démo</a></li>
                <li><a href="/agence/connexion" className="hover:text-white">Connexion agence</a></li>
                <li><a href="/admin/connexion" className="hover:text-white">Connexion admin</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>© 2026 Guest One. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
