import React, { useState, useEffect } from 'react';
import { ShoppingBag, Zap, Sparkles, Loader2, X } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useShopify } from '../../context/ShopifyContext';

interface MobileStickyBuyBarProps {
  product: Product;
  onOpenBeforeAfter?: () => void;
  hasBeforeAfter?: boolean;
}

export const MobileStickyBuyBar: React.FC<MobileStickyBuyBarProps> = ({
  product,
  onOpenBeforeAfter,
  hasBeforeAfter = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { addToCart, checkoutWithShopify, isCheckingOut } = useCart();
  const { currencySymbol } = useShopify();

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down past initial hero / main CTA (> 400px)
      setIsVisible(window.scrollY > 420);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || isDismissed) return null;

  const handleBuyNow = () => {
    checkoutWithShopify(product);
  };

  return (
    <aside
      style={{
        position: 'fixed',
        bottom: '76px', // Sits above mobile bottom dock
        left: '12px',
        right: '12px',
        zIndex: 980,
        display: 'none', // Handled via media query
      }}
      className="mobile-sticky-buy-bar"
      aria-label="Quick product purchase actions"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(229, 213, 193, 0.8)',
          borderRadius: '18px',
          padding: '8px 12px',
          boxShadow: '0 8px 30px rgba(91, 64, 42, 0.2)',
          maxWidth: '480px',
          margin: '0 auto',
        }}
      >
        {/* Left: Thumbnail & Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <img
            src={product.thumbnail}
            alt=""
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              objectFit: 'cover',
              border: '1px solid var(--border)',
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <h4
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: 'var(--brown)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2,
              }}
            >
              {product.name}
            </h4>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brown-dark)' }}>
                {currencySymbol}{product.price}
              </span>
              {product.compareAtPrice && (
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textDecoration: 'line-through' }}>
                  {currencySymbol}{product.compareAtPrice}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {hasBeforeAfter && onOpenBeforeAfter && (
            <button
              onClick={onOpenBeforeAfter}
              aria-label="View Before/After"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--cream-dark)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--terracotta-dark)',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={16} />
            </button>
          )}

          <button
            onClick={() => addToCart(product, 1)}
            aria-label="Add to cart"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--cream-light)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brown)',
              cursor: 'pointer',
            }}
          >
            <ShoppingBag size={17} />
          </button>

          <button
            onClick={handleBuyNow}
            disabled={isCheckingOut}
            style={{
              padding: '9px 16px',
              borderRadius: '12px',
              backgroundColor: 'var(--terracotta)',
              color: 'var(--white)',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(201, 130, 103, 0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            <Zap size={14} />
            <span>{isCheckingOut ? 'Opening...' : 'Buy Now'}</span>
          </button>

          {/* Dismiss Close Cross Button */}
          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss quick buy bar"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: 'var(--cream-dark)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brown)',
              cursor: 'pointer',
              marginLeft: '2px',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--terracotta-light)';
              e.currentTarget.style.color = 'var(--terracotta-dark)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--cream-dark)';
              e.currentTarget.style.color = 'var(--brown)';
            }}
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-sticky-buy-bar {
            display: block !important;
            animation: slideUpFloat 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        }
        @keyframes slideUpFloat {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </aside>
  );
};
