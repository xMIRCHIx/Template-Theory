import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { PRODUCTS as LOCAL_PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';
import { ProductCard } from '../components/cards/ProductCard';
import { useShopify } from '../context/ShopifyContext';

export const ShopPage: React.FC = () => {
  const { products, isLoading } = useShopify();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  const catalog = products.length > 0 ? products : LOCAL_PRODUCTS;

  const filteredProducts = useMemo(() => {
    return catalog.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesTags = p.tags.some((t) => t.toLowerCase().includes(q));
        const matchesDesc = p.shortDescription.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        if (!matchesName && !matchesTags && !matchesDesc && !matchesCategory) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured
    });
  }, [catalog, searchQuery, selectedCategory, sortBy]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingBottom: '80px' }}>
      
      {/* Header Banner */}
      <section style={{ paddingTop: '20px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--terracotta)',
              textTransform: 'uppercase',
              backgroundColor: 'var(--terracotta-light)',
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-block',
              marginBottom: '12px',
            }}
          >
            Curated Creator Catalog
          </span>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 800, color: 'var(--brown)', marginBottom: '10px' }}>
            Shop All Products
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: '520px', margin: '0 auto' }}>
            Handcrafted presets, cinematic LUTs, PSD kits, typefaces and 3D clay assets.
          </p>
        </div>
      </section>

      {/* Filter Controls Bar */}
      <section>
        <div className="container">
          <div
            style={{
              backgroundColor: 'var(--cream-light)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '16px 24px',
              boxShadow: 'var(--shadow-clay)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Top Row: Search & Sort */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              {/* Search Field */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: 'var(--white)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-full)',
                  padding: '8px 16px',
                  flex: 1,
                  maxWidth: '420px',
                }}
              >
                <Search size={18} color="var(--brown)" />
                <input
                  type="text"
                  placeholder="Search products, formats, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    width: '100%',
                    fontSize: '0.92rem',
                    color: 'var(--brown)',
                  }}
                />
              </div>

              {/* Sort Selection */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--white)',
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

            {/* Bottom Row: Category Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              <button
                onClick={() => setSelectedCategory('all')}
                style={{
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: selectedCategory === 'all' ? 'var(--brown)' : 'var(--cream)',
                  color: selectedCategory === 'all' ? 'var(--white)' : 'var(--brown)',
                  border: '1px solid',
                  borderColor: selectedCategory === 'all' ? 'var(--brown-dark)' : 'var(--border)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                All ({catalog.length})
              </button>

              {CATEGORIES.map((cat) => {
                const count = catalog.filter((p) => p.category === cat.id).length;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      backgroundColor: isSelected ? 'var(--brown)' : 'var(--cream)',
                      color: isSelected ? 'var(--white)' : 'var(--brown)',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--brown-dark)' : 'var(--border)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cat.title} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog Grid */}
      <section>
        <div className="container">
          {filteredProducts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 20px',
                backgroundColor: 'var(--cream-light)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
              }}
            >
              <h3 style={{ fontSize: '1.3rem', color: 'var(--brown)', marginBottom: '8px' }}>
                No products found
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '16px' }}>
                Try searching for something else or clear the filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="btn-primary"
              >
                Reset Catalog
              </button>
            </div>
          ) : (
            <div
              className="shop-catalog-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '22px',
              }}
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .shop-catalog-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }
        }
        @media (max-width: 480px) {
          .shop-catalog-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
        }
      `}</style>
    </div>
  );
};
