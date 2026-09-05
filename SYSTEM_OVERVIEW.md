# 🎬 CINEVO / TEMPLATE THEORY — SYSTEM ARCHITECTURE & DEVELOPER GUIDE

> **Master Technical Overview & Migration Blueprint**  
> Complete documentation of the Frontend Architecture, Shopify Headless Integration, State Management, External Vercel Deployment, and Developer Migration Protocols.

---

## 📌 TABLE OF CONTENTS
1. [Project Overview & Brand Purpose](#1-project-overview--brand-purpose)
2. [High-Level Architecture & Data Flow](#2-high-level-architecture--data-flow)
3. [Shopify Headless Integration Engine](#3-shopify-headless-integration-engine)
4. [State Management & Global Contexts](#4-state-management--global-contexts)
5. [Key Components & Interactive Feature Catalog](#5-key-components--interactive-feature-catalog)
6. [Design System & Styling Philosophy](#6-design-system--styling-philosophy)
7. [Vercel Deployment & External Hosting](#7-vercel-deployment--external-hosting)
8. [Complete File & Directory Inventory](#8-complete-file--directory-inventory)
9. [Migration Guide for New Machines & AI Agents](#9-migration-guide-for-new-machines--ai-agents)

---

## 1. PROJECT OVERVIEW & BRAND PURPOSE

**Cinevo (Template Theory)** is an ultra-fast, premium **Headless E-Commerce Web Application** designed for digital creators, filmmakers, photographers, and graphic designers.

### What it Sells:
- 🎥 **Cinematic 3D LUTs** (`.CUBE`, `.3DL`, `.LOOK` for Premiere Pro, DaVinci Resolve, Final Cut Pro)
- 📸 **Lightroom Presets** (`.XMP`, `.DNG` for Desktop & Mobile)
- 🔤 **Editorial & Display Fonts** (`.OTF`, `.TTF`, `.WOFF2` with interactive live type tester)
- 🖼️ **Photoshop Templates & Mockups** (`.PSD` layered files with smart objects)
- 📖 **Creator Albums & Lookbooks** (Digital editorial assets)

### Core Tech Stack:
- **Core Runtime**: React 18 (TypeScript) + Vite 6
- **Styling Engine**: Pure Vanilla CSS (`global.css`, `tokens.css`, `animations.css`) with Claymorphism & Warm Earth-Tone Palette
- **Animation Suite**: Framer Motion + Canvas Confetti + Custom Hardware-Accelerated CSS Transitions
- **Icons**: Lucide React
- **Backend / E-Commerce Engine**: Shopify Storefront GraphQL API (Headless Architecture)
- **Deployment & Hosting**: Vercel Global Edge Network (with Netlify / Cloudflare Pages compatibility)

---

## 2. HIGH-LEVEL ARCHITECTURE & DATA FLOW

This application utilizes a **Decoupled (Headless) E-Commerce Architecture**:

```
 ┌─────────────────────────────────────────────────────────┐
 │               CLIENT BROWSER (User Device)               │
 └────────────────────────────┬────────────────────────────┘
                              │
               1. HTTPS Requests & CDN Assets
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │             VERCEL GLOBAL EDGE NETWORK (SPA)            │
 │   - React 18 + Vite Production Bundle                   │
 │   - Client-Side React Router v6                         │
 │   - vercel.json SPA Rewrites                            │
 └─────────────┬─────────────────────────────▲─────────────┘
               │                             │
    2. GraphQL Queries (Storefront API)      │ 3. JSON Product Data
               │                             │
               ▼                             │
 ┌───────────────────────────────────────────┴─────────────┐
 │             SHOPIFY HEADLESS BACKEND                    │
 │   - Domain: template-theory-2.myshopify.com             │
 │   - Products, Variants, Collections, Images, Tags       │
 │   - Inventory Management & Discount Codes               │
 └────────────────────────────┬────────────────────────────┘
                              │
           4. Direct Checkout Session Creation (`cartCreate`)
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │           SHOPIFY OFFICIAL CHECKOUT ENGINE              │
 │   - PCI-Compliant Payment Gateway (Cards, UPI, PayPal)  │
 │   - Tax, Invoicing, Customer Email Automations          │
 │   - Instant Digital Download Delivery                   │
 └─────────────────────────────────────────────────────────┘
```

---

## 3. SHOPIFY HEADLESS INTEGRATION ENGINE

The bridge between React and Shopify is located in [`src/services/shopify.ts`](file:///c:/Users/Aryan%20Gupta/Downloads/cinevo/src/services/shopify.ts) and [`src/context/ShopifyContext.tsx`](file:///c:/Users/Aryan%20Gupta/Downloads/cinevo/src/context/ShopifyContext.tsx).

### Environment Configuration:
The connection is established using three environment variables:
```env
VITE_SHOPIFY_STORE_DOMAIN=template-theory-2.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=e9c5ed69764a1c1ee180980e3e8a5434
VITE_SHOPIFY_API_VERSION=2024-07
```

### Key API Functions:

#### 1. `shopifyFetch<T>()`
Executes raw GraphQL queries over HTTPS directly against `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json` with the `X-Shopify-Storefront-Access-Token` header.

#### 2. `fetchLiveShopifyProducts()`
Fetches all active products from Shopify via `GET_ALL_PRODUCTS_QUERY`.
- Automatically queries title, description, tags, price ranges, compare-at prices, productType, images, and variants.
- If Shopify API is unreachable or returns 0 products, the app gracefully falls back to [`src/data/products.ts`](file:///c:/Users/Aryan%20Gupta/Downloads/cinevo/src/data/products.ts) without crashing or displaying blank screens.

#### 3. Automatic Category Classifier (`inferCategory()`)
Analyzes product title, tags, and productType to automatically categorize products:
- Contains `lut` or `cube` → `'luts'`
- Contains `preset`, `xmp`, `dng`, `lightroom` → `'presets'`
- Contains `font`, `typeface`, `otf`, `serif` → `'fonts'`
- Contains `album`, `lookbook` → `'albums'`
- Contains `psd`, `mockup`, `stationery` → `'psds'`
- Default fallback → `'assets'`

#### 4. Instant Direct Checkout (`createShopifyCheckoutSession()`)
When a customer clicks **"Buy Now"** or checks out from the Cart Drawer:
- The app executes the `CREATE_CART_MUTATION` (`cartCreate`).
- Sends selected line items with Shopify `merchandiseId` (Variant ID) and `quantity`.
- Returns a unique, secure Shopify `checkoutUrl` (e.g. `https://template-theory-2.myshopify.com/checkouts/cn/...`).
- Instantly redirects the user to the official Shopify checkout where payment gateways (Razorpay, UPI, Credit Cards, PayPal) process the transaction securely.

---

## 4. STATE MANAGEMENT & GLOBAL CONTEXTS

The application uses three React Context Providers wrapped in [`src/App.tsx`](file:///c:/Users/Aryan%20Gupta/Downloads/cinevo/src/App.tsx):

```tsx
<ShopifyProvider>
  <CartProvider>
    <WishlistProvider>
      <AppContent />
    </WishlistProvider>
  </CartProvider>
</ShopifyProvider>
```

### 1. `ShopifyContext` (`src/context/ShopifyContext.tsx`)
- Fetches and stores the live product catalog from Shopify.
- Exposes `products`, `featuredProducts`, `bestsellerProducts`, `isLoading`, `error`, `currencySymbol`, `currencyCode`, and `checkoutWithShopify(product)`.
- Handles one-click "Buy Now" checkout workflows.

### 2. `CartContext` (`src/context/CartContext.tsx`)
- Manages client-side shopping bag items with quantity adjustment, removal, and clear actions.
- Automatically persists cart items in browser `localStorage` (`cinevo_cart_items`).
- Provides `totalItems`, `subtotal`, and `checkoutWithShopifyCart()` which packages the entire cart into a Shopify checkout session.

### 3. `WishlistContext` (`src/context/WishlistContext.tsx`)
- Allows users to bookmark/save favorite digital products.
- Persists items in `localStorage` (`cinevo_wishlist_items`).
- Exposes `savedItems`, `wishlistCount`, `isInWishlist(id)`, and `toggleWishlist(product)`.

---

## 5. KEY COMPONENTS & INTERACTIVE FEATURE CATALOG

### 1. Dynamic Island Top Header (`src/components/layout/Header.tsx`)
- Floating frosted glass dynamic pill navigation with `backdrop-filter: blur(28px)`.
- Sticky navigation across all pages including product detail pages.
- Real-time search trigger, wishlist badge counter, and cart drawer launcher.

### 2. Interactive Hero Scene (`src/components/hero/HeroScene.tsx`)
- Hardware-accelerated 3D clay floating elements (Cameras, Color Cubes, Type Blocks, Preset Cards).
- Multi-layered mouse/gyroscope parallax tracking via `useHeroParallax.ts`.
- Magnetic CTA buttons with responsive spring physics.

### 3. Before/After Split Comparison Engine (`src/components/comparison/BeforeAfterSlider.tsx`)
- Smooth interactive touch and pointer divider with horizontal drag constraints.
- **Dual-Layer Smart Auto-Containment**:
  - *Backdrop*: Ambient blurred version of the photo (`filter: blur(32px)`) filling any letterbox/pillarbox space seamlessly.
  - *Foreground*: Crisp, uncropped photo rendered with `object-fit: contain` so **100% of any uploaded image (9:16 vertical reels, 1:1 square, or 16:9 cinema widescreen) is visible without being cropped or overflowing the screen**.
- Comprehensive `onError` fallback handlers preventing broken image icons.

### 4. High-Resolution Fullscreen Lightbox (`src/pages/ProductDetailPage.tsx`)
- GPU-accelerated horizontal swipe carousel track (`translate3d`).
- 2x zoom toggle with smooth focal pan.
- Thumbnail navigation strip with flex-start auto-centering.
- Native mobile browser back-button dismissal via `window.history.pushState` / `popstate` listeners.

### 5. Instant Global Search (`src/components/layout/SearchModal.tsx`)
- Activated instantly via keyboard shortcut `/` or search icon click.
- Real-time query matching across titles, categories, tags, and descriptions.
- Quick filter category badges and instant product drawer navigation.

### 6. Mobile Sticky Buy Dock (`src/components/pdp/MobileStickyBuyBar.tsx`)
- Bottom floating quick-checkout action bar appearing on mobile scroll.
- Direct Shopify checkout trigger with dismissible close button.

---

## 6. DESIGN SYSTEM & STYLING PHILOSOPHY

All styling is managed via vanilla CSS in [`src/styles/`](file:///c:/Users/Aryan%20Gupta/Downloads/cinevo/src/styles/):

- [`tokens.css`](file:///c:/Users/Aryan%20Gupta/Downloads/cinevo/src/styles/tokens.css): Defines color palettes (`--clay`, `--terracotta`, `--cream`, `--sand`, `--brown`), typography scales (`--font-display: 'Outfit'`, `--font-body: 'Plus Jakarta Sans'`, `--font-mono: 'Space Grotesk'`), shadow tokens, and border radii.
- [`global.css`](file:///c:/Users/Aryan%20Gupta/Downloads/cinevo/src/styles/global.css): Global resets, responsive container layouts, glassmorphism utilities, and typography hierarchies.
- [`animations.css`](file:///c:/Users/Aryan%20Gupta/Downloads/cinevo/src/styles/animations.css): Keyframes for clay floats, pulses, shimmer skeletons, and smooth modal entrances.

---

## 7. VERCEL DEPLOYMENT & EXTERNAL HOSTING

### Vercel Deployment Configuration:
The project includes a root [`vercel.json`](file:///c:/Users/Aryan%20Gupta/Downloads/cinevo/vercel.json) file configured for Single Page Application (SPA) routing:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
*Purpose*: Ensures that direct URLs and hard page refreshes on sub-routes (e.g. `https://yoursite.com/product/film-tone-presets` or `/collections/luts`) route correctly to `index.html` without triggering 404 errors.

### Netlify / Cloudflare Configuration:
The project also includes [`public/_redirects`](file:///c:/Users/Aryan%20Gupta/Downloads/cinevo/public/_redirects):
```text
/*    /index.html   200
```

### Deploying to Vercel (Step-by-Step):
1. Push project to GitHub (`https://github.com/xMIRCHIx/Template-Theory.git`).
2. Log in to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the `Template-Theory` repository.
4. In **Environment Variables**, add:
   - `VITE_SHOPIFY_STORE_DOMAIN` = `template-theory-2.myshopify.com`
   - `VITE_SHOPIFY_STOREFRONT_TOKEN` = `e9c5ed69764a1c1ee180980e3e8a5434`
   - `VITE_SHOPIFY_API_VERSION` = `2024-07`
5. Click **Deploy**. The site builds in ~30 seconds and receives an automatic SSL-secured URL.

---

## 8. COMPLETE FILE & DIRECTORY INVENTORY

```text
cinevo/
├── .agents/                       # Agent tool configurations & MCP settings
├── .env                           # Local environment secrets (Shopify credentials)
├── .env.example                   # Template environment file for deployment reference
├── .gitignore                     # Git exclusion rules (node_modules, dist, .env)
├── index.html                     # HTML5 entry document with Google Fonts preloads
├── package.json                   # Dependencies, build scripts, and project metadata
├── package-lock.json              # Locked dependency tree
├── tsconfig.json                  # TypeScript compiler settings
├── tsconfig.node.json             # Vite Node TypeScript config
├── vercel.json                    # Vercel SPA routing rewrite rules
├── vite.config.ts                 # Vite bundler configuration & React plugin
├── public/
│   ├── _redirects                 # Netlify/Cloudflare SPA redirect rules
│   └── assets/clay/               # 3D clay floating assets (cameras, cubes, fonts, luts)
└── src/
    ├── main.tsx                   # React DOM application mount entry point
    ├── App.tsx                    # Root component with Providers, Routing, Header & Modals
    ├── vite-env.d.ts              # Vite client type definitions
    ├── types/
    │   └── index.ts               # Core TypeScript definitions (Product, CartItem, Categories)
    ├── styles/
    │   ├── tokens.css             # CSS Custom Property design tokens (Colors, Typography, Radii)
    │   ├── global.css             # Global stylesheet, grid layouts, scrollbars, responsive rules
    │   └── animations.css         # Keyframe animations (float, spin, pulse, fadeIn)
    ├── services/
    │   ├── shopify.ts             # Shopify Storefront GraphQL client, queries, mutations, mappers
    │   └── paymentMock.ts         # Fallback payment simulation utilities
    ├── data/
    │   ├── products.ts            # High-res curated fallback product database (76 verified active URLs)
    │   ├── categories.ts          # Category taxonomy, icons, descriptions, and badge colors
    │   ├── faqs.ts                # Structured FAQ questions and answers
    │   └── ugc.ts                 # Creator testimonials and social proof reviews
    ├── context/
    │   ├── ShopifyContext.tsx     # Global Shopify live product fetching & direct checkout context
    │   ├── CartContext.tsx        # Shopping cart state, quantity controls, localStorage syncing
    │   └── WishlistContext.tsx    # Saved wishlist bookmark state & localStorage persistence
    ├── hooks/
    │   └── useHeroParallax.ts     # Mouse/touch parallax offset calculations for 3D hero props
    ├── components/
    │   ├── cards/
    │   │   ├── ProductCard.tsx    # Responsive product card with rating, tags, and wishlist toggle
    │   │   └── CategoryCard.tsx   # Visual category showcase card
    │   ├── comparison/
    │   │   ├── BeforeAfterSlider.tsx # Smart contained Before/After split comparison slider
    │   │   └── CardSplitPreview.tsx  # Mini hover split comparison preview for cards
    │   ├── filters/
    │   │   └── SidebarFilters.tsx # Multi-criteria filtering (categories, price range, formats)
    │   ├── hero/
    │   │   └── HeroScene.tsx      # Main animated hero section with floating 3D props
    │   ├── layout/
    │   │   ├── Header.tsx         # Floating frosted glass dynamic island navigation
    │   │   ├── Footer.tsx         # Multi-column footer with newsletter and links
    │   │   ├── CartDrawer.tsx     # Slide-over cart panel with line items and checkout trigger
    │   │   ├── SearchModal.tsx    # Fullscreen live search modal with keyboard '/' shortcut
    │   │   ├── WishlistDrawer.tsx # Slide-over saved wishlist items panel
    │   │   └── MobileBottomNav.tsx# Mobile bottom sticky navigation dock
    │   ├── pdp/
    │   │   └── MobileStickyBuyBar.tsx # Mobile sticky bottom purchase bar on product pages
    │   └── ui/
    │       ├── Magnetic.tsx       # Physics-based magnetic cursor attraction wrapper
    │       └── FloatingClayProp.tsx# Floating 3D clay prop component with spring motion
    └── pages/
        ├── HomePage.tsx           # Landing page with hero, featured products, UGC, categories
        ├── ShopPage.tsx           # Full product catalog with sidebar filters & sorting
        ├── CollectionsIndexPage.tsx # Collections gallery index overview
        ├── CategoryCollectionPage.tsx # Filtered category page (LUTs, Presets, Fonts, PSDs, Albums)
        ├── ProductDetailPage.tsx  # Product detail page (Slider, Gallery, Lightbox, Buy Box, Tabs)
        ├── AboutPage.tsx          # Brand story, creator mission, and craft philosophy
        ├── ContactPage.tsx        # Customer support contact form and creator inquiries
        ├── FAQPage.tsx            # Expandable accordion FAQ knowledge base
        ├── CartPage.tsx           # Dedicated full-page shopping cart review
        ├── CheckoutPage.tsx       # Checkout summary and Shopify redirect gateway
        └── OrderSuccessPage.tsx   # Order confirmation celebratory page with confetti
```

---

## 9. MIGRATION GUIDE FOR NEW MACHINES & AI AGENTS

When moving this project to another computer or opening it with another AI assistant (Antigravity/Cursor/VS Code):

### Quick Start Setup:
1. **Clone or Copy Directory**:
   ```bash
   git clone https://github.com/xMIRCHIx/Template-Theory.git
   cd Template-Theory
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Ensure `.env` exists in the root folder with:
   ```env
   VITE_SHOPIFY_STORE_DOMAIN=template-theory-2.myshopify.com
   VITE_SHOPIFY_STOREFRONT_TOKEN=e9c5ed69764a1c1ee180980e3e8a5434
   VITE_SHOPIFY_API_VERSION=2024-07
   ```
4. **Run Local Development Server**:
   ```bash
   npm run dev
   ```
   *Opens local development server at `http://localhost:5173/` or `http://localhost:5174/`.*

5. **Build for Production**:
   ```bash
   npm run build
   ```
   *Compiles TypeScript and outputs optimized production assets into `dist/`.*

### Guidelines for AI Assistants & Developers:
- **Zero Placeholder Policy**: Always use high-resolution verified media links with `onError` fallback handlers.
- **Shopify API First**: Products added in Shopify Admin automatically sync into the live application via `src/services/shopify.ts`.
- **Full Containment for Media**: The `BeforeAfterSlider` and gallery viewers use smart dual-layer containment (`object-fit: contain` + ambient blurred glow backdrop) to guarantee arbitrary image orientations (9:16 reels, 1:1 square, 16:9 cinema) never clip or overflow viewport bounds.
- **Client-Side Routing**: When adding new pages, add routes in [`src/App.tsx`](file:///c:/Users/Aryan%20Gupta/Downloads/cinevo/src/App.tsx) and verify SPA rewrite handling in `vercel.json`.

---
*Documentation compiled and maintained for Cinevo / Template Theory.*
