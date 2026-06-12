import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Landmark,
  QrCode,
  Search,
  ShoppingBag,
  Star,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { museums, products, tourGuides } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { SectionHeader } from '../components/SectionHeader';
import { BrandLogo } from '../components/BrandLogo';

const formatRupiah = (value: number) =>
  value === 0 ? 'Gratis' : `Rp ${value.toLocaleString('id-ID')}`;

const artsy = { fontFamily: "'ArtsyHeading', serif" } as const;
const mono = { fontFamily: "'DM Mono', ui-monospace, monospace" } as const;
const textShadow = { textShadow: '0 2px 18px rgba(0,0,0,0.9)' } as const;

const quickAccess = [
  { label: 'Museum', icon: Landmark, to: '/museums' },
  { label: 'Tiket', icon: Ticket, to: '/my-tickets' },
  { label: 'Pemandu', icon: Users, to: '/tour-guides' },
  { label: 'Merch', icon: ShoppingBag, to: '/merchandise' },
];

const benefits = [
  { icon: QrCode, title: 'Tiket Digital QR', description: 'Masuk museum lebih praktis dengan tiket digital.' },
  { icon: CalendarCheck, title: 'Booking Pemandu', description: 'Pilih jadwal dan pemandu sesuai kebutuhan.' },
  { icon: BookOpen, title: 'Info Lengkap', description: 'Detail museum, fasilitas, dan tiket dalam satu tempat.' },
  { icon: ClipboardList, title: 'Pesanan Rapi', description: 'Kelola tiket, booking, dan belanja dengan mudah.' },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const featuredMuseums = museums.slice(0, 4);
  const featuredGuides = tourGuides.slice(0, 3);
  const featuredProducts = products.slice(0, 4);
  const firstName = user?.name?.split(' ')[0];

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return [];

    return museums
      .filter((museum) =>
        museum.name.toLowerCase().includes(query) ||
        museum.description.toLowerCase().includes(query) ||
        museum.location.toLowerCase().includes(query)
      )
      .slice(0, 3);
  }, [searchQuery]);

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(181,154,91,0.13),transparent_24rem),linear-gradient(180deg,#0d2b23_0%,#0a1f1a_44%,#071814_100%)] text-[#f0ebe3]">
      <header className="sticky top-0 z-40 border-b border-[#b59a5b]/10 bg-[#0d2b23]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8 lg:px-10">
          <button type="button" onClick={() => navigate('/')} className="flex items-center">
            <BrandLogo size="sm" />
          </button>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#a09a90] md:flex">
            <button className="transition hover:text-[#b59a5b]" onClick={() => navigate('/museums')}>Museum</button>
            <button className="transition hover:text-[#b59a5b]" onClick={() => navigate('/tour-guides')}>Pemandu</button>
            <button className="transition hover:text-[#b59a5b]" onClick={() => navigate('/merchandise')}>Merchandise</button>
            <button className="transition hover:text-[#b59a5b]" onClick={() => navigate('/my-orders')}>Pesanan</button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifikasi"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b59a5b]/10 bg-[#1a4d3e]/50 text-[#c8c2b8] transition hover:border-[#b59a5b]/30 hover:text-[#b59a5b]"
            >
              <Bell className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
              className="hidden rounded-full bg-[#b59a5b] px-5 py-2.5 text-sm font-bold text-[#0a1f1a] shadow-[0_16px_35px_-22px_rgba(181,154,91,.85)] transition hover:bg-[#c9ad6e] md:inline-flex"
            >
              {isAuthenticated ? firstName || 'Profil' : 'Masuk'}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ===== Hero ===== */}
        <section className="relative">
          <div className="pointer-events-none absolute -left-12 top-8 h-56 w-56 rounded-full bg-[#1f6a55]/25 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[#b59a5b]/12 blur-3xl" />

          <div className="mx-auto max-w-7xl px-5 pb-8 pt-6 md:px-8 md:pb-14 md:pt-10 lg:px-10">
            <div className="relative overflow-hidden rounded-[2rem] border border-[#b59a5b]/15 shadow-[0_50px_120px_-50px_rgba(0,0,0,1)] md:rounded-[2.5rem]">
              {/* Gambar di belakang judul */}
              <img
                className="absolute inset-0 h-full w-full object-cover"
                src="/images/foto_homepage.jpg"
                alt="Galeri museum dengan patung dan lukisan klasik"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040d0a] via-[#0a1f1a]/82 to-[#0a1f1a]/35" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#040d0a]/90 via-[#061612]/45 to-transparent" />

              <div className="relative px-6 py-12 md:max-w-2xl md:px-12 md:py-24">
                <p
                  className="inline-flex rounded-full border border-[#b59a5b]/25 bg-[#0a1f1a]/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#c9ad6e] backdrop-blur"
                  style={mono}
                >
                  Cultural Travel
                </p>

                <h1
                  className="mt-5 text-[2.35rem] font-extrabold leading-[1.02] tracking-[-0.055em] text-white md:text-[4rem] lg:text-[4.6rem]"
                  style={{ ...artsy, ...textShadow }}
                >
                  Jelajahi Warisan Budaya Surabaya
                </h1>

                <p className="mt-5 max-w-xl text-[14px] leading-[1.8] text-[#e7e0d4] md:text-[16px]" style={textShadow}>
                  Temukan museum, beli tiket digital, booking pemandu wisata, dan bawa pulang merchandise khas museum.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate('/museums')}
                    className="inline-flex items-center justify-center rounded-full bg-[#b59a5b] px-7 py-3.5 text-sm font-bold text-[#0a1f1a] shadow-[0_20px_44px_-22px_rgba(181,154,91,1)] transition hover:bg-[#c9ad6e]"
                  >
                    Jelajahi Museum
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/tour-guides')}
                    className="inline-flex items-center justify-center rounded-full border border-[#f0ebe3]/25 bg-[#0a1f1a]/40 px-7 py-3.5 text-sm font-bold text-[#f0ebe3] backdrop-blur transition hover:bg-[#b59a5b]/15 hover:text-[#b59a5b]"
                  >
                    Pesan Pemandu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-20 mx-auto max-w-7xl px-5 md:-mt-2 md:px-8 lg:px-10">
          <div className="rounded-[1.75rem] border border-[#b59a5b]/10 bg-[#12382d]/72 p-4 shadow-[0_22px_60px_-42px_rgba(0,0,0,.8)] backdrop-blur-xl md:p-5">
            <div className="grid gap-4 md:grid-cols-[1.1fr_.9fr]">
              <div className="relative">
                <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#b59a5b]/10 bg-[#0a1f1a]/52 px-4 text-sm text-[#a09a90] transition focus-within:border-[#b59a5b]/45 focus-within:text-[#f0ebe3]">
                  <Search className="h-5 w-5 shrink-0 text-[#b59a5b]" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Cari museum, tiket, pemandu..."
                    className="h-14 min-w-0 flex-1 bg-transparent text-[#f0ebe3] outline-none placeholder:text-[#a09a90]"
                    aria-label="Cari museum"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0ebe3]/10 text-[#c8c2b8]"
                      aria-label="Hapus pencarian"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {searchQuery.trim() && (
                  <div className="absolute left-0 right-0 top-[4.2rem] z-30 overflow-hidden rounded-2xl border border-[#b59a5b]/12 bg-[#0d2b23] shadow-[0_22px_54px_-30px_rgba(0,0,0,.8)]">
                    {searchResults.length > 0 ? (
                      searchResults.map((museum) => (
                        <button
                          key={museum.id}
                          type="button"
                          onClick={() => navigate(`/museums/${museum.slug}`)}
                          className="flex w-full items-center gap-3 border-b border-[#b59a5b]/8 px-4 py-3 text-left last:border-b-0 hover:bg-[#12382d]"
                        >
                          <ImageWithFallback
                            src={museum.heroImage}
                            alt={museum.name}
                            className="h-12 w-12 shrink-0 rounded-xl object-cover"
                          />
                          <div className="min-w-0">
                            <p className="line-clamp-1 text-sm font-bold text-[#f0ebe3]">{museum.name}</p>
                            <p className="line-clamp-1 text-xs text-[#a09a90]">{museum.location}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-sm text-[#a09a90]">
                        Museum tidak ditemukan.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {quickAccess.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => navigate(item.to)}
                      className="group rounded-2xl border border-[#b59a5b]/10 bg-gradient-to-br from-[#1a4d3e] to-[#12382d] px-2 py-3 text-center transition hover:-translate-y-0.5 hover:border-[#b59a5b]/30"
                    >
                      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#b59a5b]/10 text-[#b59a5b] transition group-hover:bg-[#b59a5b] group-hover:text-[#0a1f1a]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="mt-2 block text-[11px] font-semibold text-[#f0ebe3] md:text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-7xl px-5 md:mt-24 md:px-8 lg:px-10">
          <SectionHeader
            eyebrow="Curated Destination"
            title="Museum Pilihan"
            subtitle="Kurasi destinasi budaya terbaik di Surabaya."
            onAction={() => navigate('/museums')}
          />

          <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-3 no-scrollbar md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-4">
            {featuredMuseums.map((museum) => (
              <button
                key={museum.id}
                type="button"
                onClick={() => navigate(`/museums/${museum.slug}`)}
                className="group relative h-[20rem] w-[15rem] shrink-0 overflow-hidden rounded-[1.6rem] border border-[#b59a5b]/12 text-left shadow-[0_34px_80px_-44px_rgba(0,0,0,.98)] transition hover:-translate-y-1 hover:border-[#b59a5b]/30 md:h-[22rem] md:w-auto"
              >
                <ImageWithFallback
                  src={museum.heroImage}
                  alt={museum.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040d0a] via-[#06140f]/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#040d0a] to-transparent" />

                <span className="absolute right-3 top-3 rounded-full bg-[#b59a5b] px-3 py-1 text-[11px] font-bold text-[#0a1f1a] shadow-[0_10px_24px_-12px_rgba(0,0,0,.8)]">
                  {formatRupiah(museum.tickets[0]?.price ?? 0)}
                </span>

                <h3
                  className="absolute inset-x-4 bottom-4 text-[1.3rem] font-extrabold leading-tight tracking-[-0.045em] text-white"
                  style={{ ...artsy, ...textShadow }}
                >
                  {museum.name}
                </h3>
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-7xl px-5 md:mt-24 md:px-8 lg:px-10">
          <SectionHeader
            eyebrow="Guided Experience"
            title="Pemandu Wisata Pilihan"
            subtitle="Temani kunjunganmu dengan pemandu berpengalaman."
            onAction={() => navigate('/tour-guides')}
          />

          <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-3 no-scrollbar md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
            {featuredGuides.map((guide) => (
              <button
                key={guide.id}
                type="button"
                onClick={() => navigate(`/tour-guides/${guide.id}`)}
                className="group relative h-[22rem] w-[15rem] shrink-0 overflow-hidden rounded-[1.6rem] border border-[#b59a5b]/12 text-left shadow-[0_34px_80px_-44px_rgba(0,0,0,.98)] transition hover:-translate-y-1 hover:border-[#b59a5b]/30 md:w-auto"
              >
                <ImageWithFallback
                  src={guide.photo}
                  alt={guide.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040d0a] via-[#06140f]/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#040d0a] to-transparent" />

                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-[#b59a5b]/25 bg-[#0a1f1a]/65 px-2.5 py-1 text-xs font-bold text-[#b59a5b] backdrop-blur">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {guide.rating}
                </span>

                <div className="absolute inset-x-4 bottom-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#e7cf90]" style={{ ...mono, ...textShadow }}>
                    Rp {guide.pricePerHour.toLocaleString('id-ID')}/jam
                  </p>
                  <h3 className="mt-1 text-[1.25rem] font-extrabold leading-tight tracking-[-0.045em] text-white" style={{ ...artsy, ...textShadow }}>
                    {guide.name}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-7xl px-5 md:mt-24 md:px-8 lg:px-10">
          <SectionHeader
            eyebrow="Museum Store"
            title="Merchandise Museum"
            subtitle="Bawa pulang cerita dari setiap kunjungan."
            onAction={() => navigate('/merchandise')}
          />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {featuredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => navigate('/merchandise')}
                className="group relative h-[14rem] overflow-hidden rounded-[1.4rem] border border-[#b59a5b]/12 text-left shadow-[0_26px_64px_-42px_rgba(0,0,0,.95)] transition hover:-translate-y-1 hover:border-[#b59a5b]/30 md:h-[16rem]"
              >
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040d0a] via-[#06140f]/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#040d0a] to-transparent" />

                <div className="absolute inset-x-3 bottom-3">
                  <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white" style={textShadow}>
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm font-extrabold text-[#e7cf90]" style={textShadow}>
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-7xl px-5 pb-16 md:mt-24 md:px-8 md:pb-24 lg:px-10">
          <SectionHeader
            eyebrow="Why Memora"
            title="Kenapa Memora?"
            subtitle="Pengalaman museum yang terasa lebih praktis, rapi, dan premium."
            align="center"
          />

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="rounded-[1.35rem] border border-[#b59a5b]/10 bg-gradient-to-br from-[#1a4d3e] to-[#12382d] p-4 text-center md:p-6">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#b59a5b]/10 text-[#b59a5b]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-[#f0ebe3] md:text-base">{benefit.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#a09a90] md:text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="hidden border-t border-[#b59a5b]/10 bg-[#0a1f1a]/50 py-10 md:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-8 text-sm text-[#a09a90] lg:px-10">
            <div>
              <BrandLogo size="sm" />
              <p className="mt-2">Jelajahi warisan, temukan cerita.</p>
            </div>
            <p>© {new Date().getFullYear()} Memora. Built for Surabaya cultural heritage.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};
