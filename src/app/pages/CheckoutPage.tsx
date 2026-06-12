import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  BellRing,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  PackageCheck,
  QrCode,
  Smartphone,
  Store,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { useApp } from '../context/AppContext';
import { supabase } from '../../lib/supabase/supabase';
import { sendOrderNotifications } from '../services/notificationService';
import {
  buildMerchandisePickupItems,
  enrichOrderWithSimulation,
} from '../services/orderSimulationService';

const artsy = { fontFamily: "'ArtsyHeading', serif" } as const;
const mono = { fontFamily: "'DM Mono', ui-monospace, monospace" } as const;
const surface =
  'rounded-[1.4rem] border border-[#b59a5b]/12 bg-gradient-to-br from-[#1a4d3e] to-[#12382d] shadow-[0_22px_54px_-42px_rgba(0,0,0,.9)]';

const formatPrice = (price: number) => `Rp ${Number(price || 0).toLocaleString('id-ID')}`;

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, user, clearCart, isAuthenticated, isInitializing } = useApp();

  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentSimulation, setShowPaymentSimulation] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any>(null);

  const [customerData, setCustomerData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [cardData, setCardData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const [selectedWallet, setSelectedWallet] = useState('gopay');
  const [selectedBank, setSelectedBank] = useState('bca');
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'pickup' | 'delivery'>('pickup');

  const merchandiseItems = useMemo(
    () => cart.filter((item: any) => item.type === 'merchandise'),
    [cart]
  );

  const hasMerchandise = merchandiseItems.length > 0;

  const merchandisePickupItems = useMemo(
    () => buildMerchandisePickupItems(cart as any[]),
    [cart]
  );

  const hasGuide = useMemo(
    () => cart.some((item: any) => item.type === 'guide'),
    [cart]
  );

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (!isInitializing && cart.length === 0 && !showPaymentSimulation) {
      navigate('/cart');
    }
  }, [isInitializing, isAuthenticated, cart.length, navigate, showPaymentSimulation]);

  useEffect(() => {
    if (!user) return;

    setCustomerData((prev) => ({
      name: prev.name || user.name || '',
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || '',
    }));
  }, [user]);

  const serviceFee = 5000;
  const total = cartTotal + serviceFee;

  const virtualAccountNumber = useMemo(() => {
    const suffix = String(Date.now()).slice(-10);
    const prefixes: Record<string, string> = {
      bca: '8801',
      bni: '8802',
      bri: '8803',
      mandiri: '8804',
    };

    return `${prefixes[selectedBank] ?? '8800'}${suffix}`;
  }, [selectedBank]);

  const resetPaymentSimulation = () => {
    setShowPaymentSimulation(false);
    setPendingOrder(null);
  };

  const validateCheckout = () => {
    if (!customerData.name.trim() || !customerData.email.trim() || !customerData.phone.trim()) {
      toast.error('Lengkapi informasi kontak terlebih dahulu');
      return false;
    }

    if (hasMerchandise && fulfillmentMethod !== 'pickup') {
      toast.error('Untuk saat ini merchandise hanya bisa diambil langsung di lokasi pengambilan.');
      return false;
    }

    if (paymentMethod === 'credit-card') {
      if (
        !cardData.cardName.trim() ||
        !cardData.cardNumber.trim() ||
        !cardData.expiry.trim() ||
        !cardData.cvv.trim()
      ) {
        toast.error('Lengkapi data kartu terlebih dahulu');
        return false;
      }
    }

    if (paymentMethod === 'e-wallet' && !selectedWallet) {
      toast.error('Pilih e-wallet terlebih dahulu');
      return false;
    }

    if (paymentMethod === 'bank-transfer' && !selectedBank) {
      toast.error('Pilih bank terlebih dahulu');
      return false;
    }

    return true;
  };

  const buildPaymentDetails = () => {
    if (paymentMethod === 'credit-card') {
      return {
        method: 'credit-card',
        label: 'Credit / Debit Card',
        cardName: cardData.cardName,
        last4: cardData.cardNumber.replace(/\s/g, '').slice(-4),
      };
    }

    if (paymentMethod === 'e-wallet') {
      return {
        method: 'e-wallet',
        label: 'E-Wallet / QRIS',
        wallet: selectedWallet,
        type: 'QRIS',
      };
    }

    return {
      method: 'bank-transfer',
      label: 'Bank Transfer',
      bank: selectedBank,
      virtualAccountNumber,
    };
  };

  const buildOrder = (status: 'confirmed' | 'pending_payment_simulation') => {
    const now = new Date().toISOString();
    const orderId = 'ORD' + Date.now();

    return {
      id: orderId,
      userId: user?.id,
      customer: {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
      },
      date: now,
      total,
      status,
      paidAt: status === 'confirmed' ? now : null,
      items: cart,
      paymentMethod,
      paymentDetails: buildPaymentDetails(),
      fulfillment: hasMerchandise
        ? {
            method: fulfillmentMethod,
            label: fulfillmentMethod === 'pickup' ? 'Ambil sesuai lokasi produk' : 'Delivery',
            status: fulfillmentMethod === 'pickup' ? 'preparing' : 'delivery_coming_soon',
            items: merchandisePickupItems,
            pickupOutlet: merchandisePickupItems[0]?.pickup.type,
            pickupOutletName: merchandisePickupItems[0]?.pickup.name,
            pickupLocation: merchandisePickupItems[0]?.pickup.location,
            deliveryStatus: fulfillmentMethod === 'delivery' ? 'coming-soon' : undefined,
            updatedAt: now,
          }
        : null,
      guideBooking: hasGuide
        ? {
            status: 'waiting_confirmation',
            updatedAt: now,
          }
        : null,
      notifications: [],
    };
  };

  // AMAN DI EKSEKUSI: Proses pemindahan data orisinal ke pangkalan data Supabase
  const savePaidOrder = async (order: any) => {
    const paidAt = new Date().toISOString();

    const paidOrder = {
      ...order,
      status: 'confirmed',
      paidAt,
      paymentSimulation: {
        success: true,
        simulatedAt: paidAt,
      },
    };

    // --- INTEGRASI NOTIFIKASI OTOMATIS ---
    const notifications = await sendOrderNotifications(paidOrder);

    const finalOrder = enrichOrderWithSimulation({
      ...paidOrder,
      notifications,
    });

    try {
      // 1. Memasukkan baris utama ke tabel "orders"
      const { data: insertedOrder, error: orderError } = await supabase.from('orders')
        .insert({
          user_id: user?.id,
          total: finalOrder.total,
          status: 'confirmed',
          payment_status: 'paid',
          fulfillment: finalOrder.fulfillment,
          guide_booking: finalOrder.guideBooking
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Memasukkan daftar komoditas belanjaan ke tabel "order_items"
      const { error: itemsError } = await supabase.from('order_items').insert(
        finalOrder.items.map((it: any) => ({
          order_id: insertedOrder.id,
          type: it.type,
          name: it.name,
          quantity: it.quantity,
          price: it.price,
          details: it.details
        }))
      );

      if (itemsError) throw itemsError;

      // 3. Menyimpan pemesanan pemandu ke tabel guide_bookings (untuk mencegah konflik jam)
      const guideItems = finalOrder.items.filter((it: any) => it.type === 'guide' && it.details);
      if (guideItems.length > 0) {
        const guideBookings = guideItems.map((it: any) => ({
          guide_id: it.details.guideId,
          user_id: user?.id,
          booking_date: it.details.bookingDate || new Date(it.details.date).toISOString().split('T')[0],
          start_hour: it.details.startHour,
          duration_hours: it.details.duration,
          museum: it.details.museum,
          status: 'confirmed',
        }));

        const { error: bookingError } = await supabase
          .from('guide_bookings')
          .insert(guideBookings);

        if (bookingError) {
          console.error('Gagal menyimpan booking pemandu:', bookingError);
          toast.warning('Pesanan berhasil, namun slot pemandu mungkin belum terkunci.');
        }
      }

      clearCart();
      toast.success('Pembayaran berhasil diproses dan disimpan.');
      navigate(`/order-confirmation/${insertedOrder.id}`); // Melempar ID unik database ke halaman konfirmasi
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal memasukkan data pesanan ke database: ' + err.message);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCheckout()) return;

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    if (paymentMethod === 'e-wallet' || paymentMethod === 'bank-transfer') {
      const order = buildOrder('pending_payment_simulation');
      setPendingOrder(order);
      setShowPaymentSimulation(true);
      setIsProcessing(false);
      return;
    }

    const order = buildOrder('confirmed');
    await savePaidOrder(order);
    setIsProcessing(false);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0a1f1a] px-5 py-12 text-[#f0ebe3]">
        <div className="mx-auto max-w-4xl">
          <p className="text-[#a09a90]">Memuat checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(181,154,91,0.13),transparent_24rem),linear-gradient(180deg,#0d2b23_0%,#0a1f1a_46%,#061612_100%)] px-5 py-8 text-[#f0ebe3] md:px-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#b59a5b]/75" style={mono}>
          Memora Checkout
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.04em] md:text-4xl" style={artsy}>
          Checkout
        </h1>

        <form onSubmit={handleCheckout} className="mt-7">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="space-y-6 lg:col-span-2">
              <Card className={surface}>
                <CardHeader>
                  <CardTitle className="text-[#f0ebe3]">Informasi Kontak</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name" className="text-[#c8c2b8]">Nama Lengkap</Label>
                      <Input
                        id="name"
                        value={customerData.name}
                        onChange={(e) => setCustomerData((prev) => ({ ...prev, name: e.target.value }))}
                        className="mt-2 border-[#b59a5b]/20 bg-[#0a1f1a]/40 text-[#f0ebe3]"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-[#c8c2b8]">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerData.email}
                        onChange={(e) => setCustomerData((prev) => ({ ...prev, email: e.target.value }))}
                        className="mt-2 border-[#b59a5b]/20 bg-[#0a1f1a]/40 text-[#f0ebe3]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-[#c8c2b8]">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="mt-2 border-[#b59a5b]/20 bg-[#0a1f1a]/40 text-[#f0ebe3]"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {hasMerchandise && (
                <Card className={surface}>
                  <CardHeader>
                    <CardTitle className="text-[#f0ebe3]">Pengambilan Merchandise</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup
                      value={fulfillmentMethod}
                      onValueChange={(value) => setFulfillmentMethod(value as 'pickup' | 'delivery')}
                      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                    >
                      <div className="rounded-2xl border border-[#b59a5b]/30 bg-[#0a1f1a]/45 p-4">
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                          <div className="min-w-0 flex-1">
                            <Label htmlFor="pickup" className="flex cursor-pointer items-center gap-2 font-bold text-[#f0ebe3]">
                              <Store className="h-4 w-4 text-[#b59a5b]" />
                              Ambil di Lokasi
                            </Label>
                            <p className="mt-1 text-xs leading-relaxed text-[#a09a90]">
                              Produk lokal diambil di outlet pameran. Merchandise museum diambil langsung di museum terkait.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#f0ebe3]/10 bg-[#0a1f1a]/25 p-4 opacity-60">
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="delivery" id="delivery" disabled className="mt-1" />
                          <div className="min-w-0 flex-1">
                            <Label htmlFor="delivery" className="flex items-center gap-2 font-bold text-[#c8c2b8]">
                              <Truck className="h-4 w-4" />
                              Delivery
                              <Badge variant="secondary" className="ml-auto text-[10px]">Segera hadir</Badge>
                            </Label>
                            <p className="mt-1 text-xs leading-relaxed text-[#a09a90]">
                              Pengiriman ke alamat customer masih dalam tahap pengembangan.
                            </p>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>

                    <div className="rounded-2xl border border-[#b59a5b]/15 bg-[#0a1f1a]/35 p-4 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b59a5b]" style={mono}>
                        Lokasi Pengambilan
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-[#c8c2b8]">
                        Lokasi pickup ditentukan otomatis berdasarkan jenis merchandise.
                      </p>

                      <div className="mt-4 space-y-3">
                        {merchandisePickupItems.map((item) => (
                          <div
                            key={item.itemId}
                            className="rounded-2xl border border-[#b59a5b]/12 bg-[#061612]/35 p-4"
                          >
                            <p className="text-sm font-bold leading-snug text-[#f0ebe3]">
                              {item.productName} x{item.quantity}
                            </p>
                            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b59a5b]" style={mono}>
                              {item.pickup.label}
                            </p>
                            <p className="mt-1 text-sm font-semibold leading-snug text-[#f0ebe3]">
                              {item.pickup.name}
                            </p>
                            <p className="mt-0.5 text-xs leading-relaxed text-[#a09a90]">
                              {item.pickup.location}
                            </p>
                          </div>
                        ))}
                      </div>

                      <p className="mt-4 text-xs leading-relaxed text-[#a09a90]">
                        Setelah pembayaran berhasil, status merchandise menjadi <span className="font-semibold text-[#c9ad6e]">Sedang disiapkan</span>, lalu otomatis berubah menjadi <span className="font-semibold text-[#c9ad6e]">Siap diambil</span> setelah beberapa detik untuk simulasi demo.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className={surface}>
                <CardHeader>
                  <CardTitle className="text-[#f0ebe3]">Metode Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => {
                      setPaymentMethod(value);
                      resetPaymentSimulation();
                    }}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 rounded-2xl border border-[#b59a5b]/15 bg-[#0a1f1a]/35 p-4">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <CreditCard className="h-5 w-5 text-[#b59a5b]" />
                      <Label htmlFor="credit-card" className="flex-1 cursor-pointer text-[#f0ebe3]">
                        Credit / Debit Card
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 rounded-2xl border border-[#b59a5b]/15 bg-[#0a1f1a]/35 p-4">
                      <RadioGroupItem value="e-wallet" id="e-wallet" />
                      <Smartphone className="h-5 w-5 text-[#b59a5b]" />
                      <Label htmlFor="e-wallet" className="flex-1 cursor-pointer text-[#f0ebe3]">
                        E-Wallet / QRIS
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 rounded-2xl border border-[#b59a5b]/15 bg-[#0a1f1a]/35 p-4">
                      <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                      <Building2 className="h-5 w-5 text-[#b59a5b]" />
                      <Label htmlFor="bank-transfer" className="flex-1 cursor-pointer text-[#f0ebe3]">
                        Bank Transfer
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === 'credit-card' && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <Label htmlFor="card-name" className="text-[#c8c2b8]">Nama Pemilik Kartu</Label>
                        <Input
                          id="card-name"
                          placeholder="Nama sesuai kartu"
                          value={cardData.cardName}
                          onChange={(e) => setCardData((prev) => ({ ...prev, cardName: e.target.value }))}
                          className="mt-2 border-[#b59a5b]/20 bg-[#0a1f1a]/40 text-[#f0ebe3] placeholder:text-[#a09a90]"
                        />
                      </div>

                      <div>
                        <Label htmlFor="card-number" className="text-[#c8c2b8]">Nomor Kartu</Label>
                        <Input
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                          value={cardData.cardNumber}
                          onChange={(e) => setCardData((prev) => ({ ...prev, cardNumber: e.target.value }))}
                          className="mt-2 border-[#b59a5b]/20 bg-[#0a1f1a]/40 text-[#f0ebe3] placeholder:text-[#a09a90]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry" className="text-[#c8c2b8]">Masa Berlaku</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            value={cardData.expiry}
                            onChange={(e) => setCardData((prev) => ({ ...prev, expiry: e.target.value }))}
                            className="mt-2 border-[#b59a5b]/20 bg-[#0a1f1a]/40 text-[#f0ebe3] placeholder:text-[#a09a90]"
                          />
                        </div>

                        <div>
                          <Label htmlFor="cvv" className="text-[#c8c2b8]">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            maxLength={3}
                            value={cardData.cvv}
                            onChange={(e) => setCardData((prev) => ({ ...prev, cvv: e.target.value }))}
                            className="mt-2 border-[#b59a5b]/20 bg-[#0a1f1a]/40 text-[#f0ebe3] placeholder:text-[#a09a90]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'e-wallet' && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <Label className="text-[#c8c2b8]">Pilih E-Wallet</Label>
                        <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                          <SelectTrigger className="mt-2 border-[#b59a5b]/20 bg-[#0a1f1a]/40 text-[#f0ebe3]">
                            <SelectValue placeholder="Pilih e-wallet" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gopay">GoPay</SelectItem>
                            <SelectItem value="ovo">OVO</SelectItem>
                            <SelectItem value="dana">DANA</SelectItem>
                            <SelectItem value="shopeepay">ShopeePay</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="rounded-2xl border border-dashed border-[#b59a5b]/25 bg-[#0a1f1a]/30 p-4">
                        <div className="mb-2 flex items-center gap-2 text-[#f0ebe3]">
                          <QrCode className="h-4 w-4 text-[#b59a5b]" />
                          <p className="font-medium">Pembayaran via QRIS</p>
                        </div>
                        <p className="text-sm leading-relaxed text-[#a09a90]">
                          Setelah klik tombol bayar, QRIS demo akan muncul. Klik simulasi pembayaran untuk mengubah status menjadi berhasil.
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'bank-transfer' && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <Label className="text-[#c8c2b8]">Pilih Bank</Label>
                        <Select value={selectedBank} onValueChange={setSelectedBank}>
                          <SelectTrigger className="mt-2 border-[#b59a5b]/20 bg-[#0a1f1a]/40 text-[#f0ebe3]">
                            <SelectValue placeholder="Pilih bank" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bca">BCA</SelectItem>
                            <SelectItem value="bni">BNI</SelectItem>
                            <SelectItem value="bri">BRI</SelectItem>
                            <SelectItem value="mandiri">Mandiri</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="rounded-2xl border border-[#b59a5b]/15 bg-[#0a1f1a]/35 p-4">
                        <p className="font-medium text-[#f0ebe3]">Virtual Account</p>
                        <p className="mt-2 break-all text-2xl font-bold tracking-wide text-[#c9ad6e]">
                          {virtualAccountNumber}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[#a09a90]">
                          Transfer ke virtual account {selectedBank.toUpperCase()} di atas untuk menyelesaikan pembayaran demo.
                        </p>
                      </div>
                    </div>
                  )}

                  {showPaymentSimulation && (
                    <Card className="mt-6 border-[#b59a5b]/30 bg-[#0a1f1a]/45">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#f0ebe3]">
                          <Clock3 className="h-5 w-5 text-[#c9ad6e]" />
                          Simulasi Pembayaran
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {paymentMethod === 'e-wallet' && (
                          <div className="rounded-2xl border border-[#b59a5b]/15 p-4 text-center">
                            <QrCode className="mx-auto mb-3 h-20 w-20 text-[#c9ad6e]" />
                            <p className="font-semibold text-[#f0ebe3]">QRIS - {selectedWallet.toUpperCase()}</p>
                            <p className="mt-2 text-sm text-[#a09a90]">Klik tombol di bawah untuk mensimulasikan pembayaran berhasil.</p>
                          </div>
                        )}

                        {paymentMethod === 'bank-transfer' && (
                          <div className="rounded-2xl border border-[#b59a5b]/15 p-4">
                            <p className="font-semibold text-[#f0ebe3]">Virtual Account</p>
                            <p className="mt-2 break-all text-2xl font-bold text-[#c9ad6e]">{virtualAccountNumber}</p>
                            <p className="mt-2 text-sm text-[#a09a90]">Bank {selectedBank.toUpperCase()}</p>
                          </div>
                        )}

                        <Button
                          type="button"
                          className="w-full bg-[#b59a5b] font-bold text-[#0a1f1a] hover:bg-[#c9ad6e]"
                          disabled={isProcessing}
                          onClick={async () => {
                            if (!pendingOrder) return;
                            await savePaidOrder(pendingOrder);
                          }}
                        >
                          {isProcessing ? 'Memproses Simulasi...' : 'Simulasikan Pembayaran Berhasil'}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* KANAN: Bilah Samping Ringkasan Pesanan Orisinal */}
            <div>
              <Card className={`${surface} sticky top-24`}>
                <CardHeader>
                  <CardTitle className="text-[#f0ebe3]">Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {cart.map((item: any) => (
                      <div key={item.id} className="flex justify-between gap-3 text-sm">
                        <span className="line-clamp-2 flex-1 text-[#c8c2b8]">{item.name}</span>
                        <span className="shrink-0 font-medium text-[#f0ebe3]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-[#b59a5b]/12" />

                  <div className="space-y-2 text-sm text-[#c8c2b8]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Biaya Layanan</span>
                      <span>{formatPrice(serviceFee)}</span>
                    </div>
                  </div>

                  <Separator className="bg-[#b59a5b]/12" />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[#c9ad6e]">{formatPrice(total)}</span>
                  </div>

                  <div className="space-y-2 rounded-2xl border border-[#b59a5b]/15 bg-[#0a1f1a]/35 p-3 text-xs text-[#a09a90]">
                    <div className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#c9ad6e]" />
                      <span>Pembayaran demo akan disimpan sebagai berhasil.</span>
                    </div>
                    {hasMerchandise && (
                      <div className="flex gap-2">
                        <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#c9ad6e]" />
                        <span>Status merchandise akan otomatis berubah dari disiapkan menjadi siap diambil.</span>
                      </div>
                    )}
                    {hasGuide && (
                      <div className="flex gap-2">
                        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#c9ad6e]" />
                        <span>Status pemandu akan otomatis berubah menjadi terkonfirmasi.</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-[#c9ad6e]" />
                      <span>Notifikasi WhatsApp otomatis masih disimulasikan dari frontend.</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#b59a5b] font-bold text-[#0a1f1a] hover:bg-[#c9ad6e]"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Memproses...' : 'Buat Pesanan'}
                  </Button>

                  <p className="text-center text-xs leading-relaxed text-[#a09a90]">
                    Dengan melanjutkan, kamu menyetujui proses pemesanan di Memora.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};