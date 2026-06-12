import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Star, ArrowRight, Languages } from 'lucide-react';
// Menggunakan import * agar semua fungsi export terbaca sebagai objek dataService
import * as dataService from '../services/dataService'; 
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { SectionHeader } from '../components/SectionHeader';

const artsy = { fontFamily: "'ArtsyHeading', serif" } as const;
const mono = { fontFamily: "'DM Mono', ui-monospace, monospace" } as const;
const textShadow = { textShadow: '0 2px 16px rgba(0,0,0,0.85)' } as const;

export const TourGuidesPage: React.FC = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dataService.getTourGuides();
        setGuides(data);
      } catch (error) {
        console.error("Gagal memuat data guide:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const openDetail = (guideId: string) => navigate(`/tour-guides/${guideId}`);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1f1a] flex items-center justify-center text-[#f0ebe3]">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(181,154,91,0.13),transparent_24rem),linear-gradient(180deg,#0d2b23_0%,#0a1f1a_44%,#071814_100%)] text-[#f0ebe3]">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-8 md:px-8 md:pt-12 lg:px-10">
        <SectionHeader
          eyebrow="Guided Experience"
          title="Pemandu Wisata"
        />

        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 no-scrollbar md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-3">
          {guides.map((guide) => (
            <article
              key={guide.id}
              className="relative h-[27rem] w-[85%] shrink-0 snap-center overflow-hidden rounded-[1.85rem] border border-[#b59a5b]/12 shadow-[0_34px_80px_-44px_rgba(0,0,0,.95)] md:h-[30rem] md:w-auto"
            >
              <button type="button" onClick={() => openDetail(guide.id)} className="absolute inset-0 h-full w-full text-left">
                <ImageWithFallback src={guide.photo} alt={guide.name} className="h-full w-full object-cover" />
                {/* Scrim berlapis — base lembut + bawah kuat agar teks terbaca */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#06140f] via-[#0a1f1a]/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#040d0a] via-[#06140f]/80 to-transparent" />
              </button>

              <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-1 rounded-full border border-[#b59a5b]/25 bg-[#0a1f1a]/65 px-3 py-1.5 text-sm font-bold text-[#b59a5b] backdrop-blur-md">
                <Star className="h-3.5 w-3.5 fill-current" />
                {guide.rating}
                <span className="font-medium text-[#c8c2b8]">({guide.reviews})</span>
              </div>

              <div className="pointer-events-none absolute inset-x-4 bottom-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#c9ad6e]" style={{ ...mono, ...textShadow }}>
                  {guide.gender} • {guide.age} thn
                </p>
                <h3 className="mt-1.5 text-[1.9rem] font-extrabold leading-none tracking-[-0.05em] text-white" style={{ ...artsy, ...textShadow }}>
                  {guide.name}
                </h3>

                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#f0ebe3]" style={textShadow}>
                  <Languages className="h-3.5 w-3.5 shrink-0 text-[#c9ad6e]" />
                  <span className="line-clamp-1">{guide.languages.join(' • ')}</span>
                </div>

                <p className="mt-1 text-sm font-bold text-[#e7cf90]" style={textShadow}>
                  {/* Proteksi (guide.pricePerHour ?? 0) agar tidak crash jika data null */}
                  Rp {(guide.pricePerHour ?? 0).toLocaleString('id-ID')}
                  <span className="text-xs font-medium text-[#e7cf90]/80">/jam</span>
                </p>

                <button
                  type="button"
                  onClick={() => openDetail(guide.id)}
                  className="pointer-events-auto mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-[#b59a5b]/25 bg-[#040d0a]/70 px-4 py-3 backdrop-blur-md transition active:scale-[0.98]"
                >
                  <span className="text-sm font-bold text-[#f0ebe3]">Lihat Selengkapnya</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b59a5b] text-[#0a1f1a]">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};