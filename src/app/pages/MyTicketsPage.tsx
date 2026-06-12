import React from 'react';
import { Navigate } from 'react-router';

/**
 * Halaman ini sudah digabung ke "Pesanan Saya" (/my-orders),
 * tab "Tiket Museum". Dibiarkan sebagai redirect agar route lama
 * /my-tickets tetap aman dan tidak 404.
 */
export const MyTicketsPage: React.FC = () => {
  return <Navigate to="/my-orders" replace />;
};
