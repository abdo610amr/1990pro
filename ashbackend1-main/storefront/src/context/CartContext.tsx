import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppliedPromo, CartItem } from "@/types/cart";
import { promoService } from "@/services/promos";
import { getApiErrorMessage } from "@/services/api";

const CART_STORAGE_KEY = "ash-storefront-cart";
const PROMO_STORAGE_KEY = "ash-storefront-promo";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  appliedPromo: AppliedPromo | null;
  promoLoading: boolean;
  promoError: string | null;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  removeItem: (productId: number, size: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string, email?: string) => Promise<boolean>;
  removeCoupon: () => void;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function loadPromo(): AppliedPromo | null {
  try {
    const raw = localStorage.getItem(PROMO_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppliedPromo;
  } catch {
    return null;
  }
}

function cartItemKey(productId: number, size: string) {
  return `${productId}-${size}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(() => loadPromo());
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedPromo) {
      localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(appliedPromo));
    } else {
      localStorage.removeItem(PROMO_STORAGE_KEY);
    }
  }, [appliedPromo]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const total = appliedPromo?.finalPrice ?? subtotal;

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) => cartItemKey(i.productId, i.size) === cartItemKey(item.productId, item.size)
        );
        if (existing) {
          return prev.map((i) =>
            cartItemKey(i.productId, i.size) === cartItemKey(item.productId, item.size)
              ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
              : i
          );
        }
        return [...prev, { ...item, quantity: item.quantity ?? 1 }];
      });
      setAppliedPromo(null);
      setIsDrawerOpen(true);
    },
    []
  );

  const updateQuantity = useCallback((productId: number, size: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) =>
        prev.filter((i) => cartItemKey(i.productId, i.size) !== cartItemKey(productId, size))
      );
    } else {
      setItems((prev) =>
        prev.map((i) =>
          cartItemKey(i.productId, i.size) === cartItemKey(productId, size)
            ? { ...i, quantity }
            : i
        )
      );
    }
    setAppliedPromo(null);
  }, []);

  const removeItem = useCallback((productId: number, size: string) => {
    setItems((prev) =>
      prev.filter((i) => cartItemKey(i.productId, i.size) !== cartItemKey(productId, size))
    );
    setAppliedPromo(null);
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedPromo(null);
  }, []);

  const applyCoupon = useCallback(
    async (code: string, email?: string): Promise<boolean> => {
      setPromoLoading(true);
      setPromoError(null);

      try {
        const result = await promoService.apply({
          code,
          totalAmount: subtotal,
          email,
          cartItems: items.map((i) => ({
            size: i.size,
            quantity: i.quantity,
            price: i.price,
          })),
        });

        if (result.type === "bundle") {
          setPromoError("Bundle offers are applied automatically at checkout.");
          return false;
        }

        setAppliedPromo({
          code: result.promo ?? code,
          type: result.type,
          discount: result.discount ?? 0,
          finalPrice: result.finalPrice ?? subtotal,
        });
        return true;
      } catch (err) {
        setPromoError(getApiErrorMessage(err));
        return false;
      } finally {
        setPromoLoading(false);
      }
    },
    [items, subtotal]
  );

  const removeCoupon = useCallback(() => {
    setAppliedPromo(null);
    setPromoError(null);
  }, []);

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      appliedPromo,
      promoLoading,
      promoError,
      isDrawerOpen,
      openDrawer: () => setIsDrawerOpen(true),
      closeDrawer: () => setIsDrawerOpen(false),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      applyCoupon,
      removeCoupon,
      total,
    }),
    [
      items,
      itemCount,
      subtotal,
      appliedPromo,
      promoLoading,
      promoError,
      isDrawerOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      applyCoupon,
      removeCoupon,
      total,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
