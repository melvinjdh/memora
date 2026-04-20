import { createBrowserRouter } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { AdminLayout } from './layouts/AdminLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('./pages/HomePage')).HomePage }) },
      { path: 'museums', lazy: async () => ({ Component: (await import('./pages/MuseumsPage')).MuseumsPage }) },
      { path: 'museums/:slug', lazy: async () => ({ Component: (await import('./pages/MuseumDetailPage')).MuseumDetailPage }) },
      { path: 'merchandise', lazy: async () => ({ Component: (await import('./pages/MerchandisePage')).MerchandisePage }) },
      { path: 'tour-guides', lazy: async () => ({ Component: (await import('./pages/TourGuidesPage')).TourGuidesPage }) },
      { path: 'tour-guides/:id', lazy: async () => ({ Component: (await import('./pages/TourGuideDetailPage')).TourGuideDetailPage }) },
      { path: 'cart', lazy: async () => ({ Component: (await import('./pages/CartPage')).CartPage }) },
      { path: 'checkout', lazy: async () => ({ Component: (await import('./pages/CheckoutPage')).CheckoutPage }) },
      { path: 'order-confirmation/:orderId', lazy: async () => ({ Component: (await import('./pages/OrderConfirmationPage')).OrderConfirmationPage }) },
      { path: 'login', lazy: async () => ({ Component: (await import('./pages/LoginPage')).LoginPage }) },
      { path: 'register', lazy: async () => ({ Component: (await import('./pages/RegisterPage')).RegisterPage }) },
      { path: 'dashboard', lazy: async () => ({ Component: (await import('./pages/DashboardPage')).DashboardPage }) },
      { path: 'my-tickets', lazy: async () => ({ Component: (await import('./pages/MyTicketsPage')).MyTicketsPage }) },
      { path: 'my-orders', lazy: async () => ({ Component: (await import('./pages/MyOrdersPage')).MyOrdersPage }) },
      { path: 'profile', lazy: async () => ({ Component: (await import('./pages/ProfilePage')).ProfilePage }) },
    ]
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('./pages/admin/AdminDashboardPage')).AdminDashboardPage }) },
      { path: 'museums', lazy: async () => ({ Component: (await import('./pages/admin/AdminMuseumsPage')).AdminMuseumsPage }) },
      { path: 'products', lazy: async () => ({ Component: (await import('./pages/admin/AdminProductsPage')).AdminProductsPage }) },
      { path: 'orders', lazy: async () => ({ Component: (await import('./pages/admin/AdminOrdersPage')).AdminOrdersPage }) },
      { path: 'guides', lazy: async () => ({ Component: (await import('./pages/admin/AdminGuidesPage')).AdminGuidesPage }) },
    ]
  },
  {
    path: '*',
    lazy: async () => ({ Component: (await import('./pages/NotFoundPage')).NotFoundPage })
  }
]);
