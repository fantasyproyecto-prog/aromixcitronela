import React, { createContext, useContext, useState, useCallback } from "react";

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

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tasaBCV, setTasaBCV] = useState(36.5);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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
    <CartContext.Provider value={{ items, tasaBCV, setTasaBCV, addItem, removeItem, updateQuantity, clearCart, totalUSD, totalBs, itemCount, isCartOpen, setIsCartOpen, isCheckoutOpen, setIsCheckoutOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
