import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Award, Calendar as CalendarIcon, Languages, Star, Quote, Landmark, MessageSquareQuote } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
// Hapus baris ini: import { tourGuides } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Calendar } from '../components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { supabase } from '../../lib/supabase/supabase'; // Alat pemanggil database

const artsy = { fontFamily: "'ArtsyHeading', serif" } as const;
const mono = { fontFamily: "'DM Mono', ui-monospace, monospace" } as const;
const textShadow = { textShadow: '0 2px 18px rgba(0,0,0,0.9)' } as const;
const surface =
  'rounded-[1.5rem] border border-[#b59a5b]/12 bg-gradient-to-br from-[#1a4d3e] to-[#12382d] shadow-[0_26px_60px_-42px_rgba(0,0,0,.85)]';

export const TourGuideDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useApp();

  // WADAH DATA DINAMIS
  const [guide, setGuide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [bookingDate, setBookingDate] = useState<Date>();
  const [selectedMuseum, setSelectedMuseum] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);

  // Entrance: slide-up dari bawah saat halaman dibuka
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // PENGAMBILAN DATA DARI SUPABASE
  useEffect(() => {
    const fetchGuideDetail = async () => {
      try {
        const { data, error } = await supabase
          .from('tour_guides')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          // Logika pembungkus teks untuk sumber gambar
          let creditData = data.image_credit;
          if (typeof creditData === 'string') {
            try {
              creditData = JSON.parse(creditData);
            } catch {
              creditData = { source: creditData };
            }
          }

          // Menerjemahkan nama kolom snake_case ke camelCase untuk UI
          setGuide({
            ...data,
            photo: data.photo,
            imageCredit: creditData,
            pricePerHour: data.price_per_hour || 0,
            reviewList: data.review_list || [],
            mainMuseums: data.main_museums || [],
            specialties: data.specialties || [],
            languages: data.languages || [],
          });
        }
      } catch (err) {
        console.error('Gagal mengambil data rincian pemandu:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchGuideDetail();
    }
  }, [id]);

  // Layar tunggu
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
  if (!guide) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1f1a] px-6 text-center text-[#f0ebe3]">
        <div>
          <h2 className="text-2xl font-bold tracking-[-0.035em]" style={artsy}>Pemandu tidak ditemukan</h2>
          <button
            type="button"
            onClick={() => navigate('/tour-guides')}
            className="mt-5 rounded-full bg-[#b59a5b] px-6 py-3 text-sm font-bold text-[#0a1f1a] transition hover:bg-[#c9ad6e]"
          >
            Kembali ke daftar pemandu
          </button>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    if (!bookingDate || !selectedMuseum || selectedSlots.length === 0) {
      toast.error('Pilih tanggal, jam, dan durasi terlebih dahulu');
      return;
    }

    const totalPrice = guide.pricePerHour * selectedSlots.length;

    addToCart({
      id: `guide-${guide.id}-${bookingDate.getTime()}`,
      type: 'guide',
      name: `Pemandu Wisata: ${guide.name}`,
      price: totalPrice,
      quantity: 1,
      details: {
        guideId: guide.id,
        guideName: guide.name,
        date: bookingDate.toISOString(),
        museum: selectedMuseum,
        slots: selectedSlots,
        duration: selectedSlots.length,
        pricePerHour: guide.pricePerHour,
      },
    });

    toast.success('Pemesanan pemandu berhasil ditambahkan ke keranjang');
  };

  const availableSlots = ['09:00', '10:30', '13:00', '14:30', '16:00'];

  return (
    <div
      className={`min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(181,154,91,0.12),transparent_24rem),linear-gradient(180deg,#0d2b23_0%,#0a1f1a_46%,#071814_100%)] text-[#f0ebe3] transition-all duration-500 ease-out ${
        entered ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
    >
      {/* ===== Hero foto ===== */}
      <div className="relative">
        {/* glow di belakang foto */}
        <div className="pointer-events-none absolute inset-x-6 top-6 h-40 rounded-full bg-[#b59a5b]/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pt-4 md:px-8 md:pt-6 lg:px-10">
          <div className="relative h-[26rem] overflow-hidden rounded-[2rem] border border-[#b59a5b]/15 shadow-[0_44px_100px_-50px_rgba(0,0,0,1)] md:h-[34rem]">
            <ImageWithFallback src={guide.photo} alt={guide.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#040d0a] via-[#0a1f1a]/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#040d0a] via-[#06140f]/75 to-transparent" />

            {/* Source foto */}
            <div
              className="absolute left-3 top-3 z-10 rounded-full border border-white/10 bg-[#040d0a]/35 px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.16em] text-[#f0ebe3]/60 backdrop-blur-md"
              style={mono}
            >
              source: {guide.imageCredit?.source || 'unsplash'}
            </div>

            {/* Rating */}
            <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-[#b59a5b]/25 bg-[#040d0a]/55 px-3 py-1.5 text-sm font-bold text-[#b59a5b] backdrop-blur-md">
              <Star className="h-3.5 w-3.5 fill-current" />
              {guide.rating}
              <span className="font-medium text-[#c8c2b8]">({guide.reviews})</span>
            </div>

            {/* Nama overlay */}
            <div className="absolute inset-x-5 bottom-5 md:inset-x-7 md:bottom-7">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#c9ad6e]" style={{ ...mono, ...textShadow }}>
                {guide.gender} • {guide.age} tahun
              </p>
              <h1 className="mt-1.5 text-[2.3rem] font-extrabold leading-[0.98] tracking-[-0.05em] text-white md:text-[3.2rem]" style={{ ...artsy, ...textShadow }}>
                {guide.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Body ===== */}
      <div className="mx-auto max-w-7xl px-5 py-7 md:px-8 md:py-10 lg:px-10">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
          {/* Booking card */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
            <section className={`${surface} p-6`}>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#b59a5b]/75" style={mono}>Tarif</p>
              <p className="mt-1 text-[2rem] font-extrabold leading-none text-[#c9ad6e]">
                Rp {guide.pricePerHour.toLocaleString('id-ID')}
                <span className="text-sm font-medium text-[#a09a90]">/jam</span>
              </p>

              <Dialog>
                <DialogTrigger asChild>
                  <button type="button" className="mt-5 w-full rounded-2xl bg-[#b59a5b] px-4 py-3.5 text-sm font-bold text-[#0a1f1a] shadow-[0_18px_42px_-24px_rgba(181,154,91,.95)] transition hover:bg-[#c9ad6e]">
                    Pesan Pemandu
                  </button>
                </DialogTrigger>
                <DialogContent className="max-h-[85vh] overflow-y-auto border-[#b59a5b]/15 bg-[#0d2b23] text-[#f0ebe3]">
                  <DialogHeader>
                    <DialogTitle style={artsy} className="text-xl tracking-[-0.035em]">Pesan {guide.name}</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 pt-2">
                    <div className="relative">
                      <Label className="text-[#c8c2b8]">Tanggal Tur</Label>
                      <button
                        type="button"
                        onClick={() => setShowCalendar((prev) => !prev)}
                        className="mt-2 flex w-full items-center gap-2 rounded-xl border border-[#b59a5b]/20 bg-[#0a1f1a]/40 px-4 py-3 text-left text-sm text-[#f0ebe3] transition hover:border-[#b59a5b]/40"
                      >
                        <CalendarIcon className="h-4 w-4 text-[#b59a5b]" />
                        {bookingDate ? format(bookingDate, 'PPP') : 'Pilih tanggal'}
                      </button>

                      {showCalendar && (
                        <div className="absolute z-50 mt-2 rounded-2xl border border-[#b59a5b]/15 bg-[#0d2b23] p-2 shadow-[0_22px_54px_-30px_rgba(0,0,0,.8)]">
                          <Calendar
                            mode="single"
                            selected={bookingDate}
                            onSelect={(date) => {
                              if (!date) return;
                              setBookingDate(date);
                              setShowCalendar(false);
                            }}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today;
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-[#c8c2b8]">Museum Tujuan</Label>
                      <Select
                        value={selectedMuseum}
                        onValueChange={(value) => {
                          setSelectedMuseum(value);
                          setSelectedSlots([]);
                        }}
                      >
                        <SelectTrigger className="mt-2 rounded-xl border-[#b59a5b]/20 bg-[#0a1f1a]/40">
                          <SelectValue placeholder="Pilih Museum" />
                        </SelectTrigger>
                        <SelectContent>
                          {guide.mainMuseums.map((museum: string) => (
                            <SelectItem key={museum} value={museum}>{museum}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {bookingDate && selectedMuseum && (
                      <div>
                        <Label className="text-[#c8c2b8]">Jam Tersedia</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {availableSlots.map((slot) => {
                            const active = selectedSlots.includes(slot);
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => {
                                  setSelectedSlots((prev) =>
                                    prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot].sort()
                                  );
                                }}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                  active ? 'bg-[#b59a5b] text-[#0a1f1a]' : 'border border-[#b59a5b]/25 text-[#c8c2b8] hover:bg-[#b59a5b]/10'
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {bookingDate && selectedMuseum && selectedSlots.length > 0 && (
                      <div className="space-y-2 border-t border-[#b59a5b]/12 pt-4 text-sm">
                        <div className="flex justify-between"><span className="text-[#a09a90]">Museum</span><span>{selectedMuseum}</span></div>
                        <div className="flex justify-between"><span className="text-[#a09a90]">Tanggal</span><span>{format(bookingDate, 'dd/MM/yyyy')}</span></div>
                        <div className="flex justify-between"><span className="text-[#a09a90]">Jam Dipilih</span><span className="text-right">{selectedSlots.join(', ')}</span></div>
                        <div className="flex justify-between"><span className="text-[#a09a90]">Jumlah Slot</span><span>{selectedSlots.length} Jam</span></div>
                        <div className="flex justify-between"><span className="text-[#a09a90]">Tarif/Jam</span><span>Rp {guide.pricePerHour.toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between pt-1 text-base font-bold"><span>Total</span><span className="text-[#c9ad6e]">Rp {(guide.pricePerHour * selectedSlots.length).toLocaleString('id-ID')}</span></div>
                      </div>
                    )}

                    <button type="button" onClick={handleBooking} className="w-full rounded-xl bg-[#b59a5b] px-4 py-3 text-sm font-bold text-[#0a1f1a] transition hover:bg-[#c9ad6e]">
                      Tambahkan ke Keranjang
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            </section>
          </div>

          {/* Detail */}
          <div className="space-y-6 lg:col-span-2">
            {/* Profil + quote */}
            <section className={`${surface} p-6 md:p-7`}>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#b59a5b]/75" style={mono}>Profil</p>
              <h2 className="mt-1.5 text-[1.5rem] font-bold tracking-[-0.035em] text-[#f0ebe3]" style={artsy}>Tentang Pemandu</h2>
              <p className="mt-4 text-sm leading-[1.85] text-[#c8c2b8]">{guide.description}</p>

              <div className="relative mt-5 overflow-hidden rounded-2xl border border-[#b59a5b]/15 bg-[#0a1f1a]/45 p-5">
                <Quote className="absolute -right-1 -top-1 h-16 w-16 text-[#b59a5b]/10" />
                <p className="relative text-[15px] italic leading-relaxed text-[#e7e0d4]">"{guide.quote}"</p>
              </div>
            </section>

            {/* Bahasa & Spesialisasi */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <section className={`${surface} p-6`}>
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b59a5b]/12 text-[#b59a5b]"><Languages className="h-4 w-4" /></span>
                  <h3 className="text-base font-bold text-[#f0ebe3]">Bahasa</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {guide.languages.map((lang: string) => (
                    <span key={lang} className="rounded-full border border-[#b59a5b]/25 bg-[#0a1f1a]/40 px-3.5 py-1.5 text-[13px] font-medium text-[#e7e0d4]">{lang}</span>
                  ))}
                </div>
              </section>

              <section className={`${surface} p-6`}>
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b59a5b]/12 text-[#b59a5b]"><Award className="h-4 w-4" /></span>
                  <h3 className="text-base font-bold text-[#f0ebe3]">Spesialisasi</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {guide.specialties.map((item: string) => (
                    <span key={item} className="rounded-full bg-gradient-to-r from-[#b59a5b] to-[#c9ad6e] px-3.5 py-1.5 text-[13px] font-bold text-[#0a1f1a]">{item}</span>
                  ))}
                </div>
              </section>
            </div>

            {/* Museum Utama */}
            <section className={`${surface} p-6`}>
              <h3 className="mb-4 text-base font-bold text-[#f0ebe3]">Museum Utama</h3>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {guide.mainMuseums.map((museum: string) => (
                  <div key={museum} className="flex items-center gap-3 rounded-2xl border border-[#b59a5b]/10 bg-[#0a1f1a]/40 px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#b59a5b]/12 text-[#b59a5b]"><Landmark className="h-4 w-4" /></span>
                    <span className="text-sm font-medium text-[#e7e0d4]">{museum}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Review */}
            <section className={`${surface} p-6`}>
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b59a5b]/12 text-[#b59a5b]"><MessageSquareQuote className="h-4 w-4" /></span>
                <h3 className="text-base font-bold text-[#f0ebe3]">Review Pengunjung</h3>
              </div>
              <div className="space-y-3">
                {guide.reviewList.map((review: any, index: number) => (
                  <div key={index} className="rounded-2xl border border-[#b59a5b]/10 bg-[#0a1f1a]/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#b59a5b] to-[#8a7440] text-sm font-bold text-[#0a1f1a]">
                          {review.userName ? review.userName.charAt(0) : '?'}
                        </span>
                        <div>
                          <p className="font-bold text-[#f0ebe3]">{review.userName}</p>
                          <div className="mt-0.5 flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, starIndex) => (
                              <Star key={starIndex} className={`h-3.5 w-3.5 ${starIndex < review.rating ? 'fill-[#b59a5b] text-[#b59a5b]' : 'text-[#3a5048]'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="shrink-0 text-xs text-[#a09a90]" style={mono}>{new Date(review.date).toLocaleDateString('id-ID')}</p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[#c8c2b8]">{review.comment}</p>
                  </div>
                ))}
                
                {/* Fallback jika belum ada review */}
                {(!guide.reviewList || guide.reviewList.length === 0) && (
                  <div className="text-center py-6 text-[#a09a90] text-sm">
                    Belum ada ulasan untuk pemandu ini.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};