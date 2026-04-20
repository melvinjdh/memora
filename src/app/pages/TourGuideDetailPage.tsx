import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Award,
  Calendar as CalendarIcon,
  Languages,
  Star,
  UserCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { tourGuides } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar } from '../components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';

export const TourGuideDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useApp();

  const guide = tourGuides.find((item) => item.id === id);

  const [bookingDate, setBookingDate] = useState<Date>();
  const [duration, setDuration] = useState<string>('2');
  const [showCalendar, setShowCalendar] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const resetBookingForm = () => {
    setBookingDate(undefined);
    setDuration('2');
    setShowCalendar(false);
  };

  if (!guide) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-3 text-2xl font-bold">Pemandu tidak ditemukan</h2>
          <Button onClick={() => navigate('/tour-guides')}>Kembali ke daftar pemandu</Button>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    if (!bookingDate || !duration) {
      toast.error('Pilih tanggal dan durasi terlebih dahulu');
      return;
    }

    const hours = parseInt(duration, 10);
    const totalPrice = guide.pricePerHour * hours;

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
        duration: hours,
        pricePerHour: guide.pricePerHour
      }
    });

    toast.success('Pemesanan pemandu berhasil ditambahkan ke keranjang');
    setDialogOpen(false);
    resetBookingForm();
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/tour-guides')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke daftar pemandu
        </Button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="overflow-hidden lg:col-span-1">
            <div className="relative h-80">
              <ImageWithFallback
                src={guide.photo}
                alt={guide.name}
                className="h-full w-full object-cover"
              />
            </div>
            <CardContent className="space-y-4 p-6">
              <div>
                <h1 className="text-2xl font-bold">{guide.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {guide.gender} • {guide.age} tahun
                </p>
              </div>

              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="ml-1 font-semibold">{guide.rating}</span>
                <span className="ml-1 text-sm text-muted-foreground">
                  ({guide.reviews} ulasan)
                </span>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tarif per jam</p>
                <p className="text-2xl font-bold text-primary">
                  Rp {guide.pricePerHour.toLocaleString('id-ID')}
                </p>
              </div>

              <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) {
                    resetBookingForm();
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button className="w-full">Pesan Pemandu</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Pesan {guide.name}</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 pt-4">
                    <div className="relative">
                      <Label>Tanggal Tur</Label>

                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 w-full justify-start text-left"
                        onClick={() => setShowCalendar((prev) => !prev)}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {bookingDate ? format(bookingDate, 'PPP') : 'Pilih tanggal'}
                      </Button>

                      {showCalendar && (
                        <div className="absolute z-50 mt-2 rounded-md border bg-background p-2 shadow-lg">
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
                      <Label>Durasi Tur</Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 jam</SelectItem>
                          <SelectItem value="2">2 jam</SelectItem>
                          <SelectItem value="3">3 jam</SelectItem>
                          <SelectItem value="4">4 jam</SelectItem>
                          <SelectItem value="6">6 jam (setengah hari)</SelectItem>
                          <SelectItem value="8">8 jam (seharian)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {bookingDate && (
                      <div className="border-t pt-4">
                        <div className="mb-2 flex justify-between">
                          <span>Tarif per jam</span>
                          <span>Rp {guide.pricePerHour.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="mb-2 flex justify-between">
                          <span>Durasi</span>
                          <span>{duration} jam</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-primary">
                            Rp {(guide.pricePerHour * parseInt(duration, 10)).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button className="w-full" onClick={handleBooking}>
                      Tambahkan ke Keranjang
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCircle2 className="mr-2 h-5 w-5" />
                  Profil Lengkap
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{guide.description}</p>
                <div className="rounded-lg bg-muted p-4 italic text-sm">
                  "{guide.quote}"
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Languages className="mr-2 h-5 w-5" />
                    Bahasa
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {guide.languages.map((lang) => (
                    <Badge key={lang} variant="secondary">
                      {lang}
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5" />
                    Spesialisasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {guide.specialties.map((item) => (
                    <Badge key={item}>{item}</Badge>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Museum Utama</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {guide.mainMuseums.map((museum) => (
                  <div key={museum} className="rounded-md border p-3 text-sm">
                    {museum}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review Pengunjung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {guide.reviewList.map((review, index) => (
                  <div key={review.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{review.userName}</p>
                        <div className="mt-1 flex items-center">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star
                              key={starIndex}
                              className={`h-4 w-4 ${
                                starIndex < review.rating
                                  ? 'fill-yellow-500 text-yellow-500'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                    {index < guide.reviewList.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
