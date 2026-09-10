/**
 * Meta Pixel Tracking Utility for Template Theory
 * Pixel / Dataset ID: 1462897352329408
 */

export const META_PIXEL_ID = '1462897352329408';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

/**
 * Track generic page view on route transitions
 */
export const trackMetaPageView = () => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
};

/**
 * Track when customer views a specific digital product
 */
export const trackMetaViewContent = (product: {
  id: string;
  name: string;
  category?: string;
  price: number;
}) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'ViewContent', {
      content_name: product.name,
      content_category: product.category || 'Digital Asset',
      content_ids: [product.id],
      content_type: 'product',
      value: product.price,
      currency: 'INR',
    });
  }
};

/**
 * Track Add To Cart event
 */
export const trackMetaAddToCart = (product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'AddToCart', {
      content_name: product.name,
      content_category: product.category || 'Digital Asset',
      content_ids: [product.id],
      content_type: 'product',
      value: product.price,
      currency: 'INR',
    });
  }
};

/**
 * Track Initiate Checkout event
 */
export const trackMetaInitiateCheckout = (totalValue: number, itemCount: number) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      value: totalValue,
      currency: 'INR',
      num_items: itemCount,
      content_type: 'product',
    });
  }
};

/**
 * Track Purchase event
 */
export const trackMetaPurchase = (orderId: string, totalValue: number) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'Purchase', {
      value: totalValue,
      currency: 'INR',
      content_type: 'product',
      order_id: orderId,
    });
  }
};
