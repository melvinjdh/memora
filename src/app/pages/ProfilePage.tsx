import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase/supabase';
import {
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Crown,
  Edit3,
  Gift,
  History,
  Landmark,
  LogOut,
  Mail,
  PackageCheck,
  Phone,
  ReceiptText,
  Sparkles,
  Ticket,
  UserRound,
  WalletCards,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

const mono = { fontFamily: "'DM Mono', ui-monospace, monospace" } as const;
const heading = { fontFamily: "'DM Serif Display', Georgia, serif" } as const;

const surface =
  'w-full min-w-0 rounded-[1.35rem] border border-[#b59a5b]/12 bg-gradient-to-br from-[#1a4d3e]/92 to-[#12382d]/95 shadow-[0_26px_60px_-42px_rgba(0,0,0,.85)] md:rounded-[1.55rem]';
const subtleSurface =
  'min-w-0 rounded-[1.15rem] border border-[#b59a5b]/10 bg-[#0a1f1a]/30 shadow-[inset_0_1px_0_rgba(240,235,227,.04)] md:rounded-[1.35rem]';

const REWARD_LEVELS = [
  {
    level: 1,
    name: 'Penjelajah',
    spendTarget: 500_000,
    description: 'Tahap awal untuk mulai membangun perjalanan budaya bersama Memora.',
    promo: 'Akses info promo tiket museum pilihan saat program aktif.',
    bonus: 'Badge Penjelajah dan rekomendasi museum untuk kunjungan pertama.',
  },
  {
    level: 2,
    name: 'Jelajahwan',
    spendTarget: 1_000_000,
    description: 'Untuk pengguna yang mulai aktif menjelajahi museum dan layanan Memora.',
    promo: 'Prioritas informasi promo tiket dan kampanye kunjungan museum.',
    bonus: 'Rekomendasi rute jelajah budaya dan badge Jelajahwan.',
  },
  {
    level: 3,
    name: 'Kurator',
    spendTarget: 1_500_000,
    description: 'Untuk pengguna yang sudah memiliki koleksi pengalaman museum yang lebih matang.',
    promo: 'Info promo merchandise dan bundling pilihan saat tersedia.',
    bonus: 'Badge Kurator dan kurasi rekomendasi museum yang lebih personal.',
  },
  {
    level: 4,
    name: 'Patron Budaya',
    spendTarget: 2_000_000,
    description: 'Untuk pengguna loyal yang ikut mendukung perjalanan budaya lokal.',
    promo: 'Prioritas informasi promo bundling tiket, pemandu, dan merchandise.',
    bonus: 'Badge Patron Budaya dan akses awal info event budaya pilihan.',
  },
  {
    level: 5,
    name: 'Maestro Budaya',
    spendTarget: 2_500_000,
    description: 'Level tertinggi untuk pengguna dengan perjalanan budaya paling konsisten.',
    promo: 'Info promo eksklusif level tertinggi saat program Memora aktif.',
    bonus: 'Badge Maestro Budaya dan prioritas akses program spesial Memora.',
  },
] as const;

type ProfileScreen = 'overview' | 'reward' | 'edit';
type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
type ItemType = 'ticket' | 'guide' | 'merchandise';

interface StoredOrderItem {
  type?: ItemType;
  name?: string;
  quantity?: number;
  price?: number;
  details?: Record<string, unknown>;
}

interface StoredOrder {
  id?: string;
  userId?: string;
  date?: string;
  total?: number;
  status?: OrderStatus | string;
  items?: StoredOrderItem[];
}

interface RecentOrder {
  id: string;
  date?: string;
  total: number;
  status: string;
  summary: string;
  itemCount: number;
}

function rp(value: number) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

function formatDate(iso?: string) {
  if (!iso) return '-';

  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

function safeNumber(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getOrderTotal(order: StoredOrder) {
  if (typeof order.total === 'number' && order.total > 0) return safeNumber(order.total);

  return (Array.isArray(order.items) ? order.items : []).reduce((sum, item) => {
    return sum + safeNumber(item.price) * Math.max(safeNumber(item.quantity), 1);
  }, 0);
}

function getInitials(name?: string, email?: string) {
  const source = (name?.trim() || email?.split('@')[0] || 'Memora').trim();
  const words = source.split(/\s+/).filter(Boolean);

  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function getRewardInfo(totalSpend: number) {
  const safeSpend = Math.max(totalSpend, 0);
  const currentIndex = REWARD_LEVELS.findIndex((level) => safeSpend < level.spendTarget);
  const index = currentIndex === -1 ? REWARD_LEVELS.length - 1 : currentIndex;
  const currentLevel = REWARD_LEVELS[index];
  const previousTarget = index > 0 ? REWARD_LEVELS[index - 1].spendTarget : 0;
  const currentTarget = currentLevel.spendTarget;
  const remaining = Math.max(currentTarget - safeSpend, 0);
  const progress = Math.min(
    Math.max(((safeSpend - previousTarget) / (currentTarget - previousTarget)) * 100, 0),
    100
  );

  return {
    currentLevel,
    currentTarget,
    nextLevel: REWARD_LEVELS[index + 1],
    remaining,
    progress,
    isMaxLevelComplete: index === REWARD_LEVELS.length - 1 && safeSpend >= currentTarget,
  };
}

function getStatusMeta(status?: string) {
  const normalized = status || 'pending';

  const meta: Record<string, { label: string; className: string; icon: LucideIcon }> = {
    pending: {
      label: 'Menunggu',
      className: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
      icon: Clock3,
    },
    confirmed: {
      label: 'Terkonfirmasi',
      className: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
      icon: CheckCircle2,
    },
    completed: {
      label: 'Selesai',
      className: 'border-[#b59a5b]/40 bg-[#b59a5b]/15 text-[#c9ad6e]',
      icon: PackageCheck,
    },
    cancelled: {
      label: 'Dibatalkan',
      className: 'border-red-400/30 bg-red-400/10 text-red-300',
      icon: XCircle,
    },
  };

  return meta[normalized] || meta.pending;
}

const PageShell: React.FC<{ children: React.ReactNode; narrow?: boolean }> = ({ children, narrow }) => (
  <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_right,rgba(181,154,91,0.14),transparent_22rem),linear-gradient(180deg,#0d2b23_0%,#0a1f1a_48%,#071814_100%)] text-[#f0ebe3]">
    <div
      className={`mx-auto w-full px-4 pb-36 pt-5 sm:px-5 md:px-8 md:pb-16 md:pt-10 lg:px-10 ${
        narrow ? 'max-w-3xl' : 'max-w-[520px] lg:max-w-7xl'
      }`}
    >
      {children}
    </div>
  </div>
);

const BackButton: React.FC<{ onClick: () => void; label?: string }> = ({ onClick, label = 'Kembali' }) => (
  <button
    type="button"
    onClick={onClick}
    className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#b59a5b]/15 bg-[#0a1f1a]/30 px-4 text-sm font-bold text-[#c9ad6e] transition hover:bg-[#b59a5b]/10"
  >
    <ChevronLeft className="h-4 w-4" />
    {label}
  </button>
);

const StatCard: React.FC<{
  label: string;
  value: string;
  caption?: string;
  icon: LucideIcon;
}> = ({ label, value, caption, icon: Icon }) => (
  <div className={`${subtleSurface} p-3.5 sm:p-4 md:p-5`}>
    <div className="flex items-start justify-between gap-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-[9px] uppercase tracking-[0.18em] text-[#b59a5b]/70 sm:text-[10px]" style={mono}>
          {label}
        </p>
        <p className="mt-2 break-words text-[1.15rem] font-extrabold leading-tight tracking-[-0.04em] text-[#f0ebe3] sm:text-2xl md:text-3xl" style={heading}>
          {value}
        </p>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#b59a5b]/12 text-[#c9ad6e] sm:h-10 sm:w-10">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </span>
    </div>
    {caption && <p className="mt-3 hidden text-xs leading-relaxed text-[#a09a90] sm:block">{caption}</p>}
  </div>
);

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isInitializing, updateProfile, logout } = useApp();

  const [screen, setScreen] = useState<ProfileScreen>('overview');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // State untuk data Supabase
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isInitializing, navigate]);

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [user]);

  // Efek untuk memuat data dari Supabase
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        if (ordersData && ordersData.length > 0) {
          const orderIds = ordersData.map((o: any) => o.id);

          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

          if (itemsError) throw itemsError;

          const formattedOrders = ordersData.map((o: any) => {
            const matchingItems = (itemsData || []).filter((item: any) => item.order_id === o.id);
            return {
              id: o.id,
              userId: o.user_id,
              date: o.created_at || o.date,
              total: o.total || o.total_amount, 
              status: o.status,
              items: matchingItems.map((item: any) => ({
                type: item.type,
                name: item.name || item.title,
                quantity: Number(item.quantity) || 1,
                price: Number(item.price) || 0,
                details: item.details || {},
              }))
            };
          });
          
          setOrders(formattedOrders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("Gagal mengambil data profil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isInitializing && isAuthenticated) {
      fetchProfileData();
    }
  }, [user, isInitializing, isAuthenticated]);

  const dashboard = useMemo(() => {
    const totalSpend = orders.reduce((sum, order) => sum + getOrderTotal(order), 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter((order) => order.status === 'completed' || order.status === 'selesai').length;
    const activeOrders = orders.filter((order) => order.status === 'pending' || order.status === 'confirmed' || order.status === 'terkonfirmasi').length;
    const ticketCount = orders.reduce((sum, order) => {
      return (
        sum +
        (Array.isArray(order.items) ? order.items : []).reduce((itemSum, item) => {
          if (item.type !== 'ticket') return itemSum;
          return itemSum + Math.max(safeNumber(item.quantity), 1);
        }, 0)
      );
    }, 0);
    
    const museumNames = new Set<string>();

    orders.forEach((order) => {
      (Array.isArray(order.items) ? order.items : []).forEach((item) => {
        const museumName =
          typeof item.details?.museumName === 'string'
            ? item.details.museumName
            : typeof item.details?.museum === 'string'
              ? item.details.museum
              : item.type === 'ticket'
                ? item.name
                : undefined;

        if (museumName) museumNames.add(museumName);
      });
    });

    const recentOrders: RecentOrder[] = [...orders]
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, 3)
      .map((order) => {
        const items = Array.isArray(order.items) ? order.items : [];
        const firstItem = items[0];
        const itemCount = items.reduce((sum, item) => sum + Math.max(safeNumber(item.quantity), 1), 0);
        const summary =
          items.length === 0
            ? 'Pesanan Memora'
            : items.length === 1
              ? firstItem?.name || 'Pesanan Memora'
              : `${firstItem?.name || 'Pesanan Memora'} +${items.length - 1} item`;

        return {
          id: order.id ? order.id.slice(0, 8).toUpperCase() : 'ORD-MEMORA',
          date: order.date,
          total: getOrderTotal(order),
          status: order.status || 'pending',
          summary,
          itemCount,
        };
      });

    return {
      totalSpend,
      totalOrders,
      completedOrders,
      activeOrders,
      ticketCount,
      museumCount: museumNames.size,
      recentOrders,
    };
  }, [orders]);

  const reward = useMemo(() => getRewardInfo(dashboard.totalSpend), [dashboard.totalSpend]);
  const initials = getInitials(user?.name, user?.email);

  const resetFormFromUser = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  };

  const openEditPage = () => {
    resetFormFromUser();
    setScreen('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openRewardPage = () => {
    setScreen('reward');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToOverview = () => {
    resetFormFromUser();
    setScreen('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error('Semua data profil wajib diisi');
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      toast.success('Profil berhasil diperbarui');
      setScreen('overview');
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already in use') {
        toast.error('Email sudah digunakan akun lain');
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Gagal memperbarui profil');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isInitializing || isLoading) {
    return (
      <PageShell narrow>
        <p className="text-sm text-[#a09a90]">Memuat profil dan data...</p>
      </PageShell>
    );
  }

  if (!user) return null;

  if (screen === 'reward') {
    return (
      <PageShell narrow>
        <BackButton onClick={backToOverview} />

        <Card className={`${surface} overflow-hidden`}>
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#b59a5b]/75" style={mono}>
                  Detail Reward
                </p>
                <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-[-0.045em] text-[#f0ebe3] sm:text-4xl" style={heading}>
                  Memora Reward
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-[#a09a90]">
                  Level dihitung dari total transaksi akun. Setiap kenaikan level membutuhkan tambahan spend Rp500.000.
                </p>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#b59a5b] text-[#0a1f1a]">
                <Crown className="h-6 w-6" />
              </span>
            </div>

            <div className="mt-6 rounded-[1.25rem] border border-[#b59a5b]/15 bg-[#0a1f1a]/30 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#b59a5b]/70" style={mono}>
                Level Saat Ini
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-4xl font-extrabold tracking-[-0.055em] text-[#f0ebe3]" style={heading}>
                    Level {reward.currentLevel.level}
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#c9ad6e]">{reward.currentLevel.name}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-bold text-[#f0ebe3]">{rp(dashboard.totalSpend)}</p>
                  <p className="text-xs text-[#a09a90]">Total transaksi kamu</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="text-[#c8c2b8]">Progress level</span>
                  <span className="text-[#a09a90]">Target {rp(reward.currentTarget)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[#071814]/70 ring-1 ring-[#b59a5b]/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#b59a5b] to-[#c9ad6e] shadow-[0_0_18px_rgba(181,154,91,.35)] transition-all"
                    style={{ width: `${reward.progress}%` }}
                  />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#c8c2b8]">
                  {reward.isMaxLevelComplete
                    ? 'Kamu sudah menyelesaikan target Level 5 — Maestro Budaya.'
                    : reward.nextLevel
                      ? `Belanja ${rp(reward.remaining)} lagi untuk menuju Level ${reward.nextLevel.level}.`
                      : `Belanja ${rp(reward.remaining)} lagi untuk menyempurnakan Level 5.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="mt-5 space-y-3">
          {REWARD_LEVELS.map((level) => {
            const active = reward.currentLevel.level === level.level;
            const reached = dashboard.totalSpend >= level.spendTarget;

            return (
              <article
                key={level.level}
                className={`w-full min-w-0 rounded-[1.25rem] border p-4 transition ${
                  active
                    ? 'border-[#b59a5b]/38 bg-[#b59a5b]/12'
                    : reached
                      ? 'border-emerald-400/20 bg-emerald-400/5'
                      : 'border-[#b59a5b]/12 bg-[#12382d]/72'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[#b59a5b]/70" style={mono}>
                      Level {level.level}
                    </p>
                    <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.045em] text-[#f0ebe3]" style={heading}>
                      {level.name}
                    </h2>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${active ? 'bg-[#b59a5b] text-[#0a1f1a]' : 'bg-[#0a1f1a]/45 text-[#c9ad6e]'}`}>
                    {active ? 'Aktif' : reached ? 'Tercapai' : rp(level.spendTarget)}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-[#c8c2b8]">{level.description}</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#b59a5b]/10 bg-[#0a1f1a]/28 p-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#f0ebe3]">
                      <BadgePercent className="h-4 w-4 text-[#c9ad6e]" />
                      Promo
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[#a09a90]">{level.promo}</p>
                  </div>
                  <div className="rounded-2xl border border-[#b59a5b]/10 bg-[#0a1f1a]/28 p-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#f0ebe3]">
                      <Gift className="h-4 w-4 text-[#c9ad6e]" />
                      Bonus
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[#a09a90]">{level.bonus}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </PageShell>
    );
  }

  if (screen === 'edit') {
    return (
      <PageShell narrow>
        <BackButton onClick={backToOverview} />

        <Card className={`${surface} overflow-hidden`}>
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="mb-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.55rem] border border-[#b59a5b]/28 bg-[#0a1f1a]/55 text-2xl font-extrabold text-[#c9ad6e] shadow-[0_18px_42px_-28px_rgba(0,0,0,.9)]" style={heading}>
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#b59a5b]/75" style={mono}>
                  Edit Profil
                </p>
                <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-[-0.045em] text-[#f0ebe3] sm:text-4xl" style={heading}>
                  Perbarui Data Akun
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-[#a09a90]">
                  Data ini dipakai untuk profil akun dan kebutuhan pemesanan di Memora.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-bold text-[#f0ebe3]">
                  Nama Lengkap
                </Label>
                <div className="relative mt-2">
                  <CircleUserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b59a5b]" />
                  <Input
                    id="name"
                    value={formData.name}
                    className="h-12 rounded-2xl border-[#b59a5b]/15 bg-[#0a1f1a]/35 pl-10 text-[#f0ebe3] placeholder:text-[#a09a90] focus-visible:border-[#b59a5b]"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-bold text-[#f0ebe3]">
                  Email
                </Label>
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b59a5b]" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    className="h-12 rounded-2xl border-[#b59a5b]/15 bg-[#0a1f1a]/35 pl-10 text-[#f0ebe3] placeholder:text-[#a09a90] focus-visible:border-[#b59a5b]"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-bold text-[#f0ebe3]">
                  Nomor Telepon
                </Label>
                <div className="relative mt-2">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b59a5b]" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    className="h-12 rounded-2xl border-[#b59a5b]/15 bg-[#0a1f1a]/35 pl-10 text-[#f0ebe3] placeholder:text-[#a09a90] focus-visible:border-[#b59a5b]"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-12 flex-1 rounded-full bg-[#b59a5b] text-sm font-extrabold text-[#0a1f1a] transition hover:bg-[#c9ad6e]"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={backToOverview}
                  className="h-12 flex-1 rounded-full border-[#b59a5b]/20 bg-transparent text-sm font-bold text-[#c9ad6e] hover:bg-[#b59a5b]/10 hover:text-[#f0ebe3]"
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="grid w-full min-w-0 gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:gap-6">
        <div className="min-w-0 space-y-4 lg:space-y-5">
          {/* Profil utama */}
          <Card className={`${surface} overflow-hidden`}>
            <CardContent className="p-0">
              <div className="relative px-4 pb-5 pt-5 sm:px-5 md:px-6 md:pb-6 md:pt-6">
                <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-[#b59a5b]/10 blur-2xl" />
                <div className="relative flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.55rem] border border-[#b59a5b]/28 bg-[#0a1f1a]/55 text-2xl font-extrabold text-[#c9ad6e] shadow-[0_18px_42px_-28px_rgba(0,0,0,.9)] sm:h-24 sm:w-24 md:text-3xl" style={heading}>
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#b59a5b]/75" style={mono}>
                      Profil Pengguna
                    </p>
                    <h1 className="mx-auto mt-2 max-w-full break-words text-[2rem] font-extrabold leading-[0.95] tracking-[-0.055em] text-[#f0ebe3] sm:mx-0 sm:text-[2.25rem] md:text-[2.75rem]" style={heading}>
                      {user.name || 'Pengguna Memora'}
                    </h1>
                    <div className="mt-3 space-y-1.5 text-sm text-[#c8c2b8]">
                      <p className="flex min-w-0 items-center justify-center gap-2 sm:justify-start">
                        <Mail className="h-4 w-4 shrink-0 text-[#b59a5b]" />
                        <span className="min-w-0 break-all">{user.email}</span>
                      </p>
                      <p className="flex min-w-0 items-center justify-center gap-2 sm:justify-start">
                        <Phone className="h-4 w-4 shrink-0 text-[#b59a5b]" />
                        <span className="min-w-0 break-words">{user.phone || 'Nomor belum tersedia'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative mt-5 grid grid-cols-2 gap-3">
                  <div className="min-w-0 rounded-2xl border border-[#b59a5b]/12 bg-[#0a1f1a]/35 p-3">
                    <p className="text-[9px] uppercase tracking-[0.18em] text-[#b59a5b]/65 sm:text-[10px]" style={mono}>
                      Status
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#f0ebe3]">Member Memora</p>
                  </div>
                  <div className="min-w-0 rounded-2xl border border-[#b59a5b]/12 bg-[#0a1f1a]/35 p-3">
                    <p className="text-[9px] uppercase tracking-[0.18em] text-[#b59a5b]/65 sm:text-[10px]" style={mono}>
                      Level
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#f0ebe3]">Level {reward.currentLevel.level}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reward ringkas */}
          <button
            type="button"
            onClick={openRewardPage}
            className={`${surface} block overflow-hidden text-left transition active:scale-[0.99] hover:border-[#b59a5b]/25`}
          >
            <div className="p-4 sm:p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#b59a5b]/75" style={mono}>
                    Memora Reward
                  </p>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.055em] text-[#f0ebe3] sm:text-4xl" style={heading}>
                    Level {reward.currentLevel.level}
                  </h2>
                  <p className="mt-1 text-base font-bold text-[#c9ad6e] sm:text-lg">{reward.currentLevel.name}</p>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#b59a5b] text-[#0a1f1a] shadow-[0_16px_34px_-22px_rgba(181,154,91,.9)]">
                  <Crown className="h-6 w-6" />
                </span>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-4 text-xs">
                  <span className="font-medium text-[#c8c2b8]">{rp(dashboard.totalSpend)}</span>
                  <span className="text-[#a09a90]">Target {rp(reward.currentTarget)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[#0a1f1a]/60 ring-1 ring-[#b59a5b]/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#b59a5b] to-[#c9ad6e] shadow-[0_0_18px_rgba(181,154,91,.35)] transition-all"
                    style={{ width: `${reward.progress}%` }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[#b59a5b]/10 bg-[#0a1f1a]/24 px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#f0ebe3]">Lihat detail reward</p>
                    <p className="mt-0.5 text-xs text-[#a09a90]">Promo, bonus, dan target setiap level</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[#c9ad6e]" />
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="min-w-0 space-y-4 lg:space-y-5">
          {/* Dashboard pemesanan */}
          <section className={`${surface} p-4 sm:p-5 md:p-6`}>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#b59a5b]/75" style={mono}>
                  Dashboard Pemesanan
                </p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.055em] text-[#f0ebe3] md:text-4xl" style={heading}>
                  Riwayat Aktivitas
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/my-orders')}
                className="hidden items-center gap-1 rounded-full border border-[#b59a5b]/15 px-4 py-2 text-xs font-bold text-[#c9ad6e] transition hover:bg-[#b59a5b]/10 md:flex"
              >
                Lihat Pesanan
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <StatCard label="Total Pesanan" value={String(dashboard.totalOrders)} caption="Semua transaksi akun ini." icon={ReceiptText} />
              <StatCard label="Total Transaksi" value={rp(dashboard.totalSpend)} caption="Akumulasi pesanan tersimpan." icon={WalletCards} />
              <StatCard label="Tiket Dibeli" value={String(dashboard.ticketCount)} caption="Jumlah tiket dari riwayat order." icon={Ticket} />
              <StatCard label="Museum" value={String(dashboard.museumCount)} caption="Museum unik dari aktivitas tiket." icon={Landmark} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 md:gap-4">
              <div className="min-w-0 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-3.5 sm:p-4">
                <p className="text-[9px] uppercase tracking-[0.18em] text-emerald-300/80 sm:text-[10px]" style={mono}>
                  Aktif
                </p>
                <p className="mt-2 text-2xl font-extrabold text-emerald-200" style={heading}>{dashboard.activeOrders}</p>
                <p className="mt-1 hidden text-xs text-[#a09a90] sm:block">Menunggu / terkonfirmasi</p>
              </div>
              <div className="min-w-0 rounded-2xl border border-[#b59a5b]/15 bg-[#b59a5b]/10 p-3.5 sm:p-4">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#b59a5b]/80 sm:text-[10px]" style={mono}>
                  Selesai
                </p>
                <p className="mt-2 text-2xl font-extrabold text-[#c9ad6e]" style={heading}>{dashboard.completedOrders}</p>
                <p className="mt-1 hidden text-xs text-[#a09a90] sm:block">Pesanan berstatus selesai</p>
              </div>
            </div>
          </section>

          {/* Riwayat terbaru */}
          <section className={`${surface} p-4 sm:p-5 md:p-6`}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#b59a5b]/75" style={mono}>
                  Aktivitas Terbaru
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.045em] text-[#f0ebe3] md:text-3xl" style={heading}>
                  Ringkasan Pesanan
                </h2>
              </div>
              <History className="h-5 w-5 shrink-0 text-[#b59a5b]" />
            </div>

            {dashboard.recentOrders.length === 0 ? (
              <div className="rounded-[1.25rem] border border-dashed border-[#b59a5b]/18 bg-[#0a1f1a]/25 px-4 py-7 text-center sm:px-5 sm:py-8">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b59a5b]/10 text-[#b59a5b]">
                  <ReceiptText className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-xl font-extrabold tracking-[-0.04em] text-[#f0ebe3]" style={heading}>
                  Belum ada pesanan
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#a09a90]">
                  Setelah kamu membeli tiket, pemandu, atau merchandise, ringkasannya akan tampil di sini.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/museums')}
                  className="mt-5 rounded-full bg-[#b59a5b] px-5 py-2.5 text-sm font-bold text-[#0a1f1a] transition hover:bg-[#c9ad6e]"
                >
                  Mulai Jelajah
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.recentOrders.map((order) => {
                  const meta = getStatusMeta(order.status);
                  const StatusIcon = meta.icon;

                  return (
                    <article key={order.id} className="rounded-[1.2rem] border border-[#b59a5b]/10 bg-[#0a1f1a]/28 p-3.5 sm:p-4">
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-words text-[10px] uppercase tracking-[0.18em] text-[#b59a5b]/65" style={mono}>
                            {formatDate(order.date)} · #{order.id}
                          </p>
                          <h3 className="mt-1 break-words text-sm font-bold text-[#f0ebe3]">{order.summary}</h3>
                          <p className="mt-1 text-xs text-[#a09a90]">
                            {order.itemCount} item · {rp(order.total)}
                          </p>
                        </div>
                        <span className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${meta.className}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {meta.label}
                        </span>
                      </div>
                    </article>
                  );
                })}

                <button
                  type="button"
                  onClick={() => navigate('/my-orders')}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#b59a5b]/18 bg-[#f0ebe3]/[0.03] px-4 py-3 text-sm font-bold text-[#c9ad6e] transition hover:bg-[#b59a5b]/10"
                >
                  Lihat Semua Pesanan
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>

          {/* Menu akun */}
          <section className={`${surface} p-4 sm:p-5 md:p-6`}>
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#b59a5b]/75" style={mono}>
                Menu Akun
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.045em] text-[#f0ebe3] md:text-3xl" style={heading}>
                Pengaturan Profil
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={openEditPage}
                className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-[#b59a5b]/12 bg-[#0a1f1a]/28 px-4 py-3 text-left transition hover:border-[#b59a5b]/28 hover:bg-[#b59a5b]/10"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#b59a5b]/12 text-[#c9ad6e]">
                    <Edit3 className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-[#f0ebe3]">Edit Profil</span>
                    <span className="block text-xs text-[#a09a90]">Nama, email, dan nomor telepon</span>
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-[#c9ad6e]" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/my-orders')}
                className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-[#b59a5b]/12 bg-[#0a1f1a]/28 px-4 py-3 text-left transition hover:border-[#b59a5b]/28 hover:bg-[#b59a5b]/10"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#b59a5b]/12 text-[#c9ad6e]">
                    <ReceiptText className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-[#f0ebe3]">Pesanan Saya</span>
                    <span className="block text-xs text-[#a09a90]">Tiket, pemandu, dan merchandise</span>
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-[#c9ad6e]" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/museums')}
                className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-[#b59a5b]/12 bg-[#0a1f1a]/28 px-4 py-3 text-left transition hover:border-[#b59a5b]/28 hover:bg-[#b59a5b]/10"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#b59a5b]/12 text-[#c9ad6e]">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-[#f0ebe3]">Jelajahi Museum</span>
                    <span className="block text-xs text-[#a09a90]">Temukan destinasi budaya baru</span>
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-[#c9ad6e]" />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-red-400/12 bg-red-400/5 px-4 py-3 text-left transition hover:border-red-400/28 hover:bg-red-400/10"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-400/10 text-red-300">
                    <LogOut className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-red-100">Keluar</span>
                    <span className="block text-xs text-red-200/65">Akhiri sesi akun Memora</span>
                  </span>
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
};