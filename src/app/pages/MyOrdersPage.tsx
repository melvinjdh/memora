import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';

export const MyOrdersPage: React.FC = () => {
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
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-muted-foreground">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  const orders = JSON.parse(localStorage.getItem('memora_orders') || '[]')
    .filter((order: any) => order.userId === user?.id)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
          <p className="text-muted-foreground mb-6">Start exploring and make your first purchase</p>
          <Button onClick={() => navigate('/museums')}>Browse Museums</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order {order.id}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant={order.status === 'confirmed' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {Array.isArray(order.items) &&
                    order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-muted-foreground capitalize">
                            {item.type} x {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))}
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary text-lg">
                    Rp {order.total.toLocaleString('id-ID')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
