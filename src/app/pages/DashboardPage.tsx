import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';
import { Ticket, ShoppingBag, User, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';
import { getOrders } from '../services/dataService'; // <-- Tambahkan import ini

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isInitializing } = useApp();
  
  // State untuk menyimpan data dari Supabase
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isInitializing, navigate]);

  // Logika pengambilan data dari Supabase
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const data = await getOrders(user.id);
        setOrders(data || []);
      } catch (error) {
        console.error("Gagal mengambil data dasbor:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isInitializing && isAuthenticated) {
      fetchDashboardData();
    }
  }, [user, isInitializing, isAuthenticated]);

  // Kalkulasi statistik dari data Supabase secara aman
  const statsData = useMemo(() => {
    let ticketCount = 0;
    let merchCount = 0;

    orders.forEach(o => {
      const items = o.order_items || o.items || [];
      items.forEach((item: any) => {
        if (item.type === 'ticket') ticketCount += (Number(item.quantity) || 1);
        if (item.type === 'merchandise') merchCount += (Number(item.quantity) || 1);
      });
    });

    return { ticketCount, merchCount, totalOrders: orders.length };
  }, [orders]);

  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <p className="text-muted-foreground">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  // Desain stat persis seperti permintaan Anda
  const stats = [
    {
      title: 'My Tickets',
      value: statsData.ticketCount,
      icon: Ticket,
      link: '/my-tickets',
      color: 'text-blue-600'
    },
    {
      title: 'Total Orders',
      value: statsData.totalOrders,
      icon: Package,
      link: '/my-orders',
      color: 'text-green-600'
    },
    {
      title: 'Merchandise Purchased',
      value: statsData.merchCount,
      icon: ShoppingBag,
      link: '/my-orders',
      color: 'text-purple-600'
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || user?.email?.split('@')[0] || 'User'}!</h1>
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
                  {orders.slice(0, 3).map((order: any) => {
                    // Kalkulasi total harga dan tanggal yang aman
                    const items = order.order_items || order.items || [];
                    const totalHarga = order.total || order.total_amount || items.reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0);
                    const orderDate = order.created_at || order.date;

                    return (
                      <div key={order.id} className="flex justify-between items-center text-sm border-b pb-2">
                        <div>
                          <p className="font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">
                            {orderDate ? new Date(orderDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                          </p>
                        </div>
                        <p className="font-semibold">Rp {totalHarga.toLocaleString('id-ID')}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};