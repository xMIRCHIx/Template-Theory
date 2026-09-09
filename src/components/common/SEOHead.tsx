import React, { useEffect } from 'react';
import { SITE_SEO_CONFIG } from '../../utils/seoConfig';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string | string[];
  canonicalPath?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

/**
 * Helper to update or create meta tag by name or property
 */
function setMetaTag(attribute: 'name' | 'property', key: string, content: string | undefined) {
  if (!content) return;
  let element = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Helper to update or create canonical link tag
 */
function setCanonical(url: string) {
  let element = document.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', url);
}

/**
 * Helper to update or create JSON-LD script tag
 */
function setJsonLd(data: Record<string, any> | Array<Record<string, any>> | undefined) {
  const SCRIPT_ID = 'seo-json-ld-schema';
  let element = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  
  if (!data) {
    if (element) element.remove();
    return;
  }

  if (!element) {
    element = document.createElement('script');
    element.id = SCRIPT_ID;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }
  
  element.textContent = JSON.stringify(data);
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonicalPath,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  noIndex = false,
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Page Title
    const formattedTitle = title
      ? title.includes(SITE_SEO_CONFIG.siteName)
        ? title
        : `${title} | ${SITE_SEO_CONFIG.siteName}`
      : SITE_SEO_CONFIG.defaultTitle;
    document.title = formattedTitle;

    // 2. Meta Description
    const metaDesc = description || SITE_SEO_CONFIG.defaultDescription;
    setMetaTag('name', 'description', metaDesc);

    // 3. Keywords
    if (keywords) {
      const keywordString = Array.isArray(keywords) ? keywords.join(', ') : keywords;
      setMetaTag('name', 'keywords', keywordString);
    }

    // 4. Robots Directives
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // 5. Canonical URL
    const canonicalUrl = canonicalPath
      ? `${SITE_SEO_CONFIG.siteUrl}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`
      : SITE_SEO_CONFIG.siteUrl;
    setCanonical(canonicalUrl);

    // 6. OpenGraph Metadata (Facebook, WhatsApp, LinkedIn, Pinterest)
    const finalOgTitle = ogTitle || formattedTitle;
    const finalOgDesc = ogDescription || metaDesc;
    const finalOgImage = ogImage || SITE_SEO_CONFIG.defaultOgImage;

    setMetaTag('property', 'og:site_name', SITE_SEO_CONFIG.siteName);
    setMetaTag('property', 'og:title', finalOgTitle);
    setMetaTag('property', 'og:description', finalOgDesc);
    setMetaTag('property', 'og:image', finalOgImage);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:locale', SITE_SEO_CONFIG.locale);

    // 7. Twitter Card Metadata (X / Twitter)
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:site', SITE_SEO_CONFIG.twitterHandle);
    setMetaTag('name', 'twitter:creator', SITE_SEO_CONFIG.twitterHandle);
    setMetaTag('name', 'twitter:title', finalOgTitle);
    setMetaTag('name', 'twitter:description', finalOgDesc);
    setMetaTag('name', 'twitter:image', finalOgImage);

    // 8. Schema.org JSON-LD Structured Data
    setJsonLd(jsonLd);

    return () => {
      // Optional cleanup
    };
  }, [
    title,
    description,
    keywords,
    canonicalPath,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    noIndex,
    jsonLd,
  ]);

  return null;
};
