import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, CheckCircle2, ArrowRight, Tag, Zap, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useShopify } from '../context/ShopifyContext';
import { processMockCheckout } from '../services/paymentMock';

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, clearCart, checkoutWithShopify, isCheckingOut } = useCart();
  const { currencySymbol } = useShopify();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: 'Aryan Gupta',
    email: 'aryan@example.com',
    cardNumber: '4242 •••• •••• 4242',
    expDate: '12/28',
    cvv: '888',
    country: 'India',
  });

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'CREATOR10' || code === 'THEORY10' || code === 'TEMPLATETHEORY' || code === 'CINEVO') {
      setDiscount(50);
      setCouponApplied(true);
    } else {
      alert('Invalid code! Try "THEORY10" for discount.');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    setIsProcessing(true);
    try {
      const order = await processMockCheckout(
        formData.email,
        formData.name,
        cart,
        subtotal,
        discount
      );
      clearCart();
      navigate('/order-success');
    } catch (err) {
      console.error(err);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--brown)', marginBottom: '12px' }}>Your Cart is Empty</h2>
        <Link to="/shop" className="btn-primary">Return to Shop</Link>
      </div>
    );
  }

  const finalTotal = Math.max(0, subtotal - discount);

  return (
    <div style={{ paddingBottom: '80px', paddingTop: '20px' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        
        {/* Checkout Header */}
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--brown)' }}>
              Secure Checkout
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--muted)' }}>
              Instant digital delivery and commercial entitlement.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--olive-dark)', fontSize: '0.85rem', fontWeight: 600 }}>
            <Lock size={16} />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.3fr 1fr',
              gap: '40px',
              alignItems: 'flex-start',
            }}
            className="checkout-split-grid"
          >
            {/* Left: Contact & Payment Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Customer Contact */}
              <div
                style={{
                  backgroundColor: 'var(--cream-light)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '32px',
                  boxShadow: 'var(--shadow-clay)',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '18px' }}>
                  1. Contact Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '4px' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border)',
                        backgroundColor: 'var(--white)',
                        color: 'var(--brown)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '4px' }}>
                      Email Address (Where downloads & licenses will be sent)
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border)',
                        backgroundColor: 'var(--white)',
                        color: 'var(--brown)',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div
                style={{
                  backgroundColor: 'var(--cream-light)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '32px',
                  boxShadow: 'var(--shadow-clay)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brown)' }}>
                    2. Payment Method
                  </h3>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <CreditCard size={20} color="var(--brown)" />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '4px' }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border)',
                        backgroundColor: 'var(--white)',
                        color: 'var(--brown)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '4px' }}>
                        Expiration Date
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.expDate}
                        onChange={(e) => setFormData({ ...formData, expDate: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1.5px solid var(--border)',
                          backgroundColor: 'var(--white)',
                          color: 'var(--brown)',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '4px' }}>
                        CVV / CVC
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cvv}
                        onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1.5px solid var(--border)',
                          backgroundColor: 'var(--white)',
                          color: 'var(--brown)',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Order Summary & Coupon */}
            <div
              style={{
                backgroundColor: 'var(--cream-light)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: '32px',
                boxShadow: 'var(--shadow-clay)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brown)' }}>
                Order Summary ({cart.length})
              </h3>

              {/* Items Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto' }}>
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={product.thumbnail}
                      alt=""
                      style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brown)' }}>{product.name}</h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Qty: {quantity}</span>
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brown)' }}>
                      {currencySymbol}{product.price * quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Form */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. CREATOR10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border)',
                      backgroundColor: 'var(--white)',
                      color: 'var(--brown)',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="btn-secondary"
                    style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--olive-dark)', marginTop: '6px', fontWeight: 600 }}>
                    ✓ Code applied! {currencySymbol}{discount} creator discount.
                  </p>
                )}
              </div>

              {/* Subtotals & Final Price */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--muted)' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 700, color: 'var(--brown)' }}>{currencySymbol}{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--terracotta-dark)' }}>
                    <span>Discount</span>
                    <span style={{ fontWeight: 700 }}>-{currencySymbol}{discount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--muted)' }}>
                  <span>Digital Delivery</span>
                  <span style={{ fontWeight: 700, color: 'var(--olive-dark)' }}>Instant</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brown)' }}>Total Due</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brown)' }}>{currencySymbol}{finalTotal}</span>
                </div>
              </div>

              {/* Shopify Hosted Checkout Primary CTA */}
              <button
                type="button"
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
                    <span>Pay with Official Shopify Checkout</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Direct Form Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="btn-secondary"
                style={{ width: '100%', padding: '12px 20px', fontSize: '0.95rem' }}
              >
                {isProcessing ? 'Generating Secure License...' : `Place Direct Order (${currencySymbol}${finalTotal})`}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--muted)' }}>
                <ShieldCheck size={14} color="var(--olive-dark)" />
                <span>Lifetime commercial license included with this order.</span>
              </div>
            </div>

          </div>
        </form>

      </div>

      <style>{`
        @media (max-width: 860px) {
          .checkout-split-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
