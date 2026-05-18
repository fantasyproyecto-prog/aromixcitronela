import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  priceUSD: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  tasaBCV: number;
  tasaLoading: boolean;
  setTasaBCV: (rate: number) => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  totalUSD: number;
  totalBs: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FALLBACK_RATE = 475.95;

async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function fetchBCVRate(): Promise<{ rate: number; offline: boolean }> {
  // Try primary API: ve.dolarapi.com
  try {
    const res = await fetchWithTimeout("https://ve.dolarapi.com/v1/dolares/oficial");
    if (res.ok) {
      const data = await res.json();
      const price = data?.promedio ?? data?.precio;
      if (price && typeof price === "number" && price > 0) {
        return { rate: price, offline: false };
      }
    }
  } catch (e) {
    console.warn("Primary BCV API (dolarapi) failed:", e);
  }

  // Try second API: pydolarvenezuela
  try {
    const res = await fetchWithTimeout("https://pydolarvenezuela-api.vercel.app/api/v1/dollar?page=bcv");
    if (res.ok) {
      const data = await res.json();
      const price = data?.monitors?.usd?.price ?? data?.dollar ?? data?.price;
      if (price && typeof price === "number" && price > 0) {
        return { rate: price, offline: false };
      }
    }
  } catch (e) {
    console.warn("Secondary BCV API (pydolar) failed:", e);
  }

  // Try third API: bcv-api.rafnixg.dev
  try {
    const res = await fetchWithTimeout("https://bcv-api.rafnixg.dev/rates/");
    if (res.ok) {
      const data = await res.json();
      if (data?.dollar && typeof data.dollar === "number" && data.dollar > 0) {
        return { rate: data.dollar, offline: false };
      }
    }
  } catch (e) {
    console.warn("Tertiary BCV API (rafnixg) failed:", e);
  }

  return { rate: FALLBACK_RATE, offline: true };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tasaBCV, setTasaBCV] = useState(0);
  const [tasaLoading, setTasaLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let refreshInterval: ReturnType<typeof setInterval> | null = null;

    const loadRate = async (isRetry = false) => {
      try {
        const { rate, offline } = await fetchBCVRate();
        if (cancelled) return;
        setTasaBCV((prev) => (rate > 0 ? rate : prev || FALLBACK_RATE));
        if (offline && !isRetry) {
          toast.info("Tasa BCV obtenida offline", {
            description: `Usando tasa de respaldo: Bs ${rate.toFixed(2)}`,
          });
        }
        // Si fue offline, reintenta en 60s para intentar obtener la tasa real
        if (offline && !cancelled) {
          retryTimer = setTimeout(() => loadRate(true), 60_000);
        }
      } catch (e) {
        console.error("fetchBCVRate crashed:", e);
        if (!cancelled) {
          setTasaBCV((prev) => prev || FALLBACK_RATE);
          retryTimer = setTimeout(() => loadRate(true), 60_000);
        }
      } finally {
        if (!cancelled) setTasaLoading(false);
      }
    };

    loadRate();
    // Refresca cada 30 minutos
    refreshInterval = setInterval(() => loadRate(true), 30 * 60 * 1000);
    // Refresca al volver a la pestaña
    const onFocus = () => loadRate(true);
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (refreshInterval) clearInterval(refreshInterval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) { removeItem(id); return; }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const totalUSD = items.reduce((sum, i) => sum + i.priceUSD * i.quantity, 0);
  const totalBs = totalUSD * tasaBCV;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, tasaBCV, tasaLoading, setTasaBCV, addItem, removeItem, updateQuantity, clearCart, totalUSD, totalBs, itemCount, isCartOpen, setIsCartOpen, isCheckoutOpen, setIsCheckoutOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
