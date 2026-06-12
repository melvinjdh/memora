import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  BellRing,
  CheckCircle,
  Clock3,
  MapPin,
  MessageCircle,
  Package,
  PackageCheck,
  Ticket,
  UserRound,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  getFulfillmentStatusDescription,
  getFulfillmentStatusLabel,
  getGuideBookingStatusDescription,
  getGuideBookingStatusLabel,
  getPaymentStatusLabel,
} from '../services/orderSimulationService';
import { supabase } from '../../lib/supabase/supabase'; // Alat pemanggil database

const artsy = { fontFamily: "'ArtsyHeading', serif" } as const;
const mono = { fontFamily: "'DM Mono', ui-monospace, monospace" } as const;
const surface =
  'rounded-[1.4rem] border border-[#b59a5b]/12 bg-gradient-to-br from-[#1a4d3e] to-[#12382d] shadow-[0_22px_54px_-42px_rgba(0,0,0,.9)]';

const formatPrice = (price: number) => `Rp ${Number(price || 0).toLocaleString('id-ID')}`;

const formatDate = (value?: string) => {
  if (!value) return '-';

  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getOrderTitle = (order: any) => {
  const hasMerchandise = order.items?.some((item: any) => item.type === 'merchandise');
  const hasGuide = order.items?.some((item: any) => item.type === 'guide');
  const hasTicket = order.items?.some((item: any) => item.type === 'ticket');

  if (hasMerchandise && !hasGuide && !hasTicket) return 'Pembayaran Merchandise Berhasil!';
  if (hasGuide && !hasMerchandise && !hasTicket) return 'Booking Pemandu Berhasil!';
  if (hasTicket && !hasMerchandise && !hasGuide) return 'Tiket Berhasil Dipesan!';
  return 'Pembayaran Berhasil!';
};

const getOrderSubtitle = (order: any) => {
  const hasMerchandise = order.items?.some((item: any) => item.type === 'merchandise');
  const hasGuide = order.items?.some((item: any) => item.type === 'guide');
  const hasTicket = order.items?.some((item: any) => item.type === 'ticket');

  if (hasMerchandise && !hasGuide && !hasTicket) {
    return 'Pesanan merchandise berhasil dibuat. Untuk demo, status akan otomatis berubah dari sedang disiapkan menjadi siap diambil.';
  }

  if (hasGuide && !hasMerchandise && !hasTicket) {
    return 'Booking pemandu berhasil dibuat. Untuk demo, pemandu akan otomatis mengonfirmasi setelah beberapa detik.';
  }

  if (hasTicket && !hasMerchandise && !hasGuide) {
    return 'Tiket museum berhasil diterbitkan dan dapat dilihat pada halaman Pesanan.';
  }

  return 'Pembayaran berhasil diproses. Detail pesanan dapat dilihat pada halaman Pesanan.';
};

const getItemPickup = (order: any, item: any) => {
  return (
    order.fulfillment?.items?.find((pickupItem: any) => pickupItem.itemId === item.id)?.pickup ||
    item.details?.pickup ||
    null
  );
};

const getNotificationTargetLabel = (target: string) => {
  if (target === 'seller') return 'Outlet/Penjual';
  if (target === 'guide') return 'Pemandu';
  if (target === 'customer') return 'Customer';
  return target;
};

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  // WADAH DATA DINAMIS
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // MENGAMBIL DATA LANGSUNG DARI SUPABASE
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) return;

      try {
        // 1. Mengambil data pesanan utama
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;

        // 2. Mengambil rincian keranjang belanjaan dengan cara terpisah (sangat aman)
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);

        if (orderData) {
          // Menyusun ulang data dari database agar bentuknya persis seperti yang dikenali desain UI
          const formattedOrder = {
            id: orderData.id,
            userId: orderData.user_id,
            date: orderData.created_at,
            status: orderData.status,
            total: orderData.total,
            fulfillment: orderData.fulfillment,
            guideBooking: orderData.guide_booking,
            notifications: [], // Dikosongkan karena notifikasi WA murni simulasi layar
            items: (itemsData || []).map((item: any) => ({
              id: item.id,
              type: item.type,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              details: item.details
            }))
          };
          
          setOrder(formattedOrder);
        }
      } catch (error) {
        console.error("Gagal mengambil data pesanan konfirmasi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,rgba(181,154,91,0.13),transparent_24rem),linear-gradient(180deg,#0d2b23_0%,#0a1f1a_46%,#061612_100%)] text-[#b59a5b]">
        <p style={mono} className="text-sm tracking-widest">MEMUAT KONFIRMASI...</p>
      </div>
    );
  }

  // ==== KODE DI BAWAH INI ADALAH DESAIN ASLI ANDA TANPA ADA UBAHAN SEDIKIT PUN ====
  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1f1a] px-5 text-center text-[#f0ebe3]">
        <div>
          <h2 className="text-2xl font-bold tracking-[-0.035em]" style={artsy}>Pesanan tidak ditemukan</h2>
          <p className="mt-2 text-sm text-[#a09a90]">Data pesanan mungkin belum tersimpan atau URL tidak valid.</p>
          <Button onClick={() => navigate('/')} className="mt-5 bg-[#b59a5b] font-bold text-[#0a1f1a] hover:bg-[#c9ad6e]">
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  const hasMerchandise = order.items?.some((item: any) => item.type === 'merchandise');
  const hasGuide = order.items?.some((item: any) => item.type === 'guide');
  const hasTicket = order.items?.some((item: any) => item.type === 'ticket');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(181,154,91,0.13),transparent_24rem),linear-gradient(180deg,#0d2b23_0%,#0a1f1a_46%,#061612_100%)] px-5 py-8 text-[#f0ebe3] md:px-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <Card className={surface}>
          <CardContent className="p-6 text-center md:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#b59a5b]/15 text-[#c9ad6e]">
              <CheckCircle className="h-11 w-11" />
            </div>

            <p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-[#b59a5b]/75" style={mono}>
              Order Confirmed
            </p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#f0ebe3] md:text-4xl" style={artsy}>
              {getOrderTitle(order)}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#c8c2b8]">
              {getOrderSubtitle(order)}
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
              <div className="rounded-2xl border border-[#b59a5b]/12 bg-[#0a1f1a]/35 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#a09a90]" style={mono}>Order ID</p>
                <p className="mt-1 break-all text-sm font-bold text-[#f0ebe3]">{order.id}</p>
              </div>

              <div className="rounded-2xl border border-[#b59a5b]/12 bg-[#0a1f1a]/35 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#a09a90]" style={mono}>Tanggal</p>
                <p className="mt-1 text-sm font-bold text-[#f0ebe3]">{formatDate(order.date)}</p>
              </div>

              <div className="rounded-2xl border border-[#b59a5b]/12 bg-[#0a1f1a]/35 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#a09a90]" style={mono}>Status Pembayaran</p>
                <p className="mt-1 text-sm font-bold text-emerald-300">{getPaymentStatusLabel(order.status)}</p>
              </div>

              <div className="rounded-2xl border border-[#b59a5b]/12 bg-[#0a1f1a]/35 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#a09a90]" style={mono}>Total</p>
                <p className="mt-1 text-sm font-bold text-[#c9ad6e]">{formatPrice(order.total)}</p>
              </div>
            </div>

            {(hasMerchandise || hasGuide) && (
              <div className="mt-4 grid grid-cols-1 gap-3 text-left md:grid-cols-2">
                {hasMerchandise && order.fulfillment && (
                  <div className="rounded-2xl border border-[#b59a5b]/12 bg-[#0a1f1a]/35 p-4">
                    <div className="flex items-start gap-3">
                      <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#c9ad6e]" />
                      <div>
                        <p className="text-sm font-bold text-[#f0ebe3]">
                          {getFulfillmentStatusLabel(order.fulfillment.status)}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-[#a09a90]">
                          {getFulfillmentStatusDescription(order.fulfillment.status)}
                        </p>
                        <div className="mt-3 space-y-2">
                          {(order.fulfillment.items?.length
                            ? order.fulfillment.items
                            : [{
                                itemId: 'default-pickup',
                                productName: 'Merchandise',
                                pickup: {
                                  label: order.fulfillment.label || 'Ambil di Lokasi',
                                  name: order.fulfillment.pickupOutletName || 'Lokasi pengambilan',
                                  location: order.fulfillment.pickupLocation || '-',
                                },
                              }]
                          ).map((pickupItem: any) => (
                            <div key={pickupItem.itemId} className="rounded-xl border border-[#b59a5b]/10 bg-[#061612]/40 p-3">
                              <p className="flex items-start gap-2 text-xs leading-relaxed text-[#c8c2b8]">
                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b59a5b]" />
                                <span>
                                  <span className="font-bold text-[#f0ebe3]">{pickupItem.productName}</span>
                                  <br />
                                  {pickupItem.pickup.label}: {pickupItem.pickup.name}
                                  <br />
                                  {pickupItem.pickup.location}
                                </span>
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {hasGuide && order.guideBooking && (
                  <div className="rounded-2xl border border-[#b59a5b]/12 bg-[#0a1f1a]/35 p-4">
                    <div className="flex items-start gap-3">
                      <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-[#c9ad6e]" />
                      <div>
                        <p className="text-sm font-bold text-[#f0ebe3]">
                          {getGuideBookingStatusLabel(order.guideBooking.status)}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-[#a09a90]">
                          {getGuideBookingStatusDescription(order.guideBooking.status, {
                            guideName: guideItem?.details?.guideName || guideItem?.name,
                            date: guideItem?.details?.date ? formatDate(guideItem.details.date) : undefined,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-[#b59a5b]/12 bg-[#0a1f1a]/35 p-5 text-left">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-[#f0ebe3]">
                <Package className="h-4 w-4 text-[#c9ad6e]" />
                Detail Pesanan
              </h3>

              <div className="space-y-3">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="rounded-2xl border border-[#b59a5b]/10 bg-[#061612]/35 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-[#f0ebe3]">{item.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#b59a5b]/70" style={mono}>
                          {item.type === 'ticket' ? 'Tiket Museum' : item.type === 'guide' ? 'Pemandu Wisata' : 'Merchandise'}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-[#c9ad6e]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-[#a09a90]">
                      {item.quantity && <p>Jumlah: {item.quantity}</p>}
                      {item.details?.museum && <p>Museum: {item.details.museum}</p>}
                      {item.details?.date && <p>Tanggal: {formatDate(item.details.date)}</p>}
                      {item.details?.visitDate && <p>Tanggal Kunjungan: {formatDate(item.details.visitDate)}</p>}
                      {item.details?.slots && <p>Jam: {item.details.slots.join(', ')}</p>}
                      {item.details?.duration && <p>Durasi: {item.details.duration} jam</p>}
                    </div>

                    {item.type === 'merchandise' && getItemPickup(order, item) && (
                      <div className="mt-3 rounded-xl border border-[#b59a5b]/10 bg-[#0a1f1a]/40 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b59a5b]" style={mono}>
                          {getItemPickup(order, item).label}
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#f0ebe3]">
                          {getItemPickup(order, item).name}
                        </p>
                        <p className="mt-0.5 text-xs text-[#a09a90]">
                          {getItemPickup(order, item).location}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {order.notifications?.length > 0 && (
              <div className="mt-6 rounded-2xl border border-[#b59a5b]/12 bg-[#0a1f1a]/35 p-5 text-left">
                <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-[#f0ebe3]">
                  <BellRing className="h-4 w-4 text-[#c9ad6e]" />
                  Simulasi Notifikasi WhatsApp
                </h3>

                <div className="space-y-2">
                  {order.notifications.map((notification: any) => (
                    <div key={notification.id} className="flex items-start gap-3 rounded-2xl border border-[#b59a5b]/10 bg-[#061612]/35 p-3">
                      <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#c9ad6e]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#f0ebe3]">
                          WA ke {getNotificationTargetLabel(notification.target)} terkirim
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-[#a09a90]">
                          Target: {notification.targetLabel} • Status: simulasi berhasil
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-[#b59a5b]/12 bg-[#0a1f1a]/35 p-5 text-left">
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-[#f0ebe3]">
                <Clock3 className="h-4 w-4 text-[#c9ad6e]" />
                Langkah Selanjutnya
              </h3>

              <ul className="space-y-2 text-sm leading-relaxed text-[#c8c2b8]">
                {hasTicket && <li>• Tiket museum dapat dilihat pada halaman Pesanan/Tiket.</li>}
                {hasGuide && <li>• Booking pemandu dapat dipantau pada halaman Pesanan.</li>}
                {hasMerchandise && <li>• Merchandise dapat diambil saat status berubah menjadi Siap diambil.</li>}
                <li>• Tunjukkan bukti pesanan saat tiba di lokasi.</li>
              </ul>
            </div>

            <div className="mt-7 space-y-3">
              <Button
                className="w-full bg-[#b59a5b] font-bold text-[#0a1f1a] hover:bg-[#c9ad6e]"
                onClick={() => navigate('/my-orders')}
              >
                <Package className="mr-2 h-4 w-4" />
                Lihat Pesanan Saya
              </Button>
              <Button
                variant="ghost"
                className="w-full text-[#c8c2b8] hover:bg-[#f0ebe3]/10 hover:text-[#f0ebe3]"
                onClick={() => navigate('/')}
              >
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
