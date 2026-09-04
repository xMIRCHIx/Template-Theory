# ClayDigital — Design & Build Specification

## 1. Goal
Build a complete premium digital-product storefront inspired by the supplied claymorphic references. The store sells a maximum of 10 digital products: Lightroom Presets, LUTs, PSDs, Fonts, Albums and Creative Assets.

The site should feel like a polished independent Shopify-style creative store:
- warm cream background
- beige clay surfaces
- muted olive
- soft terracotta
- warm brown typography
- organic blobs and subtle paper/clay texture
- rounded cards
- soft neumorphic shadows
- minimal, premium handcrafted feel

Do NOT make it look like a generic AI SaaS template. Do NOT overuse 3D. 3D elements are supporting visuals, not the entire UI.

## 2. Routes
Create:
- `/`
- `/shop`
- `/collections`
- `/collections/presets`
- `/collections/luts`
- `/collections/psds`
- `/collections/fonts`
- `/collections/albums`
- `/collections/assets`
- `/product/:slug`
- `/about`
- `/contact`
- `/cart`

## 3. Theme Tokens
Use centralized CSS variables:

```css
--cream: #F7F0E5;
--cream-light: #FBF7F0;
--clay: #D8B892;
--clay-light: #E9D5B8;
--terracotta: #C98267;
--terracotta-dark: #A9634D;
--olive: #7F876A;
--olive-dark: #656D54;
--brown: #60442E;
--brown-dark: #493322;
--text: #4F3A29;
--muted: #806E5D;
--border: #E5D5C1;
--white: #FFFDF8;
```

Typography: DM Sans, Plus Jakarta Sans, Manrope or Nunito Sans. Use a rounded humanist sans-serif. Headings should be strong and warm brown; body text should be clean and muted.

Global visual language:
- 16–28px radius
- warm borders
- subtle texture
- generous whitespace
- soft clay shadows
- no neon
- no glassmorphism
- no dark-mode-first styling

Example shadow:
```css
box-shadow:
  0 12px 30px rgba(91, 64, 42, 0.08),
  inset 0 1px 0 rgba(255,255,255,0.55);
```

## 4. Header
Sticky minimal header.

Left:
- clay logo mark
- ClayDigital

Center:
- Home
- Shop
- Collections
- About
- Contact

Right:
- Search
- Account
- Cart

Cart can show a small clay count bubble.

Use a cream/transparent header that becomes subtly solid on scroll.

## 5. Home Page

### Hero
Two-column desktop layout.

Left:
Eyebrow: `DIGITAL GOODS FOR CREATORS`

Heading:
`Premium Digital Assets`

Copy:
`Handcrafted digital products for creators, designers & storytellers.`

Buttons:
- `Explore Products`
- `Browse Collections`

Trust row:
- High Quality
- Instant Download
- Lifetime Access
- Commercial License

Right:
A compact claymorphic composition containing:
- Presets
- LUTs
- PSDs
- Albums
- `.cube`
- small camera/video icon
- subtle organic decorative element

Keep the 3D composition compact. It must not overpower the typography.

### Benefits Strip
Four clean items:
- High Quality — Carefully crafted premium assets
- Instant Download — Get access immediately after purchase
- Lifetime Access — Use forever with free updates
- Commercial License — Use in personal & commercial projects

### Popular Categories
Five cards:
1. Presets
2. LUTs
3. PSDs
4. Fonts / Assets
5. Albums

Each:
- 3D clay icon
- title
- short description
- `Shop Now →`

3D icon should be roughly 30–35% of the card, not the whole card.

### Featured Products
Show a maximum of 4 products.

Each product card:
- product preview
- category badge
- title
- description
- rating
- price
- wishlist
- Add to Cart

### Collection Spotlight
Wide split section:
- left: clay artwork
- right: `Made for your workflow`
- short creator-focused copy
- `Explore Collections`

### Creator CTA
Heading: `Create better. Ship faster.`
Copy: `Premium digital tools made for creators who care about the final detail.`
Button: `Shop All Products`

### Newsletter
Heading: `Stay in the loop`
Copy: `New products, updates and occasional creator goodies.`
Email field + Subscribe
Social icons: Instagram, YouTube, Pinterest

### Footer
Columns:
Shop / Help / Company / Social

Include:
- All Products
- Presets
- LUTs
- PSDs
- Fonts
- Albums
- Contact
- FAQ
- License
- Refund Policy
- About
- Terms
- Privacy
- Instagram
- YouTube
- Pinterest

Bottom:
`© 2026 ClayDigital. All rights reserved.`
`Made with ♥ for creators.`

## 6. Shop Page
Route `/shop`.

Hero:
`Shop All Products`
`Premium digital tools crafted for creators.`

Filter pills:
- All
- Presets
- LUTs
- PSDs
- Fonts
- Albums
- Assets

Sorting:
- Featured
- Newest
- Price Low → High
- Price High → Low

Grid/list toggle.

Do not create a fake huge catalog. Maximum 10 real products.

## 7. Product Catalog
Create a central product data file, e.g. `/src/data/products.ts`.

Use approximately these 10 products:

### Presets
1. Film Tone Presets
2. Warm Travel Presets

### LUTs
3. Cinematic LUT Pack
4. Moody Cinema LUTs

### PSDs
5. Minimal Social PSD Pack
6. Creator Thumbnail PSDs

### Fonts
7. Modern Display Font
8. Handcrafted Script Font

### Albums / Assets
9. Wanderlust Photo Album
10. Creator Asset Pack

Do not duplicate products just to fill layouts.

Example:
```ts
{
  id: "film-tone-presets",
  slug: "film-tone-presets",
  name: "Film Tone Presets",
  category: "presets",
  price: 19,
  rating: 4.8,
  reviews: 120,
  description: "...",
  image: "/assets/products/film-tone.jpg",
  tags: ["lightroom", "film", "travel"],
  featured: true
}
```

## 8. Collection Pages
Each category gets its own page.

### Presets
Title: `Presets`
Subtitle: `Give your photos a consistent look in seconds.`
Use beige/cream Presets clay icon.

### LUTs
Title: `LUTs`
Subtitle: `Cinematic color without the complicated workflow.`
Use olive clay visuals.

### PSDs
Title: `PSD Templates`
Subtitle: `Editable Photoshop templates built for fast content creation.`
Use terracotta/cream visuals.

### Fonts
Title: `Font Assets`
Subtitle: `Typefaces and lettering tools for distinctive creative work.`
Use typography-inspired clay visuals.

### Albums / Assets
Title: `Creative Assets`
Subtitle: `Ready-to-use resources for your next project.`

Each collection page contains:
- category hero
- short description
- category illustration
- product grid
- related categories

## 9. Product Cards
Structure:
```text
[Product Preview]

CATEGORY                         ♡

Product Name
Short description

★★★★★ 4.9 (120)

$19

[ Add to Cart ]
```

Use premium cream cards with subtle borders.

Mix realistic digital-product previews with clay category branding. Do not make every product preview 3D.

## 10. Product Detail Page
Route `/product/:slug`.

Top:
LEFT — large product gallery
RIGHT —
- category
- title
- rating
- price
- description
- license selector if needed
- Add to Cart
- Buy Now
- trust indicators

Below:
### What's Included
Icon list.

### Product Details
Include:
- file format
- compatibility
- file size
- number of presets/templates
- version
- license

### Preview
Large image gallery.

### How It Works
1. Purchase
2. Download
3. Create

### FAQ
Accordion.

### Related Products
Only 2–3 related items.

## 11. Cart
Use a slide-out cart drawer on desktop.

Show:
- thumbnail
- product
- price
- quantity
- remove

Summary:
- subtotal
- Checkout
- Continue Shopping

Digital-product note:
`Instant digital delivery after purchase.`

## 12. Search
Search product name, category, tags and description.

Keep search UI compact and consistent with the clay theme.

## 13. Decorative Background System
Create reusable components:
- beige organic blob
- cream blob
- thin curved line
- clay dot
- droplet
- rounded organic shape

The supplied hero background style should become a reusable design language across the site.

## 14. 3D Asset System
Use the generated clay assets consistently:
- `presets-3d.png`
- `luts-3d.png`
- `psd-3d.png`
- `fonts-3d.png`
- `albums-3d.png`
- `cube-3d.png`
- `camera-3d.png`
- `clay-cylinder.png`
- `organic-bg.png`

Recommended directory:
```text
/public/assets/clay/
```

Keep these assets isolated and reusable.

## 15. Components
Build reusable components:
- Header
- Footer
- ClayButton
- ClayCard
- ClayBlob
- ClayIcon
- CategoryCard
- ProductCard
- ProductGrid
- CategoryHero
- BenefitsStrip
- Newsletter
- ProductGallery
- ProductInfo
- Rating
- FilterPills
- SearchBar
- CartDrawer

Avoid giant page components.

## 16. Responsive
Desktop:
- max-width about 1280–1400px
- spacious layout

Tablet:
- hero artwork reduced
- categories 2–3 columns

Mobile:
- hamburger navigation
- 1–2 product columns
- stacked hero
- hide decorative objects when they hurt readability
- compact category cards

Do not simply shrink desktop; redesign spacing for mobile.

## 17. Animation
Only subtle motion:
- 2–4px card hover
- button press
- soft fade-in
- image reveal
- tiny optional floating clay objects
- smooth page transitions

Avoid:
- excessive parallax
- spinning 3D
- bouncing cards
- constant floating
- flashy gradients

## 18. UX Priorities
The main actions must be obvious:
1. Browse products
2. Choose category
3. View product
4. Understand what's included
5. Add to cart
6. Checkout

Aesthetic must never hurt usability.

## 19. Final Home Order
1. Header
2. Hero
3. Benefits
4. Popular Categories
5. Featured Products
6. Collection Spotlight
7. Creator CTA
8. Newsletter
9. Footer

## 20. Final Shop Order
1. Header
2. Shop Hero
3. Category Filters
4. Sorting
5. Product Grid
6. Small CTA
7. Footer

## 21. Final Product Order
1. Header
2. Product Gallery + Product Information
3. What's Included
4. Product Details
5. Preview
6. How It Works
7. FAQ
8. Related Products
9. Footer

## 22. Development Priority
Phase 1 — theme, fonts, layout system
Phase 2 — header + footer
Phase 3 — home
Phase 4 — product data + product card
Phase 5 — shop
Phase 6 — collections
Phase 7 — product detail
Phase 8 — cart
Phase 9 — responsive optimization
Phase 10 — animation + final polish

## 23. Critical Visual Rules
Keep:
- cream/clay identity
- organic blobs
- earthy palette
- rounded cards
- handcrafted 3D icons
- clean editorial spacing

Do not:
- introduce purple/blue SaaS gradients
- make it dark
- use glassmorphism
- overuse 3D
- create fake testimonials or fake statistics
- invent 50+ products
- make every section a floating card
- use unnecessary stock imagery
- make the hero excessively tall
- make every element a pill

## 24. Quality Bar
The final result should feel like:

**“A designer made a beautiful little digital store.”**

Target feeling:
- tactile
- warm
- creative
- premium
- trustworthy
- easy to shop

The clay style should support the brand rather than overpower the products.
