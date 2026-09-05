import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AdminCustomizations, CustomBeforeAfterLook } from './adminStore';

const STORAGE_KEY_SUPABASE = 'cinevo_supabase_credentials';

export interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

// 1. Get Active Credentials (from Env or Local Settings)
export function getSupabaseCredentials(): SupabaseCredentials {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUPABASE);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: envUrl,
    anonKey: envKey,
  };
}

// 2. Save Credentials to Local Storage
export function saveSupabaseCredentials(creds: SupabaseCredentials): void {
  localStorage.setItem(STORAGE_KEY_SUPABASE, JSON.stringify(creds));
}

// 3. Supabase Client Singleton
let cachedClient: SupabaseClient | null = null;
let lastClientUrl = '';
let lastClientKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey || !url.startsWith('https://')) {
    return null;
  }

  if (cachedClient && lastClientUrl === url && lastClientKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey);
    lastClientUrl = url;
    lastClientKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

// 4. Test Supabase Database Connection
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase URL or Anon Key is missing or invalid.',
    };
  }

  try {
    // Try to query the store_customizations table
    const { data, error } = await client
      .from('store_customizations')
      .select('id, updated_at')
      .limit(1);

    if (error) {
      // If table does not exist yet, report clear schema guidance
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          success: false,
          message: 'Connected to Supabase project, but "store_customizations" table is not created yet. Please run the 1-click SQL setup script in Supabase.',
        };
      }
      return {
        success: false,
        message: `Supabase query error: ${error.message}`,
      };
    }

    return {
      success: true,
      message: '✓ Successfully connected to Supabase Cloud Database!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err.message || err}`,
    };
  }
}

// 5. Fetch Customizations from Supabase Cloud Database
export async function fetchCustomizationsFromCloud(): Promise<AdminCustomizations | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('store_customizations')
      .select('payload')
      .eq('id', 'template_theory_master')
      .single();

    if (error || !data?.payload) {
      return null;
    }

    return data.payload as AdminCustomizations;
  } catch (err) {
    console.warn('Error fetching customizations from Supabase:', err);
    return null;
  }
}

// 6. Save Customizations to Supabase Cloud Database
export async function saveCustomizationsToCloud(customizations: AdminCustomizations): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase is not configured.' };
  }

  try {
    const { error } = await client
      .from('store_customizations')
      .upsert({
        id: 'template_theory_master',
        payload: customizations,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown database error' };
  }
}

// 7. Upload Image to Supabase Storage Bucket
export async function uploadImageToSupabaseStorage(file: File): Promise<{ url?: string; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Supabase is not configured' };
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `ba_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `looks/${fileName}`;

    const { error: uploadError } = await client.storage
      .from('product-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data: publicUrlData } = client.storage
      .from('product-media')
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl };
  } catch (err: any) {
    return { error: err.message || 'Failed to upload image to Supabase storage' };
  }
}

// 8. SQL Setup Helper Script for Supabase SQL Editor
export const SUPABASE_SQL_SETUP = `-- Copy and paste this into Supabase SQL Editor to create the tables & storage:

-- 1. Create store_customizations table
CREATE TABLE IF NOT EXISTS public.store_customizations (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Public Read & Authenticated/Anon Upsert
ALTER TABLE public.store_customizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on store_customizations"
ON public.store_customizations FOR SELECT
USING (true);

CREATE POLICY "Allow public upsert on store_customizations"
ON public.store_customizations FOR ALL
USING (true)
WITH CHECK (true);

-- 3. Create Storage bucket for Before/After photos (optional for high-res CDN)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-media', 'product-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public media access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-media');

CREATE POLICY "Public media upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-media');
`;
