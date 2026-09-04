import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Award, ShieldCheck, Heart, Layers } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '70px', paddingBottom: '80px' }}>
      
      {/* Hero Header */}
      <section style={{ paddingTop: '30px' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--terracotta)',
              textTransform: 'uppercase',
              backgroundColor: 'var(--terracotta-light)',
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-block',
              marginBottom: '14px',
            }}
          >
            Our Philosophy
          </span>
          <h1 style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4rem)', fontWeight: 800, color: 'var(--brown)', lineHeight: 1.15, marginBottom: '18px' }}>
            Made for Creators Who Care About the Final Detail
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--muted)', lineHeight: 1.65 }}>
            Template Theory was founded with a singular belief: modern creators don't need another generic 5,000-item marketplace. They need a handful of exceptional, meticulously crafted digital assets that elevate their workflow.
          </p>
        </div>
      </section>

      {/* 2-Column Story Section */}
      <section>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '48px',
              alignItems: 'center',
              backgroundColor: 'var(--cream-light)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '48px',
              boxShadow: 'var(--shadow-clay)',
            }}
            className="about-story-grid"
          >
            <div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '16px' }}>
                Fewer Products. Better Products.
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
                Every single LUT, Lightroom preset, PSD mockup, and typeface in Template Theory is tested on real commercial shoots and design projects before it is released. We obsess over highlight roll-offs, clean layer structures, optical kerning, and cross-platform compatibility.
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>
                When you purchase from Template Theory, you aren't just getting raw files — you're getting tools built by creators who know the friction of deadlines and the value of polished aesthetics.
              </p>

              <Link to="/shop" className="btn-primary">
                <span>Explore the Collection</span>
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Clay Artwork Showcase */}
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <div
                style={{
                  position: 'relative',
                  width: '320px',
                  height: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src="/assets/clay/BG ELEMENT.png"
                  alt=""
                  style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain', opacity: 0.6 }}
                />
                <img
                  src="/assets/clay/CAMERA.png"
                  alt=""
                  style={{ position: 'relative', width: '200px', objectFit: 'contain', filter: 'drop-shadow(0 20px 30px rgba(96, 68, 46, 0.2))', zIndex: 2 }}
                />
                <img
                  src="/assets/clay/TOOL.png"
                  alt=""
                  style={{ position: 'absolute', bottom: '20px', left: '10px', width: '100px', objectFit: 'contain', zIndex: 3 }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            <div className="clay-card" style={{ padding: '32px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--clay-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown)', marginBottom: '16px' }}>
                <Award size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '8px' }}>
                Handcrafted Quality
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                Zero AI slop or mass-generated filler. Every curve, LUT matrix, and layer is hand-tuned.
              </p>
            </div>

            <div className="clay-card" style={{ padding: '32px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--olive-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--olive-dark)', marginBottom: '16px' }}>
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '8px' }}>
                Commercial Freedom
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                Every asset comes with full commercial rights for client deliverables, videos, and products.
              </p>
            </div>

            <div className="clay-card" style={{ padding: '32px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--terracotta-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--terracotta-dark)', marginBottom: '16px' }}>
                <Heart size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '8px' }}>
                Creator-First Support
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                Lifetime access, free updates, and instant download recovery directly from our support team.
              </p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .about-story-grid { grid-template-columns: 1fr !important; text-align: center; }
          .about-story-grid div { justify-content: center; }
        }
      `}</style>
    </div>
  );
};
