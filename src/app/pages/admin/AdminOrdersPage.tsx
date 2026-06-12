import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { supabase } from '../../../lib/supabase/supabase'; 
import { buildOrderStatusUpdatePayload } from '../../services/orderSimulationService';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    // Kita ambil semua pesanan tanpa filter user_id agar Admin bisa melihat semuanya
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Gagal mengambil data: ' + error.message);
    } else {
      setOrders(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const currentOrder = orders.find((order) => order.id === orderId);
    const payload = buildOrderStatusUpdatePayload(currentOrder, newStatus);

    const { error } = await supabase
      .from('orders')
      .update(payload)
      .eq('id', orderId);

    if (error) {
      toast.error('Gagal update status: ' + error.message);
    } else {
      toast.success('Status diperbarui');
      fetchOrders(); // Refresh data setelah update
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'confirmed': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1f1a] p-8 text-[#f0ebe3]">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-[#c9ad6e] mb-2" style={{ fontFamily: "'ArtsyHeading', serif" }}>Orders Management</h1>
        <p className="text-[#a09a90] text-lg">Pantau dan kelola semua pesanan pelanggan dari satu dasbor yang terpusat.</p>
      </div>

      <Card className="border-[#b59a5b]/20 bg-[#0d2b23] shadow-2xl overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#b59a5b] border-t-transparent"></div>
                <p className="text-[#a09a90]">Memuat data pesanan...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-16 text-center text-[#a09a90] flex flex-col items-center">
              <div className="mb-4 rounded-full bg-[#1a4d3e] p-4 text-[#b59a5b]">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <h3 className="text-xl font-medium text-[#f0ebe3]">Belum ada pesanan</h3>
              <p className="mt-1">Pesanan yang masuk akan otomatis tampil di sini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#12382d] border-b border-[#b59a5b]/20">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[#c9ad6e] font-semibold py-4 uppercase tracking-wider text-xs">Order ID</TableHead>
                    <TableHead className="text-[#c9ad6e] font-semibold py-4 uppercase tracking-wider text-xs">Tanggal</TableHead>
                    <TableHead className="text-[#c9ad6e] font-semibold py-4 uppercase tracking-wider text-xs">Total Pembayaran</TableHead>
                    <TableHead className="text-[#c9ad6e] font-semibold py-4 uppercase tracking-wider text-xs">Status Saat Ini</TableHead>
                    <TableHead className="text-[#c9ad6e] font-semibold py-4 uppercase tracking-wider text-xs">Aksi Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-[#b59a5b]/10">
                  {orders.map((order: any, index: number) => (
                    <TableRow key={order.id} className="hover:bg-[#1a4d3e]/50 transition-colors duration-200 border-[#b59a5b]/10">
                      <TableCell className="font-mono text-sm text-[#c8c2b8] py-4">{order.id.slice(0, 8).toUpperCase()}</TableCell>
                      <TableCell className="text-[#c8c2b8] py-4">{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                      <TableCell className="font-medium text-[#f0ebe3] py-4">Rp {order.total.toLocaleString('id-ID')}</TableCell>
                      <TableCell className="py-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <Select value={order.status || 'pending'} onValueChange={(val) => updateOrderStatus(order.id, val)}>
                          <SelectTrigger className="w-[180px] bg-[#0a1f1a] border-[#b59a5b]/30 text-[#f0ebe3] focus:ring-[#b59a5b]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0d2b23] border-[#b59a5b]/30 text-[#f0ebe3]">
                            <SelectItem value="pending" className="focus:bg-[#1a4d3e] focus:text-[#f0ebe3]">Pending - Disiapkan</SelectItem>
                            <SelectItem value="confirmed" className="focus:bg-[#1a4d3e] focus:text-[#f0ebe3]">Confirmed - Bisa Diambil</SelectItem>
                            <SelectItem value="completed" className="focus:bg-[#1a4d3e] focus:text-[#f0ebe3]">Completed - Selesai</SelectItem>
                            <SelectItem value="cancelled" className="text-red-400 focus:bg-red-500/20 focus:text-red-300">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
