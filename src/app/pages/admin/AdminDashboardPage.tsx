import React from 'react';
import { Users, ShoppingBag, Landmark, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { museums, products, tourGuides } from '../../data/mockData';

export const AdminDashboardPage: React.FC = () => {
  const orders = JSON.parse(localStorage.getItem('memora_orders') || '[]');
  
  const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalUsers = new Set(orders.map((o: any) => o.userId)).size;

  const stats = [
    {
      title: 'Total Revenue',
      value: `Rp ${totalRevenue.toLocaleString('id-ID')}`,
      icon: DollarSign,
      change: '+12.5%',
      color: 'text-green-600'
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingBag,
      change: '+8.2%',
      color: 'text-blue-600'
    },
    {
      title: 'Active Museums',
      value: museums.length,
      icon: Landmark,
      change: '0%',
      color: 'text-purple-600'
    },
    {
      title: 'Registered Users',
      value: totalUsers,
      icon: Users,
      change: '+15.3%',
      color: 'text-orange-600'
    },
  ];

  const salesData = [
    { month: 'Jan', sales: 12500000 },
    { month: 'Feb', sales: 15200000 },
    { month: 'Mar', sales: 18700000 },
    { month: 'Apr', sales: 21300000 },
  ];

  const ticketSalesData = [
    { museum: 'Sampoerna', tickets: 245 },
    { museum: 'Monkasel', tickets: 412 },
    { museum: '10 Nov', tickets: 328 },
    { museum: 'Mpu Tantular', tickets: 156 },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to Memora Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <div className={`p-2 rounded-full bg-muted ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>{stat.change}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => `Rp ${value.toLocaleString('id-ID')}`} />
                <Line type="monotone" dataKey="sales" stroke="#047857" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Sales by Museum</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="museum" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tickets" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
