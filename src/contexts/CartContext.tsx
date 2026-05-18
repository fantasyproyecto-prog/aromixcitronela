import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
const BCV_CODE = "BCV_USD";

async function readStoredBCVRate(): Promise<number | null> {
  const { data, error } = await supabase
    .from("exchange_rates")
    .select("rate")
    .eq("code", BCV_CODE)
    .maybeSingle();

  if (error) throw error;
  const rate = Number(data?.rate);
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}

async function refreshBCVRate(): Promise<number | null> {
  const { error } = await supabase.functions.invoke("update-bcv-rate", { method: "POST" });
  if (error) console.warn("BCV updater invocation failed; using stored rate", error);
  return readStoredBCVRate();
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

    const loadRate = async (forceRefresh = false) => {
      try {
        const storedRate = await readStoredBCVRate();
        if (cancelled) return;

        if (storedRate) {
          setTasaBCV(storedRate);
        } else {
          setTasaBCV((prev) => prev || FALLBACK_RATE);
        }

        if (forceRefresh || !storedRate) {
          const refreshedRate = await refreshBCVRate();
          if (!cancelled && refreshedRate) setTasaBCV(refreshedRate);
        }
      } catch (e) {
        console.error("BCV rate load failed:", e);
        if (!cancelled) {
          setTasaBCV((prev) => prev || FALLBACK_RATE);
          retryTimer = setTimeout(() => loadRate(true), 60_000);
        }
      } finally {
        if (!cancelled) setTasaLoading(false);
      }
    };

    loadRate(true);
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
