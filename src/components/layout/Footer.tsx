import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--cream-light)',
        borderTop: '1px solid var(--border)',
        paddingTop: '64px',
        paddingBottom: '36px',
        marginTop: '80px',
      }}
    >
      <div className="container">
        {/* Main Footer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr repeat(5, 1fr)',
            gap: '40px',
            marginBottom: '50px',
          }}
          className="footer-grid"
        >
          {/* Brand Info */}
          <div>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--clay) 0%, var(--terracotta) 100%)',
                  boxShadow: '0 3px 8px rgba(201, 130, 103, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--cream-light)',
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'var(--brown)',
                }}
              >
                Template Theory
              </span>
            </Link>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '20px', maxWidth: '280px' }}>
              Premium digital assets for creators, designers & storytellers. Handcrafted with attention to every detail.
            </p>
            <div style={{ display: 'flex', gap: '14px' }}>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cream)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brown)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--clay-light)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--cream)')}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cream)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brown)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--clay-light)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--cream)')}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                  <polygon points="10 15 15 12 10 9 10 15"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cream)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brown)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--clay-light)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--cream)')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 1: Shop */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '16px' }}>Shop</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <Link to="/shop" style={{ color: 'var(--muted)' }}>All Products</Link>
              <Link to="/collections/presets" style={{ color: 'var(--muted)' }}>Presets</Link>
              <Link to="/collections/luts" style={{ color: 'var(--muted)' }}>LUTs</Link>
              <Link to="/collections/psds" style={{ color: 'var(--muted)' }}>PSDs & Albums</Link>
              <Link to="/collections/fonts" style={{ color: 'var(--muted)' }}>Fonts</Link>
              <Link to="/collections/assets" style={{ color: 'var(--muted)' }}>Assets</Link>
            </div>
          </div>

          {/* Col 2: Collections */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '16px' }}>Collections</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <Link to="/collections/luts" style={{ color: 'var(--muted)' }}>Cinematic</Link>
              <Link to="/collections/presets" style={{ color: 'var(--muted)' }}>Minimal</Link>
              <Link to="/collections/luts" style={{ color: 'var(--muted)' }}>Moody</Link>
              <Link to="/collections/presets" style={{ color: 'var(--muted)' }}>Wedding</Link>
              <Link to="/collections/presets" style={{ color: 'var(--muted)' }}>Film</Link>
              <Link to="/collections" style={{ color: 'var(--muted)' }}>View All</Link>
            </div>
          </div>

          {/* Col 3: Resources */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '16px' }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <Link to="/faq" style={{ color: 'var(--muted)' }}>Tutorials</Link>
              <Link to="/faq" style={{ color: 'var(--muted)' }}>Help Center</Link>
              <Link to="/faq" style={{ color: 'var(--muted)' }}>Licensing</Link>
              <Link to="/faq" style={{ color: 'var(--muted)' }}>Freebies</Link>
            </div>
          </div>

          {/* Col 4: Company */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '16px' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <Link to="/about" style={{ color: 'var(--muted)' }}>About Us</Link>
              <Link to="/contact" style={{ color: 'var(--muted)' }}>Contact</Link>
              <Link to="/contact" style={{ color: 'var(--muted)' }}>Affiliate</Link>
            </div>
          </div>

          {/* Col 5: Support */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '16px' }}>Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <Link to="/faq" style={{ color: 'var(--muted)' }}>FAQ</Link>
              <Link to="/faq" style={{ color: 'var(--muted)' }}>Refund Policy</Link>
              <Link to="/faq" style={{ color: 'var(--muted)' }}>Terms of Use</Link>
              <Link to="/faq" style={{ color: 'var(--muted)' }}>Privacy Policy</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            color: 'var(--muted)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              to="/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: 'var(--muted)',
                fontSize: '0.8rem',
                opacity: 0.7,
                transition: 'opacity 0.2s',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
              title="Template Theory Admin Studio"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 3v3m0 12v3M3 12h3m12 0h3"/>
              </svg>
              <span>Admin Studio</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Made with</span>
              <span style={{ color: 'var(--terracotta)' }}>♥</span>
              <span>for creators.</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
};
