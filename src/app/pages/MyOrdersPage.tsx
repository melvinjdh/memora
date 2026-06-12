import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Ticket,
  UserRound,
  ShoppingBag,
  MapPin,
  CalendarDays,
  Clock,
  QrCode,
  Store,
  PackageOpen,
  XCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { SectionHeader } from '../components/SectionHeader';
import {
  getFulfillmentStatusDescription,
  getFulfillmentStatusForOrder,
  getFulfillmentStatusLabel,
  getGuideBookingStatusDescription,
  getGuideBookingStatusForOrder,
  getGuideBookingStatusLabel,
  resolveMerchandisePickup,
} from '../services/orderSimulationService';
import { supabase } from '../../lib/supabase/supabase';

const artsy = { fontFamily: "'ArtsyHeading', serif" } as const;
const mono = { fontFamily: "'DM Mono', ui-monospace, monospace" } as const;
const surface =
  'rounded-[1.5rem] border border-[#b59a5b]/12 bg-gradient-to-br from-[#1a4d3e] to-[#12382d] shadow-[0_26px_60px_-42px_rgba(0,0,0,.85)]';

type TabKey = 'ticket' | 'guide' | 'merchandise';

const fmtDate = (iso?: string) => {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
};

const rp = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;

const statusMeta: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Tiket belum terbit', cls: 'border-sky-400/30 bg-sky-400/10 text-sky-300' },
  pending_payment_simulation: { label: 'Tiket belum terbit', cls: 'border-sky-400/30 bg-sky-400/10 text-sky-300' },
  confirmed: { label: 'Tiket sudah terbit', cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' },
  paid: { label: 'Tiket sudah terbit', cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' },
  completed: { label: 'Berhasil', cls: 'border-[#b59a5b]/40 bg-[#b59a5b]/15 text-[#c9ad6e]' },
  cancelled: { label: 'Dibatalkan', cls: 'border-red-400/30 bg-red-400/10 text-red-300' },
};

const merchStatusMeta: Record<string, { cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  preparing: { cls: 'border-sky-400/30 bg-sky-400/10 text-sky-300', icon: PackageOpen },
  ready_for_pickup: { cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300', icon: Store },
  picked_up: { cls: 'border-[#b59a5b]/40 bg-[#b59a5b]/15 text-[#c9ad6e]', icon: CheckCircle2 },
  cancelled: { cls: 'border-red-400/30 bg-red-400/10 text-red-300', icon: XCircle },
};

const guideStatusMeta: Record<string, { cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  waiting_confirmation: { cls: 'border-amber-400/30 bg-amber-400/10 text-amber-300', icon: Clock },
  confirmed: { cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300', icon: CheckCircle2 },
  completed: { cls: 'border-[#b59a5b]/40 bg-[#b59a5b]/15 text-[#c9ad6e]', icon: CheckCircle2 },
  cancelled: { cls: 'border-red-400/30 bg-red-400/10 text-red-300', icon: XCircle },
};

interface FlatItem {
  id: string;
  type: TabKey;
  name: string;
  quantity: number;
  price: number;
  details?: any;
  orderId: string;
  orderDate: string;
  orderStatus: string;
  order?: any;
  fulfillmentStatus?: string;
  guideBookingStatus?: string;
  pickup?: {
    type?: string;
    label?: string;
    name?: string;
    location?: string;
  };
}

export const MyOrdersPage: React.FC = () => {
  const { user, isAuthenticated, isInitializing } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>('ticket');
  const [qrTicket, setQrTicket] = useState<FlatItem | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) navigate('/login');
  }, [isAuthenticated, isInitializing, navigate]);

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        if (ordersData && ordersData.length > 0) {
          const orderIds = ordersData.map((o: any) => o.id);

          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

          if (itemsError) throw itemsError;

          const formattedOrders = ordersData.map((o: any) => {
            const matchingItems = (itemsData || []).filter((item: any) => item.order_id === o.id);

            return {
              id: o.id,
              userId: o.user_id,
              date: o.created_at,
              status: o.status,
              fulfillment: o.fulfillment,
              guideBooking: o.guide_booking,
              items: matchingItems.map((item: any) => ({
                id: item.id,
                type: item.type,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                details: item.details
              }))
            };
          });
          
          if (isMounted) setOrders(formattedOrders);
        } else {
          if (isMounted) setOrders([]);
        }
      } catch (err: any) {
        console.error('Gagal mengambil data pesanan:', err.message || err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (user && !isInitializing) {
      fetchOrders();

      const channel = supabase
        .channel(`orders-user-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user.id}`,
          },
          () => fetchOrders()
        )
        .subscribe();

      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [user, isInitializing]);
const handleConfirmMerchandiseReceived = async (item: FlatItem) => {
  if (!user) return;

  const currentStatus = item.fulfillmentStatus || 'preparing';

  if (currentStatus !== 'ready_for_pickup') {
    alert('Pesanan ini belum siap diambil.');
    return;
  }

  const isConfirmed = window.confirm(
    'Konfirmasi bahwa pesanan ini sudah selesai?'
  );

  if (!isConfirmed) return;

  const now = new Date().toISOString();

  const updatedFulfillment = {
    ...(item.order?.fulfillment || {}),
    status: 'picked_up',
    pickedUpAt: now,
    receivedConfirmedAt: now,
    receivedConfirmedBy: user.id,
  };

  try {
    setConfirmingOrderId(item.orderId);

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        fulfillment: updatedFulfillment,
      })
      .eq('id', item.orderId)
      .eq('user_id', user.id);

    if (error) throw error;

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === item.orderId
          ? {
              ...order,
              status: 'completed',
              fulfillment: updatedFulfillment,
            }
          : order
      )
    );
  } catch (err: any) {
    console.error('Gagal konfirmasi pesanan diterima:', err.message || err);
    alert('Gagal mengonfirmasi pesanan. Coba lagi ya.');
  } finally {
    setConfirmingOrderId(null);
  }
};

  const items = useMemo<FlatItem[]>(() => {
    const flat: FlatItem[] = [];

    orders.forEach((order) => {
      const orderItems = Array.isArray(order.items) ? order.items : [];
      const fulfillmentItems = Array.isArray(order.fulfillment?.items) ? order.fulfillment.items : [];

      orderItems.forEach((item: any) => {
        const pickupFromOrder = fulfillmentItems.find(
          (fulfillmentItem: any) => fulfillmentItem.itemId === item.id
        )?.pickup;

        const pickup =
          item.type === 'merchandise'
            ? pickupFromOrder || item.details?.pickup || resolveMerchandisePickup(item)
            : undefined;

        flat.push({
          ...item,
          order,
          orderId: order.id,
          orderDate: order.date,
          orderStatus: order.status,
          fulfillmentStatus: getFulfillmentStatusForOrder(order),
          guideBookingStatus: getGuideBookingStatusForOrder(order),
          pickup,
        });
      });
    });

    return flat;
  }, [orders]);

  const tickets = items.filter((item) => item.type === 'ticket');
  const guides = items.filter((item) => item.type === 'guide');
  const merch = items.filter((item) => item.type === 'merchandise');

  const tabs: { key: TabKey; label: string; short: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'ticket', label: 'Tiket Museum', short: 'Tiket', icon: Ticket },
    { key: 'guide', label: 'Pemandu', short: 'Pemandu', icon: UserRound },
    { key: 'merchandise', label: 'Merchandise', short: 'Merch', icon: ShoppingBag },
  ];

  const StatusPill: React.FC<{ status: string }> = ({ status }) => {
    const meta = statusMeta[status] || statusMeta.confirmed;
    return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${meta.cls}`}>{meta.label}</span>;
  };

  const EmptyState: React.FC<{
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    desc: string;
  }> = ({ icon: Icon, title, desc }) => (
    <div className="col-span-full flex flex-col items-center justify-center rounded-[1.5rem] border border-[#b59a5b]/10 bg-[#12382d]/40 px-6 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#b59a5b]/10 text-[#b59a5b]">
        <Icon className="h-7 w-7" />
      </span>
      <h3 className="mt-5 text-xl font-bold tracking-[-0.035em] text-[#f0ebe3]" style={artsy}>{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-[#a09a90]">{desc}</p>
      <button
        type="button"
        onClick={() => navigate('/museums')}
        className="mt-5 rounded-full bg-[#b59a5b] px-6 py-3 text-sm font-bold text-[#0a1f1a] transition hover:bg-[#c9ad6e]"
      >
        Mulai Jelajah
      </button>
    </div>
  );

  if (isLoading || isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,rgba(181,154,91,0.13),transparent_24rem),linear-gradient(180deg,#0d2b23_0%,#0a1f1a_44%,#071814_100%)] text-[#b59a5b]">
        <p style={mono} className="text-sm tracking-widest">MEMUAT PESANAN...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(181,154,91,0.13),transparent_24rem),linear-gradient(180deg,#0d2b23_0%,#0a1f1a_44%,#071814_100%)] text-[#f0ebe3]">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-8 md:px-8 md:pt-12 lg:px-10">
        <SectionHeader
          eyebrow="My Activity"
          title="Pesanan Saya"
          subtitle="Tiket museum, voucher pemandu, dan status pembelian merchandise."
        />

        <div className="grid grid-cols-3 gap-1 rounded-[1.25rem] border border-[#b59a5b]/12 bg-[#0a1f1a]/45 p-1">
          {tabs.map((tabItem) => {
            const Icon = tabItem.icon;
            const active = tab === tabItem.key;
            return (
              <button
                key={tabItem.key}
                type="button"
                onClick={() => setTab(tabItem.key)}
                className={`flex min-w-0 items-center justify-center gap-1.5 rounded-xl px-1.5 py-2.5 text-[11px] font-bold transition md:px-2 md:text-sm ${
                  active
                    ? 'bg-[#b59a5b] text-[#0a1f1a] shadow-[0_10px_24px_-16px_rgba(181,154,91,.95)]'
                    : 'text-[#a09a90] hover:text-[#f0ebe3]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden truncate sm:inline">{tabItem.label}</span>
                <span className="truncate sm:hidden">{tabItem.short}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          {tab === 'ticket' && (
            tickets.length === 0 ? (
              <EmptyState icon={Ticket} title="Belum ada tiket" desc="Tiket museum digital kamu akan muncul di sini setelah pembelian." />
            ) : (
              tickets.map((ticket, index) => (
                <article key={`${ticket.orderId}-${ticket.id}-${index}`} className={`${surface} overflow-hidden`}>
                  <div className="flex items-start justify-between gap-3 p-5">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#b59a5b]/75" style={mono}>Tiket Museum</p>
                      <h3 className="mt-1 text-lg font-bold tracking-[-0.035em] text-[#f0ebe3]" style={artsy}>
                        {ticket.details?.museumName || ticket.name}
                      </h3>
                      <p className="mt-1 text-sm text-[#c8c2b8]">
                        {ticket.details?.ticketType || 'Tiket Masuk'} • {ticket.quantity}x
                      </p>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-[#a09a90]">
                        <CalendarDays className="h-3.5 w-3.5 text-[#b59a5b]" />
                        {fmtDate(ticket.details?.visitDate)}
                      </div>
                    </div>
                    <StatusPill status={ticket.orderStatus} />
                  </div>

                  <div className="relative">
                    <div className="mx-5 border-t border-dashed border-[#b59a5b]/25" />
                    <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#0a1f1a]" />
                    <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[#0a1f1a]" />
                  </div>

                  <div className="flex items-center justify-between gap-3 p-5">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[#b59a5b]/70" style={mono}>Kode</p>
                      <p className="font-bold text-[#c9ad6e]" style={mono}>{ticket.orderId.split('-')[0].toUpperCase()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQrTicket(ticket)}
                      className="flex shrink-0 items-center gap-2 rounded-xl bg-[#b59a5b] px-4 py-2.5 text-sm font-bold text-[#0a1f1a] transition hover:bg-[#c9ad6e]"
                    >
                      <QrCode className="h-4 w-4" />
                      Tampilkan QR
                    </button>
                  </div>
                </article>
              ))
            )
          )}

          {tab === 'guide' && (
            guides.length === 0 ? (
              <EmptyState icon={UserRound} title="Belum ada booking pemandu" desc="Voucher pemesanan pemandu wisata kamu akan tampil di sini." />
            ) : (
              guides.map((guide, index) => {
                const guideStatus = guide.guideBookingStatus || 'waiting_confirmation';
                const guideMeta = guideStatusMeta[guideStatus] || guideStatusMeta.waiting_confirmation;
                const GuideStatusIcon = guideMeta.icon;
                const guideName = guide.details?.guideName || guide.name;
                const guideDate = guide.details?.date ? fmtDate(guide.details.date) : undefined;

                return (
                  <article key={`${guide.orderId}-${guide.id}-${index}`} className={`${surface} p-5`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-[#b59a5b]/75" style={mono}>Voucher Booking Pemandu</p>
                        <h3 className="mt-1 text-lg font-bold tracking-[-0.035em] text-[#f0ebe3]" style={artsy}>
                          {guideName}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-[#b59a5b]/10 bg-[#0a1f1a]/40 p-4 text-sm">
                      <div className="flex items-center gap-2 text-[#c8c2b8]">
                        <MapPin className="h-4 w-4 shrink-0 text-[#b59a5b]" />
                        <span className="line-clamp-1">{guide.details?.museum || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#c8c2b8]">
                        <CalendarDays className="h-4 w-4 shrink-0 text-[#b59a5b]" />
                        {fmtDate(guide.details?.date)}
                      </div>
                      <div className="flex items-center gap-2 text-[#c8c2b8]">
                        <Clock className="h-4 w-4 shrink-0 text-[#b59a5b]" />
                        {Array.isArray(guide.details?.slots) ? guide.details.slots.join(', ') : '-'}
                      </div>
                      <div className="flex items-center gap-2 text-[#c8c2b8]">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#b59a5b]" />
                        {guide.details?.duration || 1} jam
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-[#b59a5b]/10 bg-[#0a1f1a]/35 p-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${guideMeta.cls}`}>
                        <GuideStatusIcon className="h-3.5 w-3.5" />
                        {getGuideBookingStatusLabel(guideStatus)}
                      </span>
                      <p className="mt-2 text-xs leading-relaxed text-[#a09a90]">
                        {getGuideBookingStatusDescription(guideStatus, {
                          guideName,
                          date: guideDate,
                        })}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#b59a5b]/70" style={mono}>Kode Booking</p>
                        <p className="font-bold text-[#c9ad6e]" style={mono}>{guide.orderId.split('-')[0].toUpperCase()}</p>
                      </div>
                      <p className="text-lg font-bold text-[#c9ad6e]">{rp(guide.price)}</p>
                    </div>
                  </article>
                );
              })
            )
          )}

          {tab === 'merchandise' && (
            merch.length === 0 ? (
              <EmptyState icon={ShoppingBag} title="Belum ada pembelian" desc="Status merchandise yang kamu beli akan muncul di sini." />
            ) : (
              merch.map((item, index) => {
                const fulfillmentStatus = item.fulfillmentStatus || 'preparing';
                const meta = merchStatusMeta[fulfillmentStatus] || merchStatusMeta.preparing;
                const StatusIcon = meta.icon;
                const pickup = item.pickup || item.details?.pickup;

                return (
                  <article key={`${item.orderId}-${item.id}-${index}`} className={`${surface} overflow-hidden`}>
                    <div className="flex gap-4 p-4">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#0d2b23]">
                        <ImageWithFallback src={item.details?.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-semibold text-[#f0ebe3]">{item.name}</h3>
                        <p className="mt-1 text-xs text-[#a09a90]">{item.quantity}x • {rp(item.price)}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#b59a5b]/60" style={mono}>{item.orderId.split('-')[0].toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-[#b59a5b]/10 px-4 py-3">
                      <div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${meta.cls}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {getFulfillmentStatusLabel(fulfillmentStatus)}
                        </span>
                        <p className="mt-2 text-xs leading-relaxed text-[#a09a90]">
                          {getFulfillmentStatusDescription(fulfillmentStatus)}
                        </p>
                        {fulfillmentStatus === 'ready_for_pickup' && (
  <button
    type="button"
    onClick={() => handleConfirmMerchandiseReceived(item)}
    disabled={confirmingOrderId === item.orderId}
    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#b59a5b] px-4 py-3 text-sm font-bold text-[#0a1f1a] transition hover:bg-[#c9ad6e] disabled:cursor-not-allowed disabled:opacity-60"
  >
    <CheckCircle2 className="h-4 w-4" />
    {confirmingOrderId === item.orderId ? 'Mengonfirmasi...' : 'Pesanan Selesai'}
  </button>
)}
                      </div>

                      {pickup && (
                        <div className="rounded-2xl border border-[#b59a5b]/10 bg-[#0a1f1a]/35 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b59a5b]/75" style={mono}>
                            {pickup.label || 'Lokasi Pengambilan'}
                          </p>
                          <p className="mt-1 text-sm font-bold text-[#f0ebe3]">{pickup.name}</p>
                          <p className="mt-0.5 text-xs text-[#a09a90]">{pickup.location}</p>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )
          )}
        </div>
      </div>

      {qrTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm"
          onClick={() => setQrTicket(null)}
        >
          <div
            className="relative w-full max-w-xs rounded-[1.6rem] border border-[#b59a5b]/15 bg-gradient-to-br from-[#1a4d3e] to-[#12382d] p-6 text-center shadow-[0_44px_100px_-40px_rgba(0,0,0,1)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setQrTicket(null)}
              aria-label="Tutup"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#0a1f1a]/50 text-[#c8c2b8] transition hover:text-[#f0ebe3]"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="text-[10px] uppercase tracking-[0.22em] text-[#b59a5b]/75" style={mono}>Tiket Museum</p>
            <h3 className="mt-1 text-xl font-bold tracking-[-0.035em] text-[#f0ebe3]" style={artsy}>
              {qrTicket.details?.museumName || qrTicket.name}
            </h3>
            <p className="mt-1 text-sm text-[#c8c2b8]">
              {(qrTicket.details?.ticketType || 'Tiket Masuk')} • {fmtDate(qrTicket.details?.visitDate)}
            </p>

            <div className="mx-auto mt-5 w-fit rounded-2xl bg-[#f0ebe3] p-4">
              <QRCodeSVG
                value={JSON.stringify({
                  ref: qrTicket.orderId,
                  museum: qrTicket.details?.museumName || qrTicket.name,
                  date: qrTicket.details?.visitDate || '',
                  type: qrTicket.details?.ticketType || 'Tiket',
                })}
                size={176}
                bgColor="#f0ebe3"
                fgColor="#0a1f1a"
                level="M"
              />
            </div>

            <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[#b59a5b]/70" style={mono}>Kode</p>
            <p className="font-bold text-[#c9ad6e]" style={mono}>{qrTicket.orderId.split('-')[0].toUpperCase()}</p>
            <p className="mt-3 text-[11px] text-[#a09a90]">Tunjukkan QR ini di pintu masuk museum.</p>
          </div>
        </div>
      )}
    </div>
  );
};
