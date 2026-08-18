'use client';

import { useState, useEffect } from 'react';
import HostView, { type HouseGuideData } from './HostView';
import NearbyAttractions from './NearbyAttractions';
import ServiceRequestModal from './ServiceRequestModal';
import FeedbackModal from './FeedbackModal';
import SosButton from './SosButton';
import RoomServiceModal from './RoomServiceModal';
import LastDayModal from './LastDayModal';
import SpaModal from './SpaModal';
import MarketplaceModal from './MarketplaceModal';
import ConciergeAlertButton from './ConciergeAlertButton';
import { getProfileMeta, type BraceletProfile } from '@/lib/bracelet-profiles';

// ─── Types ──────────────────────────────────────────────────────────────────
interface HotelServiceItem {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  type: string;
  category: string;
  isFree: boolean;
  price: number;
  schedule: string | null;
  assignedTeam: string;
  displayTab: string;
}

export interface WelcomeAgency {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  contactPhone: string | null;
  logoUrl: string | null;
  address: string | null;
  braceletProfile: string | null;
  latitude: number | null;
  longitude: number | null;
  houseGuide: HouseGuideData | null;
  reference: string | null;
}

interface StayData {
  id: string;
  roomNumber: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  language: string;
  checkInDate: string;
  checkOutDate: string;
  nbPersons: number;
  status: string;
}

interface WristbandViewProps {
  agency: WelcomeAgency;
  lang: string;
}

// ─── Palette Luxe ──────────────────────────────────────────────────────────
const C = {
  bg: '#FAF8F5',
  card: '#FFFFFF',
  ink: '#2C2C2C',
  inkLight: '#6B6B6B',
  gold: '#C9A961',
  goldLight: '#E8D5A3',
  goldDark: '#A8884A',
  border: '#E8E4DD',
  shadow: '0 2px 12px rgba(0,0,0,0.06)',
  shadowHover: '0 4px 20px rgba(201,169,97,0.15)',
};

// ─── Traductions ────────────────────────────────────────────────────────────
const T = {
  fr: {
    morning: 'Bonjour',
    afternoon: 'Bon après-midi',
    evening: 'Bonsoir',
    subtitle: 'Votre compagnon de séjour',
    tabRoomService: 'Room Service',
    tabMyStay: 'Mon Séjour',
    tabExplore: 'Explorer',
    tabEmergency: 'Urgence',
    reception: 'Appeler la réception',
    emergency: 'Urgences',
    review: 'Laisser un avis',
    noServices: 'Aucun service configuré pour le moment.',
    noPartners: 'Aucun lieu recommandé pour le moment.',
    backToHotel: 'Retour à l\'hôtel',
    room: 'Ch.',
    day: 'J',
    of: 'sur',
    checkout: 'Préparer mon checkout',
    wifi: 'WiFi & Informations',
    network: 'Réseau',
    rules: 'Règlement',
    myOrders: 'Mes commandes',
    pending: 'En attente',
    'Dernier jour': 'Dernier Jour',
    suggestions: 'Suggestions',
    sectionFood: 'Restauration',
    sectionWellness: 'Bien-être',
    sectionPractical: 'Pratique',
    sectionShop: 'Boutique',
  },
  en: {
    morning: 'Good Morning',
    afternoon: 'Good Afternoon',
    evening: 'Good Evening',
    subtitle: 'Your stay companion',
    tabRoomService: 'Room Service',
    tabMyStay: 'My Stay',
    tabExplore: 'Explore',
    tabEmergency: 'Emergency',
    reception: 'Call Reception',
    emergency: 'Emergency',
    review: 'Leave a review',
    noServices: 'No services configured yet.',
    noPartners: 'No recommended places yet.',
    backToHotel: 'Back to hotel',
    room: 'Room',
    day: 'D',
    of: 'of',
    checkout: 'Prepare my checkout',
    wifi: 'WiFi & Information',
    network: 'Network',
    rules: 'House Rules',
    myOrders: 'My Orders',
    pending: 'Pending',
    'Dernier jour': 'Last Day',
    suggestions: 'Suggestions',
    sectionFood: 'Food & Drinks',
    sectionWellness: 'Wellness',
    sectionPractical: 'Practical',
    sectionShop: 'Shop',
  },
};

// ─── Suggestions contextuelles (hardcodées par heure) ────────────────────
function getContextualSuggestions(hour: number, lang: string): { emoji: string; label: string; action: string }[] {
  if (hour >= 6 && hour < 10) {
    return lang === 'en'
      ? [{ emoji: '☕', label: 'Coffee & Breakfast', action: 'roomservice' }, { emoji: '🧖', label: 'Morning Spa', action: 'spa' }]
      : [{ emoji: '☕', label: 'Café & Petit-déj', action: 'roomservice' }, { emoji: '🧖', label: 'Spa matinal', action: 'spa' }];
  }
  if (hour >= 10 && hour < 14) {
    return lang === 'en'
      ? [{ emoji: '🍽️', label: 'Lunch Menu', action: 'roomservice' }, { emoji: '🚕', label: 'Book a Taxi', action: 'taxi' }]
      : [{ emoji: '🍽️', label: 'Menu déjeuner', action: 'roomservice' }, { emoji: '🚕', label: 'Réserver taxi', action: 'taxi' }];
  }
  if (hour >= 14 && hour < 18) {
    return lang === 'en'
      ? [{ emoji: '💆', label: 'Afternoon Spa', action: 'spa' }, { emoji: '🛍️', label: 'Local Shop', action: 'marketplace' }]
      : [{ emoji: '💆', label: 'Spa l\'après-midi', action: 'spa' }, { emoji: '🛍️', label: 'Boutique locale', action: 'marketplace' }];
  }
  // Evening
  return lang === 'en'
    ? [{ emoji: '🍽️', label: 'Dinner Menu', action: 'roomservice' }, { emoji: '🧳', label: 'Prepare Checkout', action: 'lastday' }]
    : [{ emoji: '🍽️', label: 'Menu dîner', action: 'roomservice' }, { emoji: '🧳', label: 'Préparer checkout', action: 'lastday' }];
}

// ─── Service category classification ───────────────────────────────────────
type ServiceCategory = 'food' | 'wellness' | 'practical' | 'other';

function classifyService(s: HotelServiceItem): ServiceCategory {
  const name = s.name.toLowerCase();
  const cat = s.category.toLowerCase();
  const type = s.type.toLowerCase();
  if (cat.includes('restauration') || cat.includes('food') || cat.includes('bar') || cat.includes('room-service') ||
      name.includes('menu') || name.includes('petit-déj') || name.includes('déjeuner') || name.includes('dîner') ||
      name.includes('breakfast') || name.includes('lunch') || name.includes('dinner') || name.includes('bar')) {
    return 'food';
  }
  if (cat.includes('spa') || cat.includes('bien-être') || cat.includes('wellness') || cat.includes('massage') ||
      name.includes('spa') || name.includes('massage') || name.includes('hammam') || name.includes('piscine')) {
    return 'wellness';
  }
  if (cat.includes('pratique') || cat.includes('practical') || cat.includes('blanchisserie') || cat.includes('navette') || cat.includes('taxi') ||
      name.includes('blanchisserie') || name.includes('pressing') || name.includes('navette') || name.includes('taxi') || name.includes('réveil') || name.includes('oreiller')) {
    return 'practical';
  }
  return 'other';
}

export default function WristbandView({ agency, lang }: WristbandViewProps) {
  const [greeting, setGreeting] = useState(T.fr.morning);
  const [activeTab, setActiveTab] = useState<'roomservice' | 'mystay' | 'explore' | 'emergency'>('roomservice');
  const [hotelServices, setHotelServices] = useState<HotelServiceItem[]>([]);
  const [stay, setStay] = useState<StayData | null>(null);
  const [selectedService, setSelectedService] = useState<HotelServiceItem | null>(null);
  const [isAtHotel, setIsAtHotel] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showRoomService, setShowRoomService] = useState(false);
  const [showLastDay, setShowLastDay] = useState(false);
  const [showSpa, setShowSpa] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);

  // Geofencing GPS
  useEffect(() => {
    if (!agency.latitude || !agency.longitude) return;
    if (!('geolocation' in navigator)) return;
    let cancelled = false;
    const checkPosition = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          const R = 6371;
          const dLat = (pos.coords.latitude - agency.latitude!) * Math.PI / 180;
          const dLng = (pos.coords.longitude - agency.longitude!) * Math.PI / 180;
          const a = Math.sin(dLat/2)**2 + Math.cos(agency.latitude!*Math.PI/180) * Math.cos(pos.coords.latitude*Math.PI/180) * Math.sin(dLng/2)**2;
          const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          setIsAtHotel(dist < 0.2);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    };
    checkPosition();
    const interval = setInterval(checkPosition, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [agency.latitude, agency.longitude]);

  // Auto-tab switch on geofencing
  useEffect(() => {
    if (isAtHotel === null) return;
    if (isAtHotel) setActiveTab('roomservice');
    else setActiveTab('explore');
  }, [isAtHotel]);

  const effectiveLang = stay?.language || lang;
  const t = effectiveLang === 'en' ? T.en : T.fr;
  const profile = (agency.braceletProfile || 'STANDARD') as BraceletProfile;
  const profileMeta = getProfileMeta(profile);
  const isHost = profile === 'HOST';
  const currentHour = new Date().getHours();

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting(t.morning);
      else if (hour < 18) setGreeting(t.afternoon);
      else setGreeting(t.evening);
    };
    updateGreeting();
    const timer = setInterval(updateGreeting, 60_000);
    return () => clearInterval(timer);
  }, [t.morning, t.afternoon, t.evening]);

  useEffect(() => {
    if (!agency.reference) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/stay?reference=${agency.reference}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.found && data.stay) setStay(data.stay);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [agency.reference]);

  useEffect(() => {
    if (isHost) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/hotel-services?agencyId=${agency.id}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.success) setHotelServices(data.services || []);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [agency.id, isHost]);

  const receptionPhone = agency.contactPhone || agency.phone;
  const cleanPhone = (p: string | null) => (p ? p.replace(/[\s\-().]/g, '') : null);
  const receptionTel = cleanPhone(receptionPhone);

  const servicesHotel = hotelServices.filter((s) => s.displayTab === 'hotel');
  const servicesTourism = hotelServices.filter((s) => s.displayTab === 'tourism');
  const servicesHelp = hotelServices.filter((s) => s.displayTab === 'help');

  // Classify hotel services by category
  const foodServices = servicesHotel.filter((s) => classifyService(s) === 'food');
  const wellnessServices = servicesHotel.filter((s) => classifyService(s) === 'wellness');
  const practicalServices = servicesHotel.filter((s) => classifyService(s) === 'practical');
  const otherServices = servicesHotel.filter((s) => classifyService(s) === 'other');

  // Stay day calculation
  const stayDay = (() => {
    if (!stay?.checkInDate) return null;
    const checkIn = new Date(stay.checkInDate);
    const now = new Date();
    const diffMs = now.getTime() - checkIn.getTime();
    const dayNum = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    let totalDays = 1;
    if (stay.checkOutDate) {
      const checkOut = new Date(stay.checkOutDate);
      totalDays = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    }
    return { dayNum: Math.max(1, dayNum), totalDays };
  })();

  const isLastDay = stayDay && stayDay.dayNum === stayDay.totalDays;

  const parseSchedule = (schedule: string | null): { days: string; open: string; close: string } | null => {
    if (!schedule) return null;
    try {
      const parsed = JSON.parse(schedule);
      if (parsed.open === '00:00' && parsed.close === '23:59') return { days: parsed.days, open: '', close: '' };
      return parsed;
    } catch { return null; }
  };

  // ─── Carte de service (réutilisable) ─.--
  const ServiceCard = ({ s }: { s: HotelServiceItem }) => {
    const sched = parseSchedule(s.schedule);
    return (
    <button
      onClick={() => setSelectedService(s)}
      className="text-left p-4 bg-white rounded-2xl border transition-all hover:shadow-lg w-full"
      style={{ borderColor: C.border, boxShadow: C.shadow }}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-2xl sm:text-xl shrink-0" style={{ backgroundColor: `${C.gold}15` }}>
          {s.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight" style={{ color: C.ink }}>{s.name}</h3>
          {s.description && <p className="text-xs mt-0.5 line-clamp-1" style={{ color: C.inkLight }}>{s.description}</p>}
          <div className="flex items-center gap-2 mt-0.5">
            {!s.isFree && <p className="text-xs font-bold" style={{ color: C.goldDark }}>{s.price.toLocaleString('fr-FR')} FCFA</p>}
            {sched && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${C.gold}10`, color: C.goldDark }}>
                {sched.open === '' ? '24/7' : `${sched.open}-${sched.close}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
    );
  };

  // ─── Section render helper ───
  const ServiceSection = ({ title, emoji, items }: { title: string; emoji: string; items: HotelServiceItem[] }) => {
    if (items.length === 0) return null;
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{emoji}</span>
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: C.inkLight }}>{title}</h2>
        </div>
        <div className="space-y-2">
          {items.map((s) => <ServiceCard key={s.id} s={s} />)}
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // ONGLET 1 — ROOM SERVICE (centre de commande)
  // ════════════════════════════════════════════════════════════════════
  const renderRoomServiceTab = () => {
    if (isHost && agency.houseGuide) {
      return <HostView guide={agency.houseGuide} agencyName={agency.name} agencyAddress={agency.address} lang={lang} />;
    }

    const suggestions = getContextualSuggestions(currentHour, effectiveLang);

    return (
      <div className="space-y-5">
        {/* Suggestions contextuelles */}
        {suggestions.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border" style={{ borderColor: `${C.gold}30` }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: C.goldDark }}>
              💡 {t.suggestions}
            </p>
            <div className="flex gap-2">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (sug.action === 'roomservice') setShowRoomService(true);
                    else if (sug.action === 'spa') setShowSpa(true);
                    else if (sug.action === 'marketplace') setShowMarketplace(true);
                    else if (sug.action === 'lastday') setShowLastDay(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-3 bg-white rounded-xl border transition-all hover:shadow-md"
                  style={{ borderColor: C.border }}
                >
                  <span className="text-xl">{sug.emoji}</span>
                  <span className="text-sm font-semibold" style={{ color: C.ink }}>{sug.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rappel dernier jour */}
        {isLastDay && (
          <button
            onClick={() => setShowLastDay(true)}
            className="w-full p-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-3"
          >
            <span className="text-2xl">🧳</span>
            <div className="text-left">
              <p className="font-bold text-sm">{t['Dernier jour']}</p>
              <p className="text-xs text-purple-100">{t.checkout}</p>
            </div>
          </button>
        )}

        {/* ─── Section Restauration ─── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🍽️</span>
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: C.inkLight }}>{t.sectionFood}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowRoomService(true)}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition"
            >
              <span className="text-2xl mb-1">🍽️</span>
              <span className="font-bold text-xs">Menu</span>
            </button>
            <button
              onClick={() => setShowRoomService(true)}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition"
            >
              <span className="text-2xl mb-1">🍸</span>
              <span className="font-bold text-xs">Bar</span>
            </button>
          </div>
          {foodServices.length > 0 && (
            <div className="space-y-2 mt-3">
              {foodServices.map((s) => <ServiceCard key={s.id} s={s} />)}
            </div>
          )}
        </div>

        {/* ─── Section Bien-être ─── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💆</span>
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: C.inkLight }}>{t.sectionWellness}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowSpa(true)}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition"
            >
              <span className="text-2xl mb-1">💆</span>
              <span className="font-bold text-xs">Spa</span>
            </button>
            <button
              onClick={() => setShowSpa(true)}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition"
            >
              <span className="text-2xl mb-1">🧖</span>
              <span className="font-bold text-xs">Hammam</span>
            </button>
          </div>
          {wellnessServices.length > 0 && (
            <div className="space-y-2 mt-3">
              {wellnessServices.map((s) => <ServiceCard key={s.id} s={s} />)}
            </div>
          )}
        </div>

        {/* ─── Section Pratique ─── */}
        {practicalServices.length > 0 && (
          <ServiceSection title={t.sectionPractical} emoji="🔧" items={practicalServices} />
        )}

        {/* ─── Section Boutique ─── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🛍️</span>
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: C.inkLight }}>{t.sectionShop}</h2>
          </div>
          <button
            onClick={() => setShowMarketplace(true)}
            className="w-full p-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-3"
          >
            <span className="text-2xl">🛍️</span>
            <div className="text-left">
              <p className="font-bold text-sm">Boutique locale</p>
              <p className="text-xs text-orange-100">Commerçants partenaires</p>
            </div>
          </button>
        </div>

        {/* Other services */}
        {otherServices.length > 0 && (
          <ServiceSection title="Autres" emoji="📋" items={otherServices} />
        )}

        {/* Empty state */}
        {servicesHotel.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center border" style={{ borderColor: C.border }}>
            <p className="text-base" style={{ color: C.inkLight }}>{t.noServices}</p>
          </div>
        )}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // ONGLET 2 — MON SÉJOUR (infos personnelles)
  // ════════════════════════════════════════════════════════════════════
  const renderMyStayTab = () => (
    <div className="space-y-5">
      {/* Guest info + countdown */}
      {stay ? (
        <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: C.border, boxShadow: C.shadow }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: `${C.gold}15` }}>
              👤
            </div>
            <div>
              <h2 className="font-bold text-lg" style={{ color: C.ink }}>{stay.guestName || 'Guest'}</h2>
              {stay.roomNumber && <p className="text-sm" style={{ color: C.inkLight }}>{t.room} {stay.roomNumber}</p>}
              {stay.nbPersons > 1 && <p className="text-xs" style={{ color: C.inkLight }}>{stay.nbPersons} pers.</p>}
            </div>
          </div>
          {stayDay && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide" style={{ color: C.goldDark }}>Séjour</p>
                  <p className="text-2xl font-bold" style={{ color: C.ink }}>
                    {t.day}{stayDay.dayNum} {t.of} {stayDay.totalDays}
                  </p>
                </div>
                <div className="text-3xl">
                  {isLastDay ? '🧳' : '🏨'}
                </div>
              </div>
              {isLastDay && <p className="text-xs font-semibold mt-1" style={{ color: '#7c3aed' }}>{t['Dernier jour']} !</p>}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs uppercase tracking-wide" style={{ color: C.inkLight }}>Check-in</p>
              <p className="font-semibold" style={{ color: C.ink }}>{new Date(stay.checkInDate).toLocaleDateString(effectiveLang === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' })}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs uppercase tracking-wide" style={{ color: C.inkLight }}>Check-out</p>
              <p className="font-semibold" style={{ color: C.ink }}>{new Date(stay.checkOutDate).toLocaleDateString(effectiveLang === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' })}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border text-center" style={{ borderColor: C.border, boxShadow: C.shadow }}>
          <span className="text-3xl">🏨</span>
          <p className="mt-2 text-sm" style={{ color: C.inkLight }}>Informations de séjour non disponibles</p>
        </div>
      )}

      {/* Checkout assistant */}
      {isLastDay && (
        <button
          onClick={() => setShowLastDay(true)}
          className="w-full p-5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-4"
        >
          <span className="text-3xl">🧳</span>
          <div className="text-left">
            <p className="font-bold">{t['Dernier jour']}</p>
            <p className="text-sm text-purple-100">{t.checkout}</p>
          </div>
        </button>
      )}

      {/* WiFi & Infos */}
      {agency.houseGuide && (
        <div className="bg-white rounded-2xl p-6 sm:p-5 border" style={{ borderColor: C.border, boxShadow: C.shadow }}>
          <h2 className="text-lg sm:text-base font-bold mb-4 flex items-center gap-3" style={{ color: C.ink }}>
            <span className="w-12 h-12 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-2xl sm:text-xl" style={{ backgroundColor: `${C.gold}15` }}>📶</span>
            {t.wifi}
          </h2>
          {agency.houseGuide.wifiNetwork && (
            <div className="bg-gray-50 rounded-xl p-4 sm:p-3 mb-2">
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: C.inkLight }}>{t.network}</p>
              <p className="font-mono font-bold text-lg sm:text-sm" style={{ color: C.ink }}>{agency.houseGuide.wifiNetwork}</p>
              {agency.houseGuide.wifiPassword && <p className="font-mono text-lg sm:text-sm mt-2" style={{ color: C.ink }}>🔑 {agency.houseGuide.wifiPassword}</p>}
            </div>
          )}
          {agency.houseGuide.houseRules && (
            <div className="bg-gray-50 rounded-xl p-4 sm:p-3">
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: C.inkLight }}>{t.rules}</p>
              <p className="text-sm sm:text-xs whitespace-pre-line" style={{ color: C.ink }}>{agency.houseGuide.houseRules}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ════════════════════════════════════════════════════════════════════
  // ONGLET 3 — EXPLORER (tourisme, GPS, partenaires)
  // ════════════════════════════════════════════════════════════════════
  const renderExploreTab = () => (
    <div className="space-y-5">
      {isAtHotel !== null && (
        <div className="bg-white rounded-2xl p-4 border flex items-center gap-3" style={{ borderColor: C.border, boxShadow: C.shadow }}>
          <span className="text-2xl">{isAtHotel ? '🏨' : '🗺️'}</span>
          <p className="text-sm font-semibold" style={{ color: C.ink }}>
            {isAtHotel
              ? (effectiveLang === 'en' ? 'You are at the hotel' : 'Vous êtes à l\'hôtel')
              : (effectiveLang === 'en' ? 'You are exploring' : 'Vous explorez')}
          </p>
        </div>
      )}
      {servicesTourism.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📍</span>
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: C.inkLight }}>
              {effectiveLang === 'en' ? 'Recommended' : 'Recommandé'}
            </h2>
          </div>
          <div className="space-y-2">
            {servicesTourism.map((s) => <ServiceCard key={s.id} s={s} />)}
          </div>
        </div>
      )}
      {agency.latitude !== null && agency.longitude !== null && !isHost && (
        <NearbyAttractions hotelLat={agency.latitude} hotelLng={agency.longitude} agencySlug={agency.slug} agencyId={agency.id} />
      )}
      {servicesTourism.length === 0 && (agency.latitude === null || agency.longitude === null) && (
        <div className="bg-white rounded-2xl p-10 text-center border" style={{ borderColor: C.border }}>
          <p className="text-base" style={{ color: C.inkLight }}>{t.noPartners}</p>
        </div>
      )}
    </div>
  );

  // ════════════════════════════════════════════════════════════════════
  // ONGLET 4 — URGENCE (SOS, contact, feedback)
  // ════════════════════════════════════════════════════════════════════
  const renderEmergencyTab = () => (
    <div className="space-y-5">
      {servicesHelp.length > 0 && (
        <div className="space-y-2">
          {servicesHelp.map((s) => <ServiceCard key={s.id} s={s} />)}
        </div>
      )}
      {!isHost && <SosButton agencyId={agency.id} baggageId={undefined} />}
      {isHost && <ConciergeAlertButton agencyId={agency.id} baggageId={undefined} />}

      <div className="bg-white rounded-2xl p-6 sm:p-5 border" style={{ borderColor: C.border, boxShadow: C.shadow }}>
        <div className="grid grid-cols-2 gap-4 sm:gap-3">
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${agency.latitude || ''},${agency.longitude || ''}`} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-5 sm:p-4 rounded-xl border transition-all hover:shadow-md" style={{ borderColor: C.border }}>
            <span className="text-4xl sm:text-2xl mb-2">📍</span>
            <span className="text-sm sm:text-xs font-semibold text-center" style={{ color: C.ink }}>{t.backToHotel}</span>
          </a>
          {receptionTel && (
            <a href={`tel:${receptionTel}`} className="flex flex-col items-center justify-center p-5 sm:p-4 rounded-xl border transition-all hover:shadow-md" style={{ borderColor: C.border }}>
              <span className="text-4xl sm:text-2xl mb-2">🛎️</span>
              <span className="text-sm sm:text-xs font-semibold text-center" style={{ color: C.ink }}>{t.reception}</span>
            </a>
          )}
          <a href="tel:1515" className="flex flex-col items-center justify-center p-5 sm:p-4 rounded-xl border transition-all hover:shadow-md" style={{ borderColor: C.border }}>
            <span className="text-4xl sm:text-2xl mb-2">🚑</span>
            <span className="text-sm sm:text-xs font-semibold text-center" style={{ color: C.ink }}>{t.emergency}</span>
          </a>
          {receptionTel && (
            <a href={`https://wa.me/${receptionTel}?text=${encodeURIComponent(effectiveLang === 'en' ? 'Hello, I need assistance.' : 'Bonjour, j\'ai besoin d\'aide.')}`} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-5 sm:p-4 rounded-xl border transition-all hover:shadow-md" style={{ borderColor: C.border }}>
              <span className="text-4xl sm:text-2xl mb-2">💬</span>
              <span className="text-sm sm:text-xs font-semibold text-center" style={{ color: C.ink }}>WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-32 sm:pb-28" style={{ backgroundColor: C.bg }}>
      {/* ─── HEADER LUXE ─── */}
      <header className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.goldLight} 0%, #FFFFFF 60%, ${C.bg} 100%)` }}>
        <div className="h-1" style={{ background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />
        <div className="pt-12 pb-10 sm:pt-10 sm:pb-8 px-6 text-center relative z-10">
          {agency.logoUrl && agency.logoUrl.length > 100 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={agency.logoUrl} alt={agency.name} className="h-56 w-56 sm:h-40 sm:w-40 object-contain mx-auto mb-5 rounded-3xl shadow-lg" style={{ boxShadow: C.shadowHover }} />
          )}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm sm:text-xs font-semibold mb-5" style={{ backgroundColor: `${C.gold}20`, color: C.goldDark }}>
            <span className="text-base">{profileMeta.emoji}</span>
            <span>{effectiveLang === 'en' ? profileMeta.labelEn : profileMeta.label}</span>
          </div>
          <p className="text-xl sm:text-lg font-light tracking-wide mb-2" style={{ color: C.inkLight }}>{greeting}</p>
          <h1 className="text-4xl sm:text-3xl font-bold mb-3 leading-tight" style={{ color: C.ink }}>{agency.name}</h1>
          {stay && stay.guestName ? (
            <div className="inline-block px-5 py-2 rounded-full mb-3" style={{ backgroundColor: `${C.gold}15` }}>
              <p className="text-base sm:text-sm font-medium" style={{ color: C.goldDark }}>
                {stay.guestName}{stay.roomNumber && ` · ${t.room} ${stay.roomNumber}`}
              </p>
            </div>
          ) : null}
          <p className="text-base sm:text-sm" style={{ color: C.inkLight }}>{t.subtitle}</p>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${C.gold}, transparent)` }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${C.gold}, transparent)` }} />
      </header>

      {/* ─── ONGLETS ─── */}
      <div className="sticky top-0 z-30 backdrop-blur-md border-b" style={{ backgroundColor: `${C.bg}F0`, borderColor: C.border }}>
        <div className="max-w-2xl mx-auto flex">
          {([
            { key: 'roomservice' as const, label: t.tabRoomService, icon: '🛎️' },
            { key: 'mystay' as const, label: t.tabMyStay, icon: '🏨' },
            { key: 'explore' as const, label: t.tabExplore, icon: '🗺️' },
            { key: 'emergency' as const, label: t.tabEmergency, icon: '🛟' },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-4 sm:py-3 px-2 sm:px-1 text-xs sm:text-sm font-semibold transition-all relative flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1"
              style={{ color: activeTab === tab.key ? C.goldDark : C.inkLight }}
            >
              <span className="text-lg sm:text-base sm:mr-1">{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-1 sm:h-0.5 rounded-full" style={{ backgroundColor: C.gold }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── CONTENU ─── */}
      <main className="px-4 py-6 sm:py-4 max-w-2xl mx-auto">
        {activeTab === 'roomservice' && renderRoomServiceTab()}
        {activeTab === 'mystay' && renderMyStayTab()}
        {activeTab === 'explore' && renderExploreTab()}
        {activeTab === 'emergency' && renderEmergencyTab()}
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="fixed bottom-0 left-0 w-full backdrop-blur-md border-t p-3 z-50" style={{ backgroundColor: `${C.bg}F0`, borderColor: C.border }}>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFeedback(true)}
            className="flex-1 py-4 sm:py-3 rounded-xl font-bold text-base sm:text-sm text-center transition-all hover:shadow-lg"
            style={{ backgroundColor: C.gold, color: '#FFFFFF' }}
          >
            ⭐ {t.review}
          </button>
        </div>
      </footer>

      {/* ─── MODALS ─── */}
      {selectedService && (
        <ServiceRequestModal
          service={selectedService}
          agencyId={agency.id}
          reference={agency.reference}
          roomNumber={stay?.roomNumber}
          guestName={stay?.guestName}
          onClose={() => setSelectedService(null)}
        />
      )}
      {showFeedback && <FeedbackModal agencyId={agency.id} baggageId={undefined} agencyName={agency.name} onClose={() => setShowFeedback(false)} />}
      {showRoomService && <RoomServiceModal agencyId={agency.id} baggageId={undefined} roomNumber={stay?.roomNumber} guestName={stay?.guestName} onClose={() => setShowRoomService(false)} />}
      {showLastDay && <LastDayModal agencyId={agency.id} baggageId={undefined} roomNumber={stay?.roomNumber} guestName={stay?.guestName} onClose={() => setShowLastDay(false)} />}
      {showSpa && <SpaModal agencyId={agency.id} baggageId={undefined} roomNumber={stay?.roomNumber} guestName={stay?.guestName} onClose={() => setShowSpa(false)} />}
      {showMarketplace && <MarketplaceModal agencyId={agency.id} baggageId={undefined} roomNumber={stay?.roomNumber} guestName={stay?.guestName} onClose={() => setShowMarketplace(false)} />}
    </div>
  );
}
