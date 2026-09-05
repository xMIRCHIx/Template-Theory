// Admin Customization Persistence Layer
// Stores custom Before/After looks, product display orders, and collection mappings in localStorage

export interface CustomBeforeAfterLook {
  id: string;
  title: string;
  before: string;
  after: string;
}

export interface AdminCustomizations {
  beforeAfter: Record<string, CustomBeforeAfterLook[]>; // keyed by product slug or id
  productOrder: string[]; // array of product ids / slugs in custom priority order
  collectionOverrides: Record<string, string[]>; // collection slug -> array of product slugs/ids
}

const STORAGE_KEY = 'cinevo_admin_customizations_v1';
const ADMIN_PIN_KEY = 'cinevo_admin_pin_v1';
const DEFAULT_PIN = '2026';

export function getAdminPin(): string {
  try {
    return localStorage.getItem(ADMIN_PIN_KEY) || DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

export function setAdminPin(newPin: string): void {
  try {
    localStorage.setItem(ADMIN_PIN_KEY, newPin);
  } catch (err) {
    console.warn('Failed to save admin PIN:', err);
  }
}

export function getAdminCustomizations(): AdminCustomizations {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { beforeAfter: {}, productOrder: [], collectionOverrides: {} };
    }
    const parsed = JSON.parse(raw);
    return {
      beforeAfter: parsed.beforeAfter || {},
      productOrder: Array.isArray(parsed.productOrder) ? parsed.productOrder : [],
      collectionOverrides: parsed.collectionOverrides || {},
    };
  } catch (err) {
    console.warn('Failed to read admin customizations from localStorage:', err);
    return { beforeAfter: {}, productOrder: [], collectionOverrides: {} };
  }
}

export function saveAdminCustomizations(data: AdminCustomizations): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save admin customizations to localStorage:', err);
  }
}

export function getCustomBeforeAfterForProduct(identifier: string): CustomBeforeAfterLook[] | null {
  const custom = getAdminCustomizations();
  if (custom.beforeAfter[identifier] && custom.beforeAfter[identifier].length > 0) {
    return custom.beforeAfter[identifier];
  }
  return null;
}

export function saveCustomBeforeAfterForProduct(identifier: string, looks: CustomBeforeAfterLook[]): void {
  const custom = getAdminCustomizations();
  custom.beforeAfter[identifier] = looks;
  saveAdminCustomizations(custom);
}

export function removeCustomBeforeAfterForProduct(identifier: string): void {
  const custom = getAdminCustomizations();
  delete custom.beforeAfter[identifier];
  saveAdminCustomizations(custom);
}

export function getSavedProductOrder(): string[] {
  const custom = getAdminCustomizations();
  return custom.productOrder || [];
}

export function saveSavedProductOrder(order: string[]): void {
  const custom = getAdminCustomizations();
  custom.productOrder = order;
  saveAdminCustomizations(custom);
}

export function getSavedCollectionOverrides(): Record<string, string[]> {
  const custom = getAdminCustomizations();
  return custom.collectionOverrides || {};
}

export function saveSavedCollectionOverrides(overrides: Record<string, string[]>): void {
  const custom = getAdminCustomizations();
  custom.collectionOverrides = overrides;
  saveAdminCustomizations(custom);
}
