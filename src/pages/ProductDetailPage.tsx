import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  DownloadCloud,
  ShieldCheck,
  Infinity as InfinityIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Layers,
  FileCode,
  Sparkles,
  Type,
  Eye,
  ArrowLeft,
  Maximize2,
  X,
  Share2,
  Check
} from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { FAQS_DATA } from '../data/faqs';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useShopify } from '../context/ShopifyContext';
import { BeforeAfterSlider } from '../components/comparison/BeforeAfterSlider';
import { ProductCard } from '../components/cards/ProductCard';
import { MobileStickyBuyBar } from '../components/pdp/MobileStickyBuyBar';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, checkoutWithShopify, isCheckingOut, setIsCartOpen, totalItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { getProductBySlug, products, currencySymbol, isLoading } = useShopify();

  // Find product from live Shopify catalog without falling back to mock products
  const product = useMemo(() => {
    if (!slug) return products[0];
    return getProductBySlug(slug) || products.find((p) => p.id === slug || p.slug === slug);
  }, [slug, getProductBySlug, products]);

  const beforeAfterPairs = useMemo(() => {
    if (!product) return [];
    if (product.beforeAfterList && product.beforeAfterList.length > 0) {
      return product.beforeAfterList.filter((look) => Boolean(look.before && look.after));
    }
    if (product.beforeAfterImage?.before && product.beforeAfterImage?.after) {
      return [
        {
          id: 'ba-default',
          title: 'Main Look',
          before: product.beforeAfterImage.before,
          after: product.beforeAfterImage.after,
        },
      ];
    }
    return [];
  }, [product]);

  const hasBeforeAfter = beforeAfterPairs.length > 0;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeBAIndex, setActiveBAIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'preview' | 'beforeAfter' | 'typeTester' | 'layers'>('preview');
  const [fontTestText, setFontTestText] = useState('Template Theory Crafted for Creators');
  const [fontSize, setFontSize] = useState(36);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(false);
  const [lightboxTouchStartX, setLightboxTouchStartX] = useState<number | null>(null);
  const [lightboxDragOffset, setLightboxDragOffset] = useState(0);
  const [isLightboxDragging, setIsLightboxDragging] = useState(false);

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const lightboxThumbsRowRef = useRef<HTMLDivElement | null>(null);
  const mainThumbsRowRef = useRef<HTMLDivElement | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (product?.fontPreviewText) {
      setFontTestText(product.fontPreviewText);
    }
  }, [product?.fontPreviewText]);

  // Gallery swipe navigation
  const handlePrevImage = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (!product?.gallery || product.gallery.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + product.gallery.length) % product.gallery.length);
  };

  const handleNextImage = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (!product?.gallery || product.gallery.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % product.gallery.length);
  };

  // Main Gallery Touch Drag
  const onTouchStart = (e: React.TouchEvent) => {
    if (!product?.gallery || product.gallery.length <= 1) return;
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
    setIsDragging(true);
    setDragOffset(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || touchStartX === null) return;
    const currentX = e.targetTouches[0].clientX;
    const delta = currentX - touchStartX;
    // Apply resistance at edges
    if ((activeImageIndex === 0 && delta > 0) || (activeImageIndex === (product?.gallery?.length || 1) - 1 && delta < 0)) {
      setDragOffset(delta * 0.35);
    } else {
      setDragOffset(delta);
    }
    setTouchEndX(currentX);
  };

  const onTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const minSwipe = 40;
    if (dragOffset < -minSwipe && activeImageIndex < (product?.gallery?.length || 1) - 1) {
      setActiveImageIndex((prev) => prev + 1);
    } else if (dragOffset > minSwipe && activeImageIndex > 0) {
      setActiveImageIndex((prev) => prev - 1);
    }
    setDragOffset(0);
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Lightbox Touch Handlers
  const onLightboxTouchStart = (e: React.TouchEvent) => {
    if (lightboxZoom || !product?.gallery || product.gallery.length <= 1) return;
    setLightboxTouchStartX(e.targetTouches[0].clientX);
    setIsLightboxDragging(true);
    setLightboxDragOffset(0);
  };

  const onLightboxTouchMove = (e: React.TouchEvent) => {
    if (!isLightboxDragging || lightboxTouchStartX === null || lightboxZoom) return;
    const currentX = e.targetTouches[0].clientX;
    const delta = currentX - lightboxTouchStartX;
    if ((activeImageIndex === 0 && delta > 0) || (activeImageIndex === (product?.gallery?.length || 1) - 1 && delta < 0)) {
      setLightboxDragOffset(delta * 0.35);
    } else {
      setLightboxDragOffset(delta);
    }
  };

  const onLightboxTouchEnd = () => {
    if (!isLightboxDragging) return;
    setIsLightboxDragging(false);
    const minSwipe = 45;
    if (lightboxDragOffset < -minSwipe && activeImageIndex < (product?.gallery?.length || 1) - 1) {
      setActiveImageIndex((prev) => prev + 1);
    } else if (lightboxDragOffset > minSwipe && activeImageIndex > 0) {
      setActiveImageIndex((prev) => prev - 1);
    }
    setLightboxDragOffset(0);
    setLightboxTouchStartX(null);
  };

  // Lightbox Back-Button PopState & Body Scroll-Lock Handler
  useEffect(() => {
    if (!isLightboxOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Push state for back-button dismissal on mobile and browser
    window.history.pushState({ pdpLightbox: true }, '');

    const handlePopState = () => {
      setIsLightboxOpen(false);
      setLightboxZoom(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, product?.gallery]);

  // Auto-scroll Lightbox thumbnails to active index
  useEffect(() => {
    if (isLightboxOpen && lightboxThumbsRowRef.current) {
      const activeBtn = lightboxThumbsRowRef.current.children[activeImageIndex] as HTMLElement;
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeImageIndex, isLightboxOpen]);

  // Auto-scroll main PDP thumbnails to active index
  useEffect(() => {
    if (mainThumbsRowRef.current) {
      const activeBtn = mainThumbsRowRef.current.children[activeImageIndex] as HTMLElement;
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeImageIndex]);

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxZoom(false);
    if (window.history.state?.pdpLightbox) {
      window.history.back();
    }
  };

  const openLightbox = (index?: number) => {
    if (typeof index === 'number') {
      setActiveImageIndex(index);
    }
    setLightboxZoom(false);
    setIsLightboxOpen(true);
  };

  // Reset indices when slug changes (defaults to gallery preview first)
  useEffect(() => {
    setActiveImageIndex(0);
    setActiveBAIndex(0);
    setActiveTab('preview');
    setIsLightboxOpen(false);
    setLightboxZoom(false);
    setDragOffset(0);
    setLightboxDragOffset(0);
  }, [slug]);

  const isSaved = product ? isInWishlist(product.id) : false;

  // Current active Before/After pair
  const currentBAPair = beforeAfterPairs[activeBAIndex] || beforeAfterPairs[0];

  // Related products (Curated items: same category first, then recommendations from other categories)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const sameCategory = products.filter((p) => p.id !== product.id && p.category === product.category);
    const otherProducts = products.filter((p) => p.id !== product.id && p.category !== product.category);
    return [...sameCategory, ...otherProducts].slice(0, 8);
  }, [product, products]);

  const handleBuyNow = () => {
    if (product) checkoutWithShopify(product);
  };

  // 1. Shimmer Loading Skeleton State (prevents flashing of old mock items during page navigation/refresh)
  if (isLoading && !product) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingBottom: '80px', paddingTop: '28px' }}>
        <div className="container">
          <div style={{ width: '220px', height: '18px', backgroundColor: 'var(--cream-dark)', borderRadius: '6px', marginBottom: '24px', animation: 'pulse 1.5s infinite ease-in-out' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1.18fr 1fr', gap: '44px' }} className="pdp-split-grid">
            <div
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                maxHeight: 'min(90vw, 520px)',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                border: '1.5px solid var(--border)',
                animation: 'pulse 1.5s infinite ease-in-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', border: '3px solid var(--clay)', borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ width: '100px', height: '26px', backgroundColor: 'var(--cream-dark)', borderRadius: 'var(--radius-full)' }} />
              <div style={{ width: '85%', height: '44px', backgroundColor: 'var(--cream-dark)', borderRadius: 'var(--radius-md)' }} />
              <div style={{ width: '60%', height: '22px', backgroundColor: 'var(--cream-dark)', borderRadius: 'var(--radius-sm)' }} />
              <div style={{ width: '140px', height: '42px', backgroundColor: 'var(--cream-dark)', borderRadius: 'var(--radius-md)', marginTop: '16px' }} />
              <div style={{ width: '100%', height: '54px', backgroundColor: 'var(--cream-dark)', borderRadius: 'var(--radius-full)', marginTop: '18px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Fallback Not Found state
  if (!product) {
    return (
      <div style={{ padding: '90px 20px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '12px' }}>Product Not Found</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '28px', maxWidth: '440px', fontSize: '1.05rem' }}>
          We couldn't find the product you're looking for. It may have been updated or moved.
        </p>
        <Link to="/shop" className="btn-primary" style={{ padding: '14px 32px' }}>
          Explore All Products
        </Link>
      </div>
    );
  }

  const galleryList = (product.gallery && product.gallery.length > 0) ? product.gallery : [product.thumbnail];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingBottom: '80px', paddingTop: '20px' }}>
      
      {/* Fullscreen High-Resolution Lightbox Modal with Smooth Slider & Touch Support */}
      {isLightboxOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9999,
            backgroundColor: 'rgba(18, 13, 10, 0.96)',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            boxSizing: 'border-box',
            animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            userSelect: 'none',
          }}
          onClick={closeLightbox}
        >
          {/* Top Bar inside Lightbox */}
          <div
            style={{
              width: '100%',
              maxWidth: '1200px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#fff',
              zIndex: 10000,
              padding: '6px 4px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--terracotta-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {product.category}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                  • Image {activeImageIndex + 1} of {galleryList.length}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {product.name}
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Zoom In / Out Toggle Button */}
              <button
                onClick={() => setLightboxZoom((prev) => !prev)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: lightboxZoom ? 'var(--terracotta)' : 'rgba(255, 255, 255, 0.18)',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                aria-label="Toggle zoom"
              >
                <Maximize2 size={14} />
                <span>{lightboxZoom ? 'Reset Zoom' : 'Zoom 2x'}</span>
              </button>

              {/* Close / Cross (X) Button */}
              <button
                onClick={closeLightbox}
                aria-label="Close fullscreen preview"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.22)',
                  border: '1.5px solid rgba(255, 255, 255, 0.5)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--terracotta)';
                  e.currentTarget.style.borderColor = 'var(--terracotta-light)';
                  e.currentTarget.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.22)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Smooth Sliding Lightbox Carousel */}
          <div
            onTouchStart={onLightboxTouchStart}
            onTouchMove={onLightboxTouchMove}
            onTouchEnd={onLightboxTouchEnd}
            style={{
              flex: 1,
              width: '100%',
              maxWidth: '1200px',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
              padding: '10px 0',
            }}
          >
            {/* Sliding Track */}
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                transform: `translate3d(calc(-${activeImageIndex * 100}% + ${lightboxDragOffset}px), 0, 0)`,
                transition: isLightboxDragging ? 'none' : 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)',
                willChange: 'transform',
              }}
            >
              {galleryList.map((imgUrl, idx) => (
                <div
                  key={idx}
                  style={{
                    minWidth: '100%',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    cursor: lightboxZoom ? 'zoom-out' : 'zoom-in',
                    padding: '0 8px',
                    boxSizing: 'border-box',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxZoom((prev) => !prev);
                  }}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} ${idx + 1}`}
                    draggable={false}
                    style={{
                      maxWidth: '100%',
                      maxHeight: lightboxZoom ? '92vh' : '70vh',
                      objectFit: 'contain',
                      borderRadius: '14px',
                      boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
                      transform: lightboxZoom ? 'scale(1.75)' : 'scale(1)',
                      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      pointerEvents: 'auto',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Lightbox Side Navigation Arrows */}
            {galleryList.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.22)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
                    zIndex: 10001,
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.45)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.22)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  <ChevronLeft size={26} />
                </button>

                <button
                  onClick={handleNextImage}
                  aria-label="Next image"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.22)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
                    zIndex: 10001,
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.45)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.22)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  <ChevronRight size={26} />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip in Lightbox (Full 1st Image visibility with flex-start & auto-centering) */}
          {galleryList.length > 1 && (
            <div
              style={{
                width: '100%',
                maxWidth: '720px',
                display: 'flex',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '4px 0 8px 0',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={lightboxThumbsRowRef}
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  overflowX: 'auto',
                  padding: '6px 16px',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {galleryList.map((imgUrl, idx) => {
                  const isActive = activeImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveImageIndex(idx);
                        setLightboxZoom(false);
                      }}
                      aria-label={`View image ${idx + 1}`}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: isActive ? '2.5px solid var(--terracotta)' : '1.5px solid rgba(255, 255, 255, 0.35)',
                        boxShadow: isActive ? '0 0 16px rgba(201, 130, 103, 0.85)' : 'none',
                        backgroundColor: '#ffffff',
                        padding: '2px',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transform: isActive ? 'scale(1.08)' : 'scale(1)',
                        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxSizing: 'border-box',
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          borderRadius: '6px',
                          display: 'block',
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1. MAIN PDP SPLIT */}
      <section style={{ paddingTop: '0px' }}>
        <div className="container">
          {/* Main 2-Column Split */}
          <div
            style={{
              alignItems: 'flex-start',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
            className="pdp-split-grid"
          >
            {/* LEFT COLUMN: DYNAMIC PREVIEW ENGINE */}
            <div id="product-preview-section" style={{ width: '100%', minWidth: 0 }}>
              {/* Display Main Image / Interactive Component */}
              <div
                className="pdp-preview-wrapper"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-clay)',
                  position: 'relative',
                  transition: 'all 0.35s ease',
                  width: '100%',
                }}
              >
                {activeTab === 'beforeAfter' && currentBAPair ? (
                  <BeforeAfterSlider
                    key={currentBAPair.id || activeBAIndex}
                    beforeImage={currentBAPair.before}
                    afterImage={currentBAPair.after}
                    beforeLabel="BEFORE"
                    afterLabel="AFTER"
                    aspectRatio="1 / 1"
                    fallbackImage={product.thumbnail}
                  />
                ) : activeTab === 'typeTester' ? (
                  <div style={{ padding: '36px 30px', backgroundColor: 'var(--white)', aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Size:</label>
                      <input
                        type="range"
                        min="20"
                        max="72"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        style={{ accentColor: 'var(--brown)', flex: 1 }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brown)' }}>{fontSize}px</span>
                    </div>

                    <textarea
                      value={fontTestText}
                      onChange={(e) => setFontTestText(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        fontSize: `${fontSize}px`,
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        color: 'var(--brown-dark)',
                        border: '1.5px dashed var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        outline: 'none',
                        resize: 'none',
                        backgroundColor: 'var(--cream-light)',
                        lineHeight: 1.25,
                        flex: 1,
                      }}
                    />
                    <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '10px' }}>
                      Type above to test live ligatures, alternate weights & character spacing.
                    </p>
                  </div>
                ) : (
                  <div
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    className="gallery-preview-container"
                    style={{
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                      backgroundColor: '#ffffff',
                      position: 'relative',
                      touchAction: 'pan-y',
                      userSelect: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Zoom / Lightbox Trigger Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightbox(activeImageIndex);
                      }}
                      aria-label="Expand image"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.94)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: '1.5px solid var(--border)',
                        color: 'var(--brown)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer',
                        zIndex: 20,
                        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <Maximize2 size={13} />
                      <span>Zoom</span>
                    </button>

                    {/* Smooth Sliding Image Carousel Track */}
                    <div
                      style={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        transform: `translate3d(calc(-${activeImageIndex * 100}% + ${dragOffset}px), 0, 0)`,
                        transition: isDragging ? 'none' : 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)',
                        willChange: 'transform',
                      }}
                    >
                      {galleryList.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() => openLightbox(idx)}
                          style={{
                            minWidth: '100%',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '12px',
                            boxSizing: 'border-box',
                            cursor: 'zoom-in',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={imgUrl}
                            alt={`${product.name} ${idx + 1}`}
                            className="gallery-active-img"
                            draggable={false}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = product.thumbnail;
                            }}
                            style={{
                              width: '100%',
                              height: '100%',
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                              objectPosition: 'center',
                              display: 'block',
                              filter: 'drop-shadow(0 8px 20px rgba(96, 68, 46, 0.12))',
                              pointerEvents: 'none',
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Semi-transparent Glass Left / Right Slide Arrows */}
                    {galleryList.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          aria-label="Previous image"
                          className="gallery-nav-arrow arrow-prev"
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '10px',
                            transform: 'translateY(-50%)',
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.92)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            border: '1.5px solid rgba(255, 255, 255, 0.95)',
                            color: 'var(--brown)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                            cursor: 'pointer',
                            zIndex: 15,
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        >
                          <ChevronLeft size={22} />
                        </button>

                        <button
                          onClick={handleNextImage}
                          aria-label="Next image"
                          className="gallery-nav-arrow arrow-next"
                          style={{
                            position: 'absolute',
                            top: '50%',
                            right: '10px',
                            transform: 'translateY(-50%)',
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.92)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            border: '1.5px solid rgba(255, 255, 255, 0.95)',
                            color: 'var(--brown)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                            cursor: 'pointer',
                            zIndex: 15,
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        >
                          <ChevronRight size={22} />
                        </button>

                        {/* Image Counter Pill */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '10px',
                            right: '10px',
                            backgroundColor: 'rgba(33, 25, 19, 0.75)',
                            backdropFilter: 'blur(6px)',
                            color: 'var(--white)',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            pointerEvents: 'none',
                            zIndex: 15,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                          }}
                        >
                          {activeImageIndex + 1} / {galleryList.length}
                        </div>

                        {/* Bottom Dots */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            backgroundColor: 'rgba(33, 25, 19, 0.45)',
                            backdropFilter: 'blur(6px)',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-full)',
                            zIndex: 15,
                          }}
                        >
                          {galleryList.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveImageIndex(idx)}
                              aria-label={`Go to image ${idx + 1}`}
                              style={{
                                width: activeImageIndex === idx ? '14px' : '6px',
                                height: '6px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: activeImageIndex === idx ? 'var(--white)' : 'rgba(255, 255, 255, 0.5)',
                                transition: 'all 0.2s ease',
                                padding: 0,
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* 4-5 Before/After Variation Thumbnails */}
              {hasBeforeAfter && activeTab === 'beforeAfter' && beforeAfterPairs.length > 1 && (
                <div style={{ marginTop: '18px' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--brown)' }}>
                        Preset Variations ({activeBAIndex + 1}/{beforeAfterPairs.length}):{' '}
                        <span style={{ color: 'var(--terracotta-dark)', fontWeight: 800 }}>{currentBAPair?.title}</span>
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--muted)',
                          backgroundColor: 'var(--cream-light)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid var(--border)',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ⇄ Drag slider to compare
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${beforeAfterPairs.length}, minmax(0, 1fr))`,
                      gap: '10px',
                    }}
                  >
                    {beforeAfterPairs.map((pair, idx) => {
                      const isActive = activeBAIndex === idx;
                      return (
                        <button
                          key={pair.id || idx}
                          onClick={() => setActiveBAIndex(idx)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            backgroundColor: isActive ? 'var(--cream-dark)' : 'var(--cream-light)',
                            border: isActive ? '2px solid var(--terracotta)' : '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '6px',
                            cursor: 'pointer',
                            boxShadow: isActive ? '0 4px 14px rgba(201, 130, 103, 0.35)' : 'var(--shadow-sm)',
                            transform: isActive ? 'translateY(-2px)' : 'none',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            textAlign: 'center',
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              aspectRatio: '1 / 1',
                              borderRadius: '4px',
                              overflow: 'hidden',
                              marginBottom: '6px',
                              position: 'relative',
                              backgroundColor: '#181310',
                            }}
                          >
                            <img
                              src={pair.after || product.thumbnail}
                              alt={pair.title}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = product.thumbnail;
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                bottom: '3px',
                                right: '3px',
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                backgroundColor: 'rgba(33, 25, 19, 0.75)',
                                color: '#fff',
                                padding: '1px 4px',
                                borderRadius: '3px',
                              }}
                            >
                              #{idx + 1}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: isActive ? 700 : 600,
                              color: isActive ? 'var(--terracotta-dark)' : 'var(--brown)',
                              lineHeight: 1.2,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              width: '100%',
                            }}
                          >
                            {pair.title?.split('(')[0] || `Look ${idx + 1}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Gallery Thumbnails Selector */}
              {galleryList.length > 1 && activeTab === 'preview' && (
                <div
                  ref={mainThumbsRowRef}
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '12px',
                    overflowX: 'auto',
                    paddingBottom: '4px',
                    paddingLeft: '2px',
                    paddingRight: '2px',
                    WebkitOverflowScrolling: 'touch',
                  }}
                  className="gallery-thumbs-row"
                >
                  {galleryList.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`View image ${idx + 1}`}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: activeImageIndex === idx ? '2.5px solid var(--terracotta)' : '1.5px solid var(--border)',
                        boxShadow: activeImageIndex === idx ? '0 4px 12px rgba(201, 130, 103, 0.35)' : 'var(--shadow-sm)',
                        flexShrink: 0,
                        cursor: 'pointer',
                        padding: '3px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: activeImageIndex === idx ? 'scale(1.04)' : 'scale(1)',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxSizing: 'border-box',
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          objectPosition: 'center',
                          display: 'block',
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Category-Specific Preview Switcher Tabs (Positioned below image preview & thumbnails, above title) */}
              {hasBeforeAfter && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActiveTab('preview')}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      backgroundColor: activeTab === 'preview' ? 'var(--brown)' : 'var(--cream-light)',
                      color: activeTab === 'preview' ? 'var(--white)' : 'var(--brown)',
                      border: '1.5px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: activeTab === 'preview' ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    📸 Gallery Photos
                  </button>
                  <button
                    onClick={() => setActiveTab('beforeAfter')}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      backgroundColor: activeTab === 'beforeAfter' ? 'var(--brown)' : 'var(--cream-light)',
                      color: activeTab === 'beforeAfter' ? 'var(--white)' : 'var(--brown)',
                      border: '1.5px solid var(--border)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: activeTab === 'beforeAfter' ? 'var(--shadow-sm)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Sparkles size={14} color={activeTab === 'beforeAfter' ? '#fff' : 'var(--terracotta)'} />
                    View Before & After
                  </button>
                </div>
              )}

              {product.category === 'fonts' && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                  <button
                    onClick={() => setActiveTab('preview')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      backgroundColor: activeTab === 'preview' ? 'var(--brown)' : 'var(--cream-light)',
                      color: activeTab === 'preview' ? 'var(--white)' : 'var(--brown)',
                      border: '1.5px solid var(--border)',
                      cursor: 'pointer',
                    }}
                  >
                    Specimens
                  </button>
                  <button
                    onClick={() => setActiveTab('typeTester')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      backgroundColor: activeTab === 'typeTester' ? 'var(--brown)' : 'var(--cream-light)',
                      color: activeTab === 'typeTester' ? 'var(--white)' : 'var(--brown)',
                      border: '1.5px solid var(--border)',
                      cursor: 'pointer',
                    }}
                  >
                    <Type size={14} style={{ display: 'inline', marginRight: '4px' }} /> Live Type Tester
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: PRODUCT METADATA & PURCHASE BOX */}
            <div
              className="pdp-info-column"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
              }}
            >
              
              {/* Category & Wishlist */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--terracotta-dark)',
                    backgroundColor: 'var(--terracotta-light)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {product.category}
                </span>

                <button
                  onClick={() => toggleWishlist(product)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: isSaved ? 'var(--terracotta)' : 'var(--muted)',
                  }}
                >
                  <Heart size={18} fill={isSaved ? 'var(--terracotta)' : 'transparent'} />
                  <span>{isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}</span>
                </button>
              </div>

              {/* Title & Tagline */}
              <div style={{ width: '100%', overflowWrap: 'anywhere' }}>
                <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--brown)', lineHeight: 1.2, wordBreak: 'break-word' }}>
                  {product.name}
                </h1>
                <p style={{ fontSize: '0.96rem', color: 'var(--muted)', marginTop: '6px', lineHeight: 1.45, wordBreak: 'break-word' }}>
                  {product.tagline}
                </p>
              </div>

              {/* Rating & Reviews */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="var(--gold)" color="var(--gold)" />
                  ))}
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brown)' }}>
                  {product.rating}
                </span>
                <span style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                  ({product.reviews} verified reviews)
                </span>
              </div>

              {/* Price & Discount */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--brown)' }}>
                  {currencySymbol}{product.price}
                </span>
                {product.compareAtPrice && (
                  <>
                    <span style={{ fontSize: '1.2rem', color: 'var(--muted)', textDecoration: 'line-through' }}>
                      {currencySymbol}{product.compareAtPrice}
                    </span>
                    <span
                      style={{
                        backgroundColor: 'rgba(201, 130, 103, 0.15)',
                        color: 'var(--terracotta-dark)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      Save {currencySymbol}{product.compareAtPrice - product.price}
                    </span>
                  </>
                )}
              </div>

              {/* Compatibility Strip */}
              <div
                style={{
                  padding: '14px 18px',
                  backgroundColor: 'var(--cream-light)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brown)', textTransform: 'uppercase' }}>
                  Compatible Software:
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {product.compatibility.map((c, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.78rem',
                        backgroundColor: 'var(--cream-dark)',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        color: 'var(--brown)',
                        fontWeight: 600,
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Purchase Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                <button
                  onClick={() => addToCart(product, 1)}
                  className="btn-primary"
                  style={{ padding: '16px 24px', fontSize: '1.05rem', width: '100%' }}
                >
                  <ShoppingBag size={19} />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isCheckingOut}
                  className="btn-terracotta"
                  style={{ padding: '16px 24px', fontSize: '1.05rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Zap size={19} />
                  <span>{isCheckingOut ? 'Redirecting to Shopify Checkout...' : 'Buy Now — Instant Checkout'}</span>
                </button>

                {/* Shortcut Button to View Before & After / Interactive Preview */}
                {hasBeforeAfter && (
                  <button
                    onClick={() => {
                      setActiveTab('beforeAfter');
                      const showcaseEl = document.getElementById('before-after-showcase-section') || document.getElementById('product-preview-section');
                      if (showcaseEl) {
                        showcaseEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    style={{
                      padding: '13px 20px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--cream-light)',
                      border: '1.5px solid var(--border)',
                      color: 'var(--brown)',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--cream-dark)';
                      e.currentTarget.style.borderColor = 'var(--terracotta)';
                      e.currentTarget.style.color = 'var(--terracotta-dark)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(201, 130, 103, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--cream-light)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--brown)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                  >
                    <Sparkles size={17} color="var(--terracotta)" />
                    <span>⚡ View Before & After ({beforeAfterPairs.length} Preset Looks)</span>
                  </button>
                )}

                {product.category === 'fonts' && (
                  <button
                    onClick={() => {
                      setActiveTab('typeTester');
                      const previewEl = document.getElementById('product-preview-section');
                      if (previewEl) {
                        previewEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    style={{
                      padding: '13px 20px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--cream-light)',
                      border: '1.5px solid var(--border)',
                      color: 'var(--brown)',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--cream-dark)';
                      e.currentTarget.style.borderColor = 'var(--terracotta)';
                      e.currentTarget.style.color = 'var(--terracotta-dark)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--cream-light)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--brown)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Type size={17} color="var(--terracotta)" />
                    <span>⚡ Test Live Font Ligatures & Weights</span>
                  </button>
                )}
              </div>

              {/* Trust Guarantee List */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '8px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border)',
                  fontSize: '0.8rem',
                  color: 'var(--muted)',
                  fontWeight: 600,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DownloadCloud size={16} color="var(--terracotta)" />
                  <span>Instant Download</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <InfinityIcon size={16} color="var(--clay-dark)" />
                  <span>Lifetime Free Updates</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="var(--olive-dark)" />
                  <span>Commercial License</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="var(--brown)" />
                  <span>100% Satisfaction Guarantee</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2. DEDICATED BEFORE & AFTER TRANSFORMATION SHOWCASE */}
      {hasBeforeAfter && beforeAfterPairs.length > 0 && (
        <section id="before-after-showcase-section" style={{ paddingTop: '10px' }}>
          <div className="container">
            <div
              style={{
                backgroundColor: 'var(--cream-light)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: '36px',
                boxShadow: 'var(--shadow-clay)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
              className="pdp-ba-showcase-card"
            >
              {/* Header Strip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        color: 'var(--terracotta-dark)',
                        backgroundColor: 'var(--terracotta-light)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Interactive Comparison
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
                      • {beforeAfterPairs.length} Variation {beforeAfterPairs.length === 1 ? 'Look' : 'Looks'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 800, color: 'var(--brown)', margin: 0 }}>
                    Live Transformation Looks
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--muted)', marginTop: '4px', maxWidth: '600px' }}>
                    Drag the slider back and forth to inspect shadow recovery, color calibration & skin-tone rendering.
                  </p>
                </div>

                {/* Variation Pills on Top */}
                {beforeAfterPairs.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {beforeAfterPairs.map((pair, idx) => {
                      const isActive = activeBAIndex === idx;
                      return (
                        <button
                          key={pair.id || idx}
                          onClick={() => setActiveBAIndex(idx)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            backgroundColor: isActive ? 'var(--brown)' : 'var(--white)',
                            color: isActive ? 'var(--white)' : 'var(--brown)',
                            border: '1.5px solid',
                            borderColor: isActive ? 'var(--brown-dark)' : 'var(--border)',
                            cursor: 'pointer',
                            boxShadow: isActive ? '0 4px 12px rgba(96, 68, 46, 0.25)' : 'var(--shadow-sm)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {pair.title || `Look #${idx + 1}`}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Big Slider Frame */}
              <div
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1.5px solid var(--border)',
                  backgroundColor: '#181310',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.18)',
                  position: 'relative',
                }}
              >
                <BeforeAfterSlider
                  key={`pdp-showcase-${currentBAPair?.id || activeBAIndex}`}
                  beforeImage={currentBAPair?.before || ''}
                  afterImage={currentBAPair?.after || ''}
                  beforeLabel="ORIGINAL RAW"
                  afterLabel="PRO GRADED"
                  aspectRatio="16 / 9"
                  fallbackImage={product.thumbnail}
                />
              </div>

              {/* Look Cards Strip Below Slider */}
              {beforeAfterPairs.length > 1 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
                    gap: '12px',
                  }}
                >
                  {beforeAfterPairs.map((pair, idx) => {
                    const isActive = activeBAIndex === idx;
                    return (
                      <div
                        key={pair.id || idx}
                        onClick={() => setActiveBAIndex(idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isActive ? 'var(--cream-dark)' : 'var(--white)',
                          border: isActive ? '2px solid var(--terracotta)' : '1px solid var(--border)',
                          cursor: 'pointer',
                          boxShadow: isActive ? '0 4px 12px rgba(201, 130, 103, 0.25)' : 'none',
                          transform: isActive ? 'translateY(-2px)' : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            flexShrink: 0,
                            backgroundColor: '#181310',
                          }}
                        >
                          <img
                            src={pair.after || product.thumbnail}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--terracotta-dark)', textTransform: 'uppercase' }}>
                            Look #{idx + 1}
                          </span>
                          <h5
                            style={{
                              fontSize: '0.84rem',
                              fontWeight: 700,
                              color: 'var(--brown)',
                              margin: 0,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {pair.title || `Preset Variation ${idx + 1}`}
                          </h5>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. WHAT'S INCLUDED & PRODUCT SPECIFICATIONS */}
      <section>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 1fr',
              gap: '40px',
            }}
            className="pdp-details-grid"
          >
            {/* What's Included */}
            <div
              className="clay-card"
              style={{
                padding: '36px',
              }}
            >
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '20px' }}>
                What's Included
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {product.included.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--olive-light)',
                        color: 'var(--olive-dark)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle2 size={15} />
                    </div>
                    <span style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 500 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* Description Paragraph */}
              <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '8px' }}>
                  Overview
                </h4>
                <p style={{ fontSize: '0.92rem', color: 'var(--muted)', lineHeight: 1.65 }}>
                  {product.description}
                </p>
              </div>
            </div>

            {/* Product Technical Details Matrix */}
            <div
              className="clay-card"
              style={{
                padding: '36px',
              }}
            >
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '20px' }}>
                Product Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>File Formats</span>
                  <span style={{ fontWeight: 700, color: 'var(--brown)', fontSize: '0.9rem' }}>{product.format.join(', ')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>File Size</span>
                  <span style={{ fontWeight: 700, color: 'var(--brown)', fontSize: '0.9rem' }}>{product.fileSize}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Version</span>
                  <span style={{ fontWeight: 700, color: 'var(--brown)', fontSize: '0.9rem' }}>v{product.version} (Latest Release)</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>License Type</span>
                  <span style={{ fontWeight: 700, color: 'var(--olive-dark)', fontSize: '0.9rem' }}>Commercial Use Included</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Delivery</span>
                  <span style={{ fontWeight: 700, color: 'var(--terracotta)', fontSize: '0.9rem' }}>Instant Secure Download</span>
                </div>
              </div>

              {/* 3-Step Flow */}
              <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '16px' }}>
                  How It Works
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
                  <div style={{ padding: '10px 6px', backgroundColor: 'var(--cream)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--terracotta)' }}>01</span>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brown)' }}>Purchase</h5>
                  </div>
                  <div style={{ padding: '10px 6px', backgroundColor: 'var(--cream)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--terracotta)' }}>02</span>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brown)' }}>Download</h5>
                  </div>
                  <div style={{ padding: '10px 6px', backgroundColor: 'var(--cream)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--terracotta)' }}>03</span>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brown)' }}>Create</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FREQUENTLY ASKED QUESTIONS */}
      <section>
        <div className="container" style={{ maxWidth: '840px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brown)' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginTop: '4px' }}>
              Common questions about licensing, installation, and file compatibility.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQS_DATA.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  style={{
                    backgroundColor: 'var(--cream-light)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: 'var(--brown)',
                    }}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        color: 'var(--muted)',
                      }}
                    />
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 24px 20px 24px',
                        fontSize: '0.92rem',
                        color: 'var(--muted)',
                        lineHeight: 1.6,
                        borderTop: '1px solid var(--border-light)',
                        paddingTop: '14px',
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section>
          <div className="container">
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.9rem)', fontWeight: 800, color: 'var(--brown)' }}>
                You Might Also Like
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--muted)', marginTop: '4px' }}>
                Explore more creator toolkits and matching assets.
              </p>
            </div>

            <div
              className="related-products-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '22px',
              }}
            >
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mobile Floating Sticky Buy Bar */}
      <MobileStickyBuyBar
        product={product}
        hasBeforeAfter={hasBeforeAfter}
        onOpenBeforeAfter={() => {
          setActiveTab('beforeAfter');
          const previewEl = document.getElementById('product-preview-section');
          if (previewEl) {
            previewEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
      />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .pdp-split-grid {
          display: grid !important;
          grid-template-columns: 1.15fr 1fr !important;
          gap: 40px !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }

        .pdp-preview-wrapper {
          width: 100% !important;
          max-width: 100% !important;
          aspect-ratio: 1 / 1 !important;
          max-height: 480px !important;
          border-radius: var(--radius-xl) !important;
          border: 1.5px solid var(--border) !important;
          box-shadow: var(--shadow-clay) !important;
          background-color: #ffffff !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
        }

        .gallery-preview-container {
          width: 100% !important;
          max-width: 100% !important;
          height: 100% !important;
          display: flex !important;
          align-items: center !important;
          justifyContent: center !important;
          background-color: #ffffff !important;
          padding: 10px !important;
          box-sizing: border-box !important;
        }

        .gallery-active-img {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: contain !important;
          object-position: center !important;
          display: block !important;
          margin: 0 auto !important;
        }

        .hide-mobile {
          display: inline;
        }

        .gallery-thumbs-row::-webkit-scrollbar {
          height: 4px;
        }
        .gallery-thumbs-row::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 4px;
        }

        .gallery-nav-arrow:hover {
          background-color: rgba(255, 255, 255, 0.98) !important;
          transform: translateY(-50%) scale(1.08) !important;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22) !important;
        }
        .gallery-nav-arrow:active {
          transform: translateY(-50%) scale(0.94) !important;
        }

        .related-products-grid {
          display: grid !important;
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          gap: 22px !important;
        }

        @media (max-width: 1100px) {
          .related-products-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 18px !important;
          }
        }

        @media (max-width: 900px) {
          .pdp-split-grid { 
            display: flex !important;
            flex-direction: column !important;
            gap: 16px !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .pdp-preview-wrapper {
            max-height: 320px !important;
            aspect-ratio: 1 / 1 !important;
            border-radius: var(--radius-lg) !important;
          }
          .gallery-preview-container {
            padding: 6px !important;
          }
          .pdp-details-grid { 
            display: flex !important;
            flex-direction: column !important;
            gap: 16px !important;
            width: 100% !important;
          }
        }

        @media (max-width: 768px) {
          .hide-mobile {
            display: none !important;
          }
          /* Exactly 2 cards per row on mobile */
          .related-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .pdp-preview-wrapper {
            max-height: 290px !important;
            aspect-ratio: 1 / 1 !important;
          }
          .pdp-details-grid .clay-card {
            padding: 20px 16px !important;
          }
          .related-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
        }
      `}</style>
    </div>
  );
};
