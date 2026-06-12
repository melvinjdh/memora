// GANTI DENGAN API TOKEN DARI DASBOR FONNTE ANDA
const FONNTE_TOKEN = "cfhexrfXjLXPQk8Rgjz5";

export type NotificationTarget = 'customer' | 'seller' | 'guide';
export type NotificationChannel = 'whatsapp';
export type NotificationStatus = 'sent' | 'failed';

export type MemoraOrder = any;

// --- UTILS ---
export const formatPhoneToInternational = (phone: string) => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return '62' + cleaned.slice(1);
  if (!cleaned.startsWith('62')) return '62' + cleaned;
  return cleaned;
};

const formatPrice = (value: number) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

// --- GENERATOR MESSAGES ---
export const generateSellerMessage = (order: any) => {
  // Fix: Menggunakan Set<string> agar TypeScript mengenali tipe data string
  const itemTypes = [...new Set<string>(order.items.map((item: any) => item.type as string))];
  const typeLabel = itemTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' & ');

  return `Halo Admin, ada pesanan baru dari Memora.\n\nJenis Pesanan: ${typeLabel}\nKode Order: ${order.id}\nNama: ${order.customer?.name}\nTotal: ${formatPrice(order.total)}\n\nMohon siapkan pesanan.`.trim();
};

export const generateCustomerMessage = (order: any) => {
  return `Salam hangat dari Memora, ${order.customer?.name || 'Customer'}! 👋
Pesanan Anda (${order.id}) telah sukses kami terima dan diproses. Kami sangat bersemangat untuk menemani langkah Anda menjelajahi warisan budaya Surabaya. 📜💫
Sampai jumpa di lokasi, dan selamat menikmati momen berharga Anda bersama kami.`.trim()
};

// --- API FONNTE ---
const sendToFonnte = async (phone: string, message: string) => {
  const url = 'https://api.fonnte.com/send';
  const headers = new Headers();
  headers.append("Authorization", FONNTE_TOKEN);

  const data = new FormData();
  data.append('target', formatPhoneToInternational(phone));
  data.append('message', message);

  try {
    const response = await fetch(url, { method: 'POST', headers: headers, body: data });
    const result = await response.json();
    return result.status === true;
  } catch (error) {
    console.error("Gagal kirim WA via Fonnte:", error);
    return false;
  }
};

export const sendOrderNotifications = async (order: any) => {
  // Hanya kirim notifikasi jika pesanan berisi 'guide'
  const hasGuide = order.items.some((item: any) => item.type === 'guide');

  if (!hasGuide) {
    console.log("Notifikasi dilewati: Tidak ada pemesanan tour guide.");
    return [];
  }

  const notifications: any[] = [];
  
  // Kirim ke Admin
  const sellerMsg = generateSellerMessage(order);
  const sellerStatus = await sendToFonnte('6285136080344', sellerMsg);
  notifications.push({ target: 'seller', status: sellerStatus ? 'sent' : 'failed' });

  // Kirim ke Customer
  const customerMsg = generateCustomerMessage(order);
  const customerStatus = await sendToFonnte(order.customer?.phone || '', customerMsg);
  notifications.push({ target: 'customer', status: customerStatus ? 'sent' : 'failed' });

  return notifications;
};