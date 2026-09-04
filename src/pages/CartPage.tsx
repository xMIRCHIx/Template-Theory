import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, DownloadCloud, ShieldCheck, ShoppingBag, Zap, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useShopify } from '../context/ShopifyContext';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, subtotal, totalItems, clearCart, checkoutWithShopify, isCheckingOut } = useCart();
  const { currencySymbol } = useShopify();
  const navigate = useNavigate();

  return (
    <div style={{ paddingBottom: '80px', paddingTop: '20px' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '6px' }}>
            Shopping Cart
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--muted)' }}>
            Review your selected digital assets before proceeding to checkout.
          </p>
        </div>

        {cart.length === 0 ? (
          <div
            style={{
              padding: '80px 20px',
              textAlign: 'center',
              backgroundColor: 'var(--cream-light)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-clay)',
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
                margin: '0 auto 16px',
              }}
            >
              <ShoppingBag size={32} color="var(--clay-dark)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--brown)', marginBottom: '8px' }}>
              Your cart is empty
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginBottom: '24px' }}>
              Looks like you haven't added any presets, LUTs, or design kits yet.
            </p>
            <Link to="/shop" className="btn-primary">
              Browse Digital Assets
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr',
              gap: '40px',
              alignItems: 'flex-start',
            }}
            className="cart-split-grid"
          >
            {/* Left: Cart Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  style={{
                    display: 'flex',
                    gap: '20px',
                    padding: '20px',
                    backgroundColor: 'var(--cream-light)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-clay)',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: 'var(--radius-md)',
                      objectFit: 'cover',
                      border: '1px solid var(--border-light)',
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--terracotta)', textTransform: 'uppercase' }}>
                      {product.category}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brown)', marginTop: '2px', marginBottom: '4px' }}>
                      {product.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                      {product.itemCount} • Commercial License
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px' }}>
                      {/* Stepper */}
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: 'var(--cream-dark)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-full)',
                          padding: '3px 8px',
                          gap: '10px',
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          style={{ color: 'var(--brown)', display: 'flex' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          style={{ color: 'var(--brown)', display: 'flex' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brown)' }}>
                          {currencySymbol}{product.price * quantity}
                        </span>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          aria-label="Remove product"
                          style={{ color: 'var(--muted)', padding: '4px' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Order Summary */}
            <div
              style={{
                backgroundColor: 'var(--cream-light)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: '32px',
                boxShadow: 'var(--shadow-clay)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brown)' }}>
                Order Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--muted)' }}>
                  <span>Items Subtotal ({totalItems})</span>
                  <span style={{ fontWeight: 700, color: 'var(--brown)' }}>{currencySymbol}{subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--muted)' }}>
                  <span>Digital Delivery</span>
                  <span style={{ fontWeight: 700, color: 'var(--olive-dark)' }}>FREE (Instant)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--muted)' }}>
                  <span>Commercial License</span>
                  <span style={{ fontWeight: 700, color: 'var(--olive-dark)' }}>Included</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brown)' }}>Total Due</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brown)' }}>{currencySymbol}{subtotal}</span>
                </div>
              </div>

              {/* Instant Delivery Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  backgroundColor: 'var(--olive-light)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  color: 'var(--olive-dark)',
                  lineHeight: 1.4,
                }}
              >
                <DownloadCloud size={20} style={{ flexShrink: 0 }} />
                <span>Instant access and secure download token generated immediately upon checkout.</span>
              </div>

              {/* Direct Shopify Checkout CTA */}
              <button
                onClick={() => checkoutWithShopify()}
                disabled={isCheckingOut}
                className="btn-terracotta"
                style={{ width: '100%', padding: '16px 20px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 size={18} className="spin-animate" />
                    <span>Connecting to Shopify Checkout...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Proceed to Shopify Checkout</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-secondary"
                style={{ width: '100%', padding: '12px 20px', fontSize: '0.95rem' }}
              >
                Review Order Details
              </button>

              <Link
                to="/shop"
                style={{
                  textAlign: 'center',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--muted)',
                }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @media (max-width: 860px) {
          .cart-split-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
