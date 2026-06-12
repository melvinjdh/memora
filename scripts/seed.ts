/**
 * Memora — Seed script
 * Mengisi tabel museums / tour_guides / products dari src/app/data/mockData.ts.
 */
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { museums, tourGuides, products } from '../src/app/data/mockData';

// 1. MENGINSTRUKSIKAN SISTEM: Secara spesifik mencari dan membaca file bernama .env.local
dotenv.config({ path: '.env.local' });

// 2. MEMBACA KUNCI: Langsung mengambil dari ember utama "process.env" tanpa embel-embel ".local".
// Kode ini juga dibuat cerdas agar bisa membaca format nama VITE_SUPABASE_URL maupun SUPABASE_URL biasa.
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_SERVICE_ROLE;

// 3. PEMERIKSAAN KEAMANAN: Memastikan kedua kunci tersebut benar-benar ada sebelum dilanjutkan
if (!url || !serviceRole) {
  console.error('❌ Kunci URL atau Service Role belum ditemukan di dalam file .env.local Anda.');
  console.error('Pastikan Anda sudah menuliskan URL dan SUPABASE_SERVICE_ROLE di dalamnya.');
  process.exit(1);
}

// Membangun jembatan ke Supabase khusus untuk proses pengisian data (bypassing keamanan RLS)
const db = createClient(url, serviceRole, { auth: { persistSession: false } });

// Menerjemahkan format nama variabel aplikasi (camelCase) menjadi format nama kolom database (snake_case)
const museumRows = museums.map((m: any) => ({
  id: m.id,
  slug: m.slug,
  name: m.name,
  hero_image: m.heroImage ?? null,
  image_credit: m.imageCredit ?? null,
  description: m.description ?? null,
  history: m.history ?? null,
  location: m.location ?? null,
  map_embed_url: m.mapEmbedUrl ?? null,
  is_open: m.isOpen !== false,
  tickets: m.tickets ?? [],
  operating_hours: m.operatingHours ?? [],
  facilities: m.facilities ?? [],
  transportation: m.transportation ?? {},
  nearby_dining: m.nearbyDining ?? [],
  nearby_facilities: m.nearbyFacilities ?? [],
}));

const guideRows = tourGuides.map((g: any) => ({
  id: g.id,
  name: g.name,
  photo: g.photo ?? null,
  image_credit: g.imageCredit ?? null,
  gender: g.gender ?? null,
  age: g.age ?? null,
  languages: g.languages ?? [],
  specialties: g.specialties ?? [],
  rating: g.rating ?? 0,
  reviews: g.reviews ?? 0,
  price_per_hour: g.pricePerHour ?? 0,
  description: g.description ?? null,
  quote: g.quote ?? null,
  main_museums: g.mainMuseums ?? [],
  review_list: g.reviewList ?? [],
}));

const productRows = products.map((p: any) => ({
  id: p.id,
  name: p.name,
  image: p.image ?? null,
  image_credit: p.imageCredit ?? null,
  price: p.price ?? 0,
  category: p.category ?? null,
  museum: p.museum ?? null,
  description: p.description ?? null,
  stock: p.stock ?? 0,
  source: p.source ?? null,
  merch_type: p.merchType ?? null,
  tags: p.tags ?? [],
  featured: p.featured ?? false,
}));

// Fungsi utama pengeksekusi pengiriman data ke peladen
async function run() {
  console.log(`Menyiapkan pengisian data: ${museumRows.length} museum, ${guideRows.length} pemandu, ${productRows.length} produk...`);

  const m = await db.from('museums').upsert(museumRows);
  if (m.error) throw m.error;

  const g = await db.from('tour_guides').upsert(guideRows);
  if (g.error) throw g.error;

  const p = await db.from('products').upsert(productRows);
  if (p.error) throw p.error;

  console.log('✅ Proses pengisian data pangkalan data berhasil diselesaikan.');
}

// Menjalankan fungsi utama
run().catch((e) => {
  console.error('❌ Pengisian data gagal:', e.message ?? e);
  process.exit(1);
});