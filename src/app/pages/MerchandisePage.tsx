import React, { useMemo, useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight, KeyRound, Search, Shirt, Sparkles, Store, Utensils, X,
} from 'lucide-react';
import { useNavigate } from 'react-router';
// Hapus baris ini: import { products, museums } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase/supabase'; // Alat pemanggil database

const artsy = { fontFamily: "'ArtsyHeading', serif" } as const;
const mono = { fontFamily: "'DM Mono', ui-monospace, monospace" } as const;
const surface =
  'rounded-[1.4rem] border border-[#b59a5b]/12 bg-gradient-to-br from-[#1a4d3e] to-[#12382d] shadow-[0_22px_54px_-42px_rgba(0,0,0,.9)]';

// Mendefinisikan ulang tipe data karena mockData sudah dihapus
type Product = {
  id: string;
  name: string;
  image?: string;
  price: number;
  category?: string;
  museum?: string;
  description?: string;
  stock: number;
  source?: 'museum' | 'local';
  merchType?: string;
  tags?: string[];
  featured?: boolean;
  imageSource?: string;
  [key: string]: any;
};

type MuseumWithStatus = {
  id: string;
  name: string;
  isOpen?: boolean;
  [key: string]: any;
};

type CategoryOption = {
  value: string;
  label: string;
  icon: LucideIcon;
  matcher: (product: Product) => boolean;
  comingSoon?: boolean;
};

const normalize = (value = '') =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const productText = (product: Product) =>
  normalize([
    product.name, product.description, product.category, product.museum,
    product.merchType, product.source, ...(product.tags ?? []),
  ].join(' '));

const hasAny = (product: Product, keywords: string[]) => {
  const text = productText(product);
  return keywords.some((keyword) => text.includes(normalize(keyword)));
};

const isLocalProduct = (product: Product) => {
  if (product.source) return product.source === 'local';
  return hasAny(product, ['Produk Lokal', 'UMKM', 'Kolaborasi Lokal', 'Lokal Collab']);
};

const isMuseumProduct = (product: Product) => {
  if (product.source) return product.source === 'museum';
  return Boolean(product.museum) && !isLocalProduct(product);
};

const matchesLocalType = (product: Product, keywords: string[]) => isLocalProduct(product) && hasAny(product, keywords);

// Label kategori (selaras 4 kategori baru) untuk badge di card & detail
const categoryLabel = (product: Product): string => {
  if (isMuseumProduct(product)) return 'Souvenir Museum';
  if (hasAny(product, ['Kuliner', 'Makanan', 'Snack', 'Camilan', 'Sambal', 'Keripik', 'Kopi', 'Minuman', 'Coffee', 'Drink', 'Teh', 'FnB', 'Food', 'Beverage'])) return 'FnB';
  if (hasAny(product, ['Aksesori', 'Pin', 'Keychain', 'Gantungan', 'Tote', 'Pouch', 'Stiker'])) return 'Aksesori';
  if (hasAny(product, ['Fashion', 'Pakaian', 'Kaos', 'Kemeja', 'Mode', 'Busana', 'Scarf'])) return 'Mode & Busana';
  return 'Produk Lokal';
};

const categoryOptions: CategoryOption[] = [
  { value: 'souvenir', label: 'Souvenir Museum', icon: Store, matcher: isMuseumProduct },
  {
    value: 'fnb',
    label: 'FnB',
    icon: Utensils,
    matcher: (p) => matchesLocalType(p, ['Kuliner', 'Makanan', 'Snack', 'Camilan', 'Sambal', 'Keripik', 'Kopi', 'Minuman', 'Coffee', 'Drink', 'Teh', 'FnB', 'Food', 'Beverage']),
  },
  {
    value: 'accessory',
    label: 'Aksesori',
    icon: KeyRound,
    matcher: (p) => matchesLocalType(p, ['Aksesori', 'Accessory', 'Pin', 'Keychain', 'Gantungan', 'Gantungan Kunci', 'Blind Pouch', 'Pouch', 'Stiker', 'Sticker']),
  },
  { value: 'fashion', label: 'Mode & Busana', icon: Shirt, matcher: () => false, comingSoon: true },
];

const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;

const shuffleProducts = (items: Product[]) =>
  [...items]
    .map((product) => ({ product, order: Math.random() }))
    .sort((a, b) => a.order - b.order)
    .map(({ product }) => product);

export const MerchandisePage: React.FC = () => {
  const { addToCart } = useApp();
  const navigate = useNavigate();
  const [hasEnteredStore, setHasEnteredStore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('top');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // WADAH DATA DINAMIS
  const [products, setProducts] = useState<Product[]>([]);
  const [museums, setMuseums] = useState<MuseumWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // PENGAMBILAN DATA DARI SUPABASE
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil data museum (untuk mengecek status buka/tutup museum)
        const { data: mData, error: mError } = await supabase.from('museums').select('*');
        if (mError) throw mError;
        
        const formattedMuseums = (mData || []).map((m: any) => ({
          ...m,
          isOpen: m.is_open,
          heroImage: m.hero_image,
        }));
        setMuseums(formattedMuseums);

        // Ambil data produk
        const { data: pData, error: pError } = await supabase.from('products').select('*');
        if (pError) throw pError;

        const formattedProducts = (pData || []).map((p: any) => {
          // Logika pembungkus teks untuk sumber gambar
          let creditData = p.image_credit;
          if (typeof creditData === 'string') {
            try {
              creditData = JSON.parse(creditData).source;
            } catch {
              creditData = p.image_credit;
            }
          } else if (creditData && creditData.source) {
            creditData = creditData.source;
          }

          return {
            ...p,
            merchType: p.merch_type,
            imageSource: creditData,
            tags: p.tags || []
          };
        });
        setProducts(formattedProducts);
      } catch (err) {
        console.error('Gagal mengambil data toko:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const museumsByName = useMemo(
    () => new Map(museums.map((m) => [normalize(m.name), m])),
    [museums] // Bergantung pada data dinamis
  );

  const getMuseum = (product: Product) => {
    const key = normalize(product.museum);
    return (
      museumsByName.get(key) ??
      Array.from(museumsByName.entries()).find(([name]) => name.includes(key) || key.includes(name))?.[1]
    );
  };

  const getProductStatus = (product: Product) => {
    const museum = getMuseum(product);
    const isMuseumClosed = museum?.isOpen === false;
    const isOutOfStock = product.stock <= 0;
    return {
      isMuseumClosed,
      isOutOfStock,
      isUnavailable: isMuseumClosed || isOutOfStock,
      label: isOutOfStock ? 'PRODUK HABIS' : isMuseumClosed ? 'MUSEUM TUTUP SEMENTARA' : '',
    };
  };

  const normalizedSearch = normalize(searchQuery);
  const activeCategory = categoryOptions.find((c) => c.value === selectedCategory);
  const isMainCatalog = selectedCategory === 'top' && !normalizedSearch;

  const topProducts = useMemo(() => {
    if (products.length === 0) return [];
    const museumOpen = (p: Product) => {
      const key = normalize(p.museum);
      const m = museums.find((mm) => {
        const n = normalize(mm.name);
        return n === key || n.includes(key) || key.includes(n);
      });
      return m?.isOpen !== false; // tampil kecuali museum eksplisit tutup
    };
    const featured = products.filter((p) => p.featured && museumOpen(p));
    if (featured.length > 0) return featured;
    return shuffleProducts(products.filter(museumOpen)).slice(0, Math.min(8, products.length));
  }, [products, museums]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = !normalizedSearch || productText(product).includes(normalizedSearch);
      const matchesCategory = selectedCategory === 'top' ? true : activeCategory?.matcher(product) ?? true;
      return matchesSearch && matchesCategory;
    });
  }, [products, activeCategory, normalizedSearch, selectedCategory]);

  const visibleProducts = isMainCatalog ? topProducts : filteredProducts;
  const sectionTitle = normalizedSearch ? 'Hasil Pencarian' : activeCategory?.label ?? 'Katalog Produk';

  const handleAddToCart = (product: Product) => {
    const isLocalMerch = isLocalProduct(product);

    const pickupInfo = isLocalMerch
      ? {
          type: 'local_outlet',
          label: 'Ambil di Outlet',
          name: 'Pameran Cross Musea Pertiwi',
          location: 'Museum Dr. Soetomo',
        }
      : {
          type: 'museum_pickup',
          label: 'Ambil di Museum',
          name: product.museum || 'Museum terkait',
          location: product.museum || 'Museum terkait',
        };

    addToCart({
      id: product.id,
      type: 'merchandise',
      name: product.name,
      price: product.price,
      quantity: 1,
      details: {
        category: product.category,
        museum: product.museum,
        image: product.image,
        source: product.source,
        merchType: product.merchType,
        imageSource: product.imageSource,
        pickup: pickupInfo,
      },
    });
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  // ===== Category carousel =====
  const CategoryCarousel = () => (
    <div className="-mx-5 overflow-x-auto px-5 pb-1 no-scrollbar md:mx-0 md:px-0">
      <div className="flex w-max gap-3 md:w-full md:flex-wrap md:gap-4">
        {categoryOptions.map((category) => {
          const Icon = category.icon;
          const active = selectedCategory === category.value;
          return (
            <button
              key={category.value}
              type="button"
              onClick={() => setSelectedCategory(active ? 'top' : category.value)}
              aria-pressed={active}
              className="group flex w-[4.4rem] shrink-0 flex-col items-center gap-2 text-center md:w-[5.2rem]"
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition md:h-16 md:w-16 ${
                  active
                    ? 'border-transparent bg-[#b59a5b] text-[#0a1f1a] shadow-[0_14px_30px_-16px_rgba(181,154,91,.95)]'
                    : 'border-[#b59a5b]/15 bg-[#0a1f1a]/45 text-[#c9ad6e] group-hover:-translate-y-0.5 group-hover:border-[#b59a5b]/35'
                }`}
              >
                <Icon className="h-5 w-5 md:h-6 md:w-6" />
              </span>
              <span className="line-clamp-2 min-h-[1.9rem] text-[10px] font-bold leading-tight text-[#c8c2b8] md:text-xs">
                {category.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ===== Product grid =====
  const ProductGrid = ({ items }: { items: Product[] }) => (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
      {items.map((product) => {
        const status = getProductStatus(product);
        const lowStock = product.stock > 0 && product.stock < 10;
        return (
          <article
            key={product.id}
            className={`group relative overflow-hidden ${surface} transition ${
              status.isUnavailable ? 'opacity-80' : 'hover:-translate-y-1 hover:border-[#b59a5b]/30'
            }`}
          >
            {status.isUnavailable && (
              <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-[#050d0b]/60 px-3 text-center backdrop-blur-[1px]">
                <span className="rounded-full border border-[#f0ebe3]/15 bg-[#0a1f1a]/85 px-3.5 py-2 text-[0.55rem] font-bold uppercase tracking-[0.14em] text-[#f0ebe3] md:text-[0.64rem]" style={mono}>
                  {status.label}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedProduct(product)}
              className={`block w-full text-left ${status.isUnavailable ? 'grayscale' : ''}`}
            >
              <div className="relative h-32 w-full overflow-hidden sm:h-40 md:h-44">
                <ImageWithFallback
                  src={product.image || '/images/no_preview.jpg'}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f1a]/70 via-transparent to-transparent" />
                <span className="absolute left-2.5 top-2.5 rounded-full border border-[#c9ad6e]/25 bg-[#0a1f1a]/70 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-[#c9ad6e] backdrop-blur md:text-[9px]" style={mono}>
                  {categoryLabel(product)}
                </span>
                {lowStock && (
                  <span className="absolute bottom-2.5 right-2.5 rounded-full bg-[#f0ebe3]/12 px-2.5 py-1 text-[9px] font-bold text-[#f0ebe3] backdrop-blur md:text-[10px]">
                    Stok {product.stock}
                  </span>
                )}
              </div>

              <div className="p-3 md:p-4">
                <h3 className="line-clamp-2 min-h-[2.4rem] text-[0.85rem] font-bold leading-tight tracking-[-0.02em] text-[#f0ebe3] md:min-h-[2.9rem] md:text-[1rem]">
                  {product.name}
                </h3>
                <p className="mt-1 line-clamp-1 text-[11px] text-[#a09a90] md:text-[12px]">{product.museum}</p>

                <div className="mt-3">
                  <span className="text-[0.9rem] font-extrabold tracking-[-0.02em] text-[#c9ad6e] md:text-[1.1rem]">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>
            </button>
          </article>
        );
      })}
    </div>
  );

  // ===== Detail produk (in-page, tanpa route) =====
  if (selectedProduct) {
    const product = selectedProduct;
    const status = getProductStatus(product);
    const lowStock = product.stock > 0 && product.stock < 10;

    const buyNow = () => {
      handleAddToCart(product);
      navigate('/cart');
    };

    return (
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(181,154,91,0.13),transparent_24rem),linear-gradient(180deg,#0d2b23_0%,#0a1f1a_46%,#061612_100%)] text-[#f0ebe3]">
        <div className="pointer-events-none absolute -left-10 top-24 h-48 w-48 rounded-full bg-[#1f6a55]/20 blur-3xl" />
        <div className="mx-auto max-w-5xl px-5 py-6 md:px-8 md:py-10 lg:px-10">
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-9">
            {/* Image */}
            <div className="relative">
              {/* glow di belakang foto */}
              <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[#b59a5b]/10 blur-2xl" />
              <div className={`relative overflow-hidden rounded-[1.5rem] border border-[#b59a5b]/12 shadow-[0_36px_84px_-44px_rgba(0,0,0,.98)] ${status.isUnavailable ? 'grayscale' : ''}`}>
                <ImageWithFallback
                  src={product.image || '/images/no_preview.jpg'}
                  alt={product.name}
                  className="aspect-square h-full w-full object-cover"
                />
                <span className="absolute right-3 top-3 rounded-full border border-[#c9ad6e]/25 bg-[#0a1f1a]/70 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#c9ad6e] backdrop-blur" style={mono}>
                  {categoryLabel(product)}
                </span>

                <span className="absolute bottom-3 right-3 z-10 rounded-full border border-white/10 bg-[#040d0a]/35 px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.16em] text-[#f0ebe3]/60 backdrop-blur-md" style={mono}>
                  Source: {product.imageSource || 'Isi nanti'}
                </span>
                {status.isUnavailable && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#050d0b]/55">
                    <span className="rounded-full border border-[#f0ebe3]/15 bg-[#0a1f1a]/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#f0ebe3]" style={mono}>
                      {status.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="mb-4 w-fit rounded-full border border-[#b59a5b]/20 bg-[#0a1f1a]/35 px-4 py-2 text-xs font-bold text-[#c9ad6e] transition hover:bg-[#b59a5b]/10"
              >
                Kembali ke katalog
              </button>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#b59a5b]/75" style={mono}>{product.museum}</p>
              <h1 className="mt-2 text-[2rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-[#f0ebe3] md:text-[2.6rem]" style={artsy}>
                {product.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#b59a5b]/15 px-3 py-1 text-xs font-semibold text-[#c9ad6e]">{categoryLabel(product)}</span>
                {lowStock && <span className="rounded-full bg-[#f0ebe3]/10 px-3 py-1 text-xs font-semibold text-[#f0ebe3]">Sisa stok {product.stock}</span>}
                {product.stock > 0 && !status.isUnavailable && !lowStock && (
                  <span className="rounded-full bg-emerald-400/12 px-3 py-1 text-xs font-semibold text-emerald-300">Tersedia</span>
                )}
              </div>

              <p className="mt-5 text-2xl font-extrabold tracking-[-0.03em] text-[#c9ad6e] md:text-[2rem]">
                {formatPrice(product.price)}
              </p>

              <div className="mt-5 h-px bg-[#b59a5b]/12" />

              <h2 className="mt-5 text-sm font-bold text-[#f0ebe3]">Deskripsi</h2>
              <p className="mt-2 text-sm leading-[1.85] text-[#c8c2b8]">{product.description}</p>

              {/* Actions */}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  disabled={status.isUnavailable}
                  className="flex-1 rounded-2xl border border-[#b59a5b]/30 bg-[#f0ebe3]/5 px-5 py-3.5 text-sm font-bold text-[#f0ebe3] transition hover:bg-[#b59a5b]/10 hover:text-[#b59a5b] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Tambah ke Keranjang
                </button>
                <button
                  type="button"
                  onClick={buyNow}
                  disabled={status.isUnavailable}
                  className="flex-1 rounded-2xl bg-[#b59a5b] px-5 py-3.5 text-sm font-bold text-[#0a1f1a] shadow-[0_18px_42px_-24px_rgba(181,154,91,.95)] transition hover:bg-[#c9ad6e] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Beli Sekarang
                </button>
              </div>

              {status.isUnavailable && (
                <p className="mt-3 text-center text-xs text-[#fca5a5] sm:text-left">{status.label} — produk belum bisa dibeli saat ini.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== Gate: intro store =====
  if (!hasEnteredStore) {
    return (
      <div className="relative flex min-h-[calc(100svh-9rem)] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(181,154,91,0.14),transparent_22rem),linear-gradient(180deg,#0d2b23_0%,#0a1f1a_52%,#061612_100%)] px-5 py-10 text-[#f0ebe3] md:min-h-screen">
        <div className="pointer-events-none absolute -right-16 top-16 h-56 w-56 rounded-full bg-[#1f6a55]/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 bottom-16 h-44 w-44 rounded-full bg-[#b59a5b]/12 blur-3xl" />

        <section className={`relative w-full max-w-md overflow-hidden p-7 md:p-9 ${surface}`}>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#b59a5b]/20 bg-[#0a1f1a]/45 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#c9ad6e]" style={mono}>
            <Sparkles className="h-3.5 w-3.5" />
            Memora Store
          </span>

          <h1 className="mt-5 text-[2.4rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#f0ebe3] md:text-[3rem]" style={artsy}>
            Lagi pengen cari apa kamu hari ini?
          </h1>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#c8c2b8] md:text-base">
            Jelajahi cinderamata museum dan produk lokal pilihan Memora.
          </p>

          <button
            type="button"
            onClick={() => setHasEnteredStore(true)}
            className="group mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#b59a5b] px-6 py-3.5 text-sm font-bold text-[#0a1f1a] shadow-[0_20px_44px_-26px_rgba(181,154,91,.95)] transition hover:bg-[#c9ad6e] md:w-auto md:px-8"
          >
            Jelajahi cinderamata
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </button>
        </section>
      </div>
    );
  }

  // ===== Loading state setelah user menekan tombol =====
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1f1a] text-[#b59a5b]">
        <p style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }} className="text-sm tracking-widest">
          MEMUAT DATA...
        </p>
      </div>
    );
  }

  // ===== Store =====
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(181,154,91,0.13),transparent_24rem),linear-gradient(180deg,#0d2b23_0%,#0a1f1a_46%,#061612_100%)] text-[#f0ebe3]">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-6 md:px-8 md:pt-10 lg:px-10">
        {/* Search */}
        <div className="relative">
          <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#b59a5b]/12 bg-[#0a1f1a]/55 px-4 text-sm text-[#a09a90] transition focus-within:border-[#b59a5b]/45 focus-within:text-[#f0ebe3] md:min-h-16">
            <Search className="h-5 w-5 shrink-0 text-[#b59a5b]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari merch, kopi, aksesori lokal..."
              className="h-14 min-w-0 flex-1 bg-transparent font-medium text-[#f0ebe3] outline-none placeholder:text-[#a09a90] md:h-16"
              aria-label="Cari merchandise"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0ebe3]/10 text-[#c8c2b8]"
                aria-label="Hapus pencarian"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="mt-5">
          <CategoryCarousel />
        </div>

        {/* Section header */}
        <div className="mb-4 mt-7 flex items-center gap-2 md:mt-9">
          <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-[#c9ad6e] to-[#8a7440]" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#b59a5b]/75" style={mono}>
              {isMainCatalog ? 'Pilihan' : 'Kategori'}
            </p>
            <h2 className="text-2xl font-bold leading-none tracking-[-0.035em] text-[#f0ebe3] md:text-[2.4rem]" style={artsy}>
              {isMainCatalog ? 'Top Product' : sectionTitle}
            </h2>
          </div>
        </div>

        {activeCategory?.comingSoon ? (
          <div className={`flex flex-col items-center px-6 py-16 text-center ${surface}`}>
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#b59a5b]/10 text-[#b59a5b]">
              <Sparkles className="h-7 w-7" />
            </span>
            <p className="mt-5 text-[10px] uppercase tracking-[0.22em] text-[#b59a5b]/75" style={mono}>{activeCategory.label}</p>
            <h3 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-[#f0ebe3] md:text-3xl" style={artsy}>Akan segera hadir</h3>
            <p className="mt-2 max-w-sm text-sm text-[#a09a90]">Kategori {activeCategory.label} sedang kami siapkan. Nantikan ya!</p>
          </div>
        ) : visibleProducts.length > 0 ? (
          <ProductGrid items={visibleProducts} />
        ) : (
          <div className={`px-6 py-14 text-center ${surface}`}>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#b59a5b]/75" style={mono}>Belum tersedia</p>
            <h3 className="mt-3 text-2xl font-bold tracking-[-0.035em] text-[#f0ebe3] md:text-3xl" style={artsy}>Produk belum ada</h3>
            <p className="mt-2 text-sm text-[#a09a90]">Coba kata kunci atau kategori lain.</p>
          </div>
        )}
      </div>
    </div>
  );
};