'use client';

import { useState, useEffect } from 'react';
import { X, ShoppingCart, Plus, Minus, Loader2, CheckCircle2, Clock, Package, Utensils } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  photoUrl: string | null;
  price: number;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  breakfast: { label: 'Petit-déjeuner', emoji: '🥐' },
  mains: { label: 'Plats', emoji: '🍽️' },
  desserts: { label: 'Desserts', emoji: '🍰' },
  drinks: { label: 'Boissons', emoji: '🥤' },
  snacks: { label: 'Snacks', emoji: '🥪' },
};

interface RoomServiceModalProps {
  agencyId: string;
  baggageId?: string;
  roomNumber?: string | null;
  guestName?: string | null;
  onClose: () => void;
}

export default function RoomServiceModal({ agencyId, baggageId, roomNumber, guestName, onClose }: RoomServiceModalProps) {
  const [menu, setMenu] = useState<Record<string, MenuItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({}); // menuItemId → quantity
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/menu?agencyId=${agencyId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setMenu(data.menu);
      })
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
    const item = Object.values(menu).flat().find((m) => m.id === id);
    return item ? { ...item, quantity: qty } : null;
  }).filter(Boolean) as (MenuItem & { quantity: number })[];

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const submit = async () => {
    if (cartItems.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId,
          baggageId,
          items: cartItems.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
          notes,
          paymentMethod: 'room',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderId(data.orderId);
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
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl my-8">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-3xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Utensils className="w-6 h-6" />
            <h2 className="text-xl font-bold">Room Service</h2>
          </div>
          <p className="text-green-50 text-sm mt-1">
            {roomNumber ? `Chambre ${roomNumber}` : 'Commande en chambre'} · Facturé sur la chambre
          </p>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {orderId ? (
            // CONFIRMATION
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Commande envoyée !</h3>
              <p className="text-sm text-slate-600 mb-4">
                Votre commande a été transmise à la cuisine. Vous serez notifié(e) à chaque étape.
              </p>
              <div className="bg-slate-50 rounded-xl p-4 text-left">
                <p className="text-xs text-slate-500 mb-2">Suivi de votre commande :</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="font-medium">En attente de confirmation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Package className="w-4 h-4" /> En préparation
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle2 className="w-4 h-4" /> Livrée
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-xl font-medium"
              >
                Fermer
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-green-500" />
            </div>
          ) : Object.keys(menu).length === 0 ? (
            <div className="text-center py-12">
              <Utensils className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Menu non disponible pour l'instant</p>
            </div>
          ) : (
            <>
              {/* MENU PAR CATÉGORIE */}
              {Object.entries(menu).map(([category, items]) => {
                const meta = CATEGORY_LABELS[category] || { label: category, emoji: '📋' };
                return (
                  <div key={category} className="mb-6">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <span>{meta.emoji}</span> {meta.label}
                    </h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl">
                          {item.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.photoUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-2xl">{meta.emoji}</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-slate-900">{item.name}</p>
                            {item.description && <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>}
                            <p className="text-sm font-bold text-green-700">{item.price.toLocaleString('fr-FR')} FCFA</p>
                          </div>
                          {cart[item.id] ? (
                            <div className="flex items-center gap-2 bg-green-100 rounded-lg p-1">
                              <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 flex items-center justify-center text-green-700 hover:bg-green-200 rounded">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-bold text-green-700 text-sm w-4 text-center">{cart[item.id]}</span>
                              <button onClick={() => addToCart(item.id)} className="w-7 h-7 flex items-center justify-center text-green-700 hover:bg-green-200 rounded">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => addToCart(item.id)} className="w-8 h-8 flex items-center justify-center bg-green-600 text-white rounded-lg hover:bg-green-700">
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* NOTES */}
              {cartItems.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-600 mb-2">Notes (allergies, préférences…)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Sans oignon, bien cuit…"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-green-400"
                  />
                </div>
              )}

              {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded mb-3">⚠️ {error}</p>}
            </>
          )}
        </div>

        {/* FOOTER PANIER */}
        {!orderId && cartItems.length > 0 && (
          <div className="border-t bg-slate-50 p-4 rounded-b-3xl sticky bottom-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-slate-700">{cartItems.reduce((s, i) => s + i.quantity, 0)} article(s)</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{total.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <button
              onClick={submit}
              disabled={submitting}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
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
