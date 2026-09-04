import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';

export const CollectionsIndexPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '50px', paddingBottom: '80px' }}>
      
      {/* Header Banner */}
      <section style={{ paddingTop: '20px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--olive-dark)',
              textTransform: 'uppercase',
              backgroundColor: 'var(--olive-light)',
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-block',
              marginBottom: '12px',
            }}
          >
            Curated Collections
          </span>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 800, color: 'var(--brown)', marginBottom: '10px' }}>
            Explore All Categories
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: '540px', margin: '0 auto' }}>
            Dedicated toolboxes designed specifically for photo editors, filmmakers, brand designers and visual storytellers.
          </p>
        </div>
      </section>

      {/* Category Grid */}
      <section>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '28px',
            }}
            className="collections-grid"
          >
            {CATEGORIES.map((category) => {
              const productCount = PRODUCTS.filter((p) => p.category === category.id).length;
              return (
                <div
                  key={category.id}
                  style={{
                    backgroundColor: 'var(--cream-light)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '36px 32px',
                    boxShadow: 'var(--shadow-clay)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
                  }}
                  className="collection-overview-card"
                >
                  <div>
                    {/* Top Row: Icon & Count */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div
                        style={{
                          width: '80px',
                          height: '80px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={category.iconImage}
                          alt={category.title}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 10px 16px rgba(96, 68, 46, 0.16))',
                          }}
                        />
                      </div>

                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--cream-dark)',
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-full)',
                          color: 'var(--brown)',
                        }}
                      >
                        {productCount} Products
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--terracotta)', textTransform: 'uppercase' }}>
                      {category.subtitle}
                    </span>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brown)', marginTop: '4px', marginBottom: '10px' }}>
                      {category.title}
                    </h2>
                    <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                      {category.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <div>
                    <Link
                      to={`/collections/${category.slug}`}
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'space-between', padding: '12px 20px' }}
                    >
                      <span>Explore {category.title}</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <style>{`
        .collection-overview-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-clay-hover);
          border-color: rgba(201, 130, 103, 0.4);
        }
        @media (max-width: 640px) {
          .collections-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
