'use client';

import { useState, useEffect, useRef } from 'react';
import HostView, { type HouseGuideData } from './HostView';
import NearbyAttractions from './NearbyAttractions';
import ServiceRequestModal from './ServiceRequestModal';
import FeedbackModal from './FeedbackModal';
import SosButton from './SosButton';
import RoomServiceModal from './RoomServiceModal';
import LastDayModal from './LastDayModal';
import SpaModal from './SpaModal';
import MarketplaceSection from './MarketplaceSection';
import OrderTracker from './OrderTracker';
import ConciergeAlertButton from './ConciergeAlertButton';
import { getProfileMeta, type BraceletProfile } from '@/lib/bracelet-profiles';
import {
  UtensilsCrossed, Bed, Compass, ShieldAlert,
  Star, ChevronRight, Wifi, Clock, MapPin
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface HotelServiceItem {
  id: string; name: string; description: string | null; icon: string;
  type: string; category: string; isFree: boolean; price: number;
  schedule: string | null; assignedTeam: string; displayTab: string;
}

export interface WelcomeAgency {
  id: string; name: string; slug: string;
  phone: string | null; contactPhone: string | null; logoUrl: string | null;
  address: string | null; braceletProfile: string | null;
  latitude: number | null; longitude: number | null;
  houseGuide: HouseGuideData | null; reference: string | null;
}

interface StayData {
  id: string; roomNumber: string | null; guestName: string | null;
  guestEmail: string | null; guestPhone: string | null; language: string;
  checkInDate: string; checkOutDate: string; nbPersons: number; status: string;
}

interface WristbandViewProps { agency: WelcomeAgency; lang: string; }

// ─── Mobile App Palette ────────────────────────────────────────────────────
const P = {
  // Fond principal
  bg:          '#F5F5F7',
  // Cards
  card:        '#FFFFFF',
  cardShadow:  '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
  cardShadowL: '0 4px 12px rgba(0,0,0,0.1)',
  // Text
  text:        '#1C1C1E',
  text2:       '#8E8E93',
  text3:       '#C7C7CC',
  // Accent (gold luxe)
  accent:      '#C9A961',
  accentDark:  '#A8884A',
  accentBg:    '#FFF9EE',
  // Status colors
  green:       '#34C759',
  orange:      '#FF9500',
  red:         '#FF3B30',
  blue:        '#007AFF',
  purple:      '#AF52DE',
  // Tab bar
  tabBar:      '#FFFFFF',
  tabInactive: '#8E8E93',
  tabActive:   '#C9A961',
  // Separator
  sep:         '#E5E5EA',
};

// ─── Traductions ────────────────────────────────────────────────────────────
const T = {
  fr: {
    morning: 'Bonjour', afternoon: 'Bon après-midi', evening: 'Bonsoir',
    subtitle: 'Votre compagnon de séjour',
    tabRoomService: 'Service', tabMyStay: 'Séjour', tabExplore: 'Explorer', tabEmergency: 'Urgence',
    reception: 'Réception', emergency: 'Urgences', review: 'Avis',
    noServices: 'Aucun service configuré.', noPartners: 'Aucun lieu recommandé.',
    backToHotel: 'Retour hôtel', room: 'Ch.', day: 'J', of: 'sur',
    checkout: 'Préparer mon checkout', wifi: 'WiFi & Infos',
    network: 'Réseau', rules: 'Règlement',
    myOrders: 'Commandes', pending: 'En attente', lastDay: 'Dernier Jour',
    suggestions: 'Suggestions', sectionFood: 'Restauration',
    sectionWellness: 'Bien-être', sectionPractical: 'Pratique', sectionShop: 'Boutique',
    orderTracking: 'Suivi commandes', allGood: 'Tout est calme',
    activeOrders: 'En cours', pastOrders: 'Historique',
  },
  en: {
    morning: 'Good Morning', afternoon: 'Good Afternoon', evening: 'Good Evening',
    subtitle: 'Your stay companion',
    tabRoomService: 'Service', tabMyStay: 'Stay', tabExplore: 'Explore', tabEmergency: 'Emergency',
    reception: 'Reception', emergency: 'Emergency', review: 'Review',
    noServices: 'No services configured.', noPartners: 'No recommended places.',
    backToHotel: 'Back to hotel', room: 'Rm', day: 'D', of: 'of',
    checkout: 'Prepare checkout', wifi: 'WiFi & Info',
    network: 'Network', rules: 'House Rules',
    myOrders: 'Orders', pending: 'Pending', lastDay: 'Last Day',
    suggestions: 'Suggestions', sectionFood: 'Food & Drinks',
    sectionWellness: 'Wellness', sectionPractical: 'Practical', sectionShop: 'Shop',
    orderTracking: 'Order tracking', allGood: 'All quiet',
    activeOrders: 'Active', pastOrders: 'History',
  },
};

// ─── Suggestions contextuelles ─────────────────────────────────────────────
function getContextualSuggestions(hour: number, lang: string, isLastDay: boolean) {
  const isFr = lang !== 'en';
  const s: { emoji: string; label: string; action: string; gradient: string }[] = [];
  if (hour >= 6 && hour < 10) {
    s.push({ emoji: '☕', label: isFr ? 'Café & Petit-déj' : 'Coffee & Breakfast', action: 'roomservice', gradient: 'from-amber-400 to-orange-500' });
    s.push({ emoji: '🧖', label: isFr ? 'Spa matinal' : 'Morning Spa', action: 'spa', gradient: 'from-purple-400 to-pink-500' });
  } else if (hour >= 10 && hour < 14) {
    s.push({ emoji: '🍽️', label: isFr ? 'Menu déjeuner' : 'Lunch Menu', action: 'roomservice', gradient: 'from-green-400 to-emerald-500' });
    s.push({ emoji: '🚕', label: isFr ? 'Réserver taxi' : 'Book Taxi', action: 'taxi', gradient: 'from-blue-400 to-cyan-500' });
  } else if (hour >= 14 && hour < 18) {
    s.push({ emoji: '💆', label: isFr ? 'Spa après-midi' : 'Afternoon Spa', action: 'spa', gradient: 'from-violet-400 to-purple-500' });
    s.push({ emoji: '🛍️', label: isFr ? 'Boutique locale' : 'Local Shop', action: 'marketplace', gradient: 'from-orange-400 to-amber-500' });
  } else {
    s.push({ emoji: '🍽️', label: isFr ? 'Menu dîner' : 'Dinner Menu', action: 'roomservice', gradient: 'from-rose-400 to-red-500' });
    s.push({ emoji: '🧳', label: isFr ? 'Préparer checkout' : 'Prepare Checkout', action: 'lastday', gradient: 'from-indigo-400 to-violet-500' });
  }
  if (isLastDay) s.push({ emoji: '🧳', label: isFr ? 'Dernier jour !' : 'Last Day!', action: 'lastday', gradient: 'from-violet-500 to-purple-600' });
  return s;
}

// ─── Service classification ────────────────────────────────────────────────
type ServiceCategory = 'food' | 'wellness' | 'practical' | 'other';
function classifyService(s: HotelServiceItem): ServiceCategory {
  const n = s.name.toLowerCase(), c = s.category.toLowerCase();
  if (c.includes('restauration') || c.includes('food') || c.includes('bar') || c.includes('room-service') ||
      n.includes('menu') || n.includes('petit-déj') || n.includes('déjeuner') || n.includes('dîner') ||
      n.includes('breakfast') || n.includes('lunch') || n.includes('dinner') || n.includes('bar')) return 'food';
  if (c.includes('spa') || c.includes('bien-être') || c.includes('wellness') || c.includes('massage') ||
      n.includes('spa') || n.includes('massage') || n.includes('hammam') || n.includes('piscine')) return 'wellness';
  if (c.includes('pratique') || c.includes('practical') || c.includes('blanchisserie') || c.includes('navette') || c.includes('taxi') ||
      n.includes('blanchisserie') || n.includes('pressing') || n.includes('navette') || n.includes('taxi') || n.includes('réveil') || n.includes('oreiller')) return 'practical';
  return 'other';
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function WristbandView({ agency, lang }: WristbandViewProps) {
  const [activeTab, setActiveTab] = useState<'roomservice' | 'mystay' | 'explore' | 'emergency'>('roomservice');
  const [hotelServices, setHotelServices] = useState<HotelServiceItem[]>([]);
  const [stay, setStay] = useState<StayData | null>(null);
  const [selectedService, setSelectedService] = useState<HotelServiceItem | null>(null);
  const [isAtHotel, setIsAtHotel] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showRoomService, setShowRoomService] = useState(false);
  const [showLastDay, setShowLastDay] = useState(false);
  const [showSpa, setShowSpa] = useState(false);
  const [greeting, setGreeting] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // ─── Effects (geofencing, stay, services, greeting) ─────────────────────
  useEffect(() => {
    if (!agency.latitude || !agency.longitude) return;
    if (!('geolocation' in navigator)) return;
    let cancelled = false;
    const check = () => {
      navigator.geolocation.getCurrentPosition((pos) => {
        if (cancelled) return;
        const R = 6371;
        const dLat = (pos.coords.latitude - agency.latitude!) * Math.PI / 180;
        const dLng = (pos.coords.longitude - agency.longitude!) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(agency.latitude!*Math.PI/180)*Math.cos(pos.coords.latitude*Math.PI/180)*Math.sin(dLng/2)**2;
        setIsAtHotel(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) < 0.2);
      }, () => {}, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
    };
    check(); const iv = setInterval(check, 30000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [agency.latitude, agency.longitude]);

  useEffect(() => { if (isAtHotel === null) return; setActiveTab(isAtHotel ? 'roomservice' : 'explore'); }, [isAtHotel]);

  const effectiveLang = stay?.language || lang;
  const t = effectiveLang === 'en' ? T.en : T.fr;
  const profile = (agency.braceletProfile || 'STANDARD') as BraceletProfile;
  const profileMeta = getProfileMeta(profile);
  const isHost = profile === 'HOST';
  const currentHour = new Date().getHours();

  useEffect(() => {
    const update = () => { const h = new Date().getHours(); setGreeting(h < 12 ? t.morning : h < 18 ? t.afternoon : t.evening); };
    update(); const ti = setInterval(update, 60000); return () => clearInterval(ti);
  }, [t.morning, t.afternoon, t.evening]);

  useEffect(() => {
    if (!agency.reference) return; let c = false;
    (async () => { try { const r = await fetch(`/api/stay?reference=${agency.reference}`); if (r.ok) { const d = await r.json(); if (!c && d.found && d.stay) setStay(d.stay); } } catch {} })();
    return () => { c = true; };
  }, [agency.reference]);

  useEffect(() => {
    if (isHost) return; let c = false;
    (async () => { try { const r = await fetch(`/api/hotel-services?agencyId=${agency.id}`); if (r.ok) { const d = await r.json(); if (!c && d.success) setHotelServices(d.services || []); } } catch {} })();
    return () => { c = true; };
  }, [agency.id, isHost]);

  // Scroll to top on tab switch
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }, [activeTab]);

  const receptionPhone = agency.contactPhone || agency.phone;
  const cleanPhone = (p: string | null) => p ? p.replace(/[\s\-().]/g, '') : null;
  const receptionTel = cleanPhone(receptionPhone);

  const servicesHotel = hotelServices.filter((s) => s.displayTab === 'hotel');
  const servicesTourism = hotelServices.filter((s) => s.displayTab === 'tourism');
  const servicesHelp = hotelServices.filter((s) => s.displayTab === 'help');
  const foodServices = servicesHotel.filter((s) => classifyService(s) === 'food');
  const wellnessServices = servicesHotel.filter((s) => classifyService(s) === 'wellness');
  const practicalServices = servicesHotel.filter((s) => classifyService(s) === 'practical');
  const otherServices = servicesHotel.filter((s) => classifyService(s) === 'other');

  const stayDay = (() => {
    if (!stay?.checkInDate) return null;
    const ci = new Date(stay.checkInDate), now = new Date();
    const dn = Math.floor((now.getTime() - ci.getTime()) / 86400000) + 1;
    let td = 1;
    if (stay.checkOutDate) td = Math.max(1, Math.round((new Date(stay.checkOutDate).getTime() - ci.getTime()) / 86400000));
    return { dayNum: Math.max(1, dn), totalDays: td };
  })();
  const isLastDay = stayDay && stayDay.dayNum === stayDay.totalDays;

  const parseSchedule = (s: string | null) => { if (!s) return null; try { const p = JSON.parse(s); return (p.open === '00:00' && p.close === '23:59') ? { ...p, open: '', close: '' } : p; } catch { return null; } };

  // ─── Mobile Card ─────────────────────────────────────────────────────────
  const MobileCard = ({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 ${onClick ? 'active:scale-[0.98] cursor-pointer' : ''} transition-transform ${className}`}
      style={{ boxShadow: P.cardShadow }}
    >
      {children}
    </div>
  );

  // ─── Service Chip ────────────────────────────────────────────────────────
  const ServiceChip = ({ s }: { s: HotelServiceItem }) => {
    const sched = parseSchedule(s.schedule);
    return (
      <button
        onClick={() => setSelectedService(s)}
        className="w-full text-left bg-white rounded-2xl p-3.5 active:scale-[0.98] transition-transform flex items-center gap-3"
        style={{ boxShadow: P.cardShadow }}
      >
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: P.accentBg }}>
          {s.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[13px] leading-tight truncate" style={{ color: P.text }}>{s.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {!s.isFree && <span className="text-[11px] font-bold" style={{ color: P.accentDark }}>{s.price.toLocaleString('fr-FR')} FCFA</span>}
            {sched && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: P.accentBg, color: P.accentDark }}>{sched.open === '' ? '24/7' : `${sched.open}-${sched.close}`}</span>}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: P.text3 }} />
      </button>
    );
  };

  const ServiceGroup = ({ title, emoji, items }: { title: string; emoji: string; items: HotelServiceItem[] }) => {
    if (items.length === 0) return null;
    return (
      <div>
        <div className="flex items-center gap-1.5 mb-2 mt-1">
          <span className="text-sm">{emoji}</span>
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: P.text2 }}>{title}</span>
        </div>
        <div className="space-y-2">{items.map((s) => <ServiceChip key={s.id} s={s} />)}</div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════
  // TAB 1 — ROOM SERVICE (centre de commande)
  // ══════════════════════════════════════════════════════════════════════
  const renderRoomServiceTab = () => {
    if (isHost && agency.houseGuide) return <HostView guide={agency.houseGuide} agencyName={agency.name} agencyAddress={agency.address} lang={lang} />;
    const suggestions = getContextualSuggestions(currentHour, effectiveLang, !!isLastDay);

    return (
      <div className="space-y-4 pb-4">
        {/* Order Tracker */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">📦</span>
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: P.accentDark }}>{t.orderTracking}</span>
          </div>
          <OrderTracker
            agencyId={agency.id}
            baggageId={agency.reference || undefined}
            reference={agency.reference || undefined}
            lang={effectiveLang}
            onReorder={(order) => { if (order.type === 'roomservice') setShowRoomService(true); }}
          />
        </div>

        {/* Suggestions carousel */}
        {suggestions.length > 0 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-5 px-5 snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch' }}>
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => {
                  if (sug.action === 'roomservice') setShowRoomService(true);
                  else if (sug.action === 'spa') setShowSpa(true);
                  else if (sug.action === 'marketplace') document.getElementById('marketplace-section')?.scrollIntoView({ behavior: 'smooth' });
                  else if (sug.action === 'lastday') setShowLastDay(true);
                }}
                className={`snap-start flex-shrink-0 w-[140px] rounded-2xl p-3.5 text-white active:scale-95 transition-transform bg-gradient-to-br ${sug.gradient}`}
              >
                <span className="text-2xl">{sug.emoji}</span>
                <p className="text-[12px] font-semibold mt-1.5 leading-tight">{sug.label}</p>
              </button>
            ))}
          </div>
        )}

        {/* Last day banner */}
        {isLastDay && (
          <button
            onClick={() => setShowLastDay(true)}
            className="w-full rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform bg-gradient-to-r from-violet-500 to-purple-600 text-white"
            style={{ boxShadow: P.cardShadowL }}
          >
            <span className="text-2xl">🧳</span>
            <div className="text-left">
              <p className="font-bold text-[13px]">{t.lastDay}</p>
              <p className="text-[11px] text-purple-200">{t.checkout}</p>
            </div>
            <ChevronRight className="w-5 h-5 ml-auto text-purple-200" />
          </button>
        )}

        {/* ─── Food Section ─── */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <UtensilsCrossed className="w-4 h-4" style={{ color: P.text2 }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: P.text2 }}>{t.sectionFood}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={() => setShowRoomService(true)} className="rounded-2xl p-4 flex flex-col items-center justify-center active:scale-95 transition-transform bg-gradient-to-br from-green-500 to-emerald-600 text-white" style={{ boxShadow: P.cardShadowL }}>
              <span className="text-2xl mb-1">🍽️</span>
              <span className="font-bold text-[11px]">Menu</span>
            </button>
            <button onClick={() => setShowRoomService(true)} className="rounded-2xl p-4 flex flex-col items-center justify-center active:scale-95 transition-transform bg-gradient-to-br from-amber-500 to-orange-600 text-white" style={{ boxShadow: P.cardShadowL }}>
              <span className="text-2xl mb-1">🍸</span>
              <span className="font-bold text-[11px]">Bar</span>
            </button>
          </div>
          <div className="space-y-2 mt-2.5">{foodServices.map((s) => <ServiceChip key={s.id} s={s} />)}</div>
        </div>

        {/* ─── Wellness Section ─── */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">💆</span>
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: P.text2 }}>{t.sectionWellness}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={() => setShowSpa(true)} className="rounded-2xl p-4 flex flex-col items-center justify-center active:scale-95 transition-transform bg-gradient-to-br from-purple-500 to-pink-600 text-white" style={{ boxShadow: P.cardShadowL }}>
              <span className="text-2xl mb-1">💆</span>
              <span className="font-bold text-[11px]">Spa</span>
            </button>
            <button onClick={() => setShowSpa(true)} className="rounded-2xl p-4 flex flex-col items-center justify-center active:scale-95 transition-transform bg-gradient-to-br from-blue-500 to-cyan-600 text-white" style={{ boxShadow: P.cardShadowL }}>
              <span className="text-2xl mb-1">🧖</span>
              <span className="font-bold text-[11px]">Hammam</span>
            </button>
          </div>
          <div className="space-y-2 mt-2.5">{wellnessServices.map((s) => <ServiceChip key={s.id} s={s} />)}</div>
        </div>

        {/* ─── Practical ─── */}
        <ServiceGroup title={t.sectionPractical} emoji="🔧" items={practicalServices} />

        {/* ─── Marketplace INLINE ─── */}
        <div id="marketplace-section">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">🛍️</span>
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: P.text2 }}>{t.sectionShop}</span>
          </div>
          <MarketplaceSection
            agencyId={agency.id}
            baggageId={agency.reference || undefined}
            roomNumber={stay?.roomNumber}
            guestName={stay?.guestName}
            hotelLat={agency.latitude}
            hotelLng={agency.longitude}
            lang={effectiveLang}
          />
        </div>

        <ServiceGroup title={effectiveLang === 'en' ? 'Other' : 'Autres'} emoji="📋" items={otherServices} />

        {servicesHotel.length === 0 && (
          <MobileCard>
            <p className="text-center text-sm py-6" style={{ color: P.text2 }}>{t.noServices}</p>
          </MobileCard>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════
  // TAB 2 — MON SÉJOUR
  // ══════════════════════════════════════════════════════════════════════
  const renderMyStayTab = () => (
    <div className="space-y-4 pb-4">
      {stay ? (
        <MobileCard>
          {/* Guest avatar + name */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: P.accentBg }}>
              👤
            </div>
            <div>
              <p className="font-bold text-[15px]" style={{ color: P.text }}>{stay.guestName || 'Guest'}</p>
              {stay.roomNumber && <p className="text-[13px]" style={{ color: P.text2 }}>{t.room} {stay.roomNumber}</p>}
            </div>
          </div>
          {/* Stay progress */}
          {stayDay && (
            <div className="rounded-xl p-3.5 mb-3" style={{ backgroundColor: P.accentBg }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: P.accentDark }}>Séjour</p>
                  <p className="text-2xl font-bold" style={{ color: P.text }}>{t.day}{stayDay.dayNum} {t.of} {stayDay.totalDays}</p>
                </div>
                <span className="text-3xl">{isLastDay ? '🧳' : '🏨'}</span>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: `${P.accent}30` }}>
                <div className="h-full rounded-full transition-all" style={{ backgroundColor: P.accent, width: `${Math.min(100, (stayDay.dayNum / stayDay.totalDays) * 100)}%` }} />
              </div>
              {isLastDay && <p className="text-[11px] font-bold mt-1.5" style={{ color: P.purple }}>{t.lastDay} !</p>}
            </div>
          )}
          {/* Dates */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-3" style={{ backgroundColor: '#F5F5F7' }}>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: P.text2 }}>Check-in</p>
              <p className="font-semibold text-[13px] mt-0.5" style={{ color: P.text }}>{new Date(stay.checkInDate).toLocaleDateString(effectiveLang === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' })}</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: '#F5F5F7' }}>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: P.text2 }}>Check-out</p>
              <p className="font-semibold text-[13px] mt-0.5" style={{ color: P.text }}>{new Date(stay.checkOutDate).toLocaleDateString(effectiveLang === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' })}</p>
            </div>
          </div>
        </MobileCard>
      ) : (
        <MobileCard>
          <div className="text-center py-6">
            <span className="text-3xl">🏨</span>
            <p className="mt-2 text-[13px]" style={{ color: P.text2 }}>{effectiveLang === 'en' ? 'Stay info not available' : 'Infos séjour non disponibles'}</p>
          </div>
        </MobileCard>
      )}

      {/* Checkout CTA */}
      {isLastDay && (
        <button onClick={() => setShowLastDay(true)} className="w-full rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform bg-gradient-to-r from-violet-500 to-purple-600 text-white" style={{ boxShadow: P.cardShadowL }}>
          <span className="text-2xl">🧳</span>
          <div className="text-left"><p className="font-bold text-[13px]">{t.lastDay}</p><p className="text-[11px] text-purple-200">{t.checkout}</p></div>
          <ChevronRight className="w-5 h-5 ml-auto text-purple-200" />
        </button>
      )}

      {/* WiFi */}
      {agency.houseGuide && (
        <MobileCard>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: P.accentBg }}><Wifi className="w-4 h-4" style={{ color: P.accentDark }} /></div>
            <span className="font-bold text-[13px]" style={{ color: P.text }}>{t.wifi}</span>
          </div>
          {agency.houseGuide.wifiNetwork && (
            <div className="rounded-xl p-3 mb-2" style={{ backgroundColor: '#F5F5F7' }}>
              <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: P.text2 }}>{t.network}</p>
              <p className="font-mono font-bold text-[15px]" style={{ color: P.text }}>{agency.houseGuide.wifiNetwork}</p>
              {agency.houseGuide.wifiPassword && <p className="font-mono text-[15px] mt-1" style={{ color: P.text }}>🔑 {agency.houseGuide.wifiPassword}</p>}
            </div>
          )}
          {agency.houseGuide.houseRules && (
            <div className="rounded-xl p-3" style={{ backgroundColor: '#F5F5F7' }}>
              <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: P.text2 }}>{t.rules}</p>
              <p className="text-[12px] whitespace-pre-line leading-relaxed" style={{ color: P.text }}>{agency.houseGuide.houseRules}</p>
            </div>
          )}
        </MobileCard>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // TAB 3 — EXPLORER
  // ══════════════════════════════════════════════════════════════════════
  const renderExploreTab = () => (
    <div className="space-y-4 pb-4">
      {isAtHotel !== null && (
        <MobileCard>
          <div className="flex items-center gap-2">
            <span className="text-xl">{isAtHotel ? '🏨' : '🗺️'}</span>
            <span className="font-semibold text-[13px]" style={{ color: P.text }}>
              {isAtHotel ? (effectiveLang === 'en' ? 'You are at the hotel' : 'Vous êtes à l\'hôtel') : (effectiveLang === 'en' ? 'You are exploring' : 'Vous explorez')}
            </span>
          </div>
        </MobileCard>
      )}
      {servicesTourism.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-4 h-4" style={{ color: P.text2 }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: P.text2 }}>{effectiveLang === 'en' ? 'Recommended' : 'Recommandé'}</span>
          </div>
          <div className="space-y-2">{servicesTourism.map((s) => <ServiceChip key={s.id} s={s} />)}</div>
        </div>
      )}
      {agency.latitude !== null && agency.longitude !== null && !isHost && (
        <NearbyAttractions hotelLat={agency.latitude} hotelLng={agency.longitude} agencySlug={agency.slug} agencyId={agency.id} />
      )}
      {servicesTourism.length === 0 && (agency.latitude === null || agency.longitude === null) && (
        <MobileCard><p className="text-center text-sm py-6" style={{ color: P.text2 }}>{t.noPartners}</p></MobileCard>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // TAB 4 — URGENCE
  // ══════════════════════════════════════════════════════════════════════
  const renderEmergencyTab = () => (
    <div className="space-y-4 pb-4">
      {servicesHelp.length > 0 && <div className="space-y-2">{servicesHelp.map((s) => <ServiceChip key={s.id} s={s} />)}</div>}
      {!isHost && <SosButton agencyId={agency.id} baggageId={undefined} />}
      {isHost && <ConciergeAlertButton agencyId={agency.id} baggageId={undefined} />}
      <MobileCard>
        <div className="grid grid-cols-2 gap-2.5">
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${agency.latitude || ''},${agency.longitude || ''}`} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-4 rounded-2xl active:scale-95 transition-transform" style={{ backgroundColor: '#F5F5F7' }}>
            <span className="text-2xl mb-1">📍</span>
            <span className="text-[11px] font-semibold text-center" style={{ color: P.text }}>{t.backToHotel}</span>
          </a>
          {receptionTel && (
            <a href={`tel:${receptionTel}`} className="flex flex-col items-center justify-center p-4 rounded-2xl active:scale-95 transition-transform" style={{ backgroundColor: '#F5F5F7' }}>
              <span className="text-2xl mb-1">🛎️</span>
              <span className="text-[11px] font-semibold text-center" style={{ color: P.text }}>{t.reception}</span>
            </a>
          )}
          <a href="tel:1515" className="flex flex-col items-center justify-center p-4 rounded-2xl active:scale-95 transition-transform" style={{ backgroundColor: '#F5F5F7' }}>
            <span className="text-2xl mb-1">🚑</span>
            <span className="text-[11px] font-semibold text-center" style={{ color: P.text }}>{t.emergency}</span>
          </a>
          {receptionTel && (
            <a href={`https://wa.me/${receptionTel}?text=${encodeURIComponent(effectiveLang === 'en' ? 'Hello, I need assistance.' : 'Bonjour, j\'ai besoin d\'aide.')}`} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 rounded-2xl active:scale-95 transition-transform" style={{ backgroundColor: '#F5F5F7' }}>
              <span className="text-2xl mb-1">💬</span>
              <span className="text-[11px] font-semibold text-center" style={{ color: P.text }}>WhatsApp</span>
            </a>
          )}
        </div>
      </MobileCard>
    </div>
  );

  // ─── Tab config ─────────────────────────────────────────────────────────
  const tabs = [
    { key: 'roomservice' as const, label: t.tabRoomService, Icon: UtensilsCrossed },
    { key: 'mystay' as const, label: t.tabMyStay, Icon: Bed },
    { key: 'explore' as const, label: t.tabExplore, Icon: Compass },
    { key: 'emergency' as const, label: t.tabEmergency, Icon: ShieldAlert },
  ];

  return (
    <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: P.bg }}>
      {/* ─── STATUS BAR (safe area) ─── */}
      <div className="h-[env(safe-area-inset-top,0px)]" style={{ backgroundColor: P.card }} />

      {/* ─── COMPACT HEADER ─── */}
      <header className="shrink-0 bg-white border-b px-5 pt-3 pb-3" style={{ borderColor: P.sep }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {agency.logoUrl && agency.logoUrl.length > 100 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agency.logoUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: P.accentBg }}>
                {profileMeta.emoji}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-[15px] leading-tight truncate" style={{ color: P.text }}>{agency.name}</h1>
              <p className="text-[11px] leading-tight truncate" style={{ color: P.text2 }}>{greeting}{stay?.guestName ? ` · ${stay.guestName}` : ''}{stay?.roomNumber ? ` · ${t.room}${stay.roomNumber}` : ''}</p>
            </div>
          </div>
          <button
            onClick={() => setShowFeedback(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ backgroundColor: P.accentBg }}
          >
            <Star className="w-4 h-4" style={{ color: P.accentDark }} />
          </button>
        </div>
      </header>

      {/* ─── SCROLLABLE CONTENT ─── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pt-4" style={{ WebkitOverflowScrolling: 'touch' }}>
        {activeTab === 'roomservice' && renderRoomServiceTab()}
        {activeTab === 'mystay' && renderMyStayTab()}
        {activeTab === 'explore' && renderExploreTab()}
        {activeTab === 'emergency' && renderEmergencyTab()}
        {/* Bottom spacer for tab bar */}
        <div className="h-24" />
      </div>

      {/* ─── BOTTOM TAB BAR (iOS style) ─── */}
      <nav className="shrink-0 bg-white border-t" style={{ borderColor: P.sep }}>
        <div className="flex items-center justify-around px-2 pt-2 pb-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[56px] active:scale-90 transition-transform"
              >
                <tab.Icon
                  className="w-5 h-5 transition-colors"
                  style={{ color: isActive ? P.tabActive : P.tabInactive }}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span
                  className="text-[10px] font-medium transition-colors"
                  style={{ color: isActive ? P.tabActive : P.tabInactive }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Home indicator */}
        <div className="flex justify-center pb-1">
          <div className="w-32 h-1 rounded-full" style={{ backgroundColor: P.text3 }} />
        </div>
        {/* Safe area bottom */}
        <div className="h-[env(safe-area-inset-bottom,0px)]" />
      </nav>

      {/* ─── MODALS ─── */}
      {selectedService && (
        <ServiceRequestModal service={selectedService} agencyId={agency.id} reference={agency.reference} roomNumber={stay?.roomNumber} guestName={stay?.guestName} onClose={() => setSelectedService(null)} />
      )}
      {showFeedback && <FeedbackModal agencyId={agency.id} baggageId={undefined} agencyName={agency.name} onClose={() => setShowFeedback(false)} />}
      {showRoomService && <RoomServiceModal agencyId={agency.id} baggageId={undefined} roomNumber={stay?.roomNumber} guestName={stay?.guestName} onClose={() => setShowRoomService(false)} />}
      {showLastDay && <LastDayModal agencyId={agency.id} baggageId={undefined} roomNumber={stay?.roomNumber} guestName={stay?.guestName} onClose={() => setShowLastDay(false)} />}
      {showSpa && <SpaModal agencyId={agency.id} baggageId={undefined} roomNumber={stay?.roomNumber} guestName={stay?.guestName} onClose={() => setShowSpa(false)} />}
    </div>
  );
}
