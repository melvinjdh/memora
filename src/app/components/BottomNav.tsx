import React from 'react';
import { Link, useLocation } from 'react-router';
import { Home, Compass, ReceiptText, UserRound } from 'lucide-react';

const navItems = [
  { label: 'Beranda', to: '/', icon: Home, match: ['/'] },
  { label: 'Explore', to: '/museums', icon: Compass, match: ['/museums', '/tour-guides', '/merchandise'] },
  { label: 'Pesanan', to: '/my-orders', icon: ReceiptText, match: ['/my-orders', '/my-tickets', '/order-confirmation'] },
  { label: 'Profil', to: '/profile', icon: UserRound, match: ['/profile', '/login', '/register'] },
];

function isActive(pathname: string, item: (typeof navItems)[number]) {
  if (item.to === '/') return pathname === '/';
  return item.match.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export const BottomNav: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[520px] px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] md:hidden">
      <div className="rounded-[1.4rem] border border-[#b59a5b]/20 bg-[#12382d]/95 px-3 py-2 shadow-[0_-18px_46px_-24px_rgba(0,0,0,.78)] backdrop-blur-2xl">
        <ul className="grid grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item);

            return (
              <li key={item.to} className="flex">
                <Link
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-1.5 text-[10px] font-semibold transition active:scale-95"
                >
                  <span
                    className={
                      active
                        ? 'flex h-9 w-11 items-center justify-center rounded-2xl bg-[#b59a5b] text-[#0a1f1a] shadow-[0_10px_24px_-14px_rgba(181,154,91,.9)]'
                        : 'flex h-9 w-11 items-center justify-center rounded-2xl text-[#a09a90]'
                    }
                  >
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2.1} />
                  </span>
                  <span className={active ? 'text-[#b59a5b]' : 'text-[#a09a90]'}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
