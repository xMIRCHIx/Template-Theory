import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ArrowRight, DownloadCloud, ShoppingBag, Zap, Loader2, Tag, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useShopify } from '../../context/ShopifyContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    bundleDiscountPercent,
    bundleDiscountAmount,
    appliedCoupon,
    couponDiscountPercent,
    couponDiscountAmount,
    applyCoupon,
    removeCoupon,
    finalTotal,
    totalItems,
    checkoutWithShopify,
    isCheckingOut,
  } = useCart();
  const { currencySymbol } = useShopify();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCartOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 200,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(79, 58, 41, 0.4)',
          backdropFilter: 'blur(4px)',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          backgroundColor: 'var(--cream-light)',
          borderLeft: '1px solid var(--border)',
          boxShadow: 'var(--shadow-floating)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 201,
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="var(--brown)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--brown)' }}>Your Cart</h3>
            <span
              style={{
                backgroundColor: 'var(--cream-dark)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--muted)',
              }}
            >
              {totalItems}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
            style={{
              padding: '6px',
              borderRadius: '50%',
              color: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Bundle Savings Progress Bar */}
        {cart.length > 0 && (
          <div
            style={{
              padding: '12px 24px',
              backgroundColor: totalItems >= 3 ? 'var(--olive-light)' : 'var(--cream-dark)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 700 }}>
              {totalItems === 1 && (
                <span style={{ color: 'var(--terracotta-dark)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Sparkles size={14} /> Add 1 more item to unlock <strong>20% OFF</strong>!
                </span>
              )}
              {totalItems === 2 && (
                <span style={{ color: 'var(--terracotta-dark)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Sparkles size={14} /> <strong>20% OFF Unlocked!</strong> Add 1 more for <strong>25% OFF</strong>!
                </span>
              )}
              {totalItems >= 3 && (
                <span style={{ color: 'var(--olive-dark)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Sparkles size={14} /> <strong>Mega Bundle Unlocked!</strong> 25% OFF applied 🎉
                </span>
              )}
              <span style={{ color: 'var(--brown)', fontSize: '0.78rem' }}>
                {Math.min(totalItems, 3)}/3 items
              </span>
            </div>
            
            {/* Progress Track */}
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: 'rgba(0,0,0,0.08)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: totalItems >= 3 ? '100%' : totalItems === 2 ? '66%' : '33%',
                  height: '100%',
                  backgroundColor: totalItems >= 3 ? 'var(--olive)' : 'var(--terracotta)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          </div>
        )}

        {/* Cart Item List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {cart.length === 0 ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cream-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingBag size={32} color="var(--clay-dark)" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--brown)', marginBottom: '6px' }}>Your cart is empty</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  Discover handcrafted presets, LUTs, and creative assets.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/shop');
                }}
                className="btn-primary"
                style={{ marginTop: '8px' }}
              >
                Browse Shop
              </button>
            </div>
          ) : (
            cart.map(({ product, quantity }) => (
              <div
                key={product.id}
                style={{
                  display: 'flex',
                  gap: '14px',
                  padding: '14px',
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Thumbnail */}
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: 'var(--radius-sm)',
                    objectFit: 'cover',
                    border: '1px solid var(--border-light)',
                  }}
                />

                {/* Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brown)', lineHeight: 1.3 }}>
                        {product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        aria-label="Remove item"
                        style={{ color: 'var(--muted)', padding: '2px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--terracotta)', fontWeight: 600, textTransform: 'uppercase' }}>
                      {product.category}
                    </span>
                  </div>

                  {/* Price & Quantity Controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: 'var(--cream)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-full)',
                        padding: '2px 6px',
                        gap: '8px',
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        style={{ display: 'flex', alignItems: 'center', color: 'var(--brown)', padding: '2px' }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        style={{ display: 'flex', alignItems: 'center', color: 'var(--brown)', padding: '2px' }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brown)' }}>
                      {currencySymbol}{product.price * quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Action */}
        {cart.length > 0 && (
          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--border)',
              backgroundColor: 'var(--cream)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Delivery Note */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                color: 'var(--olive-dark)',
                backgroundColor: 'var(--olive-light)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <DownloadCloud size={16} />
              <span>Instant digital delivery & Creator License included.</span>
            </div>

            {/* Pricing Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {bundleDiscountPercent > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.92rem', color: 'var(--muted)', fontWeight: 500 }}>Original Price</span>
                    <span style={{ fontSize: '0.96rem', color: 'var(--muted)', textDecoration: 'line-through' }}>
                      {currencySymbol}{subtotal}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--terracotta-dark)' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Tag size={13} /> {bundleDiscountPercent}% Bundle Savings
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                      -{currencySymbol}{bundleDiscountAmount}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      paddingTop: '8px',
                      borderTop: '1px dashed var(--border)',
                    }}
                  >
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brown)' }}>Final Total</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brown-dark)' }}>
                        {currencySymbol}{finalTotal}
                      </span>
                    </div>
                  </div>
                </>
              ) : couponDiscountPercent > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.92rem', color: 'var(--muted)', fontWeight: 500 }}>Original Price</span>
                    <span style={{ fontSize: '0.96rem', color: 'var(--muted)', textDecoration: 'line-through' }}>
                      {currencySymbol}{subtotal}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#16a34a' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Tag size={13} /> 10% Off ({appliedCoupon})
                      <button
                        onClick={removeCoupon}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--muted)',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          marginLeft: '4px',
                        }}
                      >
                        Remove
                      </button>
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                      -{currencySymbol}{couponDiscountAmount}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      paddingTop: '8px',
                      borderTop: '1px dashed var(--border)',
                    }}
                  >
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brown)' }}>Final Total</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brown-dark)' }}>
                        {currencySymbol}{finalTotal}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 500 }}>Subtotal</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brown)' }}>
                      {currencySymbol}{subtotal}
                    </span>
                  </div>

                  {/* 1-Click Launch Offer Chip */}
                  <button
                    type="button"
                    onClick={() => applyCoupon('Template-10')}
                    style={{
                      width: '100%',
                      background: 'rgba(212, 163, 115, 0.08)',
                      border: '1px dashed rgba(212, 163, 115, 0.7)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                      color: 'var(--brown)',
                      fontWeight: 600,
                      marginTop: '4px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.18)';
                      e.currentTarget.style.borderColor = 'var(--terracotta)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(212, 163, 115, 0.7)';
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Tag size={13} color="var(--terracotta-dark)" />
                      <span>Have launch code? <strong>Template-10</strong></span>
                    </span>
                    <span style={{ color: 'var(--terracotta-dark)', fontWeight: 700 }}>Apply 10% OFF →</span>
                  </button>
                </>
              )}
            </div>

            {/* Direct Shopify Checkout Button */}
            <button
              onClick={() => checkoutWithShopify()}
              disabled={isCheckingOut}
              className="btn-terracotta"
              style={{ width: '100%', padding: '14px 20px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 size={18} className="spin-animate" />
                  <span>Connecting to Shopify Checkout...</span>
                </>
              ) : (
                <>
                  <Zap size={18} />
                  <span>Instant Shopify Checkout</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsCartOpen(false);
                navigate('/checkout');
              }}
              style={{
                fontSize: '0.88rem',
                color: 'var(--brown)',
                textAlign: 'center',
                fontWeight: 600,
                textDecoration: 'underline',
              }}
            >
              Review Order Details
            </button>

            <button
              onClick={() => setIsCartOpen(false)}
              style={{
                fontSize: '0.82rem',
                color: 'var(--muted)',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .spin-animate {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
