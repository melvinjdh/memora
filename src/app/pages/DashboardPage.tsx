import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router';
import { Ticket, ShoppingBag, User, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isInitializing } = useApp();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
    }
  }, [isAuthenticated, isInitializing, location.pathname, navigate]);

  if (isInitializing) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <p className="text-muted-foreground">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const orders = JSON.parse(localStorage.getItem('memora_orders') || '[]').filter(
    (order: any) => order.userId === user?.id
  );

  const stats = [
    {
      title: 'My Tickets',
      value: orders.filter((o: any) => o.items.some((i: any) => i.type === 'ticket')).length,
      icon: Ticket,
      link: '/my-tickets',
      color: 'text-blue-600'
    },
    {
      title: 'Total Orders',
      value: orders.length,
      icon: Package,
      link: '/my-orders',
      color: 'text-green-600'
    },
    {
      title: 'Merchandise Purchased',
      value: orders.filter((o: any) => o.items.some((i: any) => i.type === 'merchandise')).length,
      icon: ShoppingBag,
      link: '/my-orders',
      color: 'text-purple-600'
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Manage your bookings and explore more museums</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} to={stat.link}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/museums')}>
                <Ticket className="mr-2 h-4 w-4" />
                Browse Museums
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/merchandise')}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Shop Merchandise
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order: any) => (
                    <div key={order.id} className="flex justify-between items-center text-sm border-b pb-2">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-semibold">Rp {order.total.toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
