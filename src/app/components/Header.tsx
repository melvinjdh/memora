import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ShoppingCart, User, Bell, Landmark, Users, ReceiptText,
  LayoutDashboard, LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';

export const Header: React.FC = () => {
  const { isAuthenticated, user, cart, logout } = useApp();
  const navigate = useNavigate();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    logout();
    setAccountMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Museum', path: '/museums' },
    { label: 'Pemandu', path: '/tour-guides' },
    { label: 'Merchandise', path: '/merchandise' },
    { label: 'Pesanan', path: '/my-orders' },
  ];

  const accountLinks = [
    { label: 'Pesanan Saya', path: '/my-orders', icon: ReceiptText },
    { label: 'Profil', path: '/profile', icon: User },
  ];

  const go = (path: string) => {
    setAccountMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#b59a5b]/10 bg-[#0d2b23]/90 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8 lg:px-10">
        {/* Brand */}
        <Link to="/" className="flex items-center" aria-label="Memora — Beranda">
          <BrandLogo size="sm" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#a09a90] md:flex">
          {navLinks.map((link) => (
            <button key={link.path} className="transition hover:text-[#b59a5b]" onClick={() => navigate(link.path)}>
              {link.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Notifikasi */}
          <button
            type="button"
            aria-label="Notifikasi"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b59a5b]/10 bg-[#1a4d3e]/50 text-[#c8c2b8] transition hover:border-[#b59a5b]/30 hover:text-[#b59a5b]"
          >
            <Bell className="h-[18px] w-[18px]" />
          </button>

          {/* Keranjang */}
          <button
            type="button"
            onClick={() => navigate('/cart')}
            aria-label="Keranjang"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#b59a5b]/10 bg-[#1a4d3e]/50 text-[#c8c2b8] transition hover:border-[#b59a5b]/30 hover:text-[#b59a5b]"
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
            {cart.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b59a5b] px-1 text-[10px] font-bold text-[#0a1f1a]">
                {cart.length}
              </span>
            )}
          </button>

          {/* Akun / Masuk — desktop saja (mobile pakai bottom-nav) */}
          {isAuthenticated ? (
            <div className="relative hidden md:block" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className="flex h-10 items-center gap-2 rounded-full bg-[#b59a5b] px-4 text-sm font-bold text-[#0a1f1a] transition hover:bg-[#c9ad6e]"
              >
                <User className="h-4 w-4" />
                {user?.name?.split(' ')[0] || 'Profil'}
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-[#b59a5b]/15 bg-[#0d2b23] shadow-[0_22px_54px_-30px_rgba(0,0,0,.85)]">
                  <div className="border-b border-[#b59a5b]/10 px-4 py-3">
                    <p className="text-sm font-bold text-[#f0ebe3]">{user?.name}</p>
                    <p className="text-xs text-[#a09a90]">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    {accountLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => go(item.path)}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[#c8c2b8] transition hover:bg-[#12382d] hover:text-[#f0ebe3]"
                        >
                          <Icon className="h-4 w-4 text-[#b59a5b]" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}

                    {user?.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => go('/admin')}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[#c8c2b8] transition hover:bg-[#12382d] hover:text-[#f0ebe3]"
                      >
                        <LayoutDashboard className="h-4 w-4 text-[#b59a5b]" />
                        <span>Admin Panel</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[#fca5a5] transition hover:bg-[#ef4444]/10"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hidden rounded-full bg-[#b59a5b] px-5 py-2.5 text-sm font-bold text-[#0a1f1a] shadow-[0_16px_35px_-22px_rgba(181,154,91,.85)] transition hover:bg-[#c9ad6e] md:inline-flex"
            >
              Masuk
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
