import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';

export const AdminOrdersPage: React.FC = () => {
  const orders = JSON.parse(localStorage.getItem('memora_orders') || '[]')
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Orders Management</h1>
        <p className="text-muted-foreground">View and manage customer orders</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No orders yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{order.items.length} items</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      Rp {order.total.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'confirmed' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
