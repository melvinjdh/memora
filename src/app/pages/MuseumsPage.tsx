import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, MapPin, Clock, ArrowRight, X } from 'lucide-react';
// Hapus baris ini: import { museums } from '../data/mockData';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { SectionHeader } from '../components/SectionHeader';
import { supabase } from '../../lib/supabase/supabase'; // Alat pemanggil database

export const MuseumsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // WADAH DATA BARU
  const [museums, setMuseums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // PROSES PENGAMBILAN DATA DARI SUPABASE
  useEffect(() => {
    const fetchMuseums = async () => {
      try {
        const { data, error } = await supabase
          .from('museums')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;

        if (data) {
          // Menerjemahkan data Supabase agar cocok dengan desain UI asli Anda
          const formattedData = data.map((m: any) => ({
            ...m,
            heroImage: m.hero_image,
            isOpen: m.is_open,
            // Memastikan data array aman agar kode UI Anda tidak error (undefined)
            operatingHours: m.operating_hours?.length ? m.operating_hours : [{ hours: '-' }],
            tickets: m.tickets?.length ? m.tickets : [{ price: 0 }]
          }));
          setMuseums(formattedData);
        }
      } catch (err) {
        console.error('Gagal mengambil data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMuseums();
  }, []);

  const filteredMuseums = museums.filter(museum =>
    museum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (museum.description && museum.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatPrice = (price: number) =>
    price === 0 ? 'Gratis' : `Mulai Rp ${price.toLocaleString('id-ID')}`;

  // Tampilan tunggu simpel sebelum layar merender desain asli Anda
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1f1a] text-[#b59a5b]">
        <p style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }} className="text-sm tracking-widest">
          MEMUAT DATA...
        </p>
      </div>
    );
  }

  // ==== KODE DI BAWAH INI ADALAH DESAIN ASLI ANDA TANPA ADA UBAHAN SEDIKIT PUN ====
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(181,154,91,0.13),transparent_24rem),linear-gradient(180deg,#0d2b23_0%,#0a1f1a_44%,#071814_100%)] text-[#f0ebe3]">
      <div className="mx-auto max-w-7xl px-5 pt-8 md:px-8 md:pt-12 lg:px-10">
        {/* Page intro */}
        <SectionHeader
          eyebrow="Explore"
          title="Jelajahi Museum"
          subtitle="Temukan belasan museum yang merepresentasikan warisan budaya Surabaya."
        />

        {/* Search */}
        <div className="relative max-w-xl">
          <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#b59a5b]/10 bg-[#0a1f1a]/52 px-4 text-sm text-[#a09a90] transition focus-within:border-[#b59a5b]/45 focus-within:text-[#f0ebe3]">
            <Search className="h-5 w-5 shrink-0 text-[#b59a5b]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari museum..."
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
        </div>

        {/* Count */}
        <p
          className="mt-5 text-[11px] font-medium uppercase tracking-[0.22em] text-[#b59a5b]/70"
          style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}
        >
          {filteredMuseums.length} Museum
        </p>

        {/* Grid */}
        <div className="mt-5 grid grid-cols-1 gap-5 pb-6 md:mt-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {filteredMuseums.map((museum) => {
            const isClosed = museum.isOpen === false;
            const goDetail = () => {
              if (!isClosed) navigate(`/museums/${museum.slug}`);
            };

            return (
              <article
                key={museum.id}
                className={`group overflow-hidden rounded-[1.5rem] border border-[#b59a5b]/10 bg-gradient-to-br from-[#1a4d3e] to-[#12382d] shadow-[0_22px_54px_-40px_rgba(0,0,0,.8)] transition ${
                  isClosed ? 'opacity-70' : 'hover:-translate-y-0.5 hover:border-[#b59a5b]/25'
                }`}
              >
                <button
                  type="button"
                  onClick={goDetail}
                  disabled={isClosed}
                  className="block w-full text-left disabled:cursor-not-allowed"
                >
                  {/* Media */}
                  <div className="relative h-52 overflow-hidden md:h-56">
                    <ImageWithFallback
                      src={museum.heroImage}
                      alt={museum.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f1a]/85 via-[#0a1f1a]/10 to-transparent" />
                    <span
                      className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold ${
                        isClosed
                          ? 'bg-[#ef4444] text-white'
                          : 'bg-[#b59a5b] text-[#0a1f1a]'
                      }`}
                    >
                      {isClosed ? 'Tutup Sementara' : formatPrice(museum.tickets[0].price)}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <h3
                      className="line-clamp-1 text-[1.15rem] font-bold tracking-[-0.035em] text-[#f0ebe3]"
                      style={{ fontFamily: "'ArtsyHeading', serif" }}
                    >
                      {museum.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-[#a09a90]">
                      {museum.description}
                    </p>

                    <div className="mt-4 space-y-2 text-xs text-[#a09a90]">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b59a5b]" />
                        <span className="line-clamp-1">{museum.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-[#b59a5b]" />
                        <span>{museum.operatingHours[0].hours}</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* CTA */}
                <div className="px-5 pb-5">
                  <button
                    type="button"
                    onClick={goDetail}
                    disabled={isClosed}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                      isClosed
                        ? 'cursor-not-allowed border border-[#b59a5b]/10 bg-[#f0ebe3]/[0.03] text-[#a09a90]'
                        : 'border border-[#b59a5b]/25 bg-[#f0ebe3]/5 text-[#f0ebe3] hover:bg-[#b59a5b]/10 hover:text-[#b59a5b]'
                    }`}
                  >
                    {isClosed ? 'Tidak Tersedia' : 'Lihat Detail'}
                    {!isClosed && <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredMuseums.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-[#b59a5b]/10 bg-[#12382d]/50 px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#b59a5b]/10 text-[#b59a5b]">
              <Search className="h-6 w-6" />
            </span>
            <h3
              className="mt-5 text-xl font-bold tracking-[-0.035em] text-[#f0ebe3]"
              style={{ fontFamily: "'ArtsyHeading', serif" }}
            >
              Museum tidak ditemukan
            </h3>
            <p className="mt-2 max-w-sm text-sm text-[#a09a90]">
              Coba kata kunci lain atau jelajahi seluruh koleksi museum yang tersedia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};