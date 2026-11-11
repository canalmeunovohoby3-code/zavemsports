"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  variantId: number;
  productId: number;
  slug: string;
  name: string;
  size: string;
  priceCents: number;
  imageUrl: string;
  quantity: number;
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  isReady: boolean;
  drawerOpen: boolean;
  itemCount: number;
  subtotalCents: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  removeItem: (variantId: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const STORAGE_KEY = "zeven_cart_v1";
const MAX_PER_ITEM = 10;

const CartContext = createContext<CartContextValue | null>(null);

function sanitizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is CartItem => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Partial<CartItem>;
      return (
        typeof candidate.variantId === "number" &&
        typeof candidate.productId === "number" &&
        typeof candidate.slug === "string" &&
        typeof candidate.name === "string" &&
        typeof candidate.size === "string" &&
        typeof candidate.priceCents === "number" &&
        typeof candidate.imageUrl === "string" &&
        typeof candidate.quantity === "number" &&
        typeof candidate.stock === "number"
      );
    })
    .map((item) => ({
      ...item,
      quantity: Math.max(
        1,
        Math.min(
          item.quantity,
          MAX_PER_ITEM,
          Math.max(item.stock, 0),
        ),
      ),
    }))
    .filter((item) => item.quantity > 0 && item.stock > 0);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(sanitizeCart(JSON.parse(stored)));
    } catch {
      setItems([]);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      return;
    }
  }, [items, isReady]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      if (item.stock <= 0) return;
      setItems((current) => {
        const existing = current.find(
          (entry) => entry.variantId === item.variantId,
        );
        if (existing) {
          const nextQuantity = Math.min(
            existing.quantity + quantity,
            item.stock,
            MAX_PER_ITEM,
          );
          return current.map((entry) =>
            entry.variantId === item.variantId
              ? { ...entry, stock: item.stock, quantity: nextQuantity }
              : entry,
          );
        }
        return [
          ...current,
          {
            ...item,
            quantity: Math.min(quantity, item.stock, MAX_PER_ITEM),
          },
        ];
      });
      setDrawerOpen(true);
    },
    [],
  );

  const updateQuantity = useCallback((variantId: number, quantity: number) => {
    setItems((current) =>
      current
        .map((entry) =>
          entry.variantId === variantId
            ? {
                ...entry,
                quantity: Math.max(
                  0,
                  Math.min(quantity, entry.stock, MAX_PER_ITEM),
                ),
              }
            : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((variantId: number) => {
    setItems((current) =>
      current.filter((entry) => entry.variantId !== variantId),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      return;
    }
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotalCents = items.reduce(
      (total, item) => total + item.priceCents * item.quantity,
      0,
    );

    return {
      items,
      isReady,
      drawerOpen,
      itemCount,
      subtotalCents,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      openDrawer,
      closeDrawer,
    };
  }, [
    items,
    isReady,
    drawerOpen,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    openDrawer,
    closeDrawer,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider.");
  }
  return context;
}
