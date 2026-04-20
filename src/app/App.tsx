import { RouterProvider } from 'react-router';
import { AppProvider } from './context/AppContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

function RouterFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Memuat halaman...</p>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} fallbackElement={<RouterFallback />} />
      <Toaster />
    </AppProvider>
  );
}
