import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'film-tone-presets',
    slug: 'film-tone-presets',
    name: 'Film Tone Presets',
    category: 'presets',
    price: 24,
    compareAtPrice: 38,
    rating: 4.9,
    reviews: 148,
    tagline: 'Vintage 35mm film emulation for modern creators',
    shortDescription: 'Warm nostalgic tones, fine grain textures, and soft highlight roll-offs for Lightroom & ACR.',
    description: 'The Film Tone Preset Pack brings timeless 35mm warmth and organic film emulation straight into your Lightroom workflow. Carefully balanced tones, creamy highlights, and subtle filmic contrast ensure natural skin tones while giving every landscape or portrait an unmistakable cinematic nostalgia.',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=900&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1200&auto=format&fit=crop'
    ],
    tags: ['film', 'lightroom', 'vintage', 'travel', 'portrait'],
    included: [
      '12 Desktop Presets (.XMP)',
      '12 Mobile Presets (.DNG)',
      '4 Grain & Texture Modifiers',
      'PDF Step-by-Step Installation Guide',
      'Free Future Updates & Profiles'
    ],
    format: ['.XMP', '.DNG', '.LRTEMPLATE'],
    compatibility: ['Lightroom Classic (v10+)', 'Lightroom CC', 'Lightroom Mobile (iOS/Android)', 'Photoshop Camera Raw (ACR)'],
    fileSize: '42 MB',
    version: '2.4',
    license: 'commercial',
    featured: true,
    bestseller: true,
    itemCount: '12 Presets',
    beforeAfterImage: {
      before: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop&sat=-20&bri=-10',
      after: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop&sat=25&hue=15'
    },
    beforeAfterList: [
      {
        id: 'ba-film-1',
        title: 'Alpine Vista (35mm Nostalgia)',
        before: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop&sat=-20&bri=-10',
        after: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop&sat=25&hue=15'
      },
      {
        id: 'ba-film-2',
        title: 'Moody Pine Forest (Filmic Grain)',
        before: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop&sat=-25',
        after: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop&sat=20&hue=10'
      },
      {
        id: 'ba-film-3',
        title: 'Coastal Golden Hour (Portra 400)',
        before: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop&sat=-15',
        after: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop&sat=30&hue=5'
      },
      {
        id: 'ba-film-4',
        title: 'City Architecture (Vintage Contrast)',
        before: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop&sat=-30',
        after: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop&sat=25&hue=15'
      },
      {
        id: 'ba-film-5',
        title: 'Golden Portrait (Soft Highlight Roll-off)',
        before: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop&sat=-20',
        after: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop&sat=20&hue=12'
      }
    ]
  },
  {
    id: 'warm-travel-presets',
    slug: 'warm-travel-presets',
    name: 'Warm Travel Presets',
    category: 'presets',
    price: 18,
    compareAtPrice: 29,
    rating: 4.8,
    reviews: 96,
    tagline: 'Sun-drenched golden tones for wanderers & storytellers',
    shortDescription: 'Golden hour warmth, vibrant blues, and earthy greens crafted specifically for outdoor travel photography.',
    description: 'Transform your travel memories with warm golden glow, enriched Mediterranean blues, and earthy terra-cotta tones. Built to perform flawlessly across varying sunlights, beach scenes, European architecture, and lush tropical foliage.',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=900&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop'
    ],
    tags: ['travel', 'warm', 'summer', 'lifestyle', 'outdoor'],
    included: [
      '10 Desktop Presets (.XMP)',
      '10 Mobile Presets (.DNG)',
      'Quick Warmth Adjustment Toolkits',
      'Mobile Installation Walkthrough'
    ],
    format: ['.XMP', '.DNG'],
    compatibility: ['Lightroom Classic', 'Lightroom Mobile', 'Photoshop ACR'],
    fileSize: '35 MB',
    version: '1.8',
    license: 'commercial',
    featured: true,
    itemCount: '10 Presets',
    beforeAfterImage: {
      before: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop&sat=-20',
      after: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop&sat=30'
    },
    beforeAfterList: [
      {
        id: 'ba-travel-1',
        title: 'Santorini Coast (Terracotta & Cyan)',
        before: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop&sat=-25',
        after: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop&sat=30&hue=8'
      },
      {
        id: 'ba-travel-2',
        title: 'Tropical Palm Beach (Sun-Kissed Glow)',
        before: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop&sat=-20',
        after: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop&sat=35'
      },
      {
        id: 'ba-travel-3',
        title: 'Old European Alley (Golden Stone)',
        before: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1200&auto=format&fit=crop&sat=-25',
        after: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1200&auto=format&fit=crop&sat=30&hue=15'
      },
      {
        id: 'ba-travel-4',
        title: 'Desert Dunes (Amber Warmth)',
        before: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop&sat=-15',
        after: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop&sat=35&hue=15'
      },
      {
        id: 'ba-travel-5',
        title: 'Wanderer Portrait (Natural Skin Tones)',
        before: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop&sat=-20',
        after: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop&sat=25&hue=10'
      }
    ]
  },
  {
    id: 'cinematic-lut-pack',
    slug: 'cinematic-lut-pack',
    name: 'Cinematic LUT Pack Vol. 01',
    category: 'luts',
    price: 24,
    compareAtPrice: 42,
    rating: 4.9,
    reviews: 132,
    tagline: 'Hollywood-grade 3D LUTs for video editors & filmmakers',
    shortDescription: 'Rich contrast, deep blacks, and balanced teal-and-warm skin tones calibrated for LOG and Rec.709 footage.',
    description: 'Designed in professional color suites, Cinematic LUT Pack Vol. 01 empowers filmmakers to achieve instant movie-grade color grading. Whether shooting on Sony S-Log, Canon C-Log, Panasonic V-Log, Apple Log, or standard Rec.709, these 3D .cube files deliver high-end cinematic color harmony.',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=900&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop'
    ],
    tags: ['luts', 'video', 'cinematic', 'filmmaking', 'rec709'],
    included: [
      '16 3D LUTs (.CUBE, 33x33 & 65x65)',
      'LOG to Rec.709 Base Conversion LUTs',
      'DaVinci Resolve / Premiere Pro PowerGrades',
      'Color Grading Guide & Cheat Sheet'
    ],
    format: ['.CUBE', '.3DL', '.LOOK'],
    compatibility: ['Premiere Pro', 'DaVinci Resolve', 'Final Cut Pro X', 'After Effects', 'CapCut Desktop', 'Photoshop'],
    fileSize: '58 MB',
    version: '3.0',
    license: 'commercial',
    featured: true,
    bestseller: true,
    itemCount: '16 LUTs',
    beforeAfterImage: {
      before: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop&sat=-30',
      after: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop&sat=20'
    },
    beforeAfterList: [
      {
        id: 'ba-lut-1',
        title: 'Mountain Drone Shot (Teal & Warmth)',
        before: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop&sat=-30',
        after: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop&sat=25&hue=15'
      },
      {
        id: 'ba-lut-2',
        title: 'Tokyo Night Alley (Neon Deep Blacks)',
        before: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1200&auto=format&fit=crop&sat=-35',
        after: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1200&auto=format&fit=crop&sat=30'
      },
      {
        id: 'ba-lut-3',
        title: 'Supercar Motion (Commercial Grade)',
        before: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop&sat=-25',
        after: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop&sat=25&hue=10'
      },
      {
        id: 'ba-lut-4',
        title: 'Studio Lighting (Filmic Skin Harmony)',
        before: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop&sat=-30',
        after: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop&sat=20&hue=15'
      },
      {
        id: 'ba-lut-5',
        title: 'Misty Coastline (Anamorphic Feel)',
        before: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop&sat=-25',
        after: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop&sat=25&hue=5'
      }
    ]
  },
  {
    id: 'moody-cinema-luts',
    slug: 'moody-cinema-luts',
    name: 'Moody Cinema LUTs Collection',
    category: 'luts',
    price: 22,
    compareAtPrice: 35,
    rating: 4.8,
    reviews: 84,
    tagline: 'Dark aesthetic, dramatic shadows, and intimate atmosphere',
    shortDescription: 'Deep shadows, desaturated greens, and rich copper tones tailored for moody storytelling.',
    description: 'Crafted for atmospheric music videos, moody commercial spots, and emotive narrative films. Moody Cinema LUTs selectively pulls back midtone saturation while deepening shadow tones to create high-tension cinematic drama.',
    thumbnail: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=900&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop'
    ],
    tags: ['moody', 'dark', 'cinema', 'night', 'luts'],
    included: [
      '14 Cinematic 3D LUTs (.CUBE)',
      'Sony S-Log3 & Apple Log Optimized Profiles',
      'Opacity / Strength Guide for NLEs'
    ],
    format: ['.CUBE'],
    compatibility: ['Premiere Pro', 'DaVinci Resolve', 'Final Cut Pro X', 'CapCut Desktop'],
    fileSize: '48 MB',
    version: '1.5',
    license: 'commercial',
    itemCount: '14 LUTs',
    beforeAfterImage: {
      before: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop&bri=-10&sat=-20',
      after: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop&bri=5&sat=15'
    },
    beforeAfterList: [
      {
        id: 'ba-moody-1',
        title: 'Foggy Forest (Deep Shadows & Rolloff)',
        before: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop&bri=-10&sat=-25',
        after: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop&bri=5&sat=20&hue=10'
      },
      {
        id: 'ba-moody-2',
        title: 'Rainy Night City (Blade Runner Mood)',
        before: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=1200&auto=format&fit=crop&sat=-30',
        after: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=1200&auto=format&fit=crop&sat=30'
      },
      {
        id: 'ba-moody-3',
        title: 'Low Key Interior (High Drama)',
        before: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop&sat=-25',
        after: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop&sat=20&hue=15'
      },
      {
        id: 'ba-moody-4',
        title: 'Night Street Glow (Warm Amber)',
        before: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1200&auto=format&fit=crop&sat=-30',
        after: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1200&auto=format&fit=crop&sat=25&hue=8'
      },
      {
        id: 'ba-moody-5',
        title: 'Mountain Pass (Dark Filmic Mood)',
        before: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop&sat=-25',
        after: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop&sat=20&hue=18'
      }
    ]
  },
  {
    id: 'minimal-social-psd-pack',
    slug: 'minimal-social-psd-pack',
    name: 'Minimal Social PSD Pack',
    category: 'psds',
    price: 28,
    compareAtPrice: 45,
    rating: 4.9,
    reviews: 110,
    tagline: 'Clean aesthetic templates for modern creator brands',
    shortDescription: 'High-res layered Photoshop templates for Instagram carousels, stories, and editorial brand kits.',
    description: 'Elevate your online presence with 24 beautifully structured Photoshop templates. Built on a modular 12-column grid with smart objects, neatly labeled folders, and customizable clay paper textures that let you drop in content effortlessly.',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=900&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1200&auto=format&fit=crop'
    ],
    tags: ['psd', 'social-media', 'templates', 'instagram', 'minimal'],
    included: [
      '24 Layered PSD Files (Stories, Posts, Carousels)',
      'Smart Object Photo Placeholders',
      'Curated Color Palette Swatches',
      'Free Font Download Links & Guide'
    ],
    format: ['.PSD'],
    compatibility: ['Photoshop CC 2020+', 'Photopea (Browser)'],
    fileSize: '320 MB',
    version: '2.1',
    license: 'commercial',
    featured: true,
    itemCount: '24 PSDs',
    psdLayersCount: 18
  },
  {
    id: 'creator-thumbnail-psds',
    slug: 'creator-thumbnail-psds',
    name: 'Creator Thumbnail PSD Kit',
    category: 'psds',
    price: 19,
    compareAtPrice: 32,
    rating: 4.8,
    reviews: 75,
    tagline: 'High CTR YouTube thumbnail templates with clay accents',
    shortDescription: 'Battle-tested thumbnail layouts with editable typography, glow effects, and cutout layer masks.',
    description: 'Stop wasting hours designing thumbnails from scratch. The Creator Thumbnail PSD Kit delivers 15 high-CTR layouts used by top creators in tech, lifestyle, cinema, and design niches. Fully editable layers, vector badges, and cutout lighting presets included.',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=900&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1200&auto=format&fit=crop'
    ],
    tags: ['youtube', 'thumbnail', 'psd', 'creator', 'clickthrough'],
    included: [
      '15 Ultra HD YouTube Thumbnail PSDs (1920x1080)',
      'One-Click Cutout Glow Styles',
      'Vector Badges & Arrow Assets',
      'CTR Optimization Tips PDF'
    ],
    format: ['.PSD'],
    compatibility: ['Photoshop CC 2019+'],
    fileSize: '190 MB',
    version: '1.2',
    license: 'commercial',
    itemCount: '15 PSDs',
    psdLayersCount: 14
  },
  {
    id: 'modern-display-font',
    slug: 'modern-display-font',
    name: 'Aura Display Serif Font',
    category: 'fonts',
    price: 26,
    compareAtPrice: 40,
    rating: 4.9,
    reviews: 92,
    tagline: 'Sculptural elegance with high contrast & stylish ligatures',
    shortDescription: 'Contemporary display typeface with 60+ discretionary ligatures and complete multilingual support.',
    description: 'Aura is a bold, high-fashion display serif designed for luxury branding, editorial headlines, magazine covers, and creative posters. Features elegant curves, dramatic bracketed serifs, and dozens of stylistic alternates and ligatures.',
    thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=900&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop'
    ],
    tags: ['font', 'serif', 'display', 'branding', 'typography'],
    included: [
      'Aura Regular, Italic & Bold (.OTF, .TTF)',
      'Full Webfont Package (.WOFF, .WOFF2)',
      '68 Custom Ligatures & Alternates',
      'Complete Multilingual Character Set (Latin Extended)'
    ],
    format: ['.OTF', '.TTF', '.WOFF2'],
    compatibility: ['Adobe Suite', 'Figma', 'Canva', 'Web Browsers', 'Word / Pages'],
    fileSize: '14 MB',
    version: '1.0',
    license: 'commercial',
    featured: true,
    itemCount: '3 Weights + Webfonts',
    fontPreviewText: 'Template Theory Crafted for Creators',
    fontStyles: ['Regular', 'Italic', 'Bold']
  },
  {
    id: 'handcrafted-script-font',
    slug: 'handcrafted-script-font',
    name: 'Solara Handcrafted Script',
    category: 'fonts',
    price: 20,
    compareAtPrice: 30,
    rating: 4.8,
    reviews: 64,
    tagline: 'Organic flowing calligraphy with authentic brush texture',
    shortDescription: 'Expressive script font featuring natural ink flow, alternate swashes, and connecting glyphs.',
    description: 'Solara captures the free-flowing tactile energy of real brush lettering. Ideal for logo design, wedding invitations, quotes, merchandise, and editorial packaging. Includes uppercase swashes and end-tails.',
    thumbnail: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=900&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop'
    ],
    tags: ['script', 'handcrafted', 'calligraphy', 'font', 'branding'],
    included: [
      'Solara Script (.OTF, .TTF, .WOFF2)',
      'Swashes & Stylistic Ending Glyphs',
      'Commercial License & Lifetime Updates'
    ],
    format: ['.OTF', '.TTF', '.WOFF2'],
    compatibility: ['All Modern Software'],
    fileSize: '8 MB',
    version: '1.1',
    license: 'commercial',
    itemCount: 'Full Character Set',
    fontPreviewText: 'Authentic Organic Brush Flow',
    fontStyles: ['Script Regular', 'Script Slanted']
  },
  {
    id: 'wanderlust-photo-album',
    slug: 'wanderlust-photo-album',
    name: 'Wanderlust Photo Album Template',
    category: 'psds',
    price: 32,
    compareAtPrice: 48,
    rating: 4.9,
    reviews: 58,
    tagline: 'Editorial 32-page hardcover photobook template',
    shortDescription: 'Sophisticated magazine-style layout for photo books, portfolio spreads, and visual journals.',
    description: 'Turn your photography into an exquisite editorial coffee table book. Wanderlust comes with 32 masterfully designed page spreads featuring asymmetric photo layouts, minimal captions, pull-quotes, and print-ready CMYK color profiles with bleed margins.',
    thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=900&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop'
    ],
    tags: ['album', 'photobook', 'indesign', 'portfolio', 'editorial'],
    included: [
      '32 Custom Designed Master Page Spreads',
      'InDesign (.INDD, .IDML) & Photoshop (.PSD) Files',
      'Print-ready 300 DPI CMYK with 3mm Bleed',
      'Free Typography & Grid System Guide'
    ],
    format: ['.INDD', '.IDML', '.PSD'],
    compatibility: ['Adobe InDesign CC', 'Adobe Photoshop CC'],
    fileSize: '410 MB',
    version: '2.0',
    license: 'commercial',
    bestseller: true,
    itemCount: '32 Page Spreads'
  },
  {
    id: 'creator-asset-pack',
    slug: 'creator-asset-pack',
    name: 'Clay 3D Creator Asset Pack',
    category: 'assets',
    price: 29,
    compareAtPrice: 50,
    rating: 5.0,
    reviews: 142,
    tagline: '35+ handcrafted 3D clay objects, geometric primitives & blobs',
    shortDescription: 'High-res transparent PNGs, Blender source files, and organic clay surfaces for premium UI & graphic design.',
    description: 'The signature 3D clay elements that make Template Theory iconic. Includes 35+ high-resolution transparent clay assets (cameras, folders, cubes, droplets, abstract organic blobs, cylinders, and tools) rendered in ultra-detailed 4K with realistic soft shadows and warm clay textures.',
    thumbnail: '/assets/clay/CUBE.png',
    gallery: [
      '/assets/clay/CUBE.png',
      '/assets/clay/CAMERA.png',
      '/assets/clay/PRESET.png',
      '/assets/clay/PSDS.png',
      '/assets/clay/FONT ASSET.png'
    ],
    tags: ['3d', 'clay', 'assets', 'blender', 'illustrations', 'icons'],
    included: [
      '35+ Rendered 3D Clay PNGs with Alpha Transparency (4000x4000px)',
      'Full Blender Source Scene (.BLEND) with Clay Shader Materials',
      'Vector Organic Blob SVG Outlines',
      'Commercial License for Unlimited Projects'
    ],
    format: ['.PNG (4K)', '.BLEND', '.SVG'],
    compatibility: ['Blender 3.0+', 'Figma', 'Photoshop', 'Canva', 'Any Design Software'],
    fileSize: '540 MB',
    version: '2.0',
    license: 'commercial',
    featured: true,
    itemCount: '35+ 3D Assets'
  }
];
