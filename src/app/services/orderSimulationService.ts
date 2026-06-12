export type FulfillmentStatus = 'preparing' | 'ready_for_pickup' | 'picked_up' | 'delivery_coming_soon' | 'cancelled';
export type GuideBookingStatus = 'waiting_confirmation' | 'confirmed' | 'completed' | 'cancelled';
export type PickupType = 'local_outlet' | 'museum_pickup';

export type MerchandisePickup = {
  type: PickupType;
  label: 'Ambil di Outlet' | 'Ambil di Museum';
  name: string;
  location: string;
};

export type MerchandisePickupItem = {
  itemId: string;
  productName: string;
  quantity: number;
  museum?: string;
  pickup: MerchandisePickup;
};

const STORAGE_KEY = 'memora_orders';

// Untuk demo: merchandise otomatis berubah jadi siap diambil setelah 10 detik.
export const MERCH_READY_DELAY_MS = 10000;

// Untuk demo: pemandu otomatis mengonfirmasi booking setelah 7 detik.
export const GUIDE_CONFIRM_DELAY_MS = 7000;

export const LOCAL_PICKUP_OUTLET: MerchandisePickup = {
  type: 'local_outlet',
  label: 'Ambil di Outlet',
  name: 'Pameran Cross Musea Pertiwi',
  location: 'Museum Dr. Soetomo',
};

const getStoredOrders = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveStoredOrders = (orders: any[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

const hasMerchandise = (order: any) => {
  return order.items?.some((item: any) => item.type === 'merchandise');
};

const hasGuide = (order: any) => {
  return order.items?.some((item: any) => item.type === 'guide');
};

export const isLocalMerchandiseItem = (item: any) => {
  const details = item?.details || {};
  const museum = String(details.museum || '').toLowerCase();
  const source = String(details.source || '').toLowerCase();
  const merchType = String(details.merchType || '').toLowerCase();
  const category = String(details.category || '').toLowerCase();
  const id = String(item?.id || '').toLowerCase();

  return (
    source === 'local' ||
    id.startsWith('local-') ||
    museum.includes('produk lokal') ||
    merchType.includes('produk lokal') ||
    category.includes('produk lokal')
  );
};

export const resolveMerchandisePickup = (item: any): MerchandisePickup => {
  const existingPickup = item?.details?.pickup;

  if (
    existingPickup?.label &&
    existingPickup?.name &&
    existingPickup?.location
  ) {
    return existingPickup;
  }

  if (isLocalMerchandiseItem(item)) {
    return LOCAL_PICKUP_OUTLET;
  }

  const museumName = item?.details?.museum || 'Museum terkait';

  return {
    type: 'museum_pickup',
    label: 'Ambil di Museum',
    name: museumName,
    location: museumName,
  };
};

export const buildMerchandisePickupItems = (items: any[] = []): MerchandisePickupItem[] => {
  return items
    .filter((item: any) => item.type === 'merchandise')
    .map((item: any) => ({
      itemId: item.id,
      productName: item.name,
      quantity: item.quantity || 1,
      museum: item.details?.museum,
      pickup: resolveMerchandisePickup(item),
    }));
};

const getFirstPickup = (order: any) => {
  const pickupItems = order.fulfillment?.items || buildMerchandisePickupItems(order.items || []);
  return pickupItems?.[0]?.pickup || LOCAL_PICKUP_OUTLET;
};

export const enrichOrderWithSimulation = (order: any) => {
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const orderHasMerchandise = hasMerchandise(order);
  const orderHasGuide = hasGuide(order);
  const merchandisePickupItems = order.fulfillment?.items || buildMerchandisePickupItems(order.items || []);
  const firstPickup = merchandisePickupItems?.[0]?.pickup || LOCAL_PICKUP_OUTLET;

  return {
    ...order,
    simulation: {
      ...(order.simulation || {}),
      enabled: true,
      startedAt: order.simulation?.startedAt || nowIso,
      merchReadyAt: orderHasMerchandise
        ? order.simulation?.merchReadyAt || new Date(now + MERCH_READY_DELAY_MS).toISOString()
        : null,
      guideConfirmedAt: orderHasGuide
        ? order.simulation?.guideConfirmedAt || new Date(now + GUIDE_CONFIRM_DELAY_MS).toISOString()
        : null,
    },
    fulfillment: orderHasMerchandise
      ? {
          ...(order.fulfillment || {}),
          method: order.fulfillment?.method || 'pickup',
          label: order.fulfillment?.label || 'Ambil sesuai lokasi produk',
          status: order.fulfillment?.status || 'preparing',
          items: merchandisePickupItems,
          pickupOutlet: order.fulfillment?.pickupOutlet || firstPickup.type,
          pickupOutletName: order.fulfillment?.pickupOutletName || firstPickup.name,
          pickupLocation: order.fulfillment?.pickupLocation || firstPickup.location,
          updatedAt: order.fulfillment?.updatedAt || nowIso,
        }
      : order.fulfillment || null,
    guideBooking: orderHasGuide
      ? {
          ...(order.guideBooking || {}),
          status: order.guideBooking?.status || 'waiting_confirmation',
          updatedAt: order.guideBooking?.updatedAt || nowIso,
        }
      : order.guideBooking || null,
  };
};

export const syncSimulatedOrderStatuses = () => {
  const orders = getStoredOrders();
  const now = Date.now();
  let changed = false;

  const updatedOrders = orders.map((order: any) => {
    let updatedOrder = { ...order };

    const merchReadyAt = order.simulation?.merchReadyAt
      ? Date.parse(order.simulation.merchReadyAt)
      : null;

    const guideConfirmedAt = order.simulation?.guideConfirmedAt
      ? Date.parse(order.simulation.guideConfirmedAt)
      : null;

    if (
      updatedOrder.fulfillment?.status === 'preparing' &&
      merchReadyAt &&
      now >= merchReadyAt
    ) {
      changed = true;
      updatedOrder = {
        ...updatedOrder,
        fulfillment: {
          ...updatedOrder.fulfillment,
          status: 'ready_for_pickup',
          readyAt: updatedOrder.fulfillment.readyAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    if (
      updatedOrder.guideBooking?.status === 'waiting_confirmation' &&
      guideConfirmedAt &&
      now >= guideConfirmedAt
    ) {
      changed = true;
      updatedOrder = {
        ...updatedOrder,
        guideBooking: {
          ...updatedOrder.guideBooking,
          status: 'confirmed',
          confirmedAt: updatedOrder.guideBooking.confirmedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    return updatedOrder;
  });

  if (changed) saveStoredOrders(updatedOrders);

  return updatedOrders;
};

export const getPaymentStatusLabel = (status?: string) => {
  if (status === 'confirmed' || status === 'paid' || status === 'completed') return 'Berhasil';
  if (status === 'pending' || status === 'pending_payment_simulation') return 'Menunggu Pembayaran';
  if (status === 'cancelled') return 'Dibatalkan';
  return status || 'Berhasil';
};

export const getFulfillmentStatusLabel = (status?: FulfillmentStatus | string) => {
  if (status === 'preparing') return 'Pesanan disiapkan';
  if (status === 'ready_for_pickup') return 'Pesanan bisa diambil';
  if (status === 'picked_up') return 'Pesanan selesai';
  if (status === 'delivery_coming_soon') return 'Delivery segera hadir';
  if (status === 'cancelled') return 'Dibatalkan';
  return 'Pesanan disiapkan';
};

export const getFulfillmentStatusDescription = (status?: FulfillmentStatus | string) => {
  if (status === 'preparing') return 'Pesanan sedang disiapkan oleh outlet atau museum terkait.';
  if (status === 'ready_for_pickup') return 'Pesanan sudah siap dan dapat diambil di lokasi pengambilan.';
  if (status === 'picked_up') return 'Pesanan sudah berhasil diambil.';
  if (status === 'delivery_coming_soon') return 'Pengiriman belum tersedia untuk saat ini.';
  if (status === 'cancelled') return 'Pesanan dibatalkan dan tidak perlu diambil.';
  return 'Pesanan sedang diproses.';
};

export const getGuideBookingStatusLabel = (status?: GuideBookingStatus | string) => {
  if (status === 'waiting_confirmation') return 'Menunggu konfirmasi pemandu';
  if (status === 'confirmed') return 'Booking Pemandu Berhasil';
  if (status === 'completed') return 'Tur selesai';
  if (status === 'cancelled') return 'Booking dibatalkan';
  return 'Menunggu konfirmasi pemandu';
};

type GuideBookingDescriptionContext = {
  guideName?: string;
  date?: string;
};

export const getGuideBookingStatusDescription = (
  status?: GuideBookingStatus | string,
  context?: GuideBookingDescriptionContext
) => {
  if (status === 'waiting_confirmation') return 'Notifikasi booking sudah disimulasikan dan sedang menunggu respons pemandu.';
  if (status === 'confirmed') {
    const guideName = context?.guideName?.trim() || 'pemandu pilihan Anda';
    const date = context?.date?.trim() || 'tanggal reservasi Anda';
    return `Pemandu ${guideName} telah menerima reservasi Anda untuk tanggal ${date}. Silakan akses aplikasi untuk melihat detail perjalanan.`;
  }
  if (status === 'completed') return 'Sesi tur bersama pemandu sudah selesai.';
  if (status === 'cancelled') return 'Booking pemandu dibatalkan.';
  return 'Booking pemandu sedang diproses.';
};

export const getNextFulfillmentStatus = (status?: FulfillmentStatus | string): FulfillmentStatus => {
  if (status === 'preparing') return 'ready_for_pickup';
  if (status === 'ready_for_pickup') return 'picked_up';
  return 'picked_up';
};

export const getFulfillmentStatusForOrder = (order: any): FulfillmentStatus | string => {
  if (order?.status === 'pending' || order?.status === 'pending_payment_simulation') return 'preparing';
  if (order?.status === 'confirmed' || order?.status === 'paid') return 'ready_for_pickup';
  if (order?.status === 'completed') return 'picked_up';
  if (order?.status === 'cancelled') return 'cancelled';
  return order?.fulfillment?.status || 'preparing';
};

export const getGuideBookingStatusForOrder = (order: any): GuideBookingStatus | string => {
  if (order?.status === 'pending' || order?.status === 'pending_payment_simulation') return 'waiting_confirmation';
  if (order?.status === 'confirmed' || order?.status === 'paid') return 'confirmed';
  if (order?.status === 'completed') return 'completed';
  if (order?.status === 'cancelled') return 'cancelled';
  return order?.guideBooking?.status || order?.guide_booking?.status || 'waiting_confirmation';
};

export const buildOrderStatusUpdatePayload = (order: any, newStatus: string) => {
  const now = new Date().toISOString();
  const payload: Record<string, any> = { status: newStatus };

  if (order?.fulfillment) {
    const fulfillment = { ...order.fulfillment, updatedAt: now };

    if (newStatus === 'pending' || newStatus === 'pending_payment_simulation') {
      fulfillment.status = 'preparing';
    }

    if (newStatus === 'confirmed' || newStatus === 'paid') {
      fulfillment.status = 'ready_for_pickup';
      fulfillment.readyAt = fulfillment.readyAt || now;
    }

    if (newStatus === 'completed') {
      fulfillment.status = 'picked_up';
      fulfillment.readyAt = fulfillment.readyAt || now;
      fulfillment.pickedUpAt = fulfillment.pickedUpAt || now;
    }

    if (newStatus === 'cancelled') {
      fulfillment.status = 'cancelled';
      fulfillment.cancelledAt = fulfillment.cancelledAt || now;
    }

    payload.fulfillment = fulfillment;
  }

  if (order?.guide_booking) {
    const guideBooking = { ...order.guide_booking, updatedAt: now };

    if (newStatus === 'pending' || newStatus === 'pending_payment_simulation') {
      guideBooking.status = 'waiting_confirmation';
    }

    if (newStatus === 'confirmed' || newStatus === 'paid') {
      guideBooking.status = 'confirmed';
      guideBooking.confirmedAt = guideBooking.confirmedAt || now;
    }

    if (newStatus === 'completed') {
      guideBooking.status = 'completed';
      guideBooking.completedAt = guideBooking.completedAt || now;
    }

    if (newStatus === 'cancelled') {
      guideBooking.status = 'cancelled';
      guideBooking.cancelledAt = guideBooking.cancelledAt || now;
    }

    payload.guide_booking = guideBooking;
  }

  return payload;
};

export const updateLocalOrderFulfillmentStatus = (orderId: string, newStatus: FulfillmentStatus) => {
  const orders = getStoredOrders();

  const updatedOrders = orders.map((order: any) => {
    if (order.id !== orderId) return order;

    const firstPickup = getFirstPickup(order);

    return {
      ...order,
      fulfillment: {
        ...(order.fulfillment || {}),
        status: newStatus,
        pickupOutletName: order.fulfillment?.pickupOutletName || firstPickup.name,
        pickupLocation: order.fulfillment?.pickupLocation || firstPickup.location,
        readyAt:
          newStatus === 'ready_for_pickup'
            ? order.fulfillment?.readyAt || new Date().toISOString()
            : order.fulfillment?.readyAt,
        pickedUpAt:
          newStatus === 'picked_up'
            ? order.fulfillment?.pickedUpAt || new Date().toISOString()
            : order.fulfillment?.pickedUpAt,
        updatedAt: new Date().toISOString(),
      },
    };
  });

  saveStoredOrders(updatedOrders);
  return updatedOrders;
};

export const updateLocalGuideBookingStatus = (orderId: string, newStatus: GuideBookingStatus) => {
  const orders = getStoredOrders();

  const updatedOrders = orders.map((order: any) => {
    if (order.id !== orderId) return order;

    return {
      ...order,
      guideBooking: {
        ...(order.guideBooking || {}),
        status: newStatus,
        confirmedAt:
          newStatus === 'confirmed'
            ? order.guideBooking?.confirmedAt || new Date().toISOString()
            : order.guideBooking?.confirmedAt,
        updatedAt: new Date().toISOString(),
      },
    };
  });

  saveStoredOrders(updatedOrders);
  return updatedOrders;
};
