import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../data/mockData';

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
  confirmPassword?: string;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
}

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  cart: CartItem[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<void>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'memora_user';
const USERS_STORAGE_KEY = 'memora_users';
const CART_STORAGE_KEY = 'memora_cart';

const defaultUsers: User[] = [
  {
    id: 'user-user@memora.id',
    email: 'user@memora.id',
    name: 'User Memora',
    phone: '+62 812-3456-7890',
    role: 'user',
  },
  {
    id: 'admin-admin@memora.id',
    email: 'admin@memora.id',
    name: 'Admin Memora',
    phone: '+62 811-0000-1111',
    role: 'admin',
  },
];

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createUserId(email: string, role: User['role']) {
  return `${role}-${normalizeEmail(email)}`;
}

function getStoredUsers(): User[] {
  const storedUsers = safeParse<User[]>(
    localStorage.getItem(USERS_STORAGE_KEY),
    []
  );

  if (storedUsers.length > 0) {
    return storedUsers;
  }

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const users = getStoredUsers();
    const savedUser = safeParse<User | null>(
      localStorage.getItem(USER_STORAGE_KEY),
      null
    );
    const savedCart = safeParse<CartItem[]>(
      localStorage.getItem(CART_STORAGE_KEY),
      []
    );

    if (savedUser) {
      const matchedUser = users.find((item) => item.id === savedUser.id);
      setUser(matchedUser ?? savedUser);
    }

    setCart(savedCart);
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const login = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const normalizedEmail = normalizeEmail(email);
    const users = getStoredUsers();

    let existingUser = users.find(
      (item) => normalizeEmail(item.email) === normalizedEmail
    );

    if (!existingUser) {
      existingUser = {
        id: createUserId(normalizedEmail, normalizedEmail.includes('admin') ? 'admin' : 'user'),
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        phone: '+62 812-3456-7890',
        role: normalizedEmail.includes('admin') ? 'admin' : 'user',
      };

      saveUsers([...users, existingUser]);
    }

    setUser(existingUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(existingUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const register = async (data: RegisterData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const normalizedEmail = normalizeEmail(data.email);
    const users = getStoredUsers();

    const emailExists = users.some(
      (item) => normalizeEmail(item.email) === normalizedEmail
    );

    if (emailExists) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: createUserId(normalizedEmail, 'user'),
      email: normalizedEmail,
      name: data.name.trim(),
      phone: data.phone.trim(),
      role: 'user',
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);

    setUser(newUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
  };

  const updateProfile = async (data: ProfileData) => {
    if (!user) return;

    await new Promise((resolve) => setTimeout(resolve, 300));

    const normalizedEmail = normalizeEmail(data.email);
    const users = getStoredUsers();

    const emailUsedByAnotherUser = users.some(
      (item) =>
        normalizeEmail(item.email) === normalizedEmail && item.id !== user.id
    );

    if (emailUsedByAnotherUser) {
      throw new Error('Email already in use');
    }

    const updatedUser: User = {
      ...user,
      name: data.name.trim(),
      email: normalizedEmail,
      phone: data.phone.trim(),
    };

    const updatedUsers = users.map((item) =>
      item.id === user.id ? updatedUser : item
    );

    saveUsers(updatedUsers);
    setUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  };

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (cartItem) => cartItem.id === item.id && cartItem.type === item.type
      );

      if (existingIndex >= 0) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += item.quantity;
        return newCart;
      }

      return [...prevCart, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isInitializing,
        cart,
        login,
        logout,
        register,
        updateProfile,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }

  return context;
};
