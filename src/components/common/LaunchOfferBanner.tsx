import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, X, Tag } from 'lucide-react';

const COUPON_CODE = 'Template-10';
const STORAGE_KEY = 'tt_launch_banner_dismissed';

export const LaunchOfferBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Check if user already dismissed or used the coupon
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // Gentle delayed reveal (3.5 seconds) so user has time to view the website first
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(COUPON_CODE).catch(() => {});
    setIsCopied(true);
    localStorage.setItem('tt_applied_coupon', COUPON_CODE);
    localStorage.setItem(STORAGE_KEY, 'true');
    setTimeout(() => {
      setIsCopied(false);
      // Auto-dismiss smoothly after copying
      setTimeout(() => setIsVisible(false), 800);
    }, 1800);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          aria-label="Launch discount promotion"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 999,
            maxWidth: '380px',
            width: 'calc(100% - 48px)',
            backgroundColor: 'rgba(28, 20, 16, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(212, 163, 115, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
            padding: '16px 18px',
            color: '#fdfbf7',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '8px',
                  background: 'rgba(212, 163, 115, 0.18)',
                  color: '#d4a373',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Tag size={13} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                10% Off Your Entire Order
              </span>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              aria-label="Close offer"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.45)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)')}
            >
              <X size={15} />
            </button>
          </div>

          {/* Description */}
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.68)', lineHeight: 1.45 }}>
            Apply this code at checkout to get an instant 10% discount on any pack. Single use per customer.
          </p>

          {/* Action Row: Coupon Code & Copy */}
          <div
            onClick={handleCopy}
            role="button"
            tabIndex={0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              border: '1px dashed rgba(212, 163, 115, 0.45)',
              borderRadius: '10px',
              padding: '8px 12px',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease, background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d4a373';
              e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212, 163, 115, 0.45)';
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.35)';
            }}
          >
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#d4a373',
              }}
            >
              {COUPON_CODE}
            </span>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 600,
                color: isCopied ? '#22c55e' : 'rgba(255, 255, 255, 0.8)',
                transition: 'color 0.15s ease',
              }}
            >
              {isCopied ? (
                <>
                  <Check size={12} />
                  <span>Copied to clipboard</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Click to copy</span>
                </>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
