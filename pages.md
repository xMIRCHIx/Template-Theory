# ClayDigital — Complete Website Pages & UI Specification

## 1. Project Overview

**ClayDigital** is a premium digital-product store for creators.

Products:
- Lightroom Presets
- LUTs
- Photoshop PSD Templates
- Fonts
- Albums / Album Templates
- Creative Assets

Visual direction:
- warm cream background
- beige/clay surfaces
- muted olive
- terracotta accents
- warm brown typography
- organic blob shapes
- subtle clay/paper texture
- rounded corners
- soft shadows
- handcrafted 3D elements
- editorial product presentation
- subtle cursor-based parallax

The website should feel like a curated creative brand, not a huge generic marketplace.

---

# 2. Complete Sitemap

```text
/
├── Home
├── Shop
├── Collections
│   ├── Presets
│   ├── LUTs
│   ├── PSD Templates
│   ├── Fonts
│   ├── Albums
│   └── Creative Assets
├── Product
│   └── Individual Product Detail
├── About
├── Contact
├── FAQ
├── Cart
├── Checkout
└── Order Success / Download
```

---

# 3. Global Layout

Every page shares the same ClayDigital design system.

## Header

Left:
- ClayDigital logo
- ClayDigital wordmark

Navigation:
- Home
- Shop
- Collections
- Categories
- About
- Contact

Right:
- Search
- Account
- Wishlist
- Cart

On scroll:
- slightly stronger cream background
- subtle border/shadow
- no dramatic animation

---

# 4. HOME PAGE

Route:

`/`

The Home page is the main storytelling and product-discovery page.

## Section Order

```text
Header
↓
Hero
↓
Benefits
↓
Popular Categories
↓
Featured Collection
↓
Best Sellers
↓
Collection Showcase
↓
UGC / Creator Showcase
↓
Before / After
↓
What's Inside
↓
Creator CTA
↓
Newsletter
↓
Footer
```

## 4.1 Hero

### Left

Eyebrow:
`DIGITAL GOODS FOR CREATORS`

Heading:
`Premium Digital Assets`

Description:
`Handcrafted digital products for creators, designers & storytellers.`

Buttons:
- Explore Products
- Browse Collections

### Right

One aligned clay composition containing:
- Presets
- LUTs
- PSDs
- Albums
- `.cube`
- Camera/video icon
- optional cylinder
- organic background shape

All elements stay inside one scene container.

### Interaction

- subtle cursor parallax
- tiny rotation
- depth
- individual object wobble

Objects must not fly independently.

See `animation.md`.

---

# 5. BENEFITS

Four compact benefits:

### High Quality
Carefully crafted premium assets.

### Instant Download
Get access immediately after purchase.

### Lifetime Access
Use forever with future updates.

### Commercial License
Use in personal and commercial projects where applicable.

Mostly flat UI with small clay icons.

---

# 6. POPULAR CATEGORIES

Five cards:

### Presets
Lightroom & Camera presets.

### LUTs
Cinematic LUTs & color looks.

### PSDs
Editable Photoshop templates.

### Fonts
Display fonts and creative type assets.

### Albums / Assets
Photo, video and creative resources.

Each card:
- clay icon
- title
- description
- Shop Now

Clicking opens the relevant Collection Page.

---

# 7. FEATURED COLLECTION

Use a horizontal product carousel.

Example:

`Cinematic Collection`

Description:

`Everything you need for that cinematic feel.`

Products can include:
- Cinematic LUT Pack
- Moody Presets
- Cinematic PSD
- Film Look LUTs

The carousel should feel editorial, not like a generic ecommerce slider.

Support:
- previous/next
- drag/swipe

---

# 8. BEST SELLERS

Show strongest products.

Product card:
- preview
- category
- title
- rating
- reviews
- price
- wishlist
- Add to Cart

The store has only around 10 products, so never create fake products just to fill space.

---

# 9. COLLECTION SHOWCASE

## For the Cinematic Creator

Heading:
`For the Cinematic Creator`

Copy:
`LUTs & Presets crafted to bring your story to life.`

CTA:
`Explore LUTs & Presets`

Visual:
- LUT clay asset
- Preset clay asset
- camera
- organic clay background

## For the Designer

Heading:
`For the Designer`

Copy:
`PSDs, fonts, mockups and assets to speed up your workflow.`

CTA:
`Explore Design Assets`

Visual:
- PSD clay element
- Font element
- small asset cubes

Alternate visual direction between these sections.

---

# 10. UGC / CREATOR SHOWCASE

Heading:

`Made With ClayDigital`

Subtitle:

`Real creations from creators.`

Use a Pinterest/Instagram-inspired masonry grid.

Possible content:
- cinematic frames
- before/after edits
- poster designs
- album layouts
- typography
- thumbnails
- photography

Each card can show:

`@creatorname`

Hover:
- tiny scale
- subtle image change
- creator handle reveal

Click:
Open larger UGC viewer/modal.

Important:
Do not invent fake creators or fake social statistics.

UGC should eventually connect back to the product used.

---

# 11. BEFORE / AFTER

Especially for Presets and LUTs.

Heading:

`See The Difference`

Subtitle:

`One click. Completely different mood.`

Use draggable:

```text
BEFORE | AFTER
```

Use real product samples.

Optional tabs:
- Presets
- LUTs

---

# 12. WHAT'S INSIDE

Show the range of the store.

Example:

```text
20
PRESETS

16
LUTs

10
PSD FILES

25+
ASSETS

BONUS
FREEBIES
```

Numbers must be based on actual product contents.

---

# 13. CREATOR CTA

Large cream/clay section.

Heading:

`Create better. Ship faster.`

Copy:

`Premium digital tools made for creators who care about the final detail.`

CTA:

`Explore Products`

Do not show fake community counts.

---

# 14. NEWSLETTER

Heading:

`Stay in the Loop`

Description:

`New products, creator tips and occasional freebies.`

Elements:
- email field
- Subscribe

States:
- idle
- loading
- success
- error

---

# 15. FOOTER

Columns:

## Shop
- All Products
- Presets
- LUTs
- PSDs
- Fonts
- Albums
- Assets

## Collections
- Cinematic
- Creator
- Design
- Photography
- New Arrivals

## Support
- FAQ
- Contact
- License
- Refund Policy
- Download Help

## Company
- About
- Terms
- Privacy

## Social
- Instagram
- YouTube
- Pinterest

---

# 16. SHOP PAGE

Route:

`/shop`

Purpose:

The complete product catalog.

Top:

`Shop All Products`

`Premium digital tools crafted for creators.`

Controls:
- All
- Presets
- LUTs
- PSDs
- Fonts
- Albums
- Assets
- Search
- Sort

Sort:
- Featured
- Newest
- Price Low → High
- Price High → Low
- Rating

Maximum inventory:

**10 products**

---

# 17. COLLECTIONS LANDING PAGE

Route:

`/collections`

Purpose:

Visual directory of all categories.

Cards:
- Presets
- LUTs
- PSDs
- Fonts
- Albums
- Creative Assets

Each card:
- unique clay visual
- category description
- product count
- Explore Collection

This page should feel editorial.

---

# 18. PRESETS COLLECTION PAGE

Route:

`/collections/presets`

## What this page is

This is a **category/product listing page**.

It shows all Preset products.

It is NOT the detail page of one preset.

## Hero

Heading:
`Presets`

Subtitle:
`Give your photos a consistent look in seconds.`

Visual:
Presets clay element.

Category filters:
- All
- Film
- Travel
- Portrait
- Moody
- Warm

## Product Grid

Example:

### Film Tone Presets
- preview
- before/after
- rating
- price
- Add to Cart

### Warm Travel Presets
Same structure.

## Preset-specific content

Can include:
- before/after previews
- Lightroom compatibility
- preset count
- photo examples
- creator tips

---

# 19. LUTS COLLECTION PAGE

Route:

`/collections/luts`

Hero:

`LUTs`

Subtitle:

`Cinematic color without the complicated workflow.`

Visual:
Olive LUT clay element.

Products:
- Cinematic LUT Pack
- Moody Cinema LUTs

LUT-specific content:
- cinematic previews
- color comparison
- supported software
- LUT format
- before/after slider

---

# 20. PSD COLLECTION PAGE

Route:

`/collections/psds`

Hero:

`PSD Templates`

Subtitle:

`Editable Photoshop templates built for fast content creation.`

Visual:
Terracotta PSD clay icon.

Products:
- Minimal Social PSD Pack
- Creator Thumbnail PSDs

Preview can show:
- Photoshop canvas
- editable layers
- final result
- template count

---

# 21. FONT COLLECTION PAGE

Route:

`/collections/fonts`

Hero:

`Font Assets`

Subtitle:

`Typefaces and lettering tools for distinctive creative work.`

Visual:
Typography-inspired clay objects.

Products:
- Modern Display Font
- Handcrafted Script Font

Font preview:
```text
Aa
Creative
ClayDigital
2026
```

Also show:
- alphabet
- numbers
- punctuation
- weights
- license

---

# 22. ALBUM COLLECTION PAGE

Route:

`/collections/albums`

Hero:

`Albums`

Subtitle:

`Beautiful layouts for photo and video stories.`

Visual:
Album/photo clay element.

Products can include:
- Wanderlust Photo Album
- Wedding Album Template

Preview:
- cover
- page spreads
- layouts
- placeholders
- included pages

---

# 23. CREATIVE ASSETS COLLECTION PAGE

Route:

`/collections/assets`

Hero:

`Creative Assets`

Subtitle:

`Ready-to-use resources for your next project.`

Products:
- Creator Asset Pack
- icons
- elements
- mockups
- graphics

Visual:
Small clay cubes / asset objects.

---

# 24. PRODUCT DETAIL PAGE

Route:

`/product/:slug`

## IMPORTANT

This page represents **ONE individual product**.

Example:

`/product/film-tone-presets`

This page does NOT list all presets.

It focuses entirely on:

**Film Tone Presets**

---

# 25. PRODUCT DETAIL — TOP

Two-column desktop layout.

## Left

Large product gallery:
1. Main preview
2. Before/after
3. Included files
4. Example result
5. Optional video

## Right

- category
- product title
- rating
- review count
- price
- short description
- compatibility
- license
- Add to Cart
- Buy Now
- wishlist
- trust indicators

Example:

```text
PRESETS

Film Tone Presets

★★★★★ 4.9 (120)

₹999

Lightroom / Camera Raw

[ Add to Cart ]
[ Buy Now ]

✓ Instant Download
✓ Lifetime Access
✓ Secure Checkout
```

---

# 26. PRODUCT DETAIL — WHAT'S INCLUDED

Heading:

`What's Included`

Example:

```text
✓ 20 Lightroom Presets
✓ Desktop + Mobile versions
✓ Installation guide
✓ Bonus profiles
✓ Lifetime updates
```

Only show information actually included in that product.

---

# 27. PRODUCT DETAIL — INFORMATION

Show:
- File format
- File size
- Compatibility
- Version
- Number of files
- License
- Software requirements

Use a clean table or accordion.

---

# 28. PRODUCT DETAIL — PREVIEW

Large visual gallery.

Different product types use different previews:

### Presets
Before / After photography.

### LUTs
Cinematic frames.

### PSDs
Editable template screenshots.

### Fonts
Typography specimens.

### Albums
Page spreads.

---

# 29. PRODUCT DETAIL — HOW IT WORKS

Three steps:

```text
01
Purchase

02
Download

03
Create
```

---

# 30. PRODUCT DETAIL — FAQ

Accordion:
- How do I download it?
- Which software is supported?
- Is commercial use allowed?
- Are updates included?
- What if I lose the files?
- Is a refund available?

Answers must follow actual store policies.

---

# 31. PRODUCT DETAIL — RELATED PRODUCTS

Show only 2–3 relevant products.

Example:

Film Tone Presets:
- Cinematic LUT Pack
- Warm Travel Presets
- Moody Cinema LUTs

Do not repeat the entire catalog.

---

# 32. CART

Route:

`/cart`

Desktop:
slide-out cart drawer.

Mobile:
dedicated cart page.

Show:
- thumbnail
- product
- price
- quantity
- remove
- subtotal

Buttons:
- Checkout
- Continue Shopping

Message:

`Instant digital delivery after purchase.`

Cart should persist locally.

---

# 33. CHECKOUT

Route:

`/checkout`

Keep minimal.

Sections:

### Customer
Email.

### Billing
Only required fields.

### Order Summary
Products + total.

### Payment
Payment provider later.

If payment is not connected yet, use a clean mock checkout layer separated from production payment logic.

---

# 34. ORDER SUCCESS / DOWNLOAD

After successful purchase:

Heading:

`You're all set.`

Show:
- order number
- purchased products
- download buttons
- email confirmation
- Continue Shopping

Flow:

```text
Purchase
↓
Payment Success
↓
Order Created
↓
Secure Download Entitlement
↓
Download
```

Never expose permanent public download URLs for paid products.

---

# 35. ABOUT PAGE

Route:

`/about`

Heading:

`Made for creators.`

Explain:
- what ClayDigital is
- why it exists
- focus on quality
- practical creative workflow
- curated products

Use one large clay illustration.

Do not invent founder history.

---

# 36. CONTACT PAGE

Route:

`/contact`

Form:
- Name
- Email
- Reason
- Message

Reasons:
- Product Question
- Order Help
- License Question
- Partnership
- Other

Add support email and FAQ link.

---

# 37. FAQ PAGE

Route:

`/faq`

Categories:

### Products
- What formats are included?
- Which software is supported?

### Orders
- How do downloads work?
- Can I download again?

### License
- Can I use products commercially?

### Refunds
- What is the refund policy?

### Technical
- Installation
- Missing files
- Compatibility

---

# 38. SEARCH EXPERIENCE

Global search:
- product title
- category
- tags
- description

Dropdown:

```text
[thumbnail]
Film Tone Presets
Presets
₹999
```

Keyboard:
- `/` focus
- Escape close
- Arrow keys navigate
- Enter open

No result:

`No products found.`

---

# 39. WISHLIST

Users can save products.

Use local persistence initially.

Heart states:
- outline = inactive
- filled = active

Subtle animation only.

---

# 40. UGC SYSTEM

UGC data should eventually support:

```text
image
creatorName
creatorHandle
creatorLink
productUsed
caption
```

Relationship:

```text
UGC Image
↓
Product Used
↓
View Product
```

This makes UGC a product-discovery feature instead of decoration only.

---

# 41. PRODUCT DATA

Centralize products in:

`/src/data/products.ts`

Example:

```ts
{
  id: "film-tone-presets",
  slug: "film-tone-presets",
  name: "Film Tone Presets",
  category: "presets",
  price: 999,
  rating: 4.9,
  reviews: 120,
  shortDescription: "...",
  description: "...",
  thumbnail: "...",
  gallery: [],
  included: [],
  format: [],
  compatibility: [],
  license: "commercial",
  featured: true,
  new: false
}
```

All listing/detail pages should consume this data.

---

# 42. PAGE-TO-PAGE SHOPPING FLOW

Main:

```text
HOME
 ↓
POPULAR CATEGORY
 ↓
COLLECTION PAGE
 ↓
PRODUCT DETAIL
 ↓
ADD TO CART
 ↓
CHECKOUT
 ↓
DOWNLOAD
```

Featured:

```text
HOME
 ↓
FEATURED COLLECTION
 ↓
PRODUCT DETAIL
```

UGC:

```text
UGC
 ↓
PRODUCT USED
 ↓
PRODUCT DETAIL
```

---

# 43. COLLECTION PAGE vs PRODUCT PAGE

This distinction is critical.

## Collection Page

Purpose:

**Help the user choose a product.**

Contains:
- category hero
- filters
- sorting
- multiple product cards
- category examples
- related collections

Example:

`/collections/presets`

```text
Presets

[Film Tone Presets]
[Warm Travel Presets]
[Other Preset Products]
```

## Product Detail Page

Purpose:

**Convince the user to buy ONE product.**

Contains:
- large gallery
- title
- price
- rating
- Add to Cart
- What's Included
- compatibility
- product details
- previews
- FAQ
- related products

Example:

`/product/film-tone-presets`

Shows the complete detailed experience for:

**Film Tone Presets**

---

# 44. RESPONSIVE RULES

Desktop:
- max content width around 1280–1400px
- spacious editorial layout

Tablet:
- reduce hero artwork
- 2–3 category columns

Mobile:
- hamburger navigation
- stacked hero
- 2-column product grid where readable
- filter drawer
- simplified decoration
- no mouse parallax
- sticky Add to Cart on product detail

Do not simply shrink desktop layouts.

---

# 45. ANIMATION

Global:
- subtle hover lift
- soft reveal
- clay depth
- smooth transitions

Hero:
- cursor parallax
- object wobble
- depth response

Cards:
- 2–4px lift
- subtle image movement

Avoid:
- spinning objects
- excessive floating
- cursor trails
- neon effects
- aggressive 3D

See `animation.md`.

---

# 46. FINAL DESIGN PHILOSOPHY

ClayDigital should feel like:

**A beautifully designed, curated digital toolbox for creators.**

Not:
- a giant marketplace
- a SaaS dashboard
- a generic Shopify template
- a 3D demo

The balance:

```text
Brand Personality
        +
Product Trust
        +
Editorial Design
        +
Simple Ecommerce UX
```

## Main principle

**The clay aesthetic creates personality.**

**The product previews create trust.**

**The UX creates conversion.**

**The limited catalog creates curation.**
