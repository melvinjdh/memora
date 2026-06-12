import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  MapPin, Clock, Ticket, Bus, Car, Train, UtensilsCrossed, 
  Wifi, Coffee, ParkingCircle, Accessibility, ChevronRight, Plus, Minus
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { museums } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { Calendar } from '../components/ui/calendar';
import { format } from 'date-fns';

export const MuseumDetailPage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useApp();
  
  const museum = museums.find(m => m.slug === slug);
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [visitDate, setVisitDate] = useState<Date>();
  const [showCalendar, setShowCalendar] = useState(false);

  if (!museum) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Museum Not Found</h2>
          <Button onClick={() => navigate('/museums')}>Back to Museums</Button>
        </div>
      </div>
    );
  }

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
      toast.error('Please select a visit date');
      return;
    }

    const ticketItems = Object.entries(selectedTickets).map(([ticketId, quantity]) => {
      const ticket = museum.tickets.find(t => t.id === ticketId)!;
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
    toast.success(`Added ${ticketItems.reduce((sum, item) => sum + item.quantity, 0)} ticket(s) to cart`);
    setSelectedTickets({});
  };

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(selectedTickets).reduce((sum, [ticketId, qty]) => {
    const ticket = museum.tickets.find(t => t.id === ticketId);
    return sum + (ticket?.price || 0) * qty;
  }, 0);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[400px] overflow-hidden">
        <ImageWithFallback
          src={museum.heroImage}
          alt={museum.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2">{museum.name}</h1>
            <div className="flex items-center text-white/90">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{museum.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About This Museum</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{museum.description}</p>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">History</h3>
                  <p className="text-sm text-muted-foreground">{museum.history}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="facilities" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="facilities">Facilities</TabsTrigger>
                <TabsTrigger value="transport">How to Get There</TabsTrigger>
                <TabsTrigger value="nearby">Nearby</TabsTrigger>
              </TabsList>
              
              <TabsContent value="facilities" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      {museum.facilities.map((facility, index) => {
                        const Icon = facilityIcons[facility] || ChevronRight;
                        return (
                          <div key={index} className="flex items-center space-x-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="text-sm">{facility}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="transport" className="mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Bus className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">Public Transport</h4>
                      </div>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {museum.transportation.publicTransport.map((route, index) => (
                          <li key={index}>{route}</li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Train className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">Ride-Hailing</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{museum.transportation.ridehailing}</p>
                    </div>
                    <Separator />
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Car className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">Private Vehicle</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{museum.transportation.privateVehicle}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="nearby" className="mt-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <UtensilsCrossed className="h-5 w-5 mr-2 text-primary" />
                        Nearby Dining
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {museum.nearbyDining.map((place, index) => (
                          <div key={index} className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{place.name}</p>
                              <p className="text-xs text-muted-foreground">{place.type}</p>
                            </div>
                            <Badge variant="outline">{place.distance}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Public Facilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {museum.nearbyFacilities.map((facility, index) => (
                          <div key={index} className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{facility.name}</p>
                              <p className="text-xs text-muted-foreground">{facility.type}</p>
                            </div>
                            <Badge variant="outline">{facility.distance}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {museum.operatingHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{schedule.day}</span>
                      <span className="font-medium">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tickets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Ticket className="h-5 w-5 mr-2 text-primary" />
                  Purchase Tickets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
  <label className="text-sm font-medium mb-2 block">Tanggal Kunjungan</label>

  <Button
    type="button"
    variant="outline"
    className="w-full justify-start text-left font-normal"
    onClick={() => setShowCalendar(!showCalendar)}
  >
    {visitDate ? format(visitDate, 'PPP') : 'Pilih tanggal kunjungan'}
  </Button>

  {showCalendar && (
    <div className="absolute z-50 mt-2 rounded-md border bg-background shadow-lg p-2">
      <Calendar
        mode="single"
        selected={visitDate}
        onSelect={(date) => {
          setVisitDate(date);
          setShowCalendar(false);
        }}
        disabled={(date) => date < new Date()}
      />
    </div>
  )}
</div>
                {museum.tickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{ticket.type}</h4>
                        <p className="text-xs text-muted-foreground">{ticket.description}</p>
                      </div>
                      <p className="font-bold text-primary">
                        {ticket.price === 0 ? 'Free' : `Rp ${ticket.price.toLocaleString('id-ID')}`}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateTicketQuantity(ticket.id, -1)}
                          disabled={!selectedTickets[ticket.id]}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{selectedTickets[ticket.id] || 0}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateTicketQuantity(ticket.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {totalTickets > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Tickets:</span>
                        <span className="font-semibold">{totalTickets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Price:</span>
                        <span className="font-bold text-primary text-lg">
                          Rp {totalPrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleAddToCart}>
                      Add to Cart
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
