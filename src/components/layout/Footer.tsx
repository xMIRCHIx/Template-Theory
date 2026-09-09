import React from 'react';
import { Link } from 'react-router-dom';
import { useShopify } from '../../context/ShopifyContext';
import { DEFAULT_SOCIAL_SETTINGS } from '../../services/adminStore';

export const Footer: React.FC = () => {
  const { socialSettings: contextSocial } = useShopify();
  const social = contextSocial || DEFAULT_SOCIAL_SETTINGS;

  const rawPhone = (social.whatsappNumber || '8109280664').replace(/\D/g, '');
  const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    social.whatsappMessage || 'Hi Template Theory, I have a question about your packs!'
  )}`;
  const instagramUrl = social.instagramUrl || 'https://www.instagram.com/template_theory_/';

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

            {/* Social & Contact Icons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Instagram */}
              {social.instagramEnabled !== false && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram (@template_theory_)"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--cream)',
                    border: '1.5px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brown)',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E1306C';
                    e.currentTarget.style.borderColor = '#E1306C';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--cream)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--brown)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
              )}

              {/* WhatsApp */}
              {social.whatsappEnabled !== false && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp (8109280664)"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--cream)',
                    border: '1.5px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brown)',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#25D366';
                    e.currentTarget.style.borderColor = '#25D366';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--cream)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--brown)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 0C5.396 0 0 5.397 0 12.032c0 2.12.553 4.188 1.603 6.01L0 24l6.136-1.574A11.968 11.968 0 0012.031 24c6.634 0 12.031-5.397 12.031-12.032C24.062 5.397 18.665 0 12.031 0zm0 22.003a9.932 9.932 0 01-5.06-1.388l-.363-.215-3.76.965.998-3.662-.236-.376A9.946 9.946 0 012.029 12.03c0-5.515 4.487-10.003 10.002-10.003 5.516 0 10.003 4.488 10.003 10.003 0 5.516-4.487 10.003-10.003 10.003zm5.485-7.489c-.3-.15-1.776-.876-2.051-.976-.276-.1-.476-.15-.676.15-.2.3-.776.976-.951 1.176-.176.2-.351.226-.651.076-.3-.15-1.267-.468-2.414-1.49-.893-.797-1.496-1.782-1.671-2.082-.176-.3-.019-.462.132-.612.135-.135.3-.35.45-.526.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.628-.926-2.228-.244-.585-.492-.506-.676-.515-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8.375-.276.3-1.051 1.026-1.051 2.502 0 1.476 1.076 2.903 1.226 3.103.15.2 2.118 3.235 5.132 4.536.717.31 1.277.495 1.713.633.72.229 1.375.197 1.893.12.578-.086 1.776-.726 2.026-1.426.25-.7.25-1.301.175-1.426-.075-.125-.275-.2-.575-.35z" />
                  </svg>
                </a>
              )}

              {/* Facebook */}
              {social.facebookEnabled && social.facebookUrl && (
                <a
                  href={social.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--cream)',
                    border: '1.5px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brown)',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1877F2';
                    e.currentTarget.style.borderColor = '#1877F2';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--cream)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--brown)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}

              {/* YouTube */}
              {social.youtubeEnabled && social.youtubeUrl && (
                <a
                  href={social.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--cream)',
                    border: '1.5px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brown)',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FF0000';
                    e.currentTarget.style.borderColor = '#FF0000';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--cream)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--brown)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                    <polygon points="10 15 15 12 10 9 10 15"/>
                  </svg>
                </a>
              )}

              {/* Twitter / X */}
              {social.twitterEnabled && social.twitterUrl && (
                <a
                  href={social.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--cream)',
                    border: '1.5px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brown)',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#000000';
                    e.currentTarget.style.borderColor = '#000000';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--cream)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--brown)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Col 1: Shop */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '16px' }}>Shop</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <Link to="/shop" style={{ color: 'var(--muted)' }}>All Products</Link>
              <Link to="/collections/presets" style={{ color: 'var(--muted)' }}>Presets</Link>
              <Link to="/collections/luts" style={{ color: 'var(--muted)' }}>LUTs</Link>
              <Link to="/collections/psds" style={{ color: 'var(--muted)' }}>Album PSDs</Link>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Made with</span>
            <span style={{ color: 'var(--terracotta)' }}>♥</span>
            <span>for creators.</span>
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
