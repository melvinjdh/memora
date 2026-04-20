import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ShoppingCart,
  User,
  Menu,
  Landmark,
  ShoppingBag,
  Users,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export const Header: React.FC = () => {
  const { isAuthenticated, user, cart, logout } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    logout();
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks = [
    { label: 'Museums', path: '/museums', icon: Landmark },
    { label: 'Merchandise', path: '/merchandise', icon: ShoppingBag },
    { label: 'Tour Guides', path: '/tour-guides', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Landmark className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-primary">Memora</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2 md:space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
                >
                  {cart.length}
                </Badge>
              )}
            </Button>

            {isAuthenticated ? (
              <div className="relative hidden md:block" ref={accountMenuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                >
                  <User className="h-5 w-5" />
                </Button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md border bg-background shadow-lg z-50">
                    <div className="border-b px-4 py-3">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>

                    <div className="p-2">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          navigate('/dashboard');
                        }}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </button>

                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          navigate('/my-tickets');
                        }}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>My Tickets</span>
                      </button>

                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          navigate('/my-orders');
                        }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>My Orders</span>
                      </button>

                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          navigate('/profile');
                        }}
                      >
                        <User className="h-4 w-4" />
                        <span>My Profile</span>
                      </button>

                      {user?.role === 'admin' && (
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            navigate('/admin');
                          }}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Admin Panel</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-muted"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button className="hidden md:inline-flex" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            )}

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right">
                <div className="mt-8 flex flex-col space-y-4">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="flex items-center space-x-2 text-lg font-medium transition-colors hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}

                  {isAuthenticated ? (
                    <>
                      <button
                        type="button"
                        className="flex items-center space-x-2 text-left text-lg font-medium transition-colors hover:text-primary"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/dashboard');
                        }}
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Dashboard</span>
                      </button>

                      <button
                        type="button"
                        className="flex items-center space-x-2 text-left text-lg font-medium transition-colors hover:text-primary"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/my-tickets');
                        }}
                      >
                        <ShoppingBag className="h-5 w-5" />
                        <span>My Tickets</span>
                      </button>

                      <button
                        type="button"
                        className="flex items-center space-x-2 text-left text-lg font-medium transition-colors hover:text-primary"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/my-orders');
                        }}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        <span>My Orders</span>
                      </button>

                      <button
                        type="button"
                        className="flex items-center space-x-2 text-left text-lg font-medium transition-colors hover:text-primary"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/profile');
                        }}
                      >
                        <User className="h-5 w-5" />
                        <span>My Profile</span>
                      </button>

                      {user?.role === 'admin' && (
                        <button
                          type="button"
                          className="flex items-center space-x-2 text-left text-lg font-medium transition-colors hover:text-primary"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            navigate('/admin');
                          }}
                        >
                          <LayoutDashboard className="h-5 w-5" />
                          <span>Admin Panel</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="flex items-center space-x-2 text-left text-lg font-medium transition-colors hover:text-primary"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="flex items-center space-x-2 text-left text-lg font-medium transition-colors hover:text-primary"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/login');
                      }}
                    >
                      <User className="h-5 w-5" />
                      <span>Sign In</span>
                    </button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
