import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  MapPin, Clock, Ticket, Bus, Car, Train, UtensilsCrossed,
  Wifi, Coffee, ParkingCircle, Accessibility, ChevronRight, Plus, Minus,
  ArrowLeft, CalendarDays, ExternalLink, AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { Calendar } from '../components/ui/calendar';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase/supabase';

const artsy = { fontFamily: "'ArtsyHeading', serif" } as const;
const mono = { fontFamily: "'DM Mono', ui-monospace, monospace" } as const;
const surface =
  'rounded-[1.5rem] border border-[#b59a5b]/10 bg-gradient-to-br from-[#1a4d3e] to-[#12382d] shadow-[0_22px_54px_-40px_rgba(0,0,0,.8)]';

type TabKey = 'facilities' | 'transport' | 'nearby';

export const MuseumDetailPage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useApp();

  const [museum, setMuseum] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [visitDate, setVisitDate] = useState<Date>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('facilities');

  useEffect(() => {
    const fetchMuseumDetail = async () => {
      try {
        const { data, error } = await supabase
          .from('museums')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;

        if (data) {
          // Logika pembungkus ulang untuk data sumber gambar
          let creditData = data.image_credit;
          if (typeof creditData === 'string') {
            try {
              creditData = JSON.parse(creditData);
            } catch (e) {
              creditData = { source: creditData };
            }
          }

          setMuseum({
            ...data,
            heroImage: data.hero_image,
            imageCredit: creditData,
            mapEmbedUrl: data.map_embed_url,
            isOpen: data.is_open,
            operatingHours: data.operating_hours?.length ? data.operating_hours : [],
            nearbyDining: data.nearby_dining?.length ? data.nearby_dining : [],
            nearbyFacilities: data.nearby_facilities?.length ? data.nearby_facilities : [],
            tickets: data.tickets?.length ? data.tickets : [],
            facilities: data.facilities?.length ? data.facilities : [],
            transportation: data.transportation || { publicTransport: [] }
          });
        }
      } catch (err) {
        console.error('Gagal mengambil rincian museum:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchMuseumDetail();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1f1a] text-[#b59a5b]">
        <p style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }} className="text-sm tracking-widest">
          MEMUAT DATA...
        </p>
      </div>
    );
  }

  if (!museum) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1f1a] px-6 text-center text-[#f0ebe3]">
        <div>
          <h2 className="text-2xl font-bold tracking-[-0.035em]" style={artsy}>Museum tidak ditemukan</h2>
          <button
            type="button"
            onClick={() => navigate('/museums')}
            className="mt-5 rounded-full bg-[#b59a5b] px-6 py-3 text-sm font-bold text-[#0a1f1a] transition hover:bg-[#c9ad6e]"
          >
            Kembali ke Museum
          </button>
        </div>
      </div>
    );
  }

  const isClosed = museum.isOpen === false;

  // HELPER: Cek apakah hari cocok dengan string hari operasional
  const isDayMatch = useCallback((dayStr: string, date: Date): boolean => {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = dayNames[date.getDay()];
    const lower = dayStr.toLowerCase();

    if (lower.includes(dayName.toLowerCase())) return true;

    const rangeMatch = dayStr.match(/(\w+)\s*[-\u2013]\s*(\w+)/);
    if (rangeMatch) {
      const startIdx = dayNames.findIndex(d => d.toLowerCase() === rangeMatch[1].toLowerCase());
      const endIdx = dayNames.findIndex(d => d.toLowerCase() === rangeMatch[2].toLowerCase());
      const currentIdx = date.getDay();
      if (startIdx !== -1 && endIdx !== -1) {
        if (startIdx <= endIdx) return currentIdx >= startIdx && currentIdx <= endIdx;
        else return currentIdx >= startIdx || currentIdx <= endIdx;
      }
    }

    if (lower.includes('setiap hari')) return true;
    return false;
  }, []);

  // Cek apakah museum tutup pada tanggal tertentu berdasarkan operatingHours
  const isMuseumClosedOnDate = useCallback((date: Date): boolean => {
    if (isClosed) return true;
    if (!museum.operatingHours || museum.operatingHours.length === 0) return false;

    for (const schedule of museum.operatingHours) {
      if (isDayMatch(schedule.day, date)) {
        if (schedule.hours.toLowerCase().includes('tutup')) return true;
        return false; // Ada jadwal buka
      }
    }
    // Tidak ada jadwal yang cocok = tutup
    return true;
  }, [isClosed, museum.operatingHours, isDayMatch]);

  // Cek apakah tanggal yang dipilih jatuh di hari tutup
  const isSelectedDateClosed = visitDate ? isMuseumClosedOnDate(visitDate) : false;

  const mapEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(museum.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const mapsSearch = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

  const facilityIcons: Record<string, any> = {
    'Free WiFi': Wifi,
    'Café': Coffee,
    'Cafeteria': Coffee,
    'Parking': ParkingCircle,
    'Wheelchair Access': Accessibility,
  };

  const updateTicketQuantity = (ticketId: string, delta: number) => {
    setSelectedTickets(prev => {
      const current = prev[ticketId] || 0;
      const newValue = Math.max(0, current + delta);
      if (newValue === 0) {
        const { [ticketId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [ticketId]: newValue };
    });
  };

  const handleAddToCart = () => {
    if (!visitDate) {
      toast.error('Pilih tanggal kunjungan dulu ya');
      return;
    }
    if (isSelectedDateClosed) {
      toast.error('Museum tutup pada tanggal yang dipilih. Silakan pilih tanggal lain.');
      return;
    }

    const ticketItems = Object.entries(selectedTickets).map(([ticketId, quantity]) => {
      const ticket = museum.tickets.find((t: any) => t.id === ticketId)!;
      return {
        id: `${museum.id}-${ticketId}-${visitDate.getTime()}`,
        type: 'ticket' as const,
        name: `${museum.name} - ${ticket.type}`,
        price: ticket.price,
        quantity,
        details: {
          museumId: museum.id,
          museumName: museum.name,
          ticketType: ticket.type,
          visitDate: visitDate.toISOString(),
        }
      };
    });

    ticketItems.forEach(item => addToCart(item));
    toast.success(`${ticketItems.reduce((sum, item) => sum + item.quantity, 0)} tiket ditambahkan ke keranjang`);
    setSelectedTickets({});
  };

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(selectedTickets).reduce((sum, [ticketId, qty]) => {
    const ticket = museum.tickets.find((t: any) => t.id === ticketId);
    return sum + (ticket?.price || 0) * qty;
  }, 0);

  const showPurchaseBar = totalTickets > 0 && !isClosed && !isSelectedDateClosed;

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'facilities', label: 'Fasilitas' },
    { key: 'transport', label: 'Transportasi' },
    { key: 'nearby', label: 'Sekitar' },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(181,154,91,0.1),transparent_24rem),linear-gradient(180deg,#0d2b23_0%,#0a1f1a_46%,#071814_100%)] text-[#f0ebe3]">
      {/* ===== Hero ===== */}
      <div className="relative h-[22rem] overflow-hidden md:h-[28rem]">
        <ImageWithFallback src={museum.heroImage} alt={museum.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f1a] via-[#0a1f1a]/55 to-[#0a1f1a]/15" />
  {/* SOURCE IMAGE */}
<div className="absolute top-5 right-5 z-20">
  <span className="rounded-full bg-black/20 px-3 py-1.5 text-[10px] text-white/70 backdrop-blur-sm">
    Source: {museum.imageCredit?.source}
  </span>
</div>

        <div className="absolute inset-x-0 bottom-0 px-5 pb-7 md:px-8">
          <div className="mx-auto max-w-7xl">
            {isClosed && (
              <span className="mb-3 inline-flex rounded-full bg-[#ef4444] px-3 py-1 text-[11px] font-bold text-white">
                Tutup Sementara
              </span>
            )}
            <h1
              className="max-w-2xl text-[2rem] font-extrabold leading-[1.05] tracking-[-0.05em] text-[#f0ebe3] md:text-[3rem]"
              style={artsy}
            >
              {museum.name}
            </h1>
            <div className="mt-3 flex items-center gap-2 text-sm text-[#c8c2b8]">
              <MapPin className="h-4 w-4 shrink-0 text-[#b59a5b]" />
              <span className="line-clamp-1">{museum.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Body ===== */}
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12 lg:px-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="space-y-6 lg:col-span-2">
            {/* About */}
            <section className={`${surface} p-6 md:p-7`}>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#b59a5b]/75" style={mono}>About</p>
              <h2 className="mt-2 text-[1.5rem] font-bold tracking-[-0.035em] text-[#f0ebe3]" style={artsy}>
                Tentang Museum
              </h2>
              <p className="mt-4 text-sm leading-[1.8] text-[#c8c2b8]">{museum.description}</p>
              <div className="my-5 h-px bg-[#b59a5b]/12" />
              <h3 className="text-base font-bold text-[#f0ebe3]">Sejarah</h3>
              <p className="mt-2 text-sm leading-[1.8] text-[#a09a90]">{museum.history}</p>
            </section>

            {/* Lokasi (peta) */}
            <section className={`${surface} overflow-hidden`}>
              <div className="flex items-center justify-between gap-3 p-6 pb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#b59a5b]" />
                  <h3 className="text-base font-bold text-[#f0ebe3]">Lokasi</h3>
                </div>
                <a
                  href={museum.mapEmbedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-bold text-[#c9ad6e] transition hover:text-[#b59a5b]"
                >
                  Buka di Maps
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="mx-6 h-56 overflow-hidden rounded-2xl border border-[#b59a5b]/12 md:h-64">
                <iframe
                  title={`Peta ${museum.name}`}
                  src={mapEmbedSrc}
                  className="h-full w-full"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="flex items-start gap-2 p-6 pt-4 text-sm text-[#c8c2b8]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#b59a5b]" />
                <span>{museum.location}</span>
              </div>
            </section>

            {/* Tabs */}
            <section className={`${surface} p-2`}>
              {/* Segmented control */}
              <div className="grid grid-cols-3 gap-1 rounded-[1.25rem] bg-[#0a1f1a]/45 p-1">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={`rounded-xl px-3 py-2.5 text-xs font-bold transition md:text-sm ${
                      activeTab === t.key
                        ? 'bg-[#b59a5b] text-[#0a1f1a] shadow-[0_10px_24px_-16px_rgba(181,154,91,.95)]'
                        : 'text-[#a09a90] hover:text-[#f0ebe3]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-4 md:p-5">
                {activeTab === 'facilities' && (
                  <div className="grid grid-cols-2 gap-3">
                    {museum.facilities.map((facility: string, index: number) => {
                      const Icon = facilityIcons[facility] || ChevronRight;
                      return (
                        <div key={index} className="flex items-center gap-2.5 rounded-xl border border-[#b59a5b]/10 bg-[#0a1f1a]/30 px-3 py-2.5">
                          <Icon className="h-4 w-4 shrink-0 text-[#b59a5b]" />
                          <span className="text-sm text-[#f0ebe3]">{facility}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'transport' && (
                  <div className="space-y-5">
                    {museum.transportation?.publicTransport && (
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <Bus className="h-5 w-5 text-[#b59a5b]" />
                          <h4 className="font-bold text-[#f0ebe3]">Transportasi Umum</h4>
                        </div>
                        <ul className="list-inside list-disc space-y-1 text-sm text-[#a09a90]">
                          {museum.transportation.publicTransport.map((route: string, index: number) => (
                            <li key={index}>{route}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="h-px bg-[#b59a5b]/12" />
                    {museum.transportation?.ridehailing && (
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <Train className="h-5 w-5 text-[#b59a5b]" />
                          <h4 className="font-bold text-[#f0ebe3]">Ride-Hailing</h4>
                        </div>
                        <p className="text-sm text-[#a09a90]">{museum.transportation.ridehailing}</p>
                      </div>
                    )}
                    <div className="h-px bg-[#b59a5b]/12" />
                    {museum.transportation?.privateVehicle && (
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <Car className="h-5 w-5 text-[#b59a5b]" />
                          <h4 className="font-bold text-[#f0ebe3]">Kendaraan Pribadi</h4>
                        </div>
                        <p className="text-sm text-[#a09a90]">{museum.transportation.privateVehicle}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'nearby' && (
                  <div className="space-y-5">
                    <p className="text-xs text-[#a09a90]">Ketuk tempat untuk membukanya langsung di Google Maps.</p>
                    
                    {museum.nearbyDining?.length > 0 && (
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <UtensilsCrossed className="h-5 w-5 text-[#b59a5b]" />
                          <h4 className="font-bold text-[#f0ebe3]">Kuliner Terdekat</h4>
                        </div>
                        <div className="space-y-2">
                          {museum.nearbyDining.map((place: any, index: number) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => window.open(mapsSearch(`${place.name} Surabaya`), '_blank', 'noopener')}
                              className="flex w-full items-center gap-3 rounded-2xl border border-[#b59a5b]/10 bg-[#0a1f1a]/35 px-3.5 py-3 text-left transition hover:border-[#b59a5b]/30 hover:bg-[#0a1f1a]/55 active:scale-[0.99]"
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#b59a5b]/12 text-[#b59a5b]">
                                <UtensilsCrossed className="h-4 w-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-1 font-semibold text-[#f0ebe3]">{place.name}</p>
                                <p className="text-xs text-[#a09a90]">{place.type}</p>
                              </div>
                              <span className="shrink-0 text-xs font-semibold text-[#c8c2b8]">{place.distance}</span>
                              <ChevronRight className="h-4 w-4 shrink-0 text-[#b59a5b]/60" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="h-px bg-[#b59a5b]/12" />
                    {museum.nearbyFacilities?.length > 0 && (
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-[#b59a5b]" />
                          <h4 className="font-bold text-[#f0ebe3]">Fasilitas Umum Terdekat</h4>
                        </div>
                        <div className="space-y-2">
                          {museum.nearbyFacilities.map((facility: any, index: number) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => window.open(mapsSearch(`${facility.name} Surabaya`), '_blank', 'noopener')}
                              className="flex w-full items-center gap-3 rounded-2xl border border-[#b59a5b]/10 bg-[#0a1f1a]/35 px-3.5 py-3 text-left transition hover:border-[#b59a5b]/30 hover:bg-[#0a1f1a]/55 active:scale-[0.99]"
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#b59a5b]/12 text-[#b59a5b]">
                                <MapPin className="h-4 w-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-1 font-semibold text-[#f0ebe3]">{facility.name}</p>
                                <p className="text-xs text-[#a09a90]">{facility.type}</p>
                              </div>
                              <span className="shrink-0 text-xs font-semibold text-[#c8c2b8]">{facility.distance}</span>
                              <ChevronRight className="h-4 w-4 shrink-0 text-[#b59a5b]/60" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Operating hours */}
            <section className={`${surface} p-6`}>
              <div className="mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#b59a5b]" />
                <h3 className="text-base font-bold text-[#f0ebe3]">Jam Operasional</h3>
              </div>
              <div className="space-y-2.5">
                {museum.operatingHours.map((schedule: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-[#a09a90]">{schedule.day}</span>
                    <span className="font-semibold text-[#f0ebe3]">{schedule.hours}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Tickets */}
            <section className={`${surface} p-6`}>
              <div className="mb-4 flex items-center gap-2">
                <Ticket className="h-5 w-5 text-[#b59a5b]" />
                <h3 className="text-base font-bold text-[#f0ebe3]">Beli Tiket</h3>
              </div>

              {isClosed && (
                <div className="mb-4 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 p-4">
                  <p className="font-bold text-[#fca5a5]">Museum Tutup Sementara</p>
                  <p className="mt-1 text-sm text-[#fca5a5]/80">
                    Museum sedang tidak menerima kunjungan dan pemesanan tiket untuk sementara waktu.
                  </p>
                </div>
              )}

              {/* Date picker */}
              <div className="relative">
                <label className="mb-2 block text-sm font-medium text-[#c8c2b8]">Tanggal Kunjungan</label>
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex w-full items-center justify-between gap-2 rounded-2xl border border-[#b59a5b]/20 bg-[#0a1f1a]/40 px-4 py-3.5 text-left text-sm text-[#f0ebe3] transition hover:border-[#b59a5b]/40"
                >
                  <span className={visitDate ? 'text-[#f0ebe3]' : 'text-[#a09a90]'}>
                    {visitDate ? format(visitDate, 'PPP') : 'Pilih tanggal kunjungan'}
                  </span>
                  <CalendarDays className="h-4 w-4 shrink-0 text-[#b59a5b]" />
                </button>

                {showCalendar && (
                  <div className="absolute z-50 mt-2 rounded-2xl border border-[#b59a5b]/15 bg-[#0d2b23] p-2 shadow-[0_22px_54px_-30px_rgba(0,0,0,.8)]">
                    <Calendar
                      mode="single"
                      selected={visitDate}
                      onSelect={(date) => {
                        setVisitDate(date);
                        setShowCalendar(false);
                      }}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (date < today) return true;
                        return isMuseumClosedOnDate(date);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Warning tanggal tutup */}
              {visitDate && isSelectedDateClosed && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#ef4444]/25 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Museum <strong>tutup</strong> pada tanggal ini. Silakan pilih tanggal lain.</span>
                </div>
              )}

              {/* Ticket rows */}
              <div className="mt-4 space-y-3">
                {museum.tickets.map((ticket: any) => (
                  <div key={ticket.id} className="rounded-2xl border border-[#b59a5b]/10 bg-[#0a1f1a]/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-[#f0ebe3]">{ticket.type}</h4>
                        <p className="mt-0.5 text-xs text-[#a09a90]">{ticket.description}</p>
                      </div>
                      <p className="shrink-0 font-bold text-[#c9ad6e]">
                        {ticket.price === 0 ? 'Gratis' : `Rp ${ticket.price.toLocaleString('id-ID')}`}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateTicketQuantity(ticket.id, -1)}
                        disabled={!selectedTickets[ticket.id] || isClosed}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#b59a5b]/25 text-[#f0ebe3] transition hover:bg-[#b59a5b]/10 disabled:opacity-40"
                        aria-label="Kurangi"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-[#f0ebe3]">{selectedTickets[ticket.id] || 0}</span>
                      <button
                        type="button"
                        onClick={() => updateTicketQuantity(ticket.id, 1)}
                        disabled={isClosed}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#b59a5b]/25 text-[#f0ebe3] transition hover:bg-[#b59a5b]/10 disabled:opacity-40"
                        aria-label="Tambah"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop summary + CTA (mobile uses sticky bar) */}
              {showPurchaseBar && (
                <div className="mt-5 hidden md:block">
                  <div className="h-px bg-[#b59a5b]/12" />
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#a09a90]">Total Tiket</span>
                      <span className="font-semibold text-[#f0ebe3]">{totalTickets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a09a90]">Total Harga</span>
                      <span className="text-lg font-bold text-[#c9ad6e]">Rp {totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="mt-4 w-full rounded-xl bg-[#b59a5b] px-4 py-3 text-sm font-bold text-[#0a1f1a] transition hover:bg-[#c9ad6e]"
                  >
                    Tambah ke Keranjang
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Spacer agar konten terakhir tidak tertutup sticky bar (mobile) */}
        {showPurchaseBar && <div className="h-24 md:hidden" />}
      </div>

      {/* ===== Sticky purchase bar (mobile, di atas bottom-nav) ===== */}
      {showPurchaseBar && (
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)_+_5.25rem)] z-40 px-4 md:hidden">
          <div className="mx-auto flex max-w-[520px] items-center justify-between gap-3 rounded-2xl border border-[#b59a5b]/15 bg-[#12382d]/95 px-4 py-3 shadow-[0_18px_46px_-22px_rgba(0,0,0,.9)] backdrop-blur-2xl">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#a09a90]" style={mono}>{totalTickets} tiket</p>
              <p className="text-base font-bold text-[#c9ad6e]">Rp {totalPrice.toLocaleString('id-ID')}</p>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="shrink-0 rounded-xl bg-[#b59a5b] px-6 py-3 text-sm font-bold text-[#0a1f1a] transition hover:bg-[#c9ad6e]"
            >
              Tambah ke Keranjang
            </button>
          </div>
        </div>
      )}
    </div>
  );
};