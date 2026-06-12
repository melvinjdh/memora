import { supabase } from '../../lib/supabase/supabase';

export interface Museum {
  id: string;
  slug: string;
  name: string;
  heroImage: string;
  imageCredit?: string;
  description: string;
  history: string;
  location: string;
  mapEmbedUrl: string;
  isOpen: boolean;
  tickets: any[];
  operatingHours: any[];
  facilities: any[];
  transportation: any;
  nearbyDining: any[];
  nearbyFacilities: any[];
}

export interface TourGuide {
  id: string;
  name: string;
  photo: string;
  imageCredit?: string;
  gender: string;
  age: number;
  languages: string[];
  specialties: string[];
  rating: number;
  reviews: number;
  pricePerHour: number;
  description: string;
  quote: string;
  mainMuseums: string[];
  reviewList: any[];
}

export interface Product {
  id: string;
  name: string;
  image: string;
  imageCredit?: string;
  price: number;
  category: string;
  museum: string;
  description: string;
  stock: number;
  source?: string;
  merchType?: string;
  tags: string[];
  featured: boolean;
}

const toMuseum = (r: any): Museum => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  heroImage: r.hero_image,
  imageCredit: r.image_credit ?? undefined,
  description: r.description,
  history: r.history,
  location: r.location,
  mapEmbedUrl: r.map_embed_url,
  isOpen: r.is_open ?? true,
  tickets: r.tickets ?? [],
  operatingHours: r.operating_hours ?? [],
  facilities: r.facilities ?? [],
  transportation: r.transportation ?? {},
  nearbyDining: r.nearby_dining ?? [],
  nearbyFacilities: r.nearby_facilities ?? [],
});

const toGuide = (r: any): TourGuide => ({
  id: r.id,
  name: r.name,
  photo: r.photo,
  imageCredit: r.image_credit ?? undefined,
  gender: r.gender,
  age: r.age,
  languages: r.languages ?? [],
  specialties: r.specialties ?? [],
  rating: Number(r.rating ?? 0),
  reviews: Number(r.reviews ?? 0),
  pricePerHour: Number(r.price_per_hour ?? 0),
  description: r.description,
  quote: r.quote,
  mainMuseums: r.main_museums ?? [],
  reviewList: r.review_list ?? [],
});

const toProduct = (r: any): Product => ({
  id: r.id,
  name: r.name,
  image: r.image,
  imageCredit: r.image_credit ?? undefined,
  price: Number(r.price ?? 0),
  category: r.category,
  museum: r.museum,
  description: r.description,
  stock: Number(r.stock ?? 0),
  source: r.source ?? undefined,
  merchType: r.merch_type ?? undefined,
  tags: r.tags ?? [],
  featured: r.featured ?? false,
});

export const getMuseums = async (): Promise<Museum[]> => {
  const { data } = await supabase.from('museums').select('*').order('name');
  return (data || []).map(toMuseum);
};

export const getTourGuides = async (): Promise<TourGuide[]> => {
  const { data } = await supabase.from('tour_guides').select('*');
  return (data || []).map(toGuide);
};

export const getProducts = async (): Promise<Product[]> => {
  const { data } = await supabase.from('products').select('*');
  return (data || []).map(toProduct);
};

export const getOrders = async (userId: string): Promise<any[]> => {
  const { data: orders, error: orderError } = await supabase
    .from('orders')
    .select('*')
    //.eq('user_id', userId);

  if (orderError) {
    console.error("Gagal mengambil data pesanan utama:", orderError.message);
    return [];
  }

  if (!orders || orders.length === 0) {
    return [];
  }

  const orderIds = orders.map(o => o.id);
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds);

  if (itemsError) {
    console.error("Gagal mengambil rincian item pesanan:", itemsError.message);
    return orders.map(o => ({ ...o, order_items: [] }));
  }

  return orders.map(o => ({
    ...o,
    order_items: (items || []).filter(i => i.order_id === o.id)
  }));
};