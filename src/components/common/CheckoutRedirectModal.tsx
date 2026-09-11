import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CheckoutRedirectModal: React.FC = () => {
  const { isCheckingOut, appliedCoupon } = useCart();
  const [progress, setProgress] = useState(15);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!isCheckingOut) {
      setProgress(15);
      setCurrentStep(1);
      return;
    }

    // Lock body scroll while redirecting
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Step progression timer for smooth, reassuring perceptual feedback
    const t1 = setTimeout(() => {
      setProgress(55);
      setCurrentStep(2);
    }, 400);

    const t2 = setTimeout(() => {
      setProgress(90);
      setCurrentStep(3);
    }, 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = originalOverflow;
    };
  }, [isCheckingOut]);

  if (!isCheckingOut) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 99999,
        backgroundColor: 'rgba(20, 14, 10, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        animation: 'crmFadeIn 0.25s ease-out forwards',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#1c1613',
          border: '1.5px solid rgba(212, 163, 115, 0.35)',
          borderRadius: '24px',
          padding: '32px 24px',
          boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.7), 0 0 40px rgba(201, 130, 103, 0.15)',
          textAlign: 'center',
          position: 'relative',
          color: '#f8f4ee',
          boxSizing: 'border-box',
        }}
      >
        {/* Animated Brand Shield Icon */}
        <div
          style={{
            width: '68px',
            height: '68px',
            margin: '0 auto 18px',
            borderRadius: '50%',
            backgroundColor: 'rgba(201, 130, 103, 0.15)',
            border: '1.5px solid rgba(201, 130, 103, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: 'var(--terracotta)',
              animation: 'crmSpin 1.1s linear infinite',
            }}
          />
          <ShieldCheck size={32} color="#e5a982" />
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
            marginBottom: '8px',
            color: '#ffffff',
          }}
        >
          Securing Your Order
        </h3>

        <p
          style={{
            fontSize: '0.88rem',
            color: '#bfa799',
            lineHeight: 1.4,
            marginBottom: '22px',
          }}
        >
          Connecting to Shopify 256-Bit SSL checkout. Instant digital delivery & commercial license guaranteed.
        </p>

        {/* Dynamic Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '22px',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #c98267 0%, #e5a982 100%)',
              borderRadius: '10px',
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>

        {/* Step Progression Indicators */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            textAlign: 'left',
            backgroundColor: 'rgba(0, 0, 0, 0.28)',
            padding: '14px 16px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem' }}>
            <CheckCircle2 size={16} color="#4ade80" />
            <span style={{ color: '#e2d7ce', fontWeight: 600 }}>
              {appliedCoupon ? `Applied discount coupon (${appliedCoupon})` : 'Order items verified & locked'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem' }}>
            {currentStep >= 2 ? (
              <CheckCircle2 size={16} color="#4ade80" />
            ) : (
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: '#e5a982',
                  animation: 'crmSpin 0.9s linear infinite',
                }}
              />
            )}
            <span
              style={{
                color: currentStep >= 2 ? '#e2d7ce' : '#bfa799',
                fontWeight: currentStep >= 2 ? 600 : 500,
              }}
            >
              Lifetime creator download token ready
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem' }}>
            {currentStep >= 3 ? (
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: '#e5a982',
                  animation: 'crmSpin 0.9s linear infinite',
                }}
              />
            ) : (
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                }}
              />
            )}
            <span
              style={{
                color: currentStep >= 3 ? '#ffffff' : '#8c7668',
                fontWeight: currentStep >= 3 ? 700 : 500,
              }}
            >
              Redirecting to secure payment...
            </span>
          </div>
        </div>

        {/* Trust Badges Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            fontSize: '0.74rem',
            color: '#9e897c',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Lock size={12} color="#4ade80" /> 256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={12} color="#e5a982" /> Official Shopify Checkout
          </span>
        </div>
      </div>

      <style>{`
        @keyframes crmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes crmSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
