import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { CreditCard, Smartphone, Building2, QrCode } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, user, clearCart, isAuthenticated, isInitializing } = useApp();

  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [isProcessing, setIsProcessing] = useState(false);

  const [cardData, setCardData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const [selectedWallet, setSelectedWallet] = useState('gopay');
  const [selectedBank, setSelectedBank] = useState('bca');

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (!isInitializing && cart.length === 0) {
      navigate('/cart');
    }
  }, [isInitializing, isAuthenticated, cart.length, navigate]);

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

  const validatePayment = () => {
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

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePayment()) return;

    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const orderId = 'ORD' + Date.now();

    const paymentDetails =
      paymentMethod === 'credit-card'
        ? {
            method: 'credit-card',
            cardName: cardData.cardName,
            last4: cardData.cardNumber.slice(-4),
          }
        : paymentMethod === 'e-wallet'
        ? {
            method: 'e-wallet',
            wallet: selectedWallet,
            type: 'QRIS',
          }
        : {
            method: 'bank-transfer',
            bank: selectedBank,
            virtualAccountNumber,
          };

    const order = {
      id: orderId,
      userId: user?.id,
      date: new Date().toISOString(),
      total,
      status: 'confirmed',
      items: cart,
      paymentMethod,
      paymentDetails,
    };

    const existingOrders = JSON.parse(localStorage.getItem('memora_orders') || '[]');
    localStorage.setItem('memora_orders', JSON.stringify([...existingOrders, order]));

    clearCart();
    toast.success('Pesanan berhasil dibuat');
    navigate(`/order-confirmation/${orderId}`);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <p className="text-muted-foreground">Memuat checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-4xl font-bold">Checkout</h1>

        <form onSubmit={handleCheckout}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Kontak</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input id="name" defaultValue={user?.name} required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user?.email} required />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input id="phone" type="tel" defaultValue={user?.phone} required />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Metode Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="mb-3 flex items-center space-x-3 rounded-lg border p-4">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor="credit-card" className="flex-1 cursor-pointer">
                        Credit / Debit Card
                      </Label>
                    </div>

                    <div className="mb-3 flex items-center space-x-3 rounded-lg border p-4">
                      <RadioGroupItem value="e-wallet" id="e-wallet" />
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor="e-wallet" className="flex-1 cursor-pointer">
                        E-Wallet / QRIS
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 rounded-lg border p-4">
                      <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor="bank-transfer" className="flex-1 cursor-pointer">
                        Bank Transfer
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === 'credit-card' && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <Label htmlFor="card-name">Nama Pemilik Kartu</Label>
                        <Input
                          id="card-name"
                          placeholder="Nama sesuai kartu"
                          value={cardData.cardName}
                          onChange={(e) =>
                            setCardData((prev) => ({ ...prev, cardName: e.target.value }))
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="card-number">Nomor Kartu</Label>
                        <Input
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                          value={cardData.cardNumber}
                          onChange={(e) =>
                            setCardData((prev) => ({ ...prev, cardNumber: e.target.value }))
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Masa Berlaku</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            value={cardData.expiry}
                            onChange={(e) =>
                              setCardData((prev) => ({ ...prev, expiry: e.target.value }))
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            maxLength={3}
                            value={cardData.cvv}
                            onChange={(e) =>
                              setCardData((prev) => ({ ...prev, cvv: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'e-wallet' && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <Label>Pilih E-Wallet</Label>
                        <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                          <SelectTrigger className="mt-2">
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

                      <div className="rounded-lg border border-dashed p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <QrCode className="h-4 w-4" />
                          <p className="font-medium">Pembayaran via QRIS</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Setelah klik tombol bayar, sistem akan menyimpan pesanan dengan metode{' '}
                          <span className="font-medium uppercase">{selectedWallet}</span>.
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Untuk demo project, QR code belum dibuat dinamis, tapi alur checkout sudah berjalan.
                        </p>
                        <div className="mt-3">
                          <Badge variant="secondary">QRIS Enabled</Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'bank-transfer' && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <Label>Pilih Bank</Label>
                        <Select value={selectedBank} onValueChange={setSelectedBank}>
                          <SelectTrigger className="mt-2">
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

                      <div className="rounded-lg border p-4">
                        <p className="font-medium">Virtual Account</p>
                        <p className="mt-2 text-2xl font-bold tracking-wide">
                          {virtualAccountNumber}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Transfer ke virtual account {selectedBank.toUpperCase()} di atas untuk menyelesaikan pembayaran.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="mr-2 line-clamp-1 flex-1">{item.name}</span>
                        <span className="font-medium">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Biaya Layanan</span>
                      <span>Rp {serviceFee.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">Rp {total.toLocaleString('id-ID')}</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Memproses...' : 'Buat Pesanan'}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
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
