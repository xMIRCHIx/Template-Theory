/**
 * Template Theory — Master SEO & Metadata Architecture
 * Comprehensive SEO configurations, category presets, curated social hashtags,
 * keyword matrices, and Schema.org JSON-LD generators.
 */

import { Product } from '../types';

export const SITE_SEO_CONFIG = {
  siteName: 'Template Theory',
  tagline: 'Premium Digital Assets for Creators, Filmmakers & Designers',
  defaultTitle: 'Template Theory — Premium Digital Assets for Modern Creators',
  titleTemplate: '%s | Template Theory',
  defaultDescription:
    'Handcrafted Lightroom presets, cinematic video LUTs, Photoshop album PSDs, luxury display fonts, and creative 3D assets. Instant digital download, commercial license & lifetime access.',
  siteUrl: 'https://templatetheory.com',
  defaultOgImage: 'https://templatetheory.com/images/logo-square.png',
  locale: 'en_US',
  author: 'Template Theory & synchAD',
  twitterHandle: '@template_theory_',
  instagramHandle: '@template_theory_',
  whatsappNumber: '+918109280664',
  currency: 'INR',
  currencySymbol: '₹',
};

export interface PageSEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  hashtags: string[];
  canonicalPath: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
}

/**
 * Curated Hashtags Matrices for Social Media Marketing
 * (Instagram Reels, TikTok, Pinterest, YouTube Shorts, X/Twitter)
 */
export const HASHTAG_BANKS = {
  global: [
    '#templatetheory',
    '#creativeassets',
    '#digitalassets',
    '#contentcreator',
    '#creativecommunity',
    '#graphicdesign',
    '#visualarts',
    '#designresources',
    '#creatorlifestyle',
    '#creatorpack',
  ],
  presets: [
    '#lightroompresets',
    '#lightroommobile',
    '#lightroompack',
    '#photopresets',
    '#weddingpresets',
    '#moodypresets',
    '#filmpresets',
    '#cameraraw',
    '#portraitphotography',
    '#streetphotography',
    '#travelphotographer',
    '#photoediting',
    '#adobelightroom',
    '#filmtone',
    '#vintagetones',
  ],
  luts: [
    '#cinematicluts',
    '#colorgrading',
    '#lutpack',
    '#davinciresolve',
    '#premierepro',
    '#finalcutpro',
    '#capcutedit',
    '#filmmakerslife',
    '#cinematography',
    '#reelsediting',
    '#videoeditor',
    '#colorgrade',
    '#moodycine',
    '#cinematictones',
    '#filmmakinggear',
  ],
  psds: [
    '#photoshoptemplates',
    '#albumpsd',
    '#weddingalbumdesign',
    '#photobooktemplates',
    '#albumspreads',
    '#adobephotoshop',
    '#editorialdesign',
    '#photobook',
    '#layoutdesign',
    '#photoshopresources',
    '#magazinecover',
    '#albummaker',
  ],
  fonts: [
    '#displayfonts',
    '#typography',
    '#typefacedesign',
    '#modernfonts',
    '#serifonts',
    '#lettering',
    '#brandingfonts',
    '#typographydesign',
    '#creativefonts',
    '#fontcollector',
    '#logodesignfonts',
  ],
  assets: [
    '#3dassets',
    '#clay3d',
    '#designelements',
    '#vectorassets',
    '#texturepack',
    '#graphicdesignresources',
    '#uidesignassets',
    '#gradientspack',
    '#3delements',
  ],
};

/**
 * Detailed SEO Metadata for Core Pages
 */
export const CORE_PAGES_SEO: Record<string, PageSEOMetadata> = {
  home: {
    title: 'Template Theory — Premium Digital Assets for Modern Creators',
    description:
      'Explore handcrafted Lightroom presets, cinematic video LUTs, Photoshop album templates, luxury display fonts, and 3D creative assets. Instant download & lifetime commercial use.',
    keywords: [
      'Template Theory',
      'digital assets for creators',
      'lightroom presets bundle',
      'cinematic LUTs pack',
      'photoshop album psd',
      'display fonts for designers',
      'video color grading',
      'creative assets store',
      'davinci resolve luts',
      'wedding photo presets',
    ],
    hashtags: [
      ...HASHTAG_BANKS.global,
      ...HASHTAG_BANKS.presets.slice(0, 4),
      ...HASHTAG_BANKS.luts.slice(0, 4),
    ],
    canonicalPath: '/',
    ogType: 'website',
  },
  shop: {
    title: 'Shop All Digital Assets — Presets, LUTs, PSDs & Fonts | Template Theory',
    description:
      'Browse our complete library of creator tools. Filter through professional photo presets, cinematic video LUTs, album PSD templates, premium fonts, and 3D graphics.',
    keywords: [
      'buy lightroom presets',
      'download video LUTs',
      'photoshop templates buy',
      'creator assets catalog',
      'creative bundle',
      'wedding photo album psd',
      'cinematic color grades',
    ],
    hashtags: [...HASHTAG_BANKS.global, ...HASHTAG_BANKS.luts.slice(0, 5)],
    canonicalPath: '/shop',
    ogType: 'website',
  },
  collections: {
    title: 'Curated Collections — Discover Creator Toolkits | Template Theory',
    description:
      'Organized creative toolkits tailored for photographers, filmmakers, branding studios, and social media creators. Elevate your visual identity in seconds.',
    keywords: [
      'creative collections',
      'photography presets collection',
      'filmmaker lut bundle',
      'photoshop album collection',
      'typography bundles',
    ],
    hashtags: HASHTAG_BANKS.global,
    canonicalPath: '/collections',
    ogType: 'website',
  },
  about: {
    title: 'About Template Theory — Crafting Visual Excellence for Creators',
    description:
      'Learn about Template Theory, our philosophy on visual aesthetics, and how we empower thousands of creators, editors, and studios worldwide with top-tier assets.',
    keywords: [
      'about template theory',
      'creator asset studio',
      'digital tools for creators',
      'color grading specialists',
    ],
    hashtags: HASHTAG_BANKS.global,
    canonicalPath: '/about',
    ogType: 'website',
  },
  faq: {
    title: 'Frequently Asked Questions & Help Center | Template Theory',
    description:
      'Find answers about licensing, instant download delivery, software compatibility (Lightroom, Premiere, DaVinci, Photoshop, CapCut), and lifetime access.',
    keywords: [
      'template theory faq',
      'how to install luts',
      'how to use lightroom presets',
      'commercial license terms',
      'instant download help',
    ],
    hashtags: HASHTAG_BANKS.global,
    canonicalPath: '/faq',
    ogType: 'website',
  },
  contact: {
    title: 'Contact Support & Inquiries | Template Theory',
    description:
      'Get in touch with the Template Theory team for order assistance, custom licensing, brand collaborations, or technical questions.',
    keywords: [
      'contact template theory',
      'customer support',
      'asset licensing inquiry',
      'creator partnerships',
    ],
    hashtags: HASHTAG_BANKS.global,
    canonicalPath: '/contact',
    ogType: 'website',
  },
};

/**
 * Category-specific SEO matrices
 */
export const CATEGORY_SEO: Record<string, PageSEOMetadata> = {
  presets: {
    title: 'Lightroom & Camera Raw Presets — One-Click Pro Color Tones | Template Theory',
    description:
      'Transform your RAW and JPEG photos with professional Lightroom presets. Built for desktop and mobile, supporting Sony, Canon, Nikon, and Fujifilm color profiles.',
    keywords: [
      'lightroom presets',
      'camera raw presets',
      'lightroom mobile presets',
      'wedding photography presets',
      'moody brown presets',
      'film emulation presets',
      'vintage aesthetic presets',
      'portrait lightroom filters',
    ],
    hashtags: HASHTAG_BANKS.presets,
    canonicalPath: '/collections/presets',
    ogType: 'website',
  },
  luts: {
    title: 'Cinematic 3D LUTs — DaVinci Resolve, Premiere Pro & CapCut | Template Theory',
    description:
      'Professional .CUBE LUTs engineered for Sony S-Log3, Canon C-Log, D-Log, Blackmagic, and standard Rec.709 footage. Achieve cinematic film looks instantly.',
    keywords: [
      'cinematic luts',
      'cube luts download',
      'davinci resolve color grading',
      'premiere pro video luts',
      'slog3 cinematic lut',
      'rec709 color grade',
      'teal and orange lut',
      'capcut cinematic filters',
    ],
    hashtags: HASHTAG_BANKS.luts,
    canonicalPath: '/collections/luts',
    ogType: 'website',
  },
  psds: {
    title: 'Photoshop Album PSD Templates & Spreads | Template Theory',
    description:
      'High-resolution, fully layered PSD templates for wedding photobooks, editorial spreads, magazine covers, and social media carousels. Easy smart object editing.',
    keywords: [
      'photoshop album psd',
      'wedding album templates',
      'photobook layout psd',
      'magazine spread template',
      'editorial photo layout',
      'layered psd design',
    ],
    hashtags: HASHTAG_BANKS.psds,
    canonicalPath: '/collections/psds',
    ogType: 'website',
  },
  fonts: {
    title: 'Display Fonts & Creative Typography | Template Theory',
    description:
      'Distinctive handcrafted display fonts, luxury serif typefaces, modern sans-serifs, and expressive lettering fonts for logos, posters, and editorial branding.',
    keywords: [
      'display fonts',
      'creative typography',
      'luxury serif font',
      'branding font download',
      'modern sans font',
      'commercial font license',
    ],
    hashtags: HASHTAG_BANKS.fonts,
    canonicalPath: '/collections/fonts',
    ogType: 'website',
  },
  assets: {
    title: '3D Clay Shapes, Vector Badges & Design Elements | Template Theory',
    description:
      'Handcrafted 3D clay objects, high-resolution textures, gradients, overlays, and UI element resources for modern web designers and content creators.',
    keywords: [
      '3d clay assets',
      'vector badges',
      'graphic design textures',
      'gradient overlays',
      'ui elements pack',
    ],
    hashtags: HASHTAG_BANKS.assets,
    canonicalPath: '/collections/assets',
    ogType: 'website',
  },
};

// ==========================================
// Schema.org JSON-LD Structured Data Generators
// ==========================================

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_SEO_CONFIG.siteUrl}/#organization`,
    name: SITE_SEO_CONFIG.siteName,
    url: SITE_SEO_CONFIG.siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_SEO_CONFIG.siteUrl}/images/logo-square.png`,
      width: '512',
      height: '512',
    },
    sameAs: [
      'https://www.instagram.com/template_theory_/',
      'https://synchad.online/',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE_SEO_CONFIG.whatsappNumber,
      contactType: 'customer support',
      availableLanguage: ['English', 'Hindi'],
    },
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_SEO_CONFIG.siteUrl}/#website`,
    url: SITE_SEO_CONFIG.siteUrl,
    name: SITE_SEO_CONFIG.siteName,
    description: SITE_SEO_CONFIG.defaultDescription,
    publisher: {
      '@id': `${SITE_SEO_CONFIG.siteUrl}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_SEO_CONFIG.siteUrl}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateProductSchema(product: Product, reviewsCount = 47, rating = 4.9) {
  const productUrl = `${SITE_SEO_CONFIG.siteUrl}/product/${product.slug || product.id}`;
  const imageUrl = product.thumbnail.startsWith('http')
    ? product.thumbnail
    : `${SITE_SEO_CONFIG.siteUrl}${product.thumbnail}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.name,
    description:
      product.description ||
      `Get ${product.name} with instant digital download, commercial usage rights, and lifetime access from Template Theory.`,
    image: [imageUrl],
    sku: `TT-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: SITE_SEO_CONFIG.siteName,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: SITE_SEO_CONFIG.currency,
      price: product.price,
      priceValidUntil: '2028-12-31',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: SITE_SEO_CONFIG.siteName,
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating.toString(),
      reviewCount: reviewsCount.toString(),
      bestRating: '5',
      worstRating: '1',
    },
  };
}

export function generateCollectionSchema(categoryName: string, products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName} | Template Theory`,
    description: `Browse ${categoryName} digital asset collection with instant download and lifetime updates.`,
    url: `${SITE_SEO_CONFIG.siteUrl}/collections/${categoryName.toLowerCase()}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.map((prod, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_SEO_CONFIG.siteUrl}/product/${prod.slug || prod.id}`,
        name: prod.name,
      })),
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: `${SITE_SEO_CONFIG.siteUrl}${item.path}`,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
