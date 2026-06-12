import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { LoadingScreen } from '../components/LoadingScreen';
import { useApp } from '../context/AppContext';

export const RootLayout: React.FC = () => {
  const location = useLocation();
  const { isInitializing } = useApp();
  const isHomePage = location.pathname === '/';

  // Splash minimal saat aplikasi dibuka.
  // Tetap jalan walaupun isInitializing dari context langsung false.
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  if (isInitializing || booting) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0a1f1a] text-[#f0ebe3]">
      {!isHomePage && <Header />}

      <main className="min-h-screen pb-28 md:pb-0">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
};
