'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, ShoppingCart, Plus, Minus, Store } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  photoUrl: string | null;
  deliveryMode: string;
  stock: number;
}

interface Merchant {
  id: string;
  name: string;
  description: string | null;
  category: string;
  logoUrl: string | null;
  isVerified: boolean;
  products: Product[];
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  artisanat: { label: 'Artisanat', emoji: '🎨' },
  souvenirs: { label: 'Souvenirs', emoji: '🎁' },
  food: { label: 'Produits locaux', emoji: '🥖' },
  cosmetics: { label: 'Cosmétiques', emoji: '💄' },
  excursions: { label: 'Excursions', emoji: '🚌' },
  transport: { label: 'Transport', emoji: '🚗' },
  other: { label: 'Autre', emoji: '📦' },
};

interface MarketplaceModalProps {
  agencyId: string;
  baggageId?: string;
  roomNumber?: string | null;
  guestName?: string | null;
  onClose: () => void;
}

export default function MarketplaceModal({ agencyId, baggageId, roomNumber, guestName, onClose }: MarketplaceModalProps) {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{ totalAmount: number; merchantAmount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/marketplace?agencyId=${agencyId}`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setMerchants(data.merchants); })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [agencyId]);

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
          deliveryAddress: deliveryMode === 'delivery' ? deliveryAddress : undefined,
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl my-8">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 rounded-t-3xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6" />
            <h2 className="text-xl font-bold">Boutique locale</h2>
          </div>
          <p className="text-orange-50 text-sm mt-1">Produits de commerçants partenaires</p>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {confirmed ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Commande envoyée !</h3>
              <p className="text-sm text-slate-600 mb-4">
                {selectedMerchant?.name} a été notifié(e). Vous serez contacté(e) pour la suite.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-left">
                <p className="text-sm"><strong>Total:</strong> {confirmed.totalAmount.toLocaleString('fr-FR')} FCFA</p>
                <p className="text-sm text-slate-500 mt-1">
                  {deliveryMode === 'delivery' ? 'Livraison à votre adresse' : 'Retrait sur place'}
                </p>
              </div>
              <button onClick={onClose} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-xl font-medium">
                Fermer
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : merchants.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Aucun commerçant disponible pour l'instant</p>
            </div>
          ) : !selectedMerchant ? (
            // LISTE COMMERÇANTS
            <div className="space-y-3">
              {merchants.map((m) => {
                const meta = CATEGORY_LABELS[m.category] || CATEGORY_LABELS.other;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMerchant(m)}
                    className="w-full text-left p-4 border-2 border-slate-200 rounded-2xl hover:border-orange-400 hover:bg-orange-50/50 transition flex items-start gap-3"
                  >
                    {m.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.logoUrl} alt={m.name} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">{meta.emoji}</div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{m.name}</h3>
                        {m.isVerified && <span className="text-blue-500 text-xs">✓ Vérifié</span>}
                      </div>
                      {m.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{m.description}</p>}
                      <p className="text-xs text-orange-600 mt-1">{m.products.length} produit(s)</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            // PRODUITS DU COMMERÇANT
            <>
              <button
                onClick={() => { setSelectedMerchant(null); setCart({}); }}
                className="text-xs text-orange-600 hover:underline mb-3"
              >
                ← Retour aux commerçants
              </button>

              <div className="bg-orange-50 rounded-xl p-3 mb-4 flex items-center gap-3">
                {selectedMerchant.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedMerchant.logoUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-orange-200 flex items-center justify-center text-xl">
                    {(CATEGORY_LABELS[selectedMerchant.category] || CATEGORY_LABELS.other).emoji}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-900">{selectedMerchant.name}</h3>
                  {selectedMerchant.description && <p className="text-xs text-slate-500">{selectedMerchant.description}</p>}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {selectedMerchant.products.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl">
                    {p.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.photoUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-2xl">📦</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900">{p.name}</p>
                      {p.description && <p className="text-xs text-slate-500 line-clamp-1">{p.description}</p>}
                      <p className="text-sm font-bold text-orange-700">{p.price.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    {cart[p.id] ? (
                      <div className="flex items-center gap-2 bg-orange-100 rounded-lg p-1">
                        <button onClick={() => removeFromCart(p.id)} className="w-7 h-7 flex items-center justify-center text-orange-700 hover:bg-orange-200 rounded">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-orange-700 text-sm w-4 text-center">{cart[p.id]}</span>
                        <button onClick={() => addToCart(p.id)} className="w-7 h-7 flex items-center justify-center text-orange-700 hover:bg-orange-200 rounded">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(p.id)} className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {cartItems.length > 0 && (
                <>
                  <div className="mb-3">
                    <label className="block text-xs font-bold text-slate-600 mb-2">Mode de retrait</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setDeliveryMode('pickup')}
                        className={`py-2 rounded-lg text-sm font-medium border-2 ${deliveryMode === 'pickup' ? 'border-orange-500 bg-orange-50' : 'border-slate-200'}`}
                      >
                        🏪 Retrait
                      </button>
                      <button
                        onClick={() => setDeliveryMode('delivery')}
                        className={`py-2 rounded-lg text-sm font-medium border-2 ${deliveryMode === 'delivery' ? 'border-orange-500 bg-orange-50' : 'border-slate-200'}`}
                      >
                        🚚 Livraison
                      </button>
                    </div>
                  </div>

                  {deliveryMode === 'delivery' && (
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Adresse de livraison (chambre, lieu…)"
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm mb-3 focus:outline-none focus:border-orange-400"
                    />
                  )}

                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Notes…"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-orange-400 mb-3"
                  />

                  {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded mb-3">⚠️ {error}</p>}
                </>
              )}
            </>
          )}
        </div>

        {/* FOOTER PANIER */}
        {!confirmed && selectedMerchant && cartItems.length > 0 && (
          <div className="border-t bg-slate-50 p-4 rounded-b-3xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-slate-700">{cartItems.reduce((s, i) => s + i.quantity, 0)} article(s)</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{total.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <button
              onClick={submit}
              disabled={submitting || (deliveryMode === 'delivery' && !deliveryAddress)}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
              Commander
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
