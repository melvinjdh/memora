import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Calendar, MapPin, Ticket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useApp } from '../context/AppContext';

export const MyTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isInitializing } = useApp();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isInitializing, navigate]);

  if (isInitializing) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <p className="text-muted-foreground">Memuat tiket...</p>
        </div>
      </div>
    );
  }

  const orders = JSON.parse(localStorage.getItem('memora_orders') || '[]')
    .filter((order: any) => order.userId === user?.id)
    .filter((order: any) => Array.isArray(order.items) && order.items.some((item: any) => item.type === 'ticket'));

  const tickets = orders.flatMap((order: any) =>
    order.items
      .filter((item: any) => item.type === 'ticket')
      .map((item: any) => ({
        ...item,
        orderId: order.id,
        orderDate: order.date,
        status: order.status
      }))
  );

  if (tickets.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Tickets Yet</h2>
          <p className="text-muted-foreground mb-6">Purchase museum tickets to see them here</p>
          <Button onClick={() => navigate('/museums')}>Browse Museums</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">My Tickets</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((ticket: any, index: number) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{ticket.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{ticket.orderId}</p>
                  </div>
                  <Badge variant={ticket.status === 'confirmed' ? 'default' : 'secondary'}>
                    {ticket.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start">
                    <Calendar className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Visit Date</p>
                      <p className="font-medium">
                        {ticket.details?.visitDate
                          ? new Date(ticket.details.visitDate as string).toLocaleDateString()
                          : 'Tanggal belum tersedia'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Museum</p>
                      <p className="font-medium line-clamp-1">
                        {ticket.details?.museumName
                          ? String(ticket.details.museumName)
                          : 'Museum belum tersedia'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex-1">Show QR Code</Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Digital Ticket</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="flex justify-center rounded-lg bg-white p-6">
                          <QRCodeSVG
                            value={JSON.stringify({
                              ticketId: `${ticket.orderId}-${index}`,
                              museum: ticket.details?.museumName || 'Unknown Museum',
                              date: ticket.details?.visitDate || '',
                              type: ticket.details?.ticketType || 'General Ticket'
                            })}
                            size={200}
                            level="H"
                          />
                        </div>

                        <div className="text-center text-sm">
                          <p className="font-semibold">{ticket.name}</p>
                          <p className="text-muted-foreground">
                            {ticket.details?.visitDate
                              ? new Date(ticket.details.visitDate as string).toLocaleDateString()
                              : 'Tanggal belum tersedia'}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Show this QR code at museum entrance
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
