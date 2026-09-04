import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, ProductCategory } from '../types';
import { fetchLiveShopifyProducts } from '../services/shopify';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/products';

interface ShopifyContextType {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  currencySymbol: string;
  currencyCode: string;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductsByCategory: (category: ProductCategory | 'all') => Product[];
  refreshProducts: () => Promise<void>;
}

const ShopifyContext = createContext<ShopifyContextType | undefined>(undefined);

export const ShopifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const liveProducts = await fetchLiveShopifyProducts();
      if (liveProducts && liveProducts.length > 0) {
        setProducts(liveProducts);
      } else {
        setProducts(FALLBACK_PRODUCTS);
      }
    } catch (err: any) {
      console.warn('Could not load live Shopify products, using fallback:', err);
      setError(err?.message || 'Failed to load products');
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const currencyCode = useMemo(() => {
    return products[0]?.currencyCode || 'INR';
  }, [products]);

  const currencySymbol = useMemo(() => {
    if (currencyCode === 'INR') return '₹';
    if (currencyCode === 'EUR') return '€';
    if (currencyCode === 'GBP') return '£';
    return '$';
  }, [currencyCode]);

  const getProductBySlug = (slug: string): Product | undefined => {
    return products.find((p) => p.slug === slug);
  };

  const getProductsByCategory = (category: ProductCategory | 'all'): Product[] => {
    if (category === 'all') return products;
    return products.filter((p) => p.category === category);
  };

  return (
    <ShopifyContext.Provider
      value={{
        products,
        isLoading,
        error,
        currencySymbol,
        currencyCode,
        getProductBySlug,
        getProductsByCategory,
        refreshProducts: loadProducts,
      }}
    >
      {children}
    </ShopifyContext.Provider>
  );
};

export const useShopify = (): ShopifyContextType => {
  const context = useContext(ShopifyContext);
  if (!context) {
    throw new Error('useShopify must be used within a ShopifyProvider');
  }
  return context;
};
