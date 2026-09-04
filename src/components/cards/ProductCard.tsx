import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useShopify } from '../../context/ShopifyContext';
import { Magnetic } from '../ui/Magnetic';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { currencySymbol } = useShopify();
  const navigate = useNavigate();
  const isSaved = isInWishlist(product.id);

  return (
    <div
      style={{
        backgroundColor: 'var(--cream-light)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-clay)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all var(--transition-normal)',
        position: 'relative',
        height: '100%',
      }}
      className="product-card"
    >
      {/* Top Preview Area */}
      <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: 'var(--cream-dark)' }}>
        <Link to={`/product/${product.slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '1 / 1', overflow: 'hidden', backgroundColor: 'var(--cream-dark)' }}>
          <img
            src={product.thumbnail}
            alt={product.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=900&auto=format&fit=crop';
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="card-thumb"
          />
        </Link>

        {/* Badges Overlay */}
        <div
          className="card-badges-container"
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            display: 'flex',
            gap: '5px',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {product.bestseller && (
            <span
              className="card-badge-bestseller"
              style={{
                backgroundColor: 'rgba(96, 68, 46, 0.92)',
                backdropFilter: 'blur(4px)',
                color: 'var(--white)',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                letterSpacing: '0.02em',
              }}
            >
              Bestseller
            </span>
          )}
          {product.new && (
            <span
              className="card-badge-new"
              style={{
                backgroundColor: 'rgba(127, 135, 106, 0.92)',
                backdropFilter: 'blur(4px)',
                color: 'var(--white)',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              New
            </span>
          )}
        </div>

        {/* Wishlist Heart Toggle */}
        <div className="card-wishlist-wrapper" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
          <Magnetic intensity={0.45} range={50}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product);
              }}
              aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
              className="card-wishlist-btn"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(229, 213, 193, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isSaved ? 'var(--terracotta)' : 'var(--brown)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Heart size={15} fill={isSaved ? 'var(--terracotta)' : 'transparent'} />
            </button>
          </Magnetic>
        </div>
      </div>

      {/* Card Body */}
      <div
        className="product-card-body"
        style={{
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Software Badges / Category */}
          <div
            className="card-meta-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              marginBottom: '8px',
              flexWrap: 'wrap',
            }}
          >
            {product.category === 'presets' && (
              <>
                <span className="app-badge">Lr</span>
                <span className="app-badge">Ps</span>
              </>
            )}
            {product.category === 'luts' && (
              <>
                <span className="app-badge">Pr</span>
                <span className="app-badge">FCP</span>
              </>
            )}
            {product.category === 'psds' && (
              <>
                <span className="app-badge">Ps</span>
              </>
            )}
            {product.category === 'fonts' && (
              <>
                <span className="app-badge">Aa</span>
                <span className="app-badge">OTF</span>
              </>
            )}
            {product.category === 'albums' && (
              <>
                <span className="app-badge">Id</span>
                <span className="app-badge">Ps</span>
              </>
            )}
            {product.category === 'assets' && (
              <>
                <span className="app-badge">3D</span>
                <span className="app-badge">PNG</span>
              </>
            )}

            <span className="card-item-count" style={{ fontSize: '0.73rem', color: 'var(--muted)', marginLeft: 'auto', fontWeight: 600 }}>
              {product.itemCount}
            </span>
          </div>

          {/* Title */}
          <Link
            to={`/product/${product.slug}`}
            style={{ textDecoration: 'none' }}
          >
            <h4
              style={{
                fontSize: '0.98rem',
                fontWeight: 700,
                color: 'var(--brown)',
                marginBottom: '4px',
                lineHeight: 1.3,
                transition: 'color 0.2s',
              }}
              className="card-title"
            >
              {product.name}
            </h4>
          </Link>
        </div>

        {/* Bottom: Price, Rating & Clay Cart CTA */}
        <div
          className="card-footer-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid var(--border-light)',
            gap: '6px',
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', flexWrap: 'wrap' }}>
              <span className="card-price" style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--brown)' }}>
                {currencySymbol}{product.price}
              </span>
              {product.compareAtPrice && (
                <span className="card-compare-price" style={{ fontSize: '0.78rem', color: 'var(--muted)', textDecoration: 'line-through' }}>
                  {currencySymbol}{product.compareAtPrice}
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="card-rating-row" style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
              <Star size={11} fill="var(--gold)" color="var(--gold)" />
              <span className="card-rating-val" style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--brown)' }}>
                {product.rating}
              </span>
              <span className="card-reviews-count" style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                ({product.reviews})
              </span>
            </div>
          </div>

          {/* Add to Cart Clay Button */}
          <Magnetic intensity={0.4} range={60}>
            <button
              onClick={() => addToCart(product)}
              aria-label={`Add ${product.name} to cart`}
              className="card-cart-btn"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--cream-dark)',
                border: '1.5px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brown)',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--terracotta)';
                e.currentTarget.style.borderColor = 'var(--terracotta-dark)';
                e.currentTarget.style.color = 'var(--white)';
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 14px rgba(201, 130, 103, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--cream-dark)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--brown)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <ShoppingBag size={17} />
            </button>
          </Magnetic>
        </div>
      </div>

      <style>{`
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-clay-hover);
          border-color: rgba(201, 130, 103, 0.4);
        }
        .product-card:hover .card-thumb {
          transform: scale(1.05);
        }
        .product-card:hover .card-title {
          color: var(--terracotta-dark);
        }
        .app-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          background-color: var(--cream-dark);
          border: 1px solid var(--border);
          color: var(--brown);
        }

        @media (max-width: 640px) {
          .product-card {
            border-radius: var(--radius-md) !important;
          }
          .product-card-body {
            padding: 10px 10px 12px 10px !important;
          }
          .card-badges-container {
            top: 6px !important;
            left: 6px !important;
            gap: 3px !important;
          }
          .card-badge-bestseller, .card-badge-new {
            font-size: 0.6rem !important;
            padding: 2px 6px !important;
          }
          .card-wishlist-wrapper {
            top: 6px !important;
            right: 6px !important;
          }
          .card-wishlist-btn {
            width: 26px !important;
            height: 26px !important;
          }
          .card-wishlist-btn svg {
            width: 12px !important;
            height: 12px !important;
          }
          .card-meta-row {
            margin-bottom: 4px !important;
            gap: 3px !important;
          }
          .app-badge {
            font-size: 0.58rem !important;
            padding: 1px 4px !important;
          }
          .card-item-count {
            font-size: 0.65rem !important;
          }
          .card-title {
            font-size: 0.84rem !important;
            line-height: 1.25 !important;
            margin-bottom: 2px !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            min-height: 2.1rem !important;
          }
          .card-footer-row {
            margin-top: 8px !important;
            padding-top: 8px !important;
          }
          .card-price {
            font-size: 1rem !important;
          }
          .card-compare-price {
            font-size: 0.7rem !important;
          }
          .card-rating-row {
            margin-top: 1px !important;
          }
          .card-rating-val {
            font-size: 0.7rem !important;
          }
          .card-reviews-count {
            display: none !important;
          }
          .card-cart-btn {
            width: 32px !important;
            height: 32px !important;
            border-radius: 7px !important;
          }
          .card-cart-btn svg {
            width: 14px !important;
            height: 14px !important;
          }
        }
      `}</style>
    </div>
  );
};

