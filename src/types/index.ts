export type ProductCategory = 
  | 'presets' 
  | 'luts' 
  | 'psds' 
  | 'fonts' 
  | 'albums' 
  | 'assets';

export interface BeforeAfterItem {
  id?: string;
  title?: string;
  before: string;
  after: string;
  aspectRatio?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviews: number;
  tagline: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  gallery: string[];
  tags: string[];
  included: string[];
  format: string[];
  compatibility: string[];
  fileSize: string;
  version: string;
  license: 'commercial' | 'extended';
  featured?: boolean;
  bestseller?: boolean;
  new?: boolean;
  itemCount: string;
  beforeAfterImage?: {
    before: string;
    after: string;
  };
  beforeAfterList?: BeforeAfterItem[];
  fontPreviewText?: string;
  fontStyles?: string[];
  psdLayersCount?: number;
  shopifyVariantId?: string;
  currencyCode?: string;
}

export interface CategoryInfo {
  id: ProductCategory;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  iconImage: string;
  themeColor: string;
  filterTags: string[];
}

export interface UGCItem {
  id: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar?: string;
  image: string;
  productSlug: string;
  productName: string;
  productPrice: number;
  caption: string;
  category: ProductCategory;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'products' | 'orders' | 'license' | 'technical';
}

export interface OrderDetails {
  orderId: string;
  date: string;
  customerEmail: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  downloadTokens: Record<string, string>;
}
