import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShopify } from '../../context/ShopifyContext';
import { MessageCircle, X } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { socialSettings } = useShopify();
  const [isHovered, setIsHovered] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!socialSettings || socialSettings.floatingWhatsappEnabled === false || isDismissed) {
    return null;
  }

  // Sanitize phone number (remove non-digits, ensure country code)
  const rawNumber = (socialSettings.whatsappNumber || '8109280664').replace(/\D/g, '');
  const cleanPhone = rawNumber.length === 10 ? `91${rawNumber}` : rawNumber;
  const encodedMsg = encodeURIComponent(
    socialSettings.whatsappMessage || 'Hi Template Theory, I have a question about your products!'
  );
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

  return (
    <>
      <div
        className="floating-whatsapp-container"
        style={{
          position: 'fixed',
          zIndex: 995,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          pointerEvents: 'auto',
          transition: 'bottom 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Animated Popover Tooltip Pill (Desktop only) */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="floating-whatsapp-tooltip"
              initial={{ opacity: 0, x: 12, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 12, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{
                backgroundColor: '#ffffff',
                color: '#1e293b',
                padding: '9px 15px',
                borderRadius: '999px',
                fontSize: '0.84rem',
                fontWeight: 700,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.25)',
                  display: 'inline-block',
                }}
              />
              <span>Chat on WhatsApp</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Button with Pulse Ripple */}
        <div style={{ position: 'relative' }}>
          {/* Soft Pulse Ring */}
          <motion.div
            animate={{
              scale: [1, 1.45, 1.6],
              opacity: [0.6, 0.2, 0],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              inset: -3,
              borderRadius: '50%',
              backgroundColor: '#25D366',
              zIndex: -1,
            }}
          />

          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="floating-whatsapp-btn"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.1, rotate: [-2, 2, 0] }}
            whileTap={{ scale: 0.92 }}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            style={{
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 22px -2px rgba(37, 211, 102, 0.45), 0 3px 8px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              border: '2px solid rgba(255, 255, 255, 0.9)',
              textDecoration: 'none',
            }}
          >
            {/* Authentic WhatsApp SVG Icon */}
            <svg
              className="floating-whatsapp-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
            >
              <path d="M12.031 0C5.396 0 0 5.397 0 12.032c0 2.12.553 4.188 1.603 6.01L0 24l6.136-1.574A11.968 11.968 0 0012.031 24c6.634 0 12.031-5.397 12.031-12.032C24.062 5.397 18.665 0 12.031 0zm0 22.003a9.932 9.932 0 01-5.06-1.388l-.363-.215-3.76.965.998-3.662-.236-.376A9.946 9.946 0 012.029 12.03c0-5.515 4.487-10.003 10.002-10.003 5.516 0 10.003 4.488 10.003 10.003 0 5.516-4.487 10.003-10.003 10.003zm5.485-7.489c-.3-.15-1.776-.876-2.051-.976-.276-.1-.476-.15-.676.15-.2.3-.776.976-.951 1.176-.176.2-.351.226-.651.076-.3-.15-1.267-.468-2.414-1.49-.893-.797-1.496-1.782-1.671-2.082-.176-.3-.019-.462.132-.612.135-.135.3-.35.45-.526.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.628-.926-2.228-.244-.585-.492-.506-.676-.515-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8.375-.276.3-1.051 1.026-1.051 2.502 0 1.476 1.076 2.903 1.226 3.103.15.2 2.118 3.235 5.132 4.536.717.31 1.277.495 1.713.633.72.229 1.375.197 1.893.12.578-.086 1.776-.726 2.026-1.426.25-.7.25-1.301.175-1.426-.075-.125-.275-.2-.575-.35z" />
            </svg>
          </motion.a>
        </div>
      </div>

      <style>{`
        .floating-whatsapp-container {
          bottom: 28px;
          right: 26px;
        }
        .floating-whatsapp-btn {
          width: 56px;
          height: 56px;
        }
        .floating-whatsapp-icon {
          width: 30px;
          height: 30px;
        }
        @media (max-width: 768px) {
          .floating-whatsapp-container {
            bottom: 82px; /* Floats safely above the mobile bottom dock */
            right: 14px;
          }
          .floating-whatsapp-btn {
            width: 48px !important;
            height: 48px !important;
          }
          .floating-whatsapp-icon {
            width: 26px !important;
            height: 26px !important;
          }
          .floating-whatsapp-tooltip {
            display: none !important;
          }
          body:has(.mobile-sticky-buy-bar) .floating-whatsapp-container {
            bottom: 142px; /* Elevates above sticky buy bar when visible */
          }
        }
      `}</style>
    </>
  );
};
