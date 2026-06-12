import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Star, Languages, Award, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar } from '../components/ui/calendar';
import { tourGuides } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const TourGuidesPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useApp();
  const [selectedGuide, setSelectedGuide] = useState<typeof tourGuides[0] | null>(null);
  const [bookingDate, setBookingDate] = useState<Date>();
  const [duration, setDuration] = useState<string>('2');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const resetBookingForm = () => {
    setBookingDate(undefined);
    setDuration('2');
    setShowCalendar(false);
  };

  const handleBooking = () => {
    if (!selectedGuide || !bookingDate || !duration) {
      toast.error('Lengkapi detail pemesanan terlebih dahulu');
      return;
    }

    const hours = parseInt(duration, 10);
    const totalPrice = selectedGuide.pricePerHour * hours;

    addToCart({
      id: `guide-${selectedGuide.id}-${bookingDate.getTime()}`,
      type: 'guide',
      name: `Pemandu Wisata: ${selectedGuide.name}`,
      price: totalPrice,
      quantity: 1,
      details: {
        guideId: selectedGuide.id,
        guideName: selectedGuide.name,
        date: bookingDate.toISOString(),
        duration: hours,
        pricePerHour: selectedGuide.pricePerHour
      }
    });

    toast.success('Pemesanan pemandu berhasil ditambahkan ke keranjang');
    setDialogOpen(false);
    resetBookingForm();
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Pemandu Wisata</h1>
          <p className="text-muted-foreground">
            Pilih pemandu wisata profesional untuk pengalaman kunjungan museum yang lebih lengkap
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {tourGuides.map((guide) => (
            <Card key={guide.id} className="overflow-hidden">
              <div className="relative h-64">
                <ImageWithFallback
                  src={guide.photo}
                  alt={guide.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <CardContent className="p-5">
                <h3 className="text-lg font-semibold">{guide.name}</h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  {guide.gender} • {guide.age} tahun
                </p>

                <div className="mb-3 flex items-center">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="ml-1 font-semibold">{guide.rating}</span>
                  <span className="ml-1 text-sm text-muted-foreground">
                    ({guide.reviews})
                  </span>
                </div>

                <div className="mb-3 space-y-2">
                  <div className="flex items-start">
                    <Languages className="mr-2 mt-0.5 h-4 w-4 text-primary" />
                    <div className="flex flex-wrap gap-1">
                      {guide.languages.slice(0, 2).map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Award className="mr-2 mt-0.5 h-4 w-4 text-primary" />
                    <div className="text-sm text-muted-foreground">
                      {guide.specialties.slice(0, 2).join(', ')}
                    </div>
                  </div>
                </div>

                <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                  {guide.description}
                </p>

                <div className="mb-4">
                  <span className="text-sm text-muted-foreground">Tarif per jam</span>
                  <p className="font-bold text-primary">
                    Rp {guide.pricePerHour.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button variant="outline" onClick={() => navigate(`/tour-guides/${guide.id}`)}>
                    Lihat Profil
                  </Button>

                  <Dialog
                    open={dialogOpen && selectedGuide?.id === guide.id}
                    onOpenChange={(open) => {
                      setDialogOpen(open);

                      if (open) {
                        setSelectedGuide(guide);
                        resetBookingForm();
                      } else {
                        resetBookingForm();
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button>Pesan Sekarang</Button>
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

                          <p className="mt-1 text-xs text-muted-foreground">
                            Tanggal bisa dipilih mulai hari ini dan seterusnya
                          </p>
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

                        {bookingDate && duration && (
                          <div className="border-t pt-4">
                            <div className="mb-2 flex justify-between">
                              <span>Tarif per jam:</span>
                              <span>Rp {guide.pricePerHour.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="mb-2 flex justify-between">
                              <span>Durasi:</span>
                              <span>{duration} jam</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                              <span>Total:</span>
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
