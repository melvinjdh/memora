import React from 'react';
import { useNavigate } from 'react-router';
import {
  Minus, Plus, Trash2, Ticket, UserRound, ShoppingBag, ShoppingCart, ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const artsy = { fontFamily: "'ArtsyHeading', serif" } as const;
const mono = { fontFamily: "'DM Mono', ui-monospace, monospace" } as const;
const surface =
  'rounded-[1.4rem] border border-[#b59a5b]/12 bg-gradient-to-br from-[#1a4d3e] to-[#12382d] shadow-[0_22px_54px_-42px_rgba(0,0,0,.9)]';

const rp = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;

const typeMeta: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  ticket: { label: 'Tiket Museum', icon: Ticket },
  guide: { label: 'Pemandu Wisata', icon: UserRound },
  merchandise: { label: 'Merchandise', icon: ShoppingBag },
};

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity, cartTotal, isAuthenticated } = useApp();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  const itemDetail = (item: any) => {
    if (item.type === 'ticket' && item.details?.visitDate) {
      return `Kunjungan: ${new Date(item.details.visitDate).toLocaleDateString('id-ID')}`;
    }
    if (item.type === 'guide') {
      const parts: string[] = [];
      if (item.details?.museum) parts.push(String(item.details.museum));
      if (item.details?.date) parts.push(new Date(item.details.date).toLocaleDateString('id-ID'));
      return parts.join(' • ');
    }
    if (item.type === 'merchandise' && item.details?.museum) return String(item.details.museum);
    return '';
  };

  // ===== Empty =====
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(181,154,91,0.13),transparent_24rem),linear-gradient(180deg,#0d2b23_0%,#0a1f1a_46%,#061612_100%)] text-[#f0ebe3]">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-24 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#b59a5b]/10 text-[#b59a5b]">
            <ShoppingCart className="h-9 w-9" />
          </span>
          <h2 className="mt-6 text-2xl font-bold tracking-[-0.035em] text-[#f0ebe3]" style={artsy}>Keranjang masih kosong</h2>
          <p className="mt-2 text-sm text-[#a09a90]">Tiket, pemandu, dan merchandise yang kamu tambahkan akan muncul di sini.</p>
          <button
            type="button"
            onClick={() => navigate('/museums')}
            className="mt-6 rounded-full bg-[#b59a5b] px-7 py-3.5 text-sm font-bold text-[#0a1f1a] transition hover:bg-[#c9ad6e]"
          >
            Mulai Jelajah
          </button>
        </div>
      </div>
    );
  }

  // ===== List =====
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(181,154,91,0.13),transparent_24rem),linear-gradient(180deg,#0d2b23_0%,#0a1f1a_46%,#061612_100%)] text-[#f0ebe3]">
      <div className="mx-auto max-w-3xl px-5 pt-8 md:px-8 md:pt-12 lg:px-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#b59a5b]/75" style={mono}>{cart.length} item</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.04em] text-[#f0ebe3] md:text-4xl" style={artsy}>Keranjang</h1>

        <div className="mt-6 space-y-3">
          {cart.map((item: any) => {
            const meta = typeMeta[item.type] ?? typeMeta.merchandise;
            const Icon = meta.icon;
            const detail = itemDetail(item);
            const isGuide = item.type === 'guide';

            return (
              <article key={item.id} className={`${surface} p-3.5`}>
                <div className="flex gap-3.5">
                  {/* Thumbnail */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#0a1f1a]/50">
                    {item.details?.image ? (
                      <ImageWithFallback src={item.details.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#b59a5b]">
                        <Icon className="h-7 w-7" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#b59a5b]/70" style={mono}>{meta.label}</p>
                    <h3 className="mt-0.5 line-clamp-2 text-sm font-bold leading-tight text-[#f0ebe3]">{item.name}</h3>
                    {detail && <p className="mt-1 line-clamp-1 text-[11px] text-[#a09a90]">{detail}</p>}

                    <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                      <span className="font-extrabold tracking-[-0.02em] text-[#c9ad6e]">{rp(item.price * item.quantity)}</span>

                      {/* Stepper (guide tetap 1) + hapus */}
                      <div className="flex items-center gap-2">
                        {!isGuide ? (
                          <div className="flex items-center gap-2 rounded-full border border-[#b59a5b]/20 bg-[#0a1f1a]/40 px-1.5 py-1">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-[#f0ebe3] transition hover:bg-[#b59a5b]/15"
                              aria-label="Kurangi"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-5 text-center text-sm font-bold text-[#f0ebe3]">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-[#f0ebe3] transition hover:bg-[#b59a5b]/15"
                              aria-label="Tambah"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="rounded-full border border-[#b59a5b]/20 bg-[#0a1f1a]/40 px-3 py-1 text-xs font-semibold text-[#c8c2b8]">1 paket</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-[#a09a90] transition hover:bg-red-400/10 hover:text-red-300"
                          aria-label="Hapus item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* spacer agar konten terakhir tidak tertutup sticky bar */}
        <div className="h-28" />
      </div>

      {/* ===== Sticky checkout bar ===== */}
      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)_+_5.25rem)] z-40 px-4 md:bottom-0 md:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl border border-[#b59a5b]/15 bg-[#12382d]/95 px-4 py-3 shadow-[0_18px_46px_-22px_rgba(0,0,0,.9)] backdrop-blur-2xl md:rounded-t-2xl md:rounded-b-none md:px-6 md:py-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#a09a90]" style={mono}>Total</p>
            <p className="text-lg font-extrabold text-[#c9ad6e] md:text-xl">{rp(cartTotal)}</p>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[#b59a5b] px-6 py-3 text-sm font-bold text-[#0a1f1a] transition hover:bg-[#c9ad6e] md:px-8"
          >
            Checkout
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
