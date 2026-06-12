import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/supabase'; // Pastikan path ini sesuai dengan folder Anda

interface CartItem {
  id: string;
  type: 'ticket' | 'guide' | 'merchandise';
  name: string;
  price: number;
  quantity: number;
  details?: Record<string, unknown>;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
}

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  cart: CartItem[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<void>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Fungsi Ambil Data Profil
async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as User;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const profile = await fetchProfile(data.session.user.id);
        setUser(profile);
      }
      setIsInitializing(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw new Error('Email atau password salah');
    if (data.user) {
      const profile = await fetchProfile(data.user.id);
      setUser(profile);
    }
  };

  const register = async (data: RegisterData) => {
    // 1. Daftar ke Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email.trim().toLowerCase(),
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone,
        }
      }
    });

    if (authError) throw new Error(authError.message);

    // 2. Paksa buat profil di database
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          id: authData.user.id, 
          email: data.email.trim().toLowerCase(), 
          name: data.name, 
          phone: data.phone,
          role: 'user' 
        }]);

      if (profileError) console.error("Gagal buat profil:", profileError);
      
      // Jika ada session, berarti auto-login (email konfirmasi mati). Jika null, berarti butuh verifikasi email.
      if (authData.session) {
        const profile = await fetchProfile(authData.user.id);
        setUser(profile);
      }
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (data: ProfileData) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ name: data.name, phone: data.phone })
      .eq('id', user.id);
    
    if (error) throw error;
    setUser({ ...user, name: data.name, phone: data.phone });
  };

  // Cart functions...
  const addToCart = (item: CartItem) => setCart([...cart, item]);
  const removeFromCart = (id: string) => setCart(cart.filter(i => i.id !== id));
  const updateCartQuantity = (id: string, q: number) => setCart(cart.map(i => i.id === id ? {...i, quantity: q} : i));
  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AppContext.Provider value={{
      user, isAuthenticated: !!user, isInitializing, cart, login, logout,
      register, updateProfile, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};