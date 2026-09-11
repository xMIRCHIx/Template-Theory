import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { createShopifyCheckoutSession } from '../services/shopify';
import { trackMetaAddToCart, trackMetaInitiateCheckout } from '../utils/metaPixel';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  bundleDiscountPercent: number;
  bundleDiscountAmount: number;
  finalTotal: number;
  isCheckingOut: boolean;
  checkoutWithShopify: (singleProduct?: Product) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'templatetheory_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    trackMetaAddToCart(product);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Automatic Bundle Savings Tier:
  // 3+ items = 25% OFF (Code: BUNDLE25)
  // 2 items = 20% OFF (Code: BUNDLE20)
  const bundleDiscountPercent = totalItems >= 3 ? 25 : totalItems === 2 ? 20 : 0;
  const bundleDiscountAmount = Math.round((subtotal * bundleDiscountPercent) / 100);
  const finalTotal = subtotal - bundleDiscountAmount;
  const bundleDiscountCode = bundleDiscountPercent === 25 ? 'BUNDLE25' : bundleDiscountPercent === 20 ? 'BUNDLE20' : '';

  const checkoutWithShopify = async (singleProduct?: Product) => {
    setIsCheckingOut(true);
    try {
      const checkoutTotal = singleProduct ? singleProduct.price : finalTotal;
      const checkoutCount = singleProduct ? 1 : totalItems;
      trackMetaInitiateCheckout(checkoutTotal, checkoutCount);

      const itemsToCheckout = singleProduct
        ? [{ shopifyVariantId: singleProduct.shopifyVariantId, quantity: 1 }]
        : cart.map((item) => ({
            shopifyVariantId: item.product.shopifyVariantId,
            quantity: item.quantity,
          }));

      const savedCoupon = localStorage.getItem('tt_applied_coupon');
      const discountToApply = bundleDiscountCode || savedCoupon || undefined;

      const checkoutUrl = await createShopifyCheckoutSession(itemsToCheckout, discountToApply);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Failed to start Shopify checkout:', error);
      // Fallback redirect to store checkout
      const fallbackUrl = 'https://template-theory-2.myshopify.com/checkout';
      window.location.href = fallbackUrl;
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        bundleDiscountPercent,
        bundleDiscountAmount,
        finalTotal,
        isCheckingOut,
        checkoutWithShopify,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
