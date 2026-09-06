// Admin Customization Persistence Layer
// Stores custom Before/After looks, product display orders, and collection mappings in localStorage

import { UGCItem } from '../types';

export interface CustomBeforeAfterLook {
  id: string;
  title: string;
  before: string;
  after: string;
}

export interface HomepageSettings {
  heading?: string;
  subheading?: string;
  looks: CustomBeforeAfterLook[];
}

export interface AdminCustomizations {
  beforeAfter: Record<string, CustomBeforeAfterLook[]>; // keyed by product slug or id
  homepageSettings?: HomepageSettings; // dedicated homepage settings & looks
  productOrder: string[]; // array of product ids / slugs in custom priority order
  collectionOverrides: Record<string, string[]>; // collection slug -> array of product slugs/ids
  ugcItems?: UGCItem[]; // custom vertical UGC items for continuous marquee
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

function cleanLegacyCustomizations(data: AdminCustomizations): AdminCustomizations {
  const cleanedBA: Record<string, CustomBeforeAfterLook[]> = {};
  for (const [key, looks] of Object.entries(data.beforeAfter || {})) {
    if (Array.isArray(looks)) {
      const validLooks = looks.filter((l) => {
        if (!l || (!l.before && !l.after)) return false;
        // Purge legacy mock sample IDs from early development
        if (l.id && (l.id.startsWith('ba-film') || l.id.startsWith('ba-travel') || l.id.startsWith('ba-lut') || l.id.startsWith('ba-moody'))) {
          return false;
        }
        return true;
      });
      if (validLooks.length > 0) {
        cleanedBA[key] = validLooks;
      }
    }
  }
  return {
    ...data,
    beforeAfter: cleanedBA,
  };
}

export function getAdminCustomizations(): AdminCustomizations {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { beforeAfter: {}, productOrder: [], collectionOverrides: {} };
    }
    const parsed = JSON.parse(raw);
    const cleaned = cleanLegacyCustomizations({
      beforeAfter: parsed.beforeAfter || {},
      homepageSettings: parsed.homepageSettings,
      productOrder: Array.isArray(parsed.productOrder) ? parsed.productOrder : [],
      collectionOverrides: parsed.collectionOverrides || {},
      ugcItems: Array.isArray(parsed.ugcItems) ? parsed.ugcItems : [],
    });
    return cleaned;
  } catch (err) {
    console.warn('Failed to read admin customizations from localStorage:', err);
    return { beforeAfter: {}, productOrder: [], collectionOverrides: {} };
  }
}

export function getSavedHomepageSettings(): HomepageSettings | null {
  const custom = getAdminCustomizations();
  if (custom.homepageSettings && Array.isArray(custom.homepageSettings.looks)) {
    return custom.homepageSettings;
  }
  // Fallback to legacy beforeAfter keys if exists
  const legacy = custom.beforeAfter['__home_showcase__'] || custom.beforeAfter['home'] || custom.beforeAfter['homepage'];
  if (legacy && Array.isArray(legacy) && legacy.length > 0) {
    return {
      heading: 'See the Difference',
      subheading: 'One click. Completely different mood. Drag the slider to compare.',
      looks: legacy,
    };
  }
  return null;
}

export function saveSavedHomepageSettings(settings: HomepageSettings): void {
  const custom = getAdminCustomizations();
  custom.homepageSettings = settings;
  // Also keep backward compatible key
  custom.beforeAfter['__home_showcase__'] = settings.looks;
  custom.beforeAfter['home'] = settings.looks;
  saveAdminCustomizations(custom);
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

export function getSavedUGCItems(): UGCItem[] {
  const custom = getAdminCustomizations();
  return custom.ugcItems || [];
}

export function saveSavedUGCItems(items: UGCItem[]): void {
  const custom = getAdminCustomizations();
  custom.ugcItems = items;
  saveAdminCustomizations(custom);
}

