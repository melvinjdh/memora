import { createBrowserRouter } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { HomePage } from './pages/HomePage';
import { MuseumsPage } from './pages/MuseumsPage';
import { MuseumDetailPage } from './pages/MuseumDetailPage';
import { MerchandisePage } from './pages/MerchandisePage';
import { TourGuidesPage } from './pages/TourGuidesPage';
import { TourGuideDetailPage } from './pages/TourGuideDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMuseumsPage } from './pages/admin/AdminMuseumsPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminGuidesPage } from './pages/admin/AdminGuidesPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'museums', Component: MuseumsPage },
      { path: 'museums/:slug', Component: MuseumDetailPage },
      { path: 'merchandise', Component: MerchandisePage },
      { path: 'tour-guides', Component: TourGuidesPage },
	  { path: 'tour-guides/:id', Component: TourGuideDetailPage },
      { path: 'cart', Component: CartPage },
      { path: 'checkout', Component: CheckoutPage },
      { path: 'order-confirmation/:orderId', Component: OrderConfirmationPage },
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
      { path: 'dashboard', Component: DashboardPage },
      { path: 'my-tickets', Component: MyTicketsPage },
      { path: 'my-orders', Component: MyOrdersPage },
      { path: 'profile', Component: ProfilePage },
    ]
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboardPage },
      { path: 'museums', Component: AdminMuseumsPage },
      { path: 'products', Component: AdminProductsPage },
      { path: 'orders', Component: AdminOrdersPage },
      { path: 'guides', Component: AdminGuidesPage },
    ]
  },
  {
    path: '*',
    Component: NotFoundPage
  }
]);
