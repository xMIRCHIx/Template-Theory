import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ArrowRight, DownloadCloud, ShoppingBag, Zap, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useShopify } from '../../context/ShopifyContext';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, totalItems, checkoutWithShopify, isCheckingOut } = useCart();
  const { currencySymbol } = useShopify();
  const navigate = useNavigate();

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
              <span>Instant digital delivery & commercial license included.</span>
            </div>

            {/* Subtotal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 500 }}>Subtotal</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brown)' }}>
                {currencySymbol}{subtotal}
              </span>
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
