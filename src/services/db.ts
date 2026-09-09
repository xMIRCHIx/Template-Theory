import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AdminCustomizations, CustomBeforeAfterLook } from './adminStore';

const STORAGE_KEY_SUPABASE = 'cinevo_supabase_credentials';

export interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

const DEFAULT_SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ifdsvmiwvwwklvnsnjao.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmZHN2bWl3dnd3a2x2bnNuamFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODIyMDAsImV4cCI6MjEwNDM1ODIwMH0.Vx3w6rQ29hjVQb_BArZruBj2kmiBcRfNFAmPKP1Ujbs';

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

  return {
    url: DEFAULT_SUPABASE_URL,
    anonKey: DEFAULT_SUPABASE_ANON_KEY,
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

// 7. Upload Image or Video Media to Supabase Storage Bucket
export async function uploadMediaToSupabaseStorage(file: File): Promise<{ url?: string; mediaType: 'image' | 'video'; error?: string }> {
  const client = getSupabaseClient();
  const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|m4v|ogg)$/i);
  const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';

  if (!client) {
    return { error: 'Supabase is not configured', mediaType };
  }

  try {
    const fileExt = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
    const folder = isVideo ? 'ugc_videos' : 'looks';
    const fileName = `${mediaType}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await client.storage
      .from('product-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
      });

    if (uploadError) {
      return { error: uploadError.message, mediaType };
    }

    const { data: publicUrlData } = client.storage
      .from('product-media')
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl, mediaType };
  } catch (err: any) {
    return { error: err.message || 'Failed to upload media to Supabase storage', mediaType };
  }
}

// Backward compatibility alias for uploadImageToSupabaseStorage
export async function uploadImageToSupabaseStorage(file: File): Promise<{ url?: string; error?: string }> {
  const res = await uploadMediaToSupabaseStorage(file);
  return { url: res.url, error: res.error };
}

// Upload Base64 Data URL directly to Supabase Storage Bucket
export async function uploadBase64ToSupabaseStorage(base64DataUrl: string, folder = 'looks'): Promise<string> {
  if (!base64DataUrl || !base64DataUrl.startsWith('data:image/')) {
    return base64DataUrl; // Already a CDN URL or empty
  }

  const client = getSupabaseClient();
  if (!client) return base64DataUrl;

  try {
    const res = await fetch(base64DataUrl);
    const blob = await res.blob();
    const mime = base64DataUrl.substring(base64DataUrl.indexOf(':') + 1, base64DataUrl.indexOf(';'));
    const ext = mime.split('/')[1] || 'jpg';
    const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await client.storage
      .from('product-media')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: mime,
      });

    if (uploadError) {
      console.warn('Base64 migration upload error:', uploadError.message);
      return base64DataUrl; // Keep data URL if upload fails so nothing is lost
    }

    const { data: publicUrlData } = client.storage
      .from('product-media')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl || base64DataUrl;
  } catch (err) {
    console.warn('Base64 upload failed:', err);
    return base64DataUrl;
  }
}

// 1-Click Migration: Converts all existing Base64 images in customizations to permanent Supabase Storage Bucket URLs
export async function migrateCustomizationsBase64ToBucket(custom: AdminCustomizations): Promise<{ migratedCount: number; updatedCustomizations: AdminCustomizations }> {
  let count = 0;
  const clone: AdminCustomizations = JSON.parse(JSON.stringify(custom));

  // 1. Migrate Homepage Looks
  if (clone.homepageSettings?.looks) {
    for (const look of clone.homepageSettings.looks) {
      if (look.before?.startsWith('data:image/')) {
        const newUrl = await uploadBase64ToSupabaseStorage(look.before, 'looks');
        if (newUrl !== look.before) {
          look.before = newUrl;
          count++;
        }
      }
      if (look.after?.startsWith('data:image/')) {
        const newUrl = await uploadBase64ToSupabaseStorage(look.after, 'looks');
        if (newUrl !== look.after) {
          look.after = newUrl;
          count++;
        }
      }
    }
  }

  // 2. Migrate Product Before/After Looks
  if (clone.beforeAfter) {
    for (const [prodKey, looks] of Object.entries(clone.beforeAfter)) {
      if (Array.isArray(looks)) {
        for (const look of looks) {
          if (look.before?.startsWith('data:image/')) {
            const newUrl = await uploadBase64ToSupabaseStorage(look.before, 'looks');
            if (newUrl !== look.before) {
              look.before = newUrl;
              count++;
            }
          }
          if (look.after?.startsWith('data:image/')) {
            const newUrl = await uploadBase64ToSupabaseStorage(look.after, 'looks');
            if (newUrl !== look.after) {
              look.after = newUrl;
              count++;
            }
          }
        }
      }
    }
  }

  // 3. Migrate UGC Items Images / Posters
  if (clone.ugcItems && Array.isArray(clone.ugcItems)) {
    for (const item of clone.ugcItems) {
      if (item.image?.startsWith('data:image/')) {
        const newUrl = await uploadBase64ToSupabaseStorage(item.image, 'ugc');
        if (newUrl !== item.image) {
          item.image = newUrl;
          count++;
        }
      }
    }
  }

  return { migratedCount: count, updatedCustomizations: clone };
}

// 8. Video Link Helpers (YouTube Shorts, YouTube, Instagram Reels)
export function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
}

export function getYouTubeEmbedUrl(url?: string): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
}

export function getYouTubeThumbnailUrl(url?: string): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function getInstagramPostId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:p|reel|reels)\/([A-Za-z0-9_-]+)/);
  return match && match[1] ? match[1] : null;
}

// 8. SQL Setup Helper Script for Supabase SQL Editor
export const SUPABASE_SQL_SETUP = `-- Copy and paste this into Supabase SQL Editor to create tables, buckets & RLS:

-- ========================================================
-- 1. STORE CUSTOMIZATIONS TABLE (Before/Afters, UGC, Sort)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.store_customizations (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.store_customizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on store_customizations"
ON public.store_customizations FOR SELECT
USING (true);

CREATE POLICY "Allow public upsert on store_customizations"
ON public.store_customizations FOR ALL
USING (true)
WITH CHECK (true);

-- ========================================================
-- 2. PRODUCT REVIEWS TABLE (Customer Reviews & Star Ratings)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  product_name TEXT,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  is_verified_buyer BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_slug ON public.product_reviews (product_slug, status);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.product_reviews (product_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.product_reviews (created_at DESC);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved reviews"
ON public.product_reviews FOR SELECT
USING (status = 'approved' OR status = 'pending' OR status = 'rejected');

CREATE POLICY "Public can insert reviews"
ON public.product_reviews FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can update reviews"
ON public.product_reviews FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete reviews"
ON public.product_reviews FOR DELETE
USING (true);

-- ========================================================
-- 3. STORAGE BUCKETS (Product Media & Compressed Reviews)
-- ========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-media', 'product-media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public product-media read"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-media');

CREATE POLICY "Public product-media upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-media');

CREATE POLICY "Public review-photos read"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-photos');

CREATE POLICY "Public review-photos upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'review-photos');
`;
