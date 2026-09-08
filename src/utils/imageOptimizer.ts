/**
 * High-performance image optimization helper.
 * Automatically transforms Shopify CDN and Unsplash image URLs to WebP format,
 * custom responsive dimensions, and optimal compression quality.
 */

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
      parsed.searchParams.set('width', width.toString());
      parsed.searchParams.set('format', 'webp');
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
