import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Download, Smartphone, CheckCircle2, LogOut } from 'lucide-react';

interface KwikPassUser {
  phone: string;
  token?: string;
  customerId?: string;
  loggedInAt: string;
}

interface KwikPassAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'cinevo_kwikpass_user_session';

export const KwikPassAuthModal: React.FC<KwikPassAuthModalProps> = ({ isOpen, onClose }) => {
  const [currentUser, setCurrentUser] = useState<KwikPassUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Trigger GoKwik native events and handle message communication
  useEffect(() => {
    if (isOpen) {
      // 1. Dispatch official GoKwik SDK event
      try {
        window.dispatchEvent(
          new CustomEvent('open_kf_modal', {
            detail: {
              show: true,
              merchantInfo: {
                mid: '19ie4pp15340',
                environment: 'production',
                type: 'merchantInfo',
                integrationType: 'CUSTOM_HEADLESS',
              },
            },
          })
        );
      } catch (err) {
        console.warn('GoKwik custom event dispatch:', err);
      }
    }
  }, [isOpen]);

  // Listen for GoKwik postMessage communication from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      // Handle close popup from GoKwik
      if (event.data.type === 'close_popup' || event.data.action === 'close') {
        onClose();
        return;
      }

      // Handle successful KwikPass OTP Login
      if (
        (event.data.type === 'kf_token' && event.data.isCoreTokenValid) ||
        event.data.type === 'login_success' ||
        event.data.type === 'kp_sso_logged_in'
      ) {
        const phone = event.data.phoneNumber || event.data.phone || 'Verified Customer';
        const token = event.data.token || event.data.coreToken || event.data.kpToken || 'kp_token_' + Date.now();
        const userObj: KwikPassUser = {
          phone: typeof phone === 'string' && !phone.startsWith('+') ? `+91 ${phone}` : String(phone),
          token,
          customerId: event.data.customerId,
          loggedInAt: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
        setCurrentUser(userObj);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose]);

  // Post merchant configuration to iframe once loaded
  const handleIframeLoad = () => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          {
            merchantInfo: {
              mid: '19ie4pp15340',
              environment: 'production',
              type: 'merchantInfo',
              integrationType: 'CUSTOM_HEADLESS',
            },
            isHeadless: true,
            pageUrl: window.location.href,
            merchantUrl: window.location.origin,
          },
          '*'
        );
      }
    } catch (e) {
      // ignore cross-origin notice
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        {/* Backdrop Blur Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(28, 18, 12, 0.7)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: currentUser ? '500px' : '440px',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(229, 213, 193, 0.5)',
            overflow: 'hidden',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top Close Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              backgroundColor: '#2b1a11',
              color: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img src="/favicon.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Template Theory
              </span>
              <span
                style={{
                  backgroundColor: 'rgba(255, 184, 0, 0.2)',
                  color: '#ffd066',
                  padding: '2px 8px',
                  borderRadius: '100px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: '1px solid rgba(255, 184, 0, 0.4)',
                }}
              >
                ⚡ KwikPass
              </span>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)')}
            >
              <X size={16} />
            </button>
          </div>

          {/* IF LOGGED IN -> Show My Orders & Downloads Screen */}
          {currentUser ? (
            <div style={{ padding: '24px' }}>
              {/* User Account Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  backgroundColor: '#faf7f2',
                  borderRadius: '16px',
                  border: '1px solid #e5d5c1',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#2b1a11',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#2b1a11' }}>
                      {currentUser.phone}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} />
                      <span>KwikPass Verified</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    border: '1px solid #e5d5c1',
                    color: '#8c7664',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>

              {/* Orders List */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2b1a11', margin: 0 }}>
                    Your Purchased Packs
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#8c7664', fontWeight: 600 }}>
                    Lifetime Access
                  </span>
                </div>

                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1.5px solid #e5d5c1',
                    boxShadow: '0 4px 14px rgba(43, 26, 17, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: '#f5eee6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Package size={22} color="#c97a5a" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#2b1a11' }}>
                        Template Theory Creator Asset Pack
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#8c7664' }}>
                        Instant Digital Download (.ZIP)
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href="https://drive.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '9px 12px',
                        backgroundColor: '#2b1a11',
                        color: '#ffffff',
                        borderRadius: '10px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <Download size={15} />
                      <span>Download Assets</span>
                    </a>
                    <a
                      href="https://wa.me/918109280664?text=Hi%20Template%20Theory,%20I%20need%20help%20with%20my%20order"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '9px 14px',
                        backgroundColor: '#25D366',
                        color: '#ffffff',
                        borderRadius: '10px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <span>Support</span>
                    </a>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#faf7f2',
                  border: '1px dashed #e5d5c1',
                  fontSize: '0.8rem',
                  color: '#6b5442',
                  textAlign: 'center',
                }}
              >
                ✨ Orders placed with this mobile number will automatically appear here with instant download links.
              </div>
            </div>
          ) : (
            /* IF NOT LOGGED IN -> Embed Official KwikPass Panel */
            <div style={{ width: '100%', height: '560px', backgroundColor: '#faf7f2', position: 'relative' }}>
              <iframe
                ref={iframeRef}
                src="https://pdp.gokwik.co/kwikpass/kwikform.html?version=20260909170426949"
                title="KwikPass Official Login"
                allow="otp-credentials"
                onLoad={handleIframeLoad}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                  backgroundColor: '#ffffff',
                }}
              />
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
