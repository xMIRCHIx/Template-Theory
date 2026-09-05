import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  SlidersHorizontal,
  Wand2,
  Sliders,
  CheckCircle2,
  Mail,
  Play
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS as LOCAL_PRODUCTS } from '../data/products';
import { ProductCard } from '../components/cards/ProductCard';
import { SidebarFilters } from '../components/filters/SidebarFilters';
import { ProductCategory } from '../types';
import { useShopify } from '../context/ShopifyContext';

export const CategoryCollectionPage: React.FC = () => {
  const { category: categorySlug } = useParams<{ category: string }>();
  const { products } = useShopify();

  // Identify current category info
  const categoryInfo = useMemo(() => {
    return (
      CATEGORIES.find((c) => c.slug === categorySlug) ||
      (categorySlug === 'albums' ? CATEGORIES.find((c) => c.slug === 'psds') : null) ||
      CATEGORIES[0]
    );
  }, [categorySlug]);

  const catalog = products.length > 0 ? products : LOCAL_PRODUCTS;

  // Filter States
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedCompat, setSelectedCompat] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleToggleCompat = (compat: string) => {
    setSelectedCompat((prev) =>
      prev.includes(compat) ? prev.filter((c) => c !== compat) : [...prev, compat]
    );
  };

  const handleClearAll = () => {
    setSelectedTag('All');
    setSelectedCompat([]);
    setMaxPrice(5000);
    setMinRating(0);
  };

  // Filter products
  const categoryProducts = useMemo(() => {
    return catalog.filter((p) => {
      // Must match active category (also matching 'albums' under 'psds')
      const isMatchingCat =
        p.category === categoryInfo.id ||
        (categoryInfo.id === 'psds' && ((p.category as string) === 'albums' || p.category === 'psds'));
      if (!isMatchingCat) return false;

      // Price filter
      if (p.price > maxPrice) return false;

      // Rating filter
      if (minRating > 0 && p.rating < minRating) return false;

      // Tag filter
      if (selectedTag !== 'All' && selectedTag !== `All ${categoryInfo.title}`) {
        const matchesTag = p.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
        if (!matchesTag) return false;
      }

      // Compatibility filter
      if (selectedCompat.length > 0) {
        const matchesCompat = selectedCompat.some((sc) =>
          p.compatibility.some((pc) => pc.toLowerCase().includes(sc.toLowerCase().split(' ')[0]))
        );
        if (!matchesCompat) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured default
    });
  }, [categoryInfo, maxPrice, minRating, selectedTag, selectedCompat, sortBy]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '50px', paddingBottom: '60px' }}>
      
      {/* 1. BREADCRUMBS & CATEGORY HERO */}
      <section style={{ paddingTop: '10px' }}>
        <div className="container">
          
          {/* Breadcrumbs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              color: 'var(--muted)',
              marginBottom: '24px',
            }}
          >
            <Link to="/" style={{ color: 'var(--muted)' }}>Home</Link>
            <ChevronRight size={14} />
            <Link to="/collections" style={{ color: 'var(--muted)' }}>Collections</Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--brown)', fontWeight: 700 }}>{categoryInfo.title}</span>
          </div>

          {/* Category Hero Banner */}
          <div
            style={{
              backgroundColor: 'var(--cream-light)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '44px 48px',
              boxShadow: 'var(--shadow-clay)',
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              alignItems: 'center',
              gap: '40px',
            }}
            className="category-hero-box"
          >
            <div>
              <h1
                style={{
                  fontSize: 'clamp(2.8rem, 5vw, 3.8rem)',
                  fontWeight: 800,
                  color: 'var(--brown)',
                  lineHeight: 1.1,
                  marginBottom: '14px',
                }}
              >
                {categoryInfo.title}
              </h1>
              <p
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--muted)',
                  lineHeight: 1.6,
                  maxWidth: '500px',
                  marginBottom: '28px',
                }}
              >
                {categoryInfo.description}
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <a href="#product-grid" className="btn-primary" style={{ padding: '12px 24px' }}>
                  Explore {categoryInfo.title}
                </a>
                <button
                  onClick={() => alert(`Tutorial for ${categoryInfo.title} will play in video modal!`)}
                  className="btn-secondary"
                  style={{ padding: '12px 22px' }}
                >
                  <Play size={16} fill="var(--brown)" /> Watch Tutorial
                </button>
              </div>
            </div>

            {/* Right: Clay 3D Category Composition */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <div
                style={{
                  position: 'relative',
                  width: '280px',
                  height: '240px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Background Element */}
                <img
                  src="/assets/clay/BG ELEMENT.png"
                  alt=""
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    opacity: 0.7,
                  }}
                />
                {/* Main Category 3D Element */}
                <img
                  src={categoryInfo.iconImage}
                  alt={categoryInfo.title}
                  style={{
                    position: 'relative',
                    width: '170px',
                    height: '170px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 20px 30px rgba(96, 68, 46, 0.2))',
                    zIndex: 2,
                  }}
                />
                {/* Accent Cube */}
                <img
                  src="/assets/clay/CUBE.png"
                  alt=""
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    width: '70px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 18px rgba(127, 135, 106, 0.3))',
                    zIndex: 3,
                  }}
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. FILTER TAG PILLS & SORT */}
      <section id="product-grid">
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '32px',
            }}
          >
            {/* Tag Pills */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              {categoryInfo.filterTags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      backgroundColor: isSelected ? 'var(--brown)' : 'var(--cream-light)',
                      color: isSelected ? 'var(--white)' : 'var(--brown)',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--brown-dark)' : 'var(--border)',
                      boxShadow: isSelected ? '0 4px 12px rgba(96, 68, 46, 0.25)' : 'var(--shadow-sm)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--cream-light)',
                  border: '1px solid var(--border)',
                  color: 'var(--brown)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* MAIN 2-COLUMN LAYOUT: SIDEBAR + PRODUCT GRID */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '260px 1fr',
              gap: '36px',
              alignItems: 'flex-start',
            }}
            className="collection-main-grid"
          >
            {/* Left Sidebar */}
            <aside className="collection-sidebar">
              <div
                style={{
                  backgroundColor: 'var(--cream-light)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '28px 22px',
                  boxShadow: 'var(--shadow-clay)',
                }}
              >
                <SidebarFilters
                  selectedCategory={selectedTag}
                  onSelectCategory={(cat) => setSelectedTag(cat)}
                  selectedCompat={selectedCompat}
                  onToggleCompat={handleToggleCompat}
                  maxPrice={maxPrice}
                  onPriceChange={setMaxPrice}
                  minRating={minRating}
                  onRatingChange={setMinRating}
                  onClearAll={handleClearAll}
                />
              </div>
            </aside>

            {/* Right Main Content */}
            <main style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Wide Bundle Banner (From product.png) */}
              <div
                style={{
                  backgroundColor: 'var(--cream-dark)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '24px 32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                  boxShadow: 'var(--shadow-sm)',
                }}
                className="bundle-promo-strip"
              >
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '4px' }}>
                    CINEMATIC {categoryInfo.title.toUpperCase()} BUNDLE
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                    20+ Premium {categoryInfo.title} for a complete cinematic look.
                  </p>
                </div>

                <Link to="/shop" className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                  View Bundle
                </Link>
              </div>

              {/* Product Grid */}
              {categoryProducts.length === 0 ? (
                <div
                  style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    backgroundColor: 'var(--cream-light)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <h4 style={{ fontSize: '1.2rem', color: 'var(--brown)', marginBottom: '8px' }}>
                    No products found
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '16px' }}>
                    Try adjusting your filters or price range.
                  </p>
                  <button onClick={handleClearAll} className="btn-secondary">
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div
                  className="category-products-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '20px',
                  }}
                >
                  {categoryProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

            </main>
          </div>

        </div>
      </section>

      {/* 3. FEATURE VALUE STRIP (Bottom of product.png) */}
      <section>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Box 1 */}
            <div
              className="clay-card"
              style={{
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--clay-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brown)',
                }}
              >
                <Wand2 size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brown)' }}>
                  One Click Transformation
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '2px' }}>
                  Get professional results in just one click.
                </p>
              </div>
            </div>

            {/* Box 2 */}
            <div
              className="clay-card"
              style={{
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--terracotta-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--terracotta-dark)',
                }}
              >
                <Sliders size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brown)' }}>
                  Fully Customizable
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '2px' }}>
                  Easy to adjust and make it your own.
                </p>
              </div>
            </div>

            {/* Box 3 */}
            <div
              className="clay-card"
              style={{
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--olive-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--olive-dark)',
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brown)' }}>
                  Works Everywhere
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '2px' }}>
                  Compatible with Lightroom, Photoshop & more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .category-hero-box { grid-template-columns: 1fr !important; text-align: center; }
          .category-hero-box div { justify-content: center; }
          .collection-main-grid { grid-template-columns: 1fr !important; }
          .collection-sidebar { display: none; }
          .bundle-promo-strip { flex-direction: column; text-align: center; }
        }
        @media (max-width: 768px) {
          .category-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }
        }
        @media (max-width: 480px) {
          .category-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
        }
      `}</style>
    </div>
  );
};
