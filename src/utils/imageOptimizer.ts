/**
 * High-performance image optimization helper.
 * Automatically transforms Shopify CDN and Unsplash image URLs to WebP format,
 * custom responsive dimensions, and optimal compression quality.
 */

const LOCAL_OPTIMIZED_WEBP: Record<string, string> = {
  'ChatGPTImageJul30_2026_01_05_48AM.png': '/images/products/ChatGPTImageJul30_2026_01_05_48AM.webp',
  'ChatGPTImageJul30_2026_12_31_05AM.png': '/images/products/ChatGPTImageJul30_2026_12_31_05AM.webp',
  'ChatGPTImageJul30_2026_12_38_06AM.png': '/images/products/ChatGPTImageJul30_2026_12_38_06AM.webp',
  'ChatGPTImageJul30_2026_12_45_38AM_1.png': '/images/products/ChatGPTImageJul30_2026_12_45_38AM_1.webp',
  'ChatGPTImageJul30_2026_12_58_37AM.png': '/images/products/ChatGPTImageJul30_2026_12_58_37AM.webp',
  'ChatGPTImageJun27_2026_03_11_57AM.png': '/images/products/ChatGPTImageJun27_2026_03_11_57AM.webp',
  'ChatGPTImageJun27_2026_03_13_48AM.png': '/images/products/ChatGPTImageJun27_2026_03_13_48AM.webp',
  'ChatGPTImageJun27_2026_03_19_22AM.png': '/images/products/ChatGPTImageJun27_2026_03_19_22AM.webp',
  'ChatGPTImageJun27_2026_03_19_26AM.png': '/images/products/ChatGPTImageJun27_2026_03_19_26AM.webp',
  'ChatGPTImageJun27_2026_03_26_09AM.png': '/images/products/ChatGPTImageJun27_2026_03_26_09AM.webp',
  'ChatGPT_Image_Jun_27_2026_02_45_51_AM.png': '/images/products/ChatGPT_Image_Jun_27_2026_02_45_51_AM.webp',
  'ChatGPT_Image_Jun_27_2026_03_13_48_AM.png': '/images/products/ChatGPT_Image_Jun_27_2026_03_13_48_AM.webp',
  'ChatGPT_Image_Jun_27_2026_03_19_22_AM.png': '/images/products/ChatGPT_Image_Jun_27_2026_03_19_22_AM.webp',
  'ChatGPT_Image_Jun_27_2026_03_19_26_AM.png': '/images/products/ChatGPT_Image_Jun_27_2026_03_19_26_AM.webp',
  'ChatGPT_Image_Jun_27_2026_04_07_39_AM.png': '/images/products/ChatGPT_Image_Jun_27_2026_04_07_39_AM.webp',
  'Screenshot2026-07-09072220.png': '/images/products/Screenshot2026-07-09072220.webp',
  'Screenshot2026-07-09072331.png': '/images/products/Screenshot2026-07-09072331.webp',
  'Screenshot2026-07-09072355.png': '/images/products/Screenshot2026-07-09072355.webp',
  'Screenshot2026-07-09072432.png': '/images/products/Screenshot2026-07-09072432.webp',
  'Screenshot2026-07-09072456.png': '/images/products/Screenshot2026-07-09072456.webp',
  'Screenshot2026-07-09072457.png': '/images/products/Screenshot2026-07-09072457.webp',
  'Screenshot2026-07-09072517.png': '/images/products/Screenshot2026-07-09072517.webp',
  'White-Minimalist-Cover.png': '/images/products/White-Minimalist-Cover.webp',
};

export function optimizeImageUrl(
  url: string | undefined | null,
  width = 800,
  quality = 80
): string {
  if (!url || typeof url !== 'string') return '';

  const cleanUrl = url.trim();
  if (!cleanUrl) return '';

  // Local assets or data URLs
  if (cleanUrl.startsWith('/') || cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) {
    return cleanUrl;
  }

  try {
    const parsed = new URL(cleanUrl);

    // 1. Shopify CDN Images
    if (parsed.hostname.includes('cdn.shopify.com')) {
      const filename = parsed.pathname.split('/').pop()?.split('?')[0];
      if (filename && LOCAL_OPTIMIZED_WEBP[filename]) {
        return LOCAL_OPTIMIZED_WEBP[filename];
      }
      parsed.searchParams.set('width', width.toString());
      parsed.searchParams.set('quality', quality.toString());
      return parsed.toString();
    }

    // 2. Unsplash Images
    if (parsed.hostname.includes('images.unsplash.com')) {
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', 'crop');
      parsed.searchParams.set('w', width.toString());
      parsed.searchParams.set('q', quality.toString());
      parsed.searchParams.set('fm', 'webp');
      return parsed.toString();
    }

    return cleanUrl;
  } catch {
    // If URL parsing fails, return the original string
    return cleanUrl;
  }
}

/**
 * Returns a high-efficiency responsive srcSet string for modern responsive picture/img tags.
 */
export function getOptimizedSrcSet(
  url: string | undefined | null,
  widths = [360, 640, 960, 1280]
): string {
  if (!url) return '';
  return widths
    .map((w) => `${optimizeImageUrl(url, w)} ${w}w`)
    .join(', ');
}
