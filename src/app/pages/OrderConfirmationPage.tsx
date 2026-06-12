import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { CheckCircle, Package, Ticket } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const orders = JSON.parse(localStorage.getItem('memora_orders') || '[]');
  const order = orders.find((o: any) => o.id === orderId);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-muted/30">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for your purchase. Your order has been successfully placed.
            </p>

            <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-semibold">{order.id}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-semibold">{new Date(order.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold text-primary">Rp {order.total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full" onClick={() => navigate('/my-tickets')}>
                <Ticket className="mr-2 h-4 w-4" />
                View My Tickets
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/my-orders')}>
                <Package className="mr-2 h-4 w-4" />
                View All Orders
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
