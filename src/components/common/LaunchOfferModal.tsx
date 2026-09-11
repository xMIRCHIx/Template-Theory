import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, X, ArrowRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const COUPON_CODE = 'Template-10';
const STORAGE_KEY = 'tt_launch_coupon_seen_v1';

export const LaunchOfferModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Check if user has already seen or dismissed the modal
    const hasSeen = localStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      // Show after 2.2 seconds for a smooth, non-intrusive first impression
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(COUPON_CODE).catch(() => {});
    setIsCopied(true);
    // Remember coupon for checkout
    localStorage.setItem('tt_applied_coupon', COUPON_CODE);
    localStorage.setItem(STORAGE_KEY, 'true');
    setTimeout(() => setIsCopied(false), 3000);
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
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(15, 10, 8, 0.72)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#1c1410',
              backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(212, 163, 115, 0.18) 0%, transparent 70%)',
              border: '1.5px solid rgba(212, 163, 115, 0.35)',
              borderRadius: '24px',
              boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(212, 163, 115, 0.12)',
              padding: '28px 24px',
              color: '#fdfbf7',
              textAlign: 'center',
              overflow: 'hidden',
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
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              }}
            >
              <X size={18} />
            </button>

            {/* Sparkle Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                borderRadius: '999px',
                background: 'rgba(212, 163, 115, 0.15)',
                border: '1px solid rgba(212, 163, 115, 0.4)',
                color: '#d4a373',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}
            >
              <Sparkles size={13} />
              <span>Launch Privilege</span>
            </div>

            {/* Main Headline */}
            <h3
              style={{
                fontSize: '24px',
                fontWeight: 800,
                lineHeight: 1.25,
                margin: '0 0 8px',
                color: '#fff',
                letterSpacing: '-0.02em',
              }}
            >
              Claim Flat <span style={{ color: '#d4a373' }}>10% OFF</span> Today
            </h3>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '13.5px',
                color: 'rgba(255, 255, 255, 0.72)',
                lineHeight: 1.55,
                margin: '0 0 22px',
                padding: '0 8px',
              }}
            >
              Use this launch code at checkout to unlock an instant 10% discount on <b>any product</b> across our store.
            </p>

            {/* Coupon Code Box */}
            <div
              onClick={handleCopy}
              role="button"
              tabIndex={0}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                border: '2px dashed rgba(212, 163, 115, 0.55)',
                borderRadius: '16px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                marginBottom: '18px',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#d4a373';
                e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 163, 115, 0.55)';
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.35)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: 'rgba(212, 163, 115, 0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#d4a373',
                  }}
                >
                  <Tag size={16} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Discount Code
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      color: '#fff',
                      fontFamily: 'monospace',
                    }}
                  >
                    {COUPON_CODE}
                  </div>
                </div>
              </div>

              {/* Copy Button Inside Box */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  backgroundColor: isCopied ? '#22c55e' : 'rgba(212, 163, 115, 0.25)',
                  color: isCopied ? '#fff' : '#d4a373',
                  fontSize: '12px',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                }}
              >
                {isCopied ? (
                  <>
                    <Check size={14} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => {
                  handleCopy();
                  handleClose();
                }}
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #d4a373 0%, #b88654 100%)',
                  color: '#1a120c',
                  fontSize: '14px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 20px rgba(212, 163, 115, 0.3)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span>Apply Code & Continue</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.45)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '6px',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)')}
              >
                No thanks, I'll pay full price
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
