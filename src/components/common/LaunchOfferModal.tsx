import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, X, Tag, ChevronRight, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const COUPON_CODE = 'Template-10';
const STORAGE_KEY = 'tt_launch_modal_dismissed_v4';

export const LaunchOfferModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const { applyCoupon, appliedCoupon } = useCart();

  useEffect(() => {
    // Check if already dismissed
    const hasDismissed = localStorage.getItem(STORAGE_KEY);
    if (!hasDismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleApplyCoupon = () => {
    // 1. Apply to CartContext (updates all products and cart immediately)
    applyCoupon(COUPON_CODE);

    // 2. Also copy code to clipboard as courtesy
    navigator.clipboard.writeText(COUPON_CODE).catch(() => {});

    // 3. Mark as applied and dismissed
    setIsApplied(true);
    setIsCopied(true);
    localStorage.setItem(STORAGE_KEY, 'true');

    // 4. Smooth auto-close after feedback
    setTimeout(() => {
      setIsOpen(false);
    }, 1300);
  };

  const handleCopyOnly = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(COUPON_CODE).catch(() => {});
    setIsCopied(true);
    applyCoupon(COUPON_CODE);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          {/* Subtle Background Blur — Website remains clearly visible */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.38)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          />

          {/* Pure Jet Black Modern Minimalist Modal (No Brown) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '430px',
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              padding: '30px 26px 24px',
              color: '#ffffff',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.07)',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.55)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.55)';
              }}
            >
              <X size={16} />
            </button>

            {/* Clean Minimalist Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#d4a373',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                marginBottom: '14px',
              }}
            >
              <Tag size={12} />
              <span>Launch Offer</span>
            </div>

            {/* Headline */}
            <h3
              style={{
                fontSize: '24px',
                fontWeight: 700,
                lineHeight: 1.25,
                margin: '0 0 8px',
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              Get <span style={{ color: '#d4a373' }}>10% off</span> your order
            </h3>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.65)',
                lineHeight: 1.5,
                margin: '0 0 22px',
                padding: '0 8px',
              }}
            >
              Apply at checkout across any Wedding LUTs, Album PSDs, Fonts or Presets. Single use per customer.
            </p>

            {/* Coupon Code Pill + Copy Bar */}
            <div
              style={{
                width: '100%',
                height: '44px',
                padding: '0 8px 0 16px',
                backgroundColor: '#141414',
                border: '1px dashed rgba(255, 255, 255, 0.22)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.45)', fontWeight: 500 }}>Coupon:</span>
                <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'monospace', color: '#d4a373', letterSpacing: '0.06em' }}>
                  {COUPON_CODE}
                </span>
              </div>

              <button
                onClick={handleCopyOnly}
                type="button"
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: isCopied ? '#22c55e' : 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.2s ease',
                }}
              >
                {isCopied ? (
                  <>
                    <Check size={13} strokeWidth={2.5} />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Primary Action Button: Apply Coupon Code */}
            <button
              onClick={handleApplyCoupon}
              disabled={isApplied}
              className="group-21st"
              style={{
                width: '100%',
                height: '48px',
                padding: '0 20px',
                backgroundColor: isApplied ? '#16a34a' : '#ffffff',
                border: 'none',
                borderRadius: '12px',
                cursor: isApplied ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: isApplied ? '#ffffff' : '#0a0a0a',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                boxShadow: isApplied ? '0 4px 18px rgba(34, 197, 94, 0.4)' : '0 4px 20px rgba(255, 255, 255, 0.15)',
                marginBottom: '12px',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!isApplied) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(255, 255, 255, 0.25)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isApplied) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.15)';
                }
              }}
            >
              {isApplied ? (
                <>
                  <Check size={17} strokeWidth={2.5} />
                  <span>10% Discount Applied to Store!</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} color="#0a0a0a" />
                  <span>Apply Coupon Code</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>

            {/* Dismiss Link */}
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '4px 8px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)')}
            >
              Continue without discount
            </button>
          </motion.div>
        </div>
      )}

      {/* Persistent Floating 10% OFF launcher trigger if modal is closed and coupon not applied yet */}
      {!isOpen && !appliedCoupon && (
        <motion.button
          key="floating-launch-offer-btn"
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="floating-discount-launcher"
          aria-label="Claim 10% Launch Discount"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 890,
            backgroundColor: '#0a0a0a',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            borderRadius: '999px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            transition: 'all 0.2s ease',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
              display: 'inline-block',
            }}
          />
          <Tag size={14} color="#d4a373" />
          <span>Claim 10% OFF</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
