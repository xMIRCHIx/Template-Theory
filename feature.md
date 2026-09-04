# ClayDigital — Feature Specification

## Core Store
Maximum 10 curated products. Categories:
Presets, LUTs, PSDs, Fonts, Albums, Creative Assets.

Routes:
`/`, `/shop`, `/collections`, `/collections/:category`, `/product/:slug`, `/about`, `/contact`, `/cart`.

## Product Data
Keep all product data centralized in `/src/data/products.ts`.

Fields:
```ts
{
 id, slug, name, category, price, compareAtPrice?,
 rating, reviews, description, shortDescription,
 thumbnail, gallery[], tags[], included[],
 format[], compatibility[], fileSize, version,
 license, featured, new
}
```

Suggested catalog:
1. Film Tone Presets
2. Warm Travel Presets
3. Cinematic LUT Pack
4. Moody Cinema LUTs
5. Minimal Social PSD Pack
6. Creator Thumbnail PSDs
7. Modern Display Font
8. Handcrafted Script Font
9. Wanderlust Photo Album
10. Creator Asset Pack

Never duplicate products to fill the UI.

## Home
Order:
1. Header
2. Interactive clay hero
3. Benefits
4. Popular Categories
5. Featured Products
6. Collection Spotlight
7. Creator CTA
8. Newsletter
9. Footer

Hero CTA:
`Explore Products` / `Browse Collections`

Hero visual uses the supplied clay assets and the animation rules in `animation.md`.

## Shop
Features:
- category pills
- search
- sorting: Featured / Newest / Price Low-High / Price High-Low / Rating
- grid/list toggle
- product cards
- mobile filter drawer

## Collections
Separate pages for Presets, LUTs, PSDs, Fonts, Albums and Assets.
Each gets:
- unique category hero
- category clay icon
- short description
- product grid
- related categories

Keep one unified brand system.

## Product Card
```text
[Preview]
CATEGORY                 ♡
Product Name
Short description
★★★★★ 4.9 (120)
$19
[Add to Cart]
```
Optional New/Best Seller badge, but never overload cards.

## Product Detail
Top:
- large gallery
- category
- title
- rating
- price
- description
- license
- Add to Cart
- Buy Now
- trust indicators

Sections:
- What's Included
- Product Details
- Preview
- How It Works
- FAQ
- Related Products

Details can include format, compatibility, file size, version and license.

Presets/LUTs may have a before/after slider.

## Cart
Slide-out desktop drawer and mobile-friendly cart page.
Show thumbnail, title, price, quantity, remove, subtotal and checkout.
Persist cart locally.
Message: `Instant digital delivery after purchase.`

## Wishlist
Local wishlist persistence.
Heart toggles with subtle scale animation. Login is not required.

## Search
Search title, category, tags and description.
Keyboard:
`/` focus, `Escape` close, arrows navigate, Enter open.

## Checkout Architecture
Prepare:
`Cart → Checkout → Payment → Order → Secure Download`

If payment isn't connected yet, use a clearly separated mock checkout layer.
Never expose private download URLs.

## Order Success
Show:
- success message
- order number
- purchased products
- download buttons
- email confirmation
- Continue Shopping

## About / Contact
About: concise creator-focused brand story, no invented founder claims.
Contact: email, form, reason selector, message, FAQ link.

## Newsletter
Email + Subscribe.
States: idle / submitting / success / error.

## Toasts
Clay-style notifications:
Added to cart, wishlist updated, removed, copied, etc.

## Accessibility
Keyboard navigation, semantic controls, visible focus, alt text, labels, accessible modals, adequate contrast and reduced-motion support. Never rely on hover alone.

## SEO
Unique title, description, OG image and canonical URL for every product/category page.

## Responsive
Desktop: 1280–1400px max content width.
Tablet: 2–3 category columns.
Mobile: hamburger, 1–2 product columns, stacked hero, simplified clay scene, no mouse parallax.

## Empty/Error States
Create polished states for:
- no search results
- empty cart
- missing product
- form errors

## Analytics Hooks
Prepare events:
`product_view`, `category_view`, `search`, `add_to_cart`, `remove_from_cart`, `wishlist_add`, `checkout_start`, `purchase`.

Do not hardcode a provider.

## Priority
### Must Have
Home, Shop, Collections, Product Detail, Cart, Search, Filters, Wishlist, responsive UI, interactive hero.

### Nice to Have
Quick View, before/after slider, product video, newsletter, analytics.

### Later
Real payment gateway, secure delivery backend, accounts, order history, admin/CMS.

## Product Philosophy
**Less products. Better products.**

The store should feel curated, tactile, warm, premium, trustworthy and easy to shop.
