import React from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { products } from '../../data/mockData';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

export const AdminProductsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a1f1a] p-8 text-[#f0ebe3]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#c9ad6e] mb-2" style={{ fontFamily: "'ArtsyHeading', serif" }}>Products Management</h1>
          <p className="text-[#a09a90] text-lg">Manage merchandise and inventory</p>
        </div>
        <Button className="bg-[#b59a5b] text-[#0a1f1a] hover:bg-[#c9ad6e]">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card className="border-[#b59a5b]/20 bg-[#0d2b23] shadow-2xl overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#12382d] border-b border-[#b59a5b]/20">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[#c9ad6e] font-semibold py-4 uppercase tracking-wider text-xs">Product</TableHead>
                  <TableHead className="text-[#c9ad6e] font-semibold py-4 uppercase tracking-wider text-xs">Category</TableHead>
                  <TableHead className="text-[#c9ad6e] font-semibold py-4 uppercase tracking-wider text-xs">Price</TableHead>
                  <TableHead className="text-[#c9ad6e] font-semibold py-4 uppercase tracking-wider text-xs">Stock</TableHead>
                  <TableHead className="text-[#c9ad6e] font-semibold py-4 uppercase tracking-wider text-xs">Museum</TableHead>
                  <TableHead className="text-right text-[#c9ad6e] font-semibold py-4 uppercase tracking-wider text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-[#b59a5b]/10">
                {products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-[#1a4d3e]/50 transition-colors duration-200 border-[#b59a5b]/10">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover border border-[#b59a5b]/30"
                        />
                        <span className="font-medium text-[#f0ebe3]">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="inline-flex items-center rounded-full border border-[#b59a5b]/20 bg-[#1a4d3e]/50 px-2.5 py-0.5 text-[10px] uppercase font-semibold text-[#c8c2b8]">
                        {product.category}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-[#f0ebe3] py-4">
                      Rp {product.price.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${product.stock < 10 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                        {product.stock} units
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-[#a09a90] max-w-xs truncate py-4">
                      {product.museum}
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" className="hover:bg-[#1a4d3e] text-[#c8c2b8] hover:text-[#f0ebe3]">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="hover:bg-red-500/20 text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
