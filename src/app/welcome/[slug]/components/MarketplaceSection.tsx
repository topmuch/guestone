'use client';

import { useState, useEffect } from 'react';
import {
  X, Loader2, CheckCircle2, ShoppingCart, Plus, Minus, Store,
  Star, MapPin, Phone, MessageCircle, Globe, ChevronRight,
  Filter, Heart, Share2, Image as ImageIcon
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  photoUrl: string | null;
  deliveryMode: string;
  stock: number;
}

interface Review {
  rating: number;
  comment: string | null;
  guestName: string | null;
  createdAt: string;
}

interface Merchant {
  id: string;
  name: string;
  description: string | null;
  category: string;
  logoUrl: string | null;
  coverUrl: string | null;
  isVerified: boolean;
  // Coordonnées
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  // Géolocalisation
  latitude: number | null;
  longitude: number | null;
  distanceKm: number | null;
  // Rating
  avgRating: number | null;
  totalReviews: number;
  recentReviews: Review[];
  // Produits
  products: Product[];
}

const CATEGORY_FILTERS: Record<string, { label: string; emoji: string }> = {
  all: { label: 'Tout', emoji: '🏪' },
  artisanat: { label: 'Artisanat', emoji: '🎨' },
  souvenirs: { label: 'Souvenirs', emoji: '🎁' },
  food: { label: 'Produits locaux', emoji: '🥖' },
  cosmetics: { label: 'Cosmétiques', emoji: '💄' },
  excursions: { label: 'Excursions', emoji: '🚌' },
  transport: { label: 'Transport', emoji: '🚗' },
  other: { label: 'Autre', emoji: '📦' },
};

const CATEGORY_LABELS = CATEGORY_FILTERS;

interface MarketplaceSectionProps {
  agencyId: string;
  baggageId?: string;
  roomNumber?: string | null;
  guestName?: string | null;
  hotelLat?: number | null;
  hotelLng?: number | null;
  lang?: string;
}

// ─── Stars display ─────────────────────────────────────────────────────────
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

// ─── Distance badge ────────────────────────────────────────────────────────
function DistanceBadge({ km }: { km: number }) {
  if (km < 1) return <span className="text-xs text-emerald-600 font-medium">{Math.round(km * 1000)}m</span>;
  return <span className="text-xs text-emerald-600 font-medium">{km}km</span>;
}

export default function MarketplaceSection({
  agencyId,
  baggageId,
  roomNumber,
  guestName,
  hotelLat,
  hotelLng,
  lang = 'fr',
}: MarketplaceSectionProps) {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{ totalAmount: number; merchantAmount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch merchants with GPS
  useEffect(() => {
    let cancelled = false;
    const doFetch = async () => {
      let lat: number | null = null;
      let lng: number | null = null;

      // Try guest GPS
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {}
      }
      // Fallback to hotel GPS
      if (lat === null) { lat = hotelLat ?? null; lng = hotelLng ?? null; }

      let url = `/api/marketplace?agencyId=${agencyId}`;
      if (lat !== null && lng !== null) url += `&lat=${lat}&lng=${lng}`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        if (!cancelled && data.success) setMerchants(data.merchants);
      } catch (e) { console.error(e); }
      finally { if (!cancelled) setLoading(false); }
    };
    doFetch();
    return () => { cancelled = true; };
  }, [agencyId, hotelLat, hotelLng]);

  const addToCart = (id: string) => setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeFromCart = (id: string) => setCart((prev) => {
    const next = { ...prev };
    if (next[id] > 1) next[id]--;
    else delete next[id];
    return next;
  });

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const item = selectedMerchant?.products.find((p) => p.id === id);
    return item ? { ...item, quantity: qty } : null;
  }).filter(Boolean) as (Product & { quantity: number })[];

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const submit = async () => {
    if (!selectedMerchant || cartItems.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/marketplace/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId,
          merchantId: selectedMerchant.id,
          baggageId,
          items: cartItems.map((i) => ({ productId: i.id, quantity: i.quantity })),
          deliveryMode,
          deliveryAddress: deliveryMode === 'delivery' ? (deliveryAddress || `Chambre ${roomNumber || ''}`) : undefined,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConfirmed({ totalAmount: data.totalAmount, merchantAmount: data.merchantAmount });
      } else {
        setError(data.error || 'Erreur');
      }
    } catch (e) {
      console.error(e);
      setError('Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrer par catégorie
  const filteredMerchants = categoryFilter === 'all'
    ? merchants
    : merchants.filter((m) => m.category === categoryFilter);

  // Catégories disponibles
  const availableCategories = ['all', ...Array.from(new Set(merchants.map((m) => m.category)))];

  const isFr = lang !== 'en';

  // ─── PRODUIT DÉTAILLÉ (grande photo) ────────────────────────────────────
  if (selectedProduct && selectedMerchant) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedProduct(null)}
          className="text-sm font-medium flex items-center gap-1 hover:underline"
          style={{ color: '#C9A961' }}
        >
          ← {isFr ? 'Retour aux produits' : 'Back to products'}
        </button>
        <div className="bg-white rounded-2xl overflow-hidden border" style={{ borderColor: '#E8E4DD' }}>
          {/* Grande photo */}
          {selectedProduct.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selectedProduct.photoUrl}
              alt={selectedProduct.name}
              className="w-full h-56 object-cover"
            />
          ) : (
            <div className="w-full h-56 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-orange-300" />
            </div>
          )}
          <div className="p-5">
            <h2 className="text-xl font-bold" style={{ color: '#2C2C2C' }}>{selectedProduct.name}</h2>
            {selectedProduct.description && (
              <p className="mt-2 text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>{selectedProduct.description}</p>
            )}
            <div className="flex items-center justify-between mt-4">
              <p className="text-2xl font-bold" style={{ color: '#A8884A' }}>
                {selectedProduct.price.toLocaleString('fr-FR')} FCFA
              </p>
              <div className="flex items-center gap-2">
                {selectedProduct.stock > 0 ? (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    {isFr ? 'En stock' : 'In stock'} ({selectedProduct.stock})
                  </span>
                ) : (
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    {isFr ? 'Rupture' : 'Out of stock'}
                  </span>
                )}
              </div>
            </div>
            {/* Add to cart */}
            <div className="mt-4">
              {cart[selectedProduct.id] ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-orange-100 rounded-xl p-2 flex-1 justify-center">
                    <button
                      onClick={() => removeFromCart(selectedProduct.id)}
                      className="w-8 h-8 flex items-center justify-center text-orange-700 hover:bg-orange-200 rounded-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-orange-700 text-lg w-6 text-center">{cart[selectedProduct.id]}</span>
                    <button
                      onClick={() => addToCart(selectedProduct.id)}
                      className="w-8 h-8 flex items-center justify-center text-orange-700 hover:bg-orange-200 rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-bold text-lg" style={{ color: '#2C2C2C' }}>
                    {(selectedProduct.price * cart[selectedProduct.id]).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(selectedProduct.id)}
                  disabled={selectedProduct.stock === 0}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition"
                >
                  <Plus className="w-5 h-5" />
                  {isFr ? 'Ajouter au panier' : 'Add to cart'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── FICHE COMMERÇANT DÉTAILLÉE ─────────────────────────────────────────
  if (selectedMerchant) {
    const m = selectedMerchant;
    return (
      <div className="space-y-4">
        <button
          onClick={() => { setSelectedMerchant(null); setCart({}); setConfirmed(null); }}
          className="text-sm font-medium flex items-center gap-1 hover:underline"
          style={{ color: '#C9A961' }}
        >
          ← {isFr ? 'Retour aux commerçants' : 'Back to merchants'}
        </button>

        {/* Bannière + Logo */}
        <div className="bg-white rounded-2xl overflow-hidden border" style={{ borderColor: '#E8E4DD' }}>
          {m.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.coverUrl} alt={m.name} className="w-full h-36 object-cover" />
          ) : (
            <div className="w-full h-36 bg-gradient-to-r from-orange-400 to-amber-400" />
          )}
          <div className="p-5 -mt-8 relative">
            <div className="flex items-end gap-3">
              {m.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.logoUrl} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-orange-200 flex items-center justify-center text-2xl border-2 border-white shadow-md">
                  {(CATEGORY_LABELS[m.category] || CATEGORY_LABELS.other).emoji}
                </div>
              )}
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold" style={{ color: '#2C2C2C' }}>{m.name}</h2>
                  {m.isVerified && <span className="text-blue-500 text-xs font-medium">✓ {isFr ? 'Vérifié' : 'Verified'}</span>}
                </div>
                {m.avgRating !== null && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Stars rating={m.avgRating} size={12} />
                    <span className="text-xs" style={{ color: '#6B6B6B' }}>{m.avgRating} ({m.totalReviews})</span>
                  </div>
                )}
              </div>
            </div>

            {m.description && (
              <p className="mt-3 text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>{m.description}</p>
            )}

            {/* Info bar: distance + contacts */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {m.distanceKm !== null && (
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                  <MapPin className="w-3 h-3" /> <DistanceBadge km={m.distanceKm} />
                </span>
              )}
              {m.address && (
                <span className="inline-flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded-full" style={{ color: '#6B6B6B' }}>
                  📍 {m.address}
                </span>
              )}
              {m.whatsapp && (
                <a
                  href={`https://wa.me/${m.whatsapp.replace(/[\s\-().]/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full hover:bg-green-100 transition"
                >
                  <MessageCircle className="w-3 h-3" /> WhatsApp
                </a>
              )}
              {m.phone && (
                <a href={`tel:${m.phone.replace(/[\s\-().]/g, '')}`} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-100 transition">
                  <Phone className="w-3 h-3" /> {isFr ? 'Appeler' : 'Call'}
                </a>
              )}
              {m.website && (
                <a href={m.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full hover:bg-purple-100 transition">
                  <Globe className="w-3 h-3" /> {isFr ? 'Site' : 'Website'}
                </a>
              )}
            </div>

            {/* Avis récents */}
            {m.recentReviews.length > 0 && (
              <div className="mt-4 pt-3 border-t" style={{ borderColor: '#E8E4DD' }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#6B6B6B' }}>
                  ⭐ {isFr ? 'Avis récents' : 'Recent reviews'}
                </p>
                <div className="space-y-2">
                  {m.recentReviews.map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Stars rating={r.rating} size={10} />
                      <div className="flex-1 min-w-0">
                        {r.comment && <p className="text-xs line-clamp-2" style={{ color: '#6B6B6B' }}>{r.comment}</p>}
                        {r.guestName && <p className="text-[10px] mt-0.5" style={{ color: '#A8884A' }}>— {r.guestName}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Commande confirmée */}
        {confirmed ? (
          <div className="bg-white rounded-2xl p-6 text-center border" style={{ borderColor: '#E8E4DD' }}>
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-bold mb-2" style={{ color: '#2C2C2C' }}>
              {isFr ? 'Commande envoyée !' : 'Order sent!'}
            </h3>
            <p className="text-sm mb-4" style={{ color: '#6B6B6B' }}>
              {m.name} {isFr ? 'a été notifié(e).' : 'has been notified.'}
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-left">
              <p className="text-sm font-bold">{isFr ? 'Total' : 'Total'}: {confirmed.totalAmount.toLocaleString('fr-FR')} FCFA</p>
              <p className="text-xs mt-1" style={{ color: '#6B6B6B' }}>
                {deliveryMode === 'delivery'
                  ? (isFr ? 'Livraison' : 'Delivery') + (deliveryAddress ? ` → ${deliveryAddress}` : '')
                  : isFr ? 'Retrait sur place' : 'Pickup'}
              </p>
            </div>
            <button
              onClick={() => { setSelectedMerchant(null); setCart({}); setConfirmed(null); }}
              className="mt-5 px-6 py-2.5 rounded-xl font-bold text-white transition"
              style={{ backgroundColor: '#2C2C2C' }}
            >
              {isFr ? 'Fermer' : 'Close'}
            </button>
          </div>
        ) : (
          <>
            {/* Produits */}
            <div className="space-y-2">
              <p className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6B6B6B' }}>
                🛒 {isFr ? 'Produits' : 'Products'} ({m.products.length})
              </p>
              {m.products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className="w-full text-left flex items-center gap-3 p-3 bg-white rounded-xl border transition-all hover:shadow-md"
                  style={{ borderColor: '#E8E4DD' }}
                >
                  {p.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photoUrl} alt={p.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-xl shrink-0">📦</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: '#2C2C2C' }}>{p.name}</p>
                    {p.description && <p className="text-xs line-clamp-1" style={{ color: '#6B6B6B' }}>{p.description}</p>}
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-sm font-bold" style={{ color: '#A8884A' }}>{p.price.toLocaleString('fr-FR')} FCFA</p>
                      {p.stock <= 3 && p.stock > 0 && (
                        <span className="text-[10px] text-orange-600">{isFr ? `${p.stock} restant(s)` : `${p.stock} left`}</span>
                      )}
                    </div>
                  </div>
                  {/* Quick add */}
                  {cart[p.id] ? (
                    <div className="flex items-center gap-1 bg-orange-100 rounded-lg p-1 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); removeFromCart(p.id); }} className="w-6 h-6 flex items-center justify-center text-orange-700 hover:bg-orange-200 rounded">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-orange-700 text-xs w-4 text-center">{cart[p.id]}</span>
                      <button onClick={(e) => { e.stopPropagation(); addToCart(p.id); }} className="w-6 h-6 flex items-center justify-center text-orange-700 hover:bg-orange-200 rounded">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(p.id); }}
                      className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded-lg hover:bg-orange-600 shrink-0 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </button>
              ))}
            </div>

            {/* Panier */}
            {cartItems.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E8E4DD' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium" style={{ color: '#2C2C2C' }}>
                      {cartItems.reduce((s, i) => s + i.quantity, 0)} {isFr ? 'article(s)' : 'item(s)'}
                    </span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: '#2C2C2C' }}>{total.toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#6B6B6B' }}>
                    {isFr ? 'Mode de retrait' : 'Pickup mode'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDeliveryMode('pickup')}
                      className={`py-2 rounded-lg text-sm font-medium border-2 transition ${deliveryMode === 'pickup' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                    >
                      🏪 {isFr ? 'Retrait' : 'Pickup'}
                    </button>
                    <button
                      onClick={() => setDeliveryMode('delivery')}
                      className={`py-2 rounded-lg text-sm font-medium border-2 transition ${deliveryMode === 'delivery' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                    >
                      🚚 {isFr ? 'Livraison' : 'Delivery'}
                    </button>
                  </div>
                </div>
                {deliveryMode === 'delivery' && (
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder={roomNumber ? `Chambre ${roomNumber}` : (isFr ? 'Adresse de livraison' : 'Delivery address')}
                    className="w-full p-3 border rounded-xl text-sm mb-3 focus:outline-none focus:border-orange-400"
                    style={{ borderColor: '#E8E4DD' }}
                  />
                )}
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder={isFr ? 'Notes…' : 'Notes…'}
                  className="w-full p-3 border rounded-xl text-sm resize-none focus:outline-none focus:border-orange-400 mb-3"
                  style={{ borderColor: '#E8E4DD' }}
                />
                {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded mb-3">⚠️ {error}</p>}
                <button
                  onClick={submit}
                  disabled={submitting || (deliveryMode === 'delivery' && !deliveryAddress && !roomNumber)}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                  {isFr ? 'Commander' : 'Order'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ─── LISTE COMMERÇANTS (vue par défaut) ─────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5" style={{ color: '#C9A961' }} />
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6B6B6B' }}>
            {isFr ? 'Boutique locale' : 'Local Shop'}
          </h2>
        </div>
        <span className="text-xs" style={{ color: '#6B6B6B' }}>{merchants.length} {isFr ? 'commerçant(s)' : 'merchant(s)'}</span>
      </div>

      {/* Filtres catégories */}
      {availableCategories.length > 2 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {availableCategories.map((cat) => {
            const meta = CATEGORY_FILTERS[cat] || CATEGORY_FILTERS.other;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  categoryFilter === cat
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 border'
                }`}
                style={categoryFilter !== cat ? { borderColor: '#E8E4DD' } : {}}
              >
                <span>{meta.emoji}</span>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : filteredMerchants.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border" style={{ borderColor: '#E8E4DD' }}>
          <Store className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-sm" style={{ color: '#6B6B6B' }}>
            {isFr ? 'Aucun commerçant disponible' : 'No merchants available'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMerchants.map((m) => {
            const meta = CATEGORY_LABELS[m.category] || CATEGORY_LABELS.other;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMerchant(m)}
                className="w-full text-left bg-white rounded-2xl border overflow-hidden transition-all hover:shadow-lg"
                style={{ borderColor: '#E8E4DD' }}
              >
                {/* Mini bannière */}
                {m.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.coverUrl} alt="" className="w-full h-20 object-cover" />
                ) : null}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {m.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.logoUrl} alt={m.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl shrink-0">{meta.emoji}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm" style={{ color: '#2C2C2C' }}>{m.name}</h3>
                        {m.isVerified && <span className="text-blue-500 text-xs">✓</span>}
                      </div>
                      {m.description && <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#6B6B6B' }}>{m.description}</p>}
                      <div className="flex items-center gap-3 mt-1.5">
                        {m.avgRating !== null && (
                          <div className="flex items-center gap-1">
                            <Stars rating={m.avgRating} size={10} />
                            <span className="text-[10px]" style={{ color: '#6B6B6B' }}>({m.totalReviews})</span>
                          </div>
                        )}
                        {m.distanceKm !== null && (
                          <span className="flex items-center gap-0.5 text-[10px]">
                            <MapPin className="w-2.5 h-2.5 text-emerald-500" />
                            <DistanceBadge km={m.distanceKm} />
                          </span>
                        )}
                        <span className="text-[10px]" style={{ color: '#6B6B6B' }}>
                          {m.products.length} {isFr ? 'prod.' : 'prod.'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0" style={{ color: '#C9A961' }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
