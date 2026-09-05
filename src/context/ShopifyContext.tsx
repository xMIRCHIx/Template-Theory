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
import {
  fetchCustomizationsFromCloud,
  saveCustomizationsToCloud,
  getSupabaseCredentials,
} from '../services/db';

interface ShopifyContextType {
  products: Product[];
  rawProducts: Product[];
  isLoading: boolean;
  error: string | null;
  currencySymbol: string;
  currencyCode: string;
  isCloudSyncActive: boolean;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductsByCategory: (category: ProductCategory | 'all') => Product[];
  refreshProducts: () => Promise<void>;
  updateProductBeforeAfter: (slugOrId: string, looks: CustomBeforeAfterLook[]) => void;
  updateProductOrder: (orderedIdentifiers: string[]) => void;
  updateCollectionMapping: (collectionSlug: string, productIdentifiers: string[]) => void;
  resetAllCustomizations: () => void;
  syncWithCloud: () => Promise<void>;
}

const ShopifyContext = createContext<ShopifyContextType | undefined>(undefined);

const normalizeKey = (key: string): string => {
  return decodeURIComponent(key || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');
};

export const ShopifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [customizationVersion, setCustomizationVersion] = useState(0);
  const [isCloudSyncActive, setIsCloudSyncActive] = useState<boolean>(false);

  const syncWithCloud = async () => {
    try {
      const cloudData = await fetchCustomizationsFromCloud();
      if (cloudData) {
        saveAdminCustomizations(cloudData);
        setCustomizationVersion((v) => v + 1);
        setIsCloudSyncActive(true);
      } else {
        const creds = getSupabaseCredentials();
        setIsCloudSyncActive(Boolean(creds.url && creds.anonKey));
      }
    } catch (e) {
      console.warn('Cloud sync check failed:', e);
    }
  };

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Sync cloud customizations simultaneously
      await syncWithCloud();

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
      const cleanSlug = normalizeKey(p.slug);
      const cleanId = normalizeKey(p.id);
      const cleanName = normalizeKey(p.name);

      let customBA = beforeAfter[p.slug] || beforeAfter[p.id];
      if (!customBA || customBA.length === 0) {
        for (const [key, val] of Object.entries(beforeAfter)) {
          const normKey = normalizeKey(key);
          if (
            normKey === cleanSlug ||
            normKey === cleanId ||
            normKey === cleanName ||
            (cleanSlug && normKey.includes(cleanSlug)) ||
            (normKey && cleanSlug.includes(normKey))
          ) {
            customBA = val;
            break;
          }
        }
      }

      if (customBA && customBA.length > 0) {
        const validLooks = customBA.filter((l) => l.before && l.after);
        if (validLooks.length > 0) {
          updatedProduct = {
            ...updatedProduct,
            beforeAfterImage: { before: validLooks[0].before, after: validLooks[0].after },
            beforeAfterList: validLooks,
          };
        }
      }

      // Check if product has a collection override
      for (const [colCategory, assignedList] of Object.entries(collectionOverrides)) {
        if (assignedList.some((item) => normalizeKey(item) === cleanSlug || normalizeKey(item) === cleanId)) {
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
        orderMap.set(normalizeKey(idOrSlug), index);
      });

      merged = [...merged].sort((a, b) => {
        const orderA = orderMap.has(a.slug)
          ? orderMap.get(a.slug)!
          : orderMap.has(a.id)
          ? orderMap.get(a.id)!
          : orderMap.has(normalizeKey(a.slug))
          ? orderMap.get(normalizeKey(a.slug))!
          : 9999;
        const orderB = orderMap.has(b.slug)
          ? orderMap.get(b.slug)!
          : orderMap.has(b.id)
          ? orderMap.get(b.id)!
          : orderMap.has(normalizeKey(b.slug))
          ? orderMap.get(normalizeKey(b.slug))!
          : 9999;
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
    if (!slug) return undefined;
    const clean = normalizeKey(slug);
    return products.find((p) => {
      if (p.slug === slug || p.id === slug) return true;
      const pCleanSlug = normalizeKey(p.slug);
      const pCleanId = normalizeKey(p.id);
      const pCleanName = normalizeKey(p.name);
      return (
        pCleanSlug === clean ||
        pCleanId === clean ||
        pCleanName === clean ||
        (clean.length > 3 && pCleanSlug.includes(clean)) ||
        (pCleanSlug.length > 3 && clean.includes(pCleanSlug))
      );
    });
  };

  const getProductsByCategory = (category: ProductCategory | 'all'): Product[] => {
    if (category === 'all') return products;
    if (category === 'psds' || (category as string) === 'albums') {
      return products.filter((p) => p.category === 'psds' || (p.category as string) === 'albums');
    }
    return products.filter((p) => p.category === category);
  };

  const updateProductBeforeAfter = useCallback((slugOrId: string, looks: CustomBeforeAfterLook[]) => {
    saveCustomBeforeAfterForProduct(slugOrId, looks);
    setCustomizationVersion((v) => v + 1);
    // Background sync to Cloud Database
    const current = getAdminCustomizations();
    saveCustomizationsToCloud(current).catch((err) => console.warn('Cloud sync error:', err));
  }, []);

  const updateProductOrder = useCallback((orderedIdentifiers: string[]) => {
    saveSavedProductOrder(orderedIdentifiers);
    setCustomizationVersion((v) => v + 1);
    // Background sync to Cloud Database
    const current = getAdminCustomizations();
    saveCustomizationsToCloud(current).catch((err) => console.warn('Cloud sync error:', err));
  }, []);

  const updateCollectionMapping = useCallback((collectionSlug: string, productIdentifiers: string[]) => {
    const current = getAdminCustomizations().collectionOverrides;
    current[collectionSlug] = productIdentifiers;
    saveSavedCollectionOverrides(current);
    setCustomizationVersion((v) => v + 1);
    // Background sync to Cloud Database
    const allCustomizations = getAdminCustomizations();
    saveCustomizationsToCloud(allCustomizations).catch((err) => console.warn('Cloud sync error:', err));
  }, []);

  const resetAllCustomizations = useCallback(() => {
    saveAdminCustomizations({ beforeAfter: {}, productOrder: [], collectionOverrides: {} });
    setCustomizationVersion((v) => v + 1);
    // Background sync to Cloud Database
    saveCustomizationsToCloud({ beforeAfter: {}, productOrder: [], collectionOverrides: {} }).catch((err) => console.warn('Cloud sync error:', err));
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
        isCloudSyncActive,
        getProductBySlug,
        getProductsByCategory,
        refreshProducts: loadProducts,
        updateProductBeforeAfter,
        updateProductOrder,
        updateCollectionMapping,
        resetAllCustomizations,
        syncWithCloud,
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
