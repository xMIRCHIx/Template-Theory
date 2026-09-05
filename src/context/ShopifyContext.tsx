import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Product, ProductCategory } from '../types';
import { fetchLiveShopifyProducts } from '../services/shopify';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/products';
import {
  getAdminCustomizations,
  saveCustomBeforeAfterForProduct,
  saveSavedProductOrder,
  saveSavedCollectionOverrides,
  saveAdminCustomizations,
  CustomBeforeAfterLook,
} from '../services/adminStore';

interface ShopifyContextType {
  products: Product[];
  rawProducts: Product[];
  isLoading: boolean;
  error: string | null;
  currencySymbol: string;
  currencyCode: string;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductsByCategory: (category: ProductCategory | 'all') => Product[];
  refreshProducts: () => Promise<void>;
  updateProductBeforeAfter: (slugOrId: string, looks: CustomBeforeAfterLook[]) => void;
  updateProductOrder: (orderedIdentifiers: string[]) => void;
  updateCollectionMapping: (collectionSlug: string, productIdentifiers: string[]) => void;
  resetAllCustomizations: () => void;
}

const ShopifyContext = createContext<ShopifyContextType | undefined>(undefined);

export const ShopifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [customizationVersion, setCustomizationVersion] = useState(0);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const liveProducts = await fetchLiveShopifyProducts();
      if (liveProducts && liveProducts.length > 0) {
        setRawProducts(liveProducts);
      } else {
        setRawProducts(FALLBACK_PRODUCTS);
      }
    } catch (err: any) {
      console.warn('Could not load live Shopify products, using fallback:', err);
      setError(err?.message || 'Failed to load products');
      setRawProducts(FALLBACK_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Merge raw products with custom Admin overrides & ordering
  const products = useMemo(() => {
    if (!rawProducts || rawProducts.length === 0) return [];
    
    const customizations = getAdminCustomizations();
    const { beforeAfter, productOrder, collectionOverrides } = customizations;

    // 1. Map custom Before/After & custom collections
    let merged = rawProducts.map((p) => {
      let updatedProduct = { ...p };

      // Apply custom Before/After if defined in Admin
      const customBA = beforeAfter[p.slug] || beforeAfter[p.id];
      if (customBA && customBA.length > 0) {
        updatedProduct = {
          ...updatedProduct,
          beforeAfterImage: { before: customBA[0].before, after: customBA[0].after },
          beforeAfterList: customBA,
        };
      }

      // Check if product has a collection override
      for (const [colCategory, assignedList] of Object.entries(collectionOverrides)) {
        if (assignedList.includes(p.slug) || assignedList.includes(p.id)) {
          updatedProduct = {
            ...updatedProduct,
            category: colCategory as ProductCategory,
          };
        }
      }

      return updatedProduct;
    });

    // 2. Apply custom product ordering if defined in Admin
    if (productOrder && productOrder.length > 0) {
      const orderMap = new Map<string, number>();
      productOrder.forEach((idOrSlug, index) => {
        orderMap.set(idOrSlug, index);
      });

      merged = [...merged].sort((a, b) => {
        const orderA = orderMap.has(a.slug) ? orderMap.get(a.slug)! : orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
        const orderB = orderMap.has(b.slug) ? orderMap.get(b.slug)! : orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
        return orderA - orderB;
      });
    }

    return merged;
  }, [rawProducts, customizationVersion]);

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

  const updateProductBeforeAfter = useCallback((slugOrId: string, looks: CustomBeforeAfterLook[]) => {
    saveCustomBeforeAfterForProduct(slugOrId, looks);
    setCustomizationVersion((v) => v + 1);
  }, []);

  const updateProductOrder = useCallback((orderedIdentifiers: string[]) => {
    saveSavedProductOrder(orderedIdentifiers);
    setCustomizationVersion((v) => v + 1);
  }, []);

  const updateCollectionMapping = useCallback((collectionSlug: string, productIdentifiers: string[]) => {
    const current = getAdminCustomizations().collectionOverrides;
    current[collectionSlug] = productIdentifiers;
    saveSavedCollectionOverrides(current);
    setCustomizationVersion((v) => v + 1);
  }, []);

  const resetAllCustomizations = useCallback(() => {
    saveAdminCustomizations({ beforeAfter: {}, productOrder: [], collectionOverrides: {} });
    setCustomizationVersion((v) => v + 1);
  }, []);

  return (
    <ShopifyContext.Provider
      value={{
        products,
        rawProducts,
        isLoading,
        error,
        currencySymbol,
        currencyCode,
        getProductBySlug,
        getProductsByCategory,
        refreshProducts: loadProducts,
        updateProductBeforeAfter,
        updateProductOrder,
        updateCollectionMapping,
        resetAllCustomizations,
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
