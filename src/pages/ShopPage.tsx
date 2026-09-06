import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { ProductCard } from '../components/cards/ProductCard';
import { useShopify } from '../context/ShopifyContext';

export const ShopPage: React.FC = () => {
  const { products, isLoading } = useShopify();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  const catalog = products;

  const filteredProducts = useMemo(() => {
    return catalog.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const matchesCat =
          p.category === selectedCategory ||
          (selectedCategory === 'psds' && ((p.category as string) === 'albums' || p.category === 'psds'));
        if (!matchesCat) return false;
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
            Digital Catalog
          </span>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 800, color: 'var(--brown)', marginBottom: '10px' }}>
            Store Catalog
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: '500px', margin: '0 auto' }}>
            Explore our full catalog of premium digital products.
          </p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section>
        <div className="container">
          <div
            style={{
              backgroundColor: 'var(--cream-light)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              boxShadow: 'var(--shadow-clay)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* Search Box */}
              <div
                style={{
                  position: 'relative',
                  flex: '1 1 300px',
                  maxWidth: '500px',
                }}
              >
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--muted)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search assets, formats, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 46px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--white)',
                    color: 'var(--brown-dark)',
                    outline: 'none',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                  }}
                />
              </div>

              {/* Sort By Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--white)',
                    color: 'var(--brown)',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Category Tabs */}
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
                All Products ({catalog.length})
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
          {isLoading ? (
            <div
              className="shop-catalog-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '22px',
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
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
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
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
