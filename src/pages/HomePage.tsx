import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  DownloadCloud,
  ShieldCheck,
  Infinity as InfinityIcon,
  Award,
  Layers,
  CheckCircle2,
  Mail,
  Sliders,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingBag,
  Play,
  Video,
} from 'lucide-react';
import { HeroScene } from '../components/hero/HeroScene';
import { CategoryCard } from '../components/cards/CategoryCard';
import { ProductCard } from '../components/cards/ProductCard';
import { BeforeAfterSlider } from '../components/comparison/BeforeAfterSlider';
import { CATEGORIES } from '../data/categories';
import { useShopify } from '../context/ShopifyContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl, getInstagramPostId } from '../services/db';
import { optimizeImageUrl } from '../utils/imageOptimizer';
import { SEOHead } from '../components/common/SEOHead';
import { CORE_PAGES_SEO, generateOrganizationSchema, generateWebSiteSchema } from '../utils/seoConfig';

const YoutubeIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <polygon points="10 15 15 12 10 9 10 15" fill={color} />
  </svg>
);

const InstagramIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { products, isLoading, ugcList, currencySymbol, homepageSettings } = useShopify();
  const { addToCart } = useCart();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'subscribed'>('idle');

  // Dedicated Homepage Category Filter State (Independent from Shop page)
  const [homeCategory, setHomeCategory] = useState<string>('all');

  // Homepage Before/After Look Switcher State
  const [activeHomeLookIndex, setActiveHomeLookIndex] = useState<number>(0);
  const homeLooks = homepageSettings?.looks || [];
  const currentHomeLook = (homeLooks.length > 0)
    ? (homeLooks[activeHomeLookIndex] || homeLooks[0])
    : null;

  // Preload homepage look images in background so switching is instant
  useEffect(() => {
    if (!homeLooks || homeLooks.length === 0) return;
    homeLooks.forEach((look) => {
      if (look.before) {
        const img = new Image();
        img.decoding = 'async';
        img.src = optimizeImageUrl(look.before, 1200);
      }
      if (look.after) {
        const img = new Image();
        img.decoding = 'async';
        img.src = optimizeImageUrl(look.after, 1200);
      }
    });
  }, [homeLooks]);



  // Directional slide state for smooth animated look transitions on Homepage
  const [homeSlideDirection, setHomeSlideDirection] = useState<number>(1);

  const handleNextHomeLook = useCallback(() => {
    if (homeLooks.length <= 1) return;
    setHomeSlideDirection(1);
    setActiveHomeLookIndex((prev) => (prev + 1) % homeLooks.length);
  }, [homeLooks.length]);

  const handlePrevHomeLook = useCallback(() => {
    if (homeLooks.length <= 1) return;
    setHomeSlideDirection(-1);
    setActiveHomeLookIndex((prev) => (prev - 1 + homeLooks.length) % homeLooks.length);
  }, [homeLooks.length]);

  const handleSelectHomeLook = useCallback((idx: number) => {
    if (idx === activeHomeLookIndex) return;
    setHomeSlideDirection(idx > activeHomeLookIndex ? 1 : -1);
    setActiveHomeLookIndex(idx);
  }, [activeHomeLookIndex]);

  // Hold-and-Slide Interactive Scrubber Track State on Homepage
  const [isHomeScrubbing, setIsHomeScrubbing] = useState(false);
  const homeScrubberTrackRef = useRef<HTMLDivElement | null>(null);

  const performHomeScrub = useCallback((clientX: number) => {
    if (!homeScrubberTrackRef.current || homeLooks.length <= 1) return;
    const rect = homeScrubberTrackRef.current.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetIndex = Math.min(homeLooks.length - 1, Math.floor(progress * homeLooks.length));
    handleSelectHomeLook(targetIndex);
  }, [homeLooks.length, handleSelectHomeLook]);

  const handleHomeScrubberMouseDown = (e: React.MouseEvent) => {
    setIsHomeScrubbing(true);
    performHomeScrub(e.clientX);
  };
  const handleHomeScrubberMouseMove = (e: React.MouseEvent) => {
    if (isHomeScrubbing) performHomeScrub(e.clientX);
  };
  const handleHomeScrubberMouseUp = () => {
    setIsHomeScrubbing(false);
  };
  const handleHomeScrubberTouchStart = (e: React.TouchEvent) => {
    setIsHomeScrubbing(true);
    performHomeScrub(e.targetTouches[0].clientX);
  };
  const handleHomeScrubberTouchMove = (e: React.TouchEvent) => {
    if (isHomeScrubbing) performHomeScrub(e.targetTouches[0].clientX);
  };
  const handleHomeScrubberTouchEnd = () => {
    setIsHomeScrubbing(false);
  };

  // --- 5. ULTRA-SMOOTH UGC INTERACTIVE PHYSICS TICKER (60/120FPS ZERO-REFLOW ENGINE) ---
  const ugcSpeedSeconds = homepageSettings?.ugcSpeed || 50;
  const marqueeContainerRef = useRef<HTMLDivElement | null>(null);
  const marqueeTrackRef = useRef<HTMLDivElement | null>(null);
  const marqueeOffsetRef = useRef<number>(0);
  const targetOffsetRef = useRef<number>(0);
  const isUgcDraggingRef = useRef<boolean>(false);
  const isUgcHoveredRef = useRef<boolean>(false);
  const isUgcInViewRef = useRef<boolean>(true);
  const ugcDragStartXRef = useRef<number>(0);
  const ugcDragStartOffsetRef = useRef<number>(0);
  const ugcLastPointerXRef = useRef<number>(0);
  const ugcLastPointerTimeRef = useRef<number>(0);
  const ugcDragVelocityRef = useRef<number>(0);
  const ugcTotalDragDistRef = useRef<number>(0);
  const blockWidthRef = useRef<number>(2000);
  const lastTimeRef = useRef<number>(0);
  const [isUgcGrabbing, setIsUgcGrabbing] = useState<boolean>(false);

  // Cap at 10 items for maximum GPU memory efficiency and silky 60 FPS mobile rendering
  const displayUgcList = useMemo(() => {
    if (!ugcList || ugcList.length === 0) return [];
    return ugcList.slice(0, 10);
  }, [ugcList]);

  // Pre-measure block width once on mount/resize to avoid layout reflow in the animation loop
  const measureBlockWidth = useCallback(() => {
    if (marqueeTrackRef.current) {
      const scrollW = marqueeTrackRef.current.scrollWidth;
      if (scrollW > 0) {
        blockWidthRef.current = scrollW / 3;
      }
    }
  }, []);

  useEffect(() => {
    measureBlockWidth();
    window.addEventListener('resize', measureBlockWidth, { passive: true });
    const timer1 = setTimeout(measureBlockWidth, 200);
    const timer2 = setTimeout(measureBlockWidth, 800);
    return () => {
      window.removeEventListener('resize', measureBlockWidth);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [displayUgcList, measureBlockWidth]);

  useEffect(() => {
    if (!displayUgcList || displayUgcList.length === 0) return;
    let animId: number;
    let isMounted = true;
    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      if (!isMounted) return;

      // When the UGC section is scrolled out of viewport, skip calculations to free up 60 FPS CPU budget
      if (!isUgcInViewRef.current) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min((now - (lastTimeRef.current || now)) / 1000, 0.08);
      lastTimeRef.current = now;

      const track = marqueeTrackRef.current;
      const blockWidth = blockWidthRef.current;

      if (track && blockWidth > 0) {
        if (isUgcDraggingRef.current) {
          // Instant direct pointer follow with spring-less precision (0ms lag)
          marqueeOffsetRef.current = targetOffsetRef.current;
        } else {
          // Momentum velocity decay after flick
          if (Math.abs(ugcDragVelocityRef.current) > 0.05) {
            marqueeOffsetRef.current += ugcDragVelocityRef.current * (dt * 60);
            ugcDragVelocityRef.current *= Math.pow(0.92, dt * 60); // frame-rate independent friction
          } else {
            ugcDragVelocityRef.current = 0;
            if (!isUgcHoveredRef.current) {
              const pxPerSecond = blockWidth / Math.max(10, ugcSpeedSeconds);
              marqueeOffsetRef.current -= pxPerSecond * dt;
            }
          }
        }

        // Seamless infinite wrap around in both directions (left & right)
        while (marqueeOffsetRef.current <= -blockWidth) {
          marqueeOffsetRef.current += blockWidth;
          if (isUgcDraggingRef.current) {
            targetOffsetRef.current += blockWidth;
            ugcDragStartOffsetRef.current += blockWidth;
          }
        }
        while (marqueeOffsetRef.current > 0) {
          marqueeOffsetRef.current -= blockWidth;
          if (isUgcDraggingRef.current) {
            targetOffsetRef.current -= blockWidth;
            ugcDragStartOffsetRef.current -= blockWidth;
          }
        }

        track.style.transform = `translate3d(${marqueeOffsetRef.current.toFixed(2)}px, 0, 0)`;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    // Pause physics engine when the section is not in viewport
    const container = marqueeContainerRef.current;
    let observer: IntersectionObserver | null = null;
    if (container && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          isUgcInViewRef.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            lastTimeRef.current = performance.now();
          }
        },
        { rootMargin: '120px 0px 120px 0px' }
      );
      observer.observe(container);
    }

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      if (observer && container) {
        observer.unobserve(container);
      }
    };
  }, [displayUgcList, ugcSpeedSeconds]);

  const handleUgcPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isUgcDraggingRef.current = true;
    setIsUgcGrabbing(true);
    ugcDragStartXRef.current = e.clientX;
    ugcDragStartOffsetRef.current = marqueeOffsetRef.current;
    targetOffsetRef.current = marqueeOffsetRef.current;
    ugcLastPointerXRef.current = e.clientX;
    ugcLastPointerTimeRef.current = performance.now();
    ugcDragVelocityRef.current = 0;
    ugcTotalDragDistRef.current = 0;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleUgcPointerMove = (e: React.PointerEvent) => {
    if (!isUgcDraggingRef.current) return;

    const deltaX = e.clientX - ugcDragStartXRef.current;
    ugcTotalDragDistRef.current = Math.max(ugcTotalDragDistRef.current, Math.abs(deltaX));

    const now = performance.now();
    const dt = Math.max(1, now - ugcLastPointerTimeRef.current);
    const instantVelocity = (e.clientX - ugcLastPointerXRef.current) * (16 / dt);
    ugcDragVelocityRef.current = ugcDragVelocityRef.current * 0.3 + instantVelocity * 0.7;
    ugcLastPointerXRef.current = e.clientX;
    ugcLastPointerTimeRef.current = now;

    targetOffsetRef.current = ugcDragStartOffsetRef.current + deltaX;
  };

  const handleUgcPointerUp = (e: React.PointerEvent) => {
    if (isUgcDraggingRef.current) {
      isUgcDraggingRef.current = false;
      setIsUgcGrabbing(false);
      lastTimeRef.current = performance.now();
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const displayedHomeProducts = useMemo(() => {
    if (homeCategory === 'all') return products;
    return products.filter((p) => {
      if (homeCategory === 'psds' || homeCategory === 'albums') {
        return p.category === 'psds' || (p.category as string) === 'albums';
      }
      return p.category === homeCategory;
    });
  }, [products, homeCategory]);

  // UGC Image Lightbox Modal State
  const [selectedUgcIndex, setSelectedUgcIndex] = useState<number | null>(null);
  const activeUgcModalItem = selectedUgcIndex !== null && ugcList && ugcList.length > 0 ? ugcList[selectedUgcIndex] : null;
  const linkedModalProduct = activeUgcModalItem?.productSlug ? products.find((p) => p.slug === activeUgcModalItem.productSlug || p.id === activeUgcModalItem.productSlug) : null;

  const handleNextUgc = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedUgcIndex === null || !ugcList || ugcList.length === 0) return;
    setSelectedUgcIndex((prev) => (prev !== null ? (prev + 1) % ugcList.length : 0));
  }, [selectedUgcIndex, ugcList]);

  const handlePrevUgc = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedUgcIndex === null || !ugcList || ugcList.length === 0) return;
    setSelectedUgcIndex((prev) => (prev !== null ? (prev - 1 + ugcList.length) % ugcList.length : 0));
  }, [selectedUgcIndex, ugcList]);

  // Handle ESC key to close modal & Arrow keys to navigate
  useEffect(() => {
    if (selectedUgcIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedUgcIndex(null);
      if (e.key === 'ArrowRight') handleNextUgc();
      if (e.key === 'ArrowLeft') handlePrevUgc();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedUgcIndex, handleNextUgc, handlePrevUgc]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus('subscribed');
    setTimeout(() => {
      setNewsletterEmail('');
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', overflowX: 'hidden', position: 'relative' }}>
      <SEOHead
        title={CORE_PAGES_SEO.home.title}
        description={CORE_PAGES_SEO.home.description}
        keywords={CORE_PAGES_SEO.home.keywords}
        canonicalPath={CORE_PAGES_SEO.home.canonicalPath}
        jsonLd={[generateOrganizationSchema(), generateWebSiteSchema()]}
      />
      
      {/* 1. HERO SECTION */}
      <section className="hero-section" style={{ paddingTop: 'clamp(24px, 4vh, 44px)', paddingBottom: '30px', position: 'relative' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.15fr',
              gap: '40px',
              alignItems: 'center',
            }}
            className="hero-grid"
          >
            {/* Left Copy */}
            <div className="hero-copy-col">
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--cream-dark)',
                  border: '1px solid var(--border)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  marginBottom: '20px',
                }}
              >
                <Sparkles size={14} color="var(--terracotta)" />
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: 'var(--brown)',
                    textTransform: 'uppercase',
                  }}
                >
                  Digital Goods for Creators
                </span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.6rem, 5.5vw, 4rem)',
                  fontWeight: 800,
                  lineHeight: 1.12,
                  color: 'var(--brown)',
                  marginBottom: '18px',
                  letterSpacing: '-0.03em',
                }}
              >
                Premium Digital Assets
              </h1>

              <p
                style={{
                  fontSize: '1.15rem',
                  color: 'var(--muted)',
                  lineHeight: 1.6,
                  maxWidth: '520px',
                  marginBottom: '32px',
                }}
              >
                Handcrafted digital products for creators, designers & storytellers. Lightroom Presets, Cinematic LUTs, PSD Templates & Typefaces.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '40px' }}>
                <Link to="/shop" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                  <span>Explore Products</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/collections" className="btn-secondary" style={{ padding: '14px 26px', fontSize: '1rem' }}>
                  Browse Collections
                </Link>
              </div>

              {/* Trust Indicators */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  flexWrap: 'wrap',
                  fontSize: '0.85rem',
                  color: 'var(--muted)',
                  fontWeight: 600,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} color="var(--olive)" />
                  <span>High Quality</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DownloadCloud size={16} color="var(--terracotta)" />
                  <span>Instant Download</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <InfinityIcon size={16} color="var(--clay-dark)" />
                  <span>Lifetime Access</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="var(--olive-dark)" />
                  <span>Creator License</span>
                </div>
              </div>
            </div>

            {/* Right: Clay 3D Composition Scene */}
            <div className="hero-scene-col" style={{ position: 'relative', width: '100%' }}>
              <HeroScene />
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENEFITS PILL STRIP */}
      <section style={{ position: 'relative' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              padding: '16px 20px',
              backgroundColor: 'var(--cream-light)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-clay)',
            }}
          >
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px', borderRadius: '12px', cursor: 'default' }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--clay-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown)', boxShadow: '0 4px 10px rgba(96, 68, 46, 0.15)' }}>
                <DownloadCloud size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brown)' }}>Instant Download</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Get access immediately</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px', borderRadius: '12px', cursor: 'default' }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--olive-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--olive-dark)', boxShadow: '0 4px 10px rgba(127, 135, 106, 0.2)' }}>
                <InfinityIcon size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brown)' }}>Lifetime Access</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Yours forever</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px', borderRadius: '12px', cursor: 'default' }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--terracotta-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--terracotta-dark)', boxShadow: '0 4px 10px rgba(201, 130, 103, 0.25)' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brown)' }}>Creator License</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Personal & client work</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px', borderRadius: '12px', cursor: 'default' }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown)', boxShadow: '0 4px 10px rgba(96, 68, 46, 0.12)' }}>
                <Award size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brown)' }}>High Quality</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Carefully crafted assets</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px', borderRadius: '12px', cursor: 'default' }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--clay-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown)', boxShadow: '0 4px 10px rgba(96, 68, 46, 0.15)' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brown)' }}>Free Updates</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Continuous improvements</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. CINEMATIC COLLECTION GRID (Multi-Row Wrapping Grid, 2 per row on mobile) */}
      <section>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '28px',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--cream-dark)',
                  border: '1px solid var(--border)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  marginBottom: '10px',
                }}
              >
                <Sparkles size={13} color="var(--terracotta)" />
                <span style={{ fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.06em', color: 'var(--brown)', textTransform: 'uppercase' }}>
                  Featured Toolkits
                </span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.3rem)', fontWeight: 800, color: 'var(--brown)' }}>
                Cinematic Collection
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginTop: '4px' }}>
                Everything you need for that perfect cinematic feel.
              </p>
            </div>

            <Link
              to="/shop"
              style={{
                fontSize: '0.92rem',
                fontWeight: 700,
                color: 'var(--terracotta-dark)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>View all in shop</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Dedicated Homepage Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginBottom: '26px',
            }}
            className="smooth-scroll"
          >
            <button
              type="button"
              onClick={() => setHomeCategory('all')}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 700,
                backgroundColor: homeCategory === 'all' ? 'var(--brown)' : 'var(--cream-light)',
                color: homeCategory === 'all' ? '#ffffff' : 'var(--brown)',
                border: '1.5px solid',
                borderColor: homeCategory === 'all' ? 'var(--brown-dark)' : 'var(--border)',
                boxShadow: homeCategory === 'all' ? '0 4px 12px rgba(96, 68, 46, 0.25)' : 'var(--shadow-sm)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <span>All Products</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: homeCategory === 'all' ? 'rgba(255, 255, 255, 0.22)' : 'var(--cream-dark)',
                  color: homeCategory === 'all' ? '#ffffff' : 'var(--muted)',
                  fontWeight: 800,
                }}
              >
                {products.length}
              </span>
            </button>

            {CATEGORIES.map((cat) => {
              const isSelected = homeCategory === cat.id;
              const count = products.filter((p) => {
                if (cat.id === 'psds') return p.category === 'psds' || (p.category as string) === 'albums';
                return p.category === cat.id;
              }).length;

              if (count === 0) return null;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setHomeCategory(cat.id)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    backgroundColor: isSelected ? 'var(--brown)' : 'var(--cream-light)',
                    color: isSelected ? '#ffffff' : 'var(--brown)',
                    border: '1.5px solid',
                    borderColor: isSelected ? 'var(--brown-dark)' : 'var(--border)',
                    boxShadow: isSelected ? '0 4px 12px rgba(96, 68, 46, 0.25)' : 'var(--shadow-sm)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <span>{cat.title}</span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.22)' : 'var(--cream-dark)',
                      color: isSelected ? '#ffffff' : 'var(--muted)',
                      fontWeight: 800,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Multi-Row Product Grid */}
          <div
            className="home-products-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '22px',
            }}
          >
            {isLoading && products.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'var(--cream-light)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    aspectRatio: '3 / 4',
                    animation: 'pulse 1.5s infinite ease-in-out',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '16px',
                    gap: '12px',
                  }}
                >
                  <div style={{ width: '100%', flex: 1, backgroundColor: 'var(--cream-dark)', borderRadius: 'var(--radius-md)' }} />
                  <div style={{ width: '70%', height: '20px', backgroundColor: 'var(--cream-dark)', borderRadius: '4px' }} />
                  <div style={{ width: '40%', height: '16px', backgroundColor: 'var(--cream-dark)', borderRadius: '4px' }} />
                </div>
              ))
            ) : (
              displayedHomeProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. POPULAR CATEGORIES */}
      <section className="content-auto">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brown)' }}>Popular Categories</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginTop: '4px' }}>
                Curated toolkits organized by your creative medium.
              </p>
            </div>
            <Link
              to="/collections"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.92rem',
                fontWeight: 700,
                color: 'var(--terracotta-dark)',
              }}
            >
              <span>View all categories</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}
          >
            {CATEGORIES.slice(0, 5).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. COMMUNITY UGC SHOWCASE: INFINITE AUTO SIDE-SCROLLING VERTICAL MARQUEE */}
      {ugcList && ugcList.length > 0 && (
        <section className="content-auto" style={{ position: 'relative', overflow: 'hidden', padding: '10px 0' }}>
          <div className="container" style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'var(--cream-dark)',
                    border: '1px solid var(--border)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    marginBottom: '10px',
                  }}
                >
                  <Sparkles size={13} color="var(--terracotta)" />
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.06em', color: 'var(--brown)', textTransform: 'uppercase' }}>
                    Community Showcase
                  </span>
                </div>
                <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.3rem)', fontWeight: 800, color: 'var(--brown)' }}>
                  Made with Template Theory
                </h2>
                <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginTop: '4px' }}>
                  Real edits, film grades and creations by storytellers worldwide. Click any card to preview full creation.
                </p>
              </div>

              <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
                Click photo to expand • Hold to pause • Drag to scrub
              </span>
            </div>
          </div>

          {/* Continuous Full-Width Horizontal Marquee Loop with Interactive Physics, Hold-to-Pause & Scrub */}
          <div
            ref={marqueeContainerRef}
            className="marquee-container"
            onPointerDown={handleUgcPointerDown}
            onPointerMove={handleUgcPointerMove}
            onPointerUp={handleUgcPointerUp}
            onPointerCancel={handleUgcPointerUp}
            onMouseEnter={() => { isUgcHoveredRef.current = true; }}
            onMouseLeave={() => { isUgcHoveredRef.current = false; }}
            style={{
              width: '100%',
              padding: '8px 0',
              cursor: isUgcGrabbing ? 'grabbing' : 'grab',
              touchAction: 'pan-y', // allows natural vertical page scrolling, horizontal touch scrubs marquee
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            <div ref={marqueeTrackRef} className="marquee-track">
              {[...displayUgcList, ...displayUgcList, ...displayUgcList].map((item, idx) => {
                const originalIndex = idx % displayUgcList.length;
                return (
                  <div
                    key={`${item.id}-${idx}`}
                    className="ugc-vertical-card"
                    style={{
                      width: '240px',
                      height: '380px',
                      borderRadius: 'var(--radius-lg)',
                      position: 'relative',
                      overflow: 'hidden',
                      flexShrink: 0,
                      backgroundColor: 'var(--cream-dark)',
                      border: '1.5px solid var(--border)',
                      boxShadow: 'var(--shadow-clay)',
                      transition: isUgcGrabbing ? 'none' : 'transform 0.25s ease, box-shadow 0.25s ease',
                      cursor: isUgcGrabbing ? 'grabbing' : 'pointer',
                      pointerEvents: isUgcGrabbing ? 'none' : 'auto',
                      contain: 'paint layout',
                      transform: 'translateZ(0)',
                      willChange: 'transform',
                    }}
                    onClick={(e) => {
                      if (ugcTotalDragDistRef.current > 8) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      setSelectedUgcIndex(originalIndex);
                    }}
                  >
                    {/* Background Vertical Media (Video Poster / Photo / YouTube / Instagram) */}
                    <img
                      src={optimizeImageUrl(item.image || (item.mediaType === 'youtube' ? getYouTubeThumbnailUrl(item.videoUrl) || '' : ''), 360)}
                      alt={item.caption || item.creatorName}
                      loading={idx < 4 ? 'eager' : 'lazy'}
                      decoding="async"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: isUgcGrabbing ? 'none' : 'transform 0.5s ease',
                      }}
                      className="ugc-vertical-img"
                    />

                    {/* Floating Center Play Badge for Videos / Reels */}
                    {(item.mediaType === 'video' || item.mediaType === 'youtube' || item.mediaType === 'instagram' || item.videoUrl) && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(28, 20, 15, 0.88)',
                          border: '1.5px solid rgba(255, 255, 255, 0.85)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                          zIndex: 3,
                          pointerEvents: 'none',
                        }}
                      >
                        <Play size={16} fill="#ffffff" strokeWidth={0} style={{ marginLeft: '2px' }} />
                      </div>
                    )}

                    {/* Dark Gradient Overlay for readability */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.05) 40%, rgba(20,14,10,0.92) 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '14px',
                        boxSizing: 'border-box',
                        zIndex: 4,
                      }}
                    >
                      {/* Top Row: Handle & Category / Format Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            color: 'var(--brown-dark)',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            letterSpacing: '0.02em',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {item.mediaType === 'video' && <Video size={10} color="var(--terracotta)" />}
                          {item.mediaType === 'youtube' && <YoutubeIcon size={10} color="#dc2626" />}
                          {item.mediaType === 'instagram' && <InstagramIcon size={10} color="#c026d3" />}
                          {item.creatorHandle || '@templatetheory'}
                        </span>

                        {item.category && (
                          <span
                            style={{
                              backgroundColor: 'var(--terracotta)',
                              color: '#fff',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-full)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {item.category}
                          </span>
                        )}
                      </div>

                      {/* Bottom Row: Quote & Product Link Button */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {item.caption && (
                          <p
                            style={{
                              color: '#ffffff',
                              fontSize: '0.84rem',
                              fontWeight: 600,
                              lineHeight: 1.35,
                              margin: 0,
                              textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            "{item.caption}"
                          </p>
                        )}

                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.productSlug) {
                              navigate(`/product/${item.productSlug}`);
                            } else {
                              setSelectedUgcIndex(originalIndex);
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: 'rgba(28, 20, 15, 0.85)',
                            padding: '7px 11px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(255,255,255,0.22)',
                            transition: 'background-color 0.2s, transform 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(28, 20, 15, 0.98)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(28, 20, 15, 0.85)')}
                        >
                          <div style={{ minWidth: 0, flex: 1, paddingRight: '6px' }}>
                            <span
                              style={{
                                color: '#fff',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                display: 'block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {item.productName || 'View Asset'}
                            </span>
                          </div>

                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: '#ffffff',
                              color: 'var(--brown)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <ArrowRight size={13} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}


      {/* 5. EDITORIAL SPLIT BANNERS */}
      <section className="content-auto" style={{ position: 'relative' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Banner 1: For the Cinematic Creator */}
          <div
            style={{
              backgroundColor: 'var(--cream-light)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '40px 48px',
              boxShadow: 'var(--shadow-clay)',
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              alignItems: 'center',
              gap: '32px',
              position: 'relative',
              overflow: 'hidden',
            }}
            className="editorial-banner"
          >
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--olive-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                LUTs & Presets
              </span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--brown)', marginTop: '6px', marginBottom: '12px' }}>
                For the Cinematic Creator
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--muted)', maxWidth: '440px', marginBottom: '24px', lineHeight: 1.6 }}>
                LUTs & Presets crafted to bring your story to life. Calibrated for modern mirrorless cameras & cinema workflows.
              </p>
              <Link to="/collections/luts" className="btn-primary">
                <span>Explore LUTs & Presets</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right Artwork with Micro-Interaction Spring Tilt */}
            <motion.div
              whileHover={{ y: -8, scale: 1.04, rotate: 2 }}
              transition={{ type: 'spring', stiffness: 280, damping: 14 }}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img
                  src="/assets/clay/LUTS.png"
                  alt=""
                  style={{ width: '130px', objectFit: 'contain', filter: 'drop-shadow(0 15px 25px rgba(101, 109, 84, 0.25))' }}
                />
                <img
                  src="/assets/clay/CAMERA.png"
                  alt=""
                  style={{ width: '150px', objectFit: 'contain', filter: 'drop-shadow(0 18px 28px rgba(96, 68, 46, 0.2))' }}
                />
              </div>
            </motion.div>
          </div>

          {/* Banner 2: For the Designer */}
          <div
            style={{
              backgroundColor: 'var(--cream-light)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '40px 48px',
              boxShadow: 'var(--shadow-clay)',
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              alignItems: 'center',
              gap: '32px',
              position: 'relative',
              overflow: 'hidden',
            }}
            className="editorial-banner"
          >
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--terracotta)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                PSDs, Fonts & Assets
              </span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--brown)', marginTop: '6px', marginBottom: '12px' }}>
                For the Designer
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--muted)', maxWidth: '440px', marginBottom: '24px', lineHeight: 1.6 }}>
                PSDs, mockups, icons & 3D assets to speed up your workflow. Drop in your artwork and export in seconds.
              </p>
              <Link to="/collections/psds" className="btn-primary">
                <span>Explore Design Assets</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right Artwork with Micro-Interaction Spring Tilt */}
            <motion.div
              whileHover={{ y: -8, scale: 1.04, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 280, damping: 14 }}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img
                  src="/assets/clay/PSDS.png"
                  alt=""
                  style={{ width: '140px', objectFit: 'contain', filter: 'drop-shadow(0 18px 28px rgba(201, 130, 103, 0.25))' }}
                />
                <img
                  src="/assets/clay/FONT ASSET.png"
                  alt=""
                  style={{ width: '130px', objectFit: 'contain', filter: 'drop-shadow(0 16px 26px rgba(96, 68, 46, 0.2))' }}
                />
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 6. SEE THE DIFFERENCE (BEFORE / AFTER) */}
      {homeLooks.length > 0 && currentHomeLook?.before && currentHomeLook?.after && (
        <section className="content-auto">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--brown)' }}>
                {homepageSettings?.heading || 'See the Difference'}
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--muted)', marginTop: '6px' }}>
                {homepageSettings?.subheading || 'One click. Completely different mood. Drag the slider to compare.'}
              </p>
            </div>

            {/* Interactive Look Switcher Pills on Homepage */}
            {homeLooks.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '26px',
                  padding: '0 8px',
                }}
              >
                {homeLooks.map((look, idx) => {
                  const isSelected = activeHomeLookIndex === idx;
                  return (
                    <button
                      key={look.id || idx}
                      onClick={() => setActiveHomeLookIndex(idx)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        backgroundColor: isSelected ? 'var(--brown)' : 'var(--cream-light)',
                        color: isSelected ? '#ffffff' : 'var(--brown)',
                        border: isSelected ? '1.5px solid var(--brown)' : '1.5px solid var(--border)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isSelected ? '0 4px 14px rgba(96, 68, 46, 0.22)' : 'none',
                        transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'var(--cream)';
                          e.currentTarget.style.borderColor = 'var(--brown-light)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'var(--cream-light)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                        }
                      }}
                    >
                      <Sparkles size={13} color={isSelected ? 'var(--terracotta-light)' : 'var(--terracotta)'} />
                      <span>{look.title?.split('(')[0]?.trim() || `Look #${idx + 1}`}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div
              style={{
                maxWidth: '960px',
                margin: '0 auto',
                position: 'relative',
                touchAction: 'pan-y',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
              }}
            >
              <AnimatePresence mode="wait" custom={homeSlideDirection}>
                <motion.div
                  key={`home-look-slide-${activeHomeLookIndex}`}
                  custom={homeSlideDirection}
                  initial={{ opacity: 0, x: homeSlideDirection > 0 ? 55 : -55 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: homeSlideDirection > 0 ? -55 : 55 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <BeforeAfterSlider
                    key={`home-showcase-slider-${activeHomeLookIndex}`}
                    beforeImage={currentHomeLook.before}
                    afterImage={currentHomeLook.after}
                    beforeLabel="BEFORE"
                    afterLabel="AFTER"
                    aspectRatio="auto"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Translucent Left Arrow Button */}
              {homeLooks.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevHomeLook();
                  }}
                  aria-label="Previous Look"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '12px',
                    transform: 'translateY(-50%)',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(24, 19, 16, 0.45)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 15,
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(24, 19, 16, 0.85)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(24, 19, 16, 0.45)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  <ChevronLeft size={22} strokeWidth={2.5} />
                </button>
              )}

              {/* Translucent Right Arrow Button */}
              {homeLooks.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextHomeLook();
                  }}
                  aria-label="Next Look"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '12px',
                    transform: 'translateY(-50%)',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(24, 19, 16, 0.45)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 15,
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(24, 19, 16, 0.85)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(24, 19, 16, 0.45)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  <ChevronRight size={22} strokeWidth={2.5} />
                </button>
              )}

              {/* Look Tag Badge on top-left of the slider */}
              {currentHomeLook.title && (
                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    zIndex: 12,
                    backgroundColor: 'rgba(33, 25, 19, 0.82)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
                    pointerEvents: 'none',
                  }}
                >
                  <Sparkles size={12} color="var(--terracotta-light)" />
                  <span>{currentHomeLook.title}</span>
                </div>
              )}
            </div>

            {/* Interactive Instagram / iOS Hold-to-Scrub Dot Track on Homepage */}
            {homeLooks.length > 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '18px', gap: '6px' }}>
                <div
                  ref={homeScrubberTrackRef}
                  onMouseDown={handleHomeScrubberMouseDown}
                  onMouseMove={handleHomeScrubberMouseMove}
                  onMouseUp={handleHomeScrubberMouseUp}
                  onMouseLeave={handleHomeScrubberMouseUp}
                  onTouchStart={handleHomeScrubberTouchStart}
                  onTouchMove={handleHomeScrubberTouchMove}
                  onTouchEnd={handleHomeScrubberTouchEnd}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: isHomeScrubbing ? '8px 18px' : '6px 14px',
                    backgroundColor: isHomeScrubbing ? 'var(--cream)' : 'var(--cream-light)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: isHomeScrubbing ? '0 6px 20px rgba(96, 68, 46, 0.22)' : 'var(--shadow-sm)',
                    cursor: isHomeScrubbing ? 'ew-resize' : 'pointer',
                    userSelect: 'none',
                    touchAction: 'none',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: isHomeScrubbing ? 'scale(1.08)' : 'scale(1)',
                  }}
                  title="Slide or tap to scrub looks"
                >
                  {homeLooks.map((look, idx) => {
                    const isActive = activeHomeLookIndex === idx;
                    return (
                      <div
                        key={look.id || idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectHomeLook(idx);
                        }}
                        style={{
                          width: isActive ? (isHomeScrubbing ? '32px' : '26px') : (isHomeScrubbing ? '10px' : '7px'),
                          height: isHomeScrubbing ? '9px' : '7px',
                          borderRadius: '5px',
                          backgroundColor: isActive ? 'var(--brown)' : 'var(--border)',
                          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                          boxShadow: isActive ? '0 2px 8px rgba(96, 68, 46, 0.3)' : 'none',
                          flexShrink: 0,
                        }}
                      />
                    );
                  })}
                </div>

                {/* Subtle scrub helper hint */}
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.02em' }}>
                  {isHomeScrubbing ? `Scrubbing: Look ${activeHomeLookIndex + 1} of ${homeLooks.length}` : 'Slide dots to scrub looks'}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 8. WHAT'S INSIDE? */}
      <section className="content-auto">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--brown)' }}>What's Inside?</h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--muted)', marginTop: '6px' }}>
              Quality you can count on across all creative tools.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '18px',
            }}
          >
            {/* Card 1: Presets */}
            <motion.div
              className="clay-card"
              whileHover={{ y: -8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              style={{ padding: '24px 16px', textAlign: 'center', cursor: 'default' }}
            >
              <motion.img
                whileHover={{ rotate: 10, scale: 1.1 }}
                src="/assets/clay/PRESET.png"
                alt="Presets"
                style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto 12px' }}
              />
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brown)', display: 'block' }}>20</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.04em' }}>PRESETS</span>
            </motion.div>

            {/* Card 2: LUTs */}
            <motion.div
              className="clay-card"
              whileHover={{ y: -8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              style={{ padding: '24px 16px', textAlign: 'center', cursor: 'default' }}
            >
              <motion.img
                whileHover={{ rotate: -10, scale: 1.1 }}
                src="/assets/clay/LUTS.png"
                alt="LUTs"
                style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto 12px' }}
              />
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brown)', display: 'block' }}>16</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.04em' }}>LUTs</span>
            </motion.div>

            {/* Card 3: PSDs */}
            <motion.div
              className="clay-card"
              whileHover={{ y: -8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              style={{ padding: '24px 16px', textAlign: 'center', cursor: 'default' }}
            >
              <motion.img
                whileHover={{ rotate: 12, scale: 1.1 }}
                src="/assets/clay/PSDS.png"
                alt="PSDs"
                style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto 12px' }}
              />
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brown)', display: 'block' }}>10</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.04em' }}>PSD FILES</span>
            </motion.div>

            {/* Card 4: Assets */}
            <motion.div
              className="clay-card"
              whileHover={{ y: -8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              style={{ padding: '24px 16px', textAlign: 'center', cursor: 'default' }}
            >
              <motion.img
                whileHover={{ rotate: -12, scale: 1.1 }}
                src="/assets/clay/CUBE.png"
                alt="Assets"
                style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto 12px' }}
              />
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brown)', display: 'block' }}>25+</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.04em' }}>ASSETS</span>
            </motion.div>

            {/* Card 5: Bonus */}
            <motion.div
              className="clay-card"
              whileHover={{ y: -8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              style={{ padding: '24px 16px', textAlign: 'center', cursor: 'default' }}
            >
              <motion.img
                whileHover={{ rotate: 15, scale: 1.1 }}
                src="/assets/clay/FONT ASSET.png"
                alt="Freebies"
                style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto 12px' }}
              />
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--terracotta)', display: 'block' }}>BONUS</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.04em' }}>FREEBIES</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 9. CREATOR COMMUNITY CTA BANNER */}
      <section className="content-auto">
        <div className="container">
          <div
            style={{
              backgroundColor: 'var(--cream-light)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '48px 40px',
              boxShadow: 'var(--shadow-clay)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '32px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '8px' }}>
                Join 10,000+ Creators Building Amazing Projects
              </h3>
              <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: '540px' }}>
                Get early access to drops, exclusive discount codes, free toolkits, and creative tutorials.
              </p>
            </div>

            <Link to="/shop" className="btn-terracotta" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              <span>Join Our Community</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. NEWSLETTER */}
      <section className="content-auto">
        <div className="container">
          <div
            style={{
              backgroundColor: 'var(--cream-dark)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '36px 40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cream-light)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--terracotta)',
                }}
              >
                <Mail size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brown)' }}>Stay in the Loop</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                  New products, freebies & creator tips — straight to your inbox.
                </p>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleNewsletterSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                maxWidth: '460px',
              }}
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--border)',
                  backgroundColor: 'var(--white)',
                  outline: 'none',
                  color: 'var(--brown)',
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '12px 24px', fontSize: '0.9rem' }}
              >
                {newsletterStatus === 'subscribed' ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* UGC FULL-SIZE LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeUgcModalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              backgroundColor: 'rgba(18, 12, 9, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'clamp(12px, 3vw, 28px)',
              boxSizing: 'border-box',
            }}
            onClick={() => setSelectedUgcIndex(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedUgcIndex(null)}
              aria-label="Close Preview"
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 100000,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
            >
              <X size={22} />
            </button>

            {/* Left Nav Arrow */}
            {ugcList && ugcList.length > 1 && (
              <button
                onClick={handlePrevUgc}
                aria-label="Previous Look"
                className="ugc-nav-btn"
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 100000,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
              >
                <ChevronLeft size={26} />
              </button>
            )}

            {/* Right Nav Arrow */}
            {ugcList && ugcList.length > 1 && (
              <button
                onClick={handleNextUgc}
                aria-label="Next Look"
                className="ugc-nav-btn"
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 100000,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
              >
                <ChevronRight size={26} />
              </button>
            )}

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 380, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'var(--cream-light)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.65)',
                maxWidth: '860px',
                width: '100%',
                maxHeight: '88vh',
                display: 'grid',
                gridTemplateColumns: '1.15fr 1fr',
                overflow: 'hidden',
                position: 'relative',
              }}
              className="ugc-modal-grid"
            >
              {/* Left Column: Full-Height Vertical Media Viewer (Video Player / Photo / Embed) */}
              <div
                style={{
                  backgroundColor: '#120f0d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '380px',
                }}
              >
                {/* Ambient Blurred Glow */}
                <img
                  src={activeUgcModalItem.image || (activeUgcModalItem.mediaType === 'youtube' ? getYouTubeThumbnailUrl(activeUgcModalItem.videoUrl) || '' : '')}
                  alt=""
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: '-20%',
                    width: '140%',
                    height: '140%',
                    objectFit: 'cover',
                    filter: 'blur(30px)',
                    opacity: 0.35,
                    pointerEvents: 'none',
                  }}
                />

                {/* Media Renderer */}
                {activeUgcModalItem.mediaType === 'video' && activeUgcModalItem.videoUrl ? (
                  <video
                    key={activeUgcModalItem.videoUrl}
                    src={activeUgcModalItem.videoUrl}
                    poster={activeUgcModalItem.image}
                    controls
                    autoPlay
                    playsInline
                    loop
                    style={{
                      position: 'relative',
                      width: '100%',
                      maxHeight: '88vh',
                      objectFit: 'contain',
                      display: 'block',
                      zIndex: 2,
                    }}
                  />
                ) : activeUgcModalItem.mediaType === 'youtube' && getYouTubeEmbedUrl(activeUgcModalItem.videoUrl) ? (
                  <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', minHeight: '420px', maxHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <iframe
                      src={getYouTubeEmbedUrl(activeUgcModalItem.videoUrl)!}
                      style={{ width: '100%', height: '100%', minHeight: '420px', maxHeight: '85vh', border: 'none', borderRadius: 'var(--radius-md)' }}
                      allow="autoplay; encrypted-media; fullscreen"
                    />
                  </div>
                ) : (
                  <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={activeUgcModalItem.image || (activeUgcModalItem.mediaType === 'youtube' ? getYouTubeThumbnailUrl(activeUgcModalItem.videoUrl) || '' : '')}
                      alt={activeUgcModalItem.caption || activeUgcModalItem.creatorName}
                      style={{
                        position: 'relative',
                        width: '100%',
                        maxHeight: '88vh',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                    {activeUgcModalItem.mediaType === 'instagram' && activeUgcModalItem.videoUrl && (
                      <a
                        href={activeUgcModalItem.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          position: 'absolute',
                          bottom: '24px',
                          backgroundColor: 'rgba(192, 38, 211, 0.95)',
                          color: '#fff',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          padding: '8px 18px',
                          borderRadius: 'var(--radius-full)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          textDecoration: 'none',
                          boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
                        }}
                      >
                        <InstagramIcon size={15} color="#fff" /> Watch Reel on Instagram <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                )}

                {/* Category & Format Badge overlay on media */}
                <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {activeUgcModalItem.mediaType && (
                    <span
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backdropFilter: 'blur(6px)',
                      }}
                    >
                      {activeUgcModalItem.mediaType === 'video' && <Video size={11} color="var(--terracotta-light)" />}
                      {activeUgcModalItem.mediaType === 'youtube' && <YoutubeIcon size={11} color="#dc2626" />}
                      {activeUgcModalItem.mediaType === 'instagram' && <InstagramIcon size={11} color="#c026d3" />}
                      {activeUgcModalItem.mediaType}
                    </span>
                  )}
                  {activeUgcModalItem.category && (
                    <span
                      style={{
                        backgroundColor: 'var(--terracotta)',
                        color: '#fff',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {activeUgcModalItem.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Information, Creator Info & Linked Product Details */}
              <div
                style={{
                  padding: 'clamp(20px, 4vw, 32px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '20px',
                  overflowY: 'auto',
                  backgroundColor: '#ffffff',
                }}
              >
                <div>
                  {/* Creator Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--clay-light)',
                        border: '1.5px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--brown)',
                        fontWeight: 800,
                        fontSize: '1rem',
                      }}
                    >
                      {activeUgcModalItem.creatorHandle?.charAt(1)?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brown)', margin: 0 }}>
                        {activeUgcModalItem.creatorHandle || '@templatetheory'}
                      </h3>
                      <span style={{ fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 600 }}>
                        Verified Creator • Template Theory Community
                      </span>
                    </div>
                  </div>

                  {/* Caption / Testimonial Quote */}
                  {activeUgcModalItem.caption && (
                    <div
                      style={{
                        backgroundColor: 'var(--cream-light)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        marginBottom: '20px',
                      }}
                    >
                      <p style={{ fontSize: '0.94rem', color: 'var(--brown)', margin: 0, lineHeight: 1.55, fontStyle: 'italic', fontWeight: 600 }}>
                        "{activeUgcModalItem.caption}"
                      </p>
                    </div>
                  )}

                  {/* Look Details Summary */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} color="var(--terracotta)" />
                      <span>Color graded & curated with official Template Theory digital toolkits.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} color="var(--olive)" />
                      <span>Instant digital download with one-click installation guide.</span>
                    </div>
                  </div>
                </div>

                {/* Linked Product Banner */}
                {linkedModalProduct ? (
                  <div
                    style={{
                      backgroundColor: 'var(--cream-light)',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={linkedModalProduct.thumbnail}
                        alt={linkedModalProduct.name}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: 'var(--radius-md)',
                          objectFit: 'contain',
                          backgroundColor: 'var(--cream-dark)',
                          border: '1px solid var(--border)',
                          flexShrink: 0,
                        }}
                      />

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--terracotta-dark)', textTransform: 'uppercase' }}>
                          Used in this creation:
                        </span>
                        <h4
                          style={{
                            fontSize: '0.92rem',
                            fontWeight: 800,
                            color: 'var(--brown)',
                            margin: '2px 0 0 0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {linkedModalProduct.name}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brown)' }}>
                            {currencySymbol}{linkedModalProduct.price}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Star size={11} fill="var(--gold)" color="var(--gold)" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brown)' }}>
                              {linkedModalProduct.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          addToCart(linkedModalProduct);
                          setSelectedUgcIndex(null);
                        }}
                        className="btn-secondary"
                        style={{ padding: '9px 12px', fontSize: '0.84rem', justifyContent: 'center' }}
                      >
                        <ShoppingBag size={14} /> Add to Cart
                      </button>

                      <Link
                        to={`/product/${linkedModalProduct.slug}`}
                        className="btn-primary"
                        style={{ padding: '9px 14px', fontSize: '0.84rem', justifyContent: 'center' }}
                        onClick={() => setSelectedUgcIndex(null)}
                      >
                        <span>Explore Asset</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/shop"
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                    onClick={() => setSelectedUgcIndex(null)}
                  >
                    <span>Browse All Toolkits</span>
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .home-products-grid {
          display: grid !important;
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          gap: 22px !important;
        }

        @media (max-width: 1100px) {
          .home-products-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 18px !important;
          }
        }

        @media (max-width: 900px) {
          .hero-section { padding-top: 10px !important; }
          .hero-grid { 
            display: flex !important; 
            flex-direction: column !important; 
            text-align: center; 
            gap: 20px !important; 
            width: 100% !important;
            max-width: 100% !important;
          }
          .hero-scene-col { 
            order: -1 !important; 
            width: 100% !important;
            max-width: 100% !important;
            margin-bottom: 4px !important;
          }
          .hero-copy-col { 
            order: 1 !important; 
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 4px !important;
            box-sizing: border-box !important;
          }
          .hero-copy-col h1 {
            font-size: clamp(2.1rem, 7.5vw, 2.7rem) !important;
            word-break: break-word !important;
            line-height: 1.15 !important;
          }
          .hero-copy-col p { 
            margin-left: auto; 
            margin-right: auto;
            max-width: 100% !important;
            font-size: 0.92rem !important;
            line-height: 1.55 !important;
          }
          .hero-copy-col div { justify-content: center; }
          .editorial-banner { grid-template-columns: 1fr !important; text-align: center; }
          .ugc-modal-grid { grid-template-columns: 1fr !important; max-height: 85vh; overflow-y: auto; }
        }

        @media (max-width: 768px) {
          /* Exactly 2 cards per row on mobile / phone */
          .home-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .home-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
        }

        .ugc-vertical-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 16px 36px rgba(45, 30, 20, 0.22) !important;
        }
        .ugc-vertical-card:hover .ugc-vertical-img {
          transform: scale(1.06);
        }
      `}</style>
    </div>
  );
};
