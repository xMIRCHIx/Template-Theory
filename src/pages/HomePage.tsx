import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  DownloadCloud,
  ShieldCheck,
  Infinity as InfinityIcon,
  Award,
  Layers,
  CheckCircle2,
  Mail,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { HeroScene } from '../components/hero/HeroScene';
import { CategoryCard } from '../components/cards/CategoryCard';
import { ProductCard } from '../components/cards/ProductCard';
import { BeforeAfterSlider } from '../components/comparison/BeforeAfterSlider';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS as LOCAL_PRODUCTS } from '../data/products';
import { UGC_DATA } from '../data/ugc';
import { UGCItem } from '../types';
import { useShopify } from '../context/ShopifyContext';
import { motion } from 'framer-motion';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useShopify();
  const [selectedUgc, setSelectedUgc] = useState<UGCItem | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'subscribed'>('idle');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus('subscribed');
    setTimeout(() => {
      setNewsletterEmail('');
    }, 2000);
  };

  const catalog = products.length > 0 ? products : LOCAL_PRODUCTS;
  const cinematicProducts = catalog.filter((p) => p.category === 'presets' || p.category === 'luts' || p.category === 'psds');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', overflowX: 'hidden', position: 'relative' }}>
      
      {/* 1. HERO SECTION */}
      <section className="hero-section" style={{ paddingTop: 'clamp(24px, 4vh, 44px)', paddingBottom: '30px', position: 'relative' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.15fr',
              gap: '40px',
              alignItems: 'center',
            }}
            className="hero-grid"
          >
            {/* Left Copy */}
            <div className="hero-copy-col">
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--cream-dark)',
                  border: '1px solid var(--border)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  marginBottom: '20px',
                }}
              >
                <Sparkles size={14} color="var(--terracotta)" />
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: 'var(--brown)',
                    textTransform: 'uppercase',
                  }}
                >
                  Digital Goods for Creators
                </span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.6rem, 5.5vw, 4rem)',
                  fontWeight: 800,
                  lineHeight: 1.12,
                  color: 'var(--brown)',
                  marginBottom: '18px',
                  letterSpacing: '-0.03em',
                }}
              >
                Premium Digital Assets
              </h1>

              <p
                style={{
                  fontSize: '1.15rem',
                  color: 'var(--muted)',
                  lineHeight: 1.6,
                  maxWidth: '520px',
                  marginBottom: '32px',
                }}
              >
                Handcrafted digital products for creators, designers & storytellers. Lightroom Presets, Cinematic LUTs, PSD Templates & Typefaces.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '40px' }}>
                <Link to="/shop" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                  <span>Explore Products</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/collections" className="btn-secondary" style={{ padding: '14px 26px', fontSize: '1rem' }}>
                  Browse Collections
                </Link>
              </div>

              {/* Trust Indicators */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  flexWrap: 'wrap',
                  fontSize: '0.85rem',
                  color: 'var(--muted)',
                  fontWeight: 600,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} color="var(--olive)" />
                  <span>High Quality</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DownloadCloud size={16} color="var(--terracotta)" />
                  <span>Instant Download</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <InfinityIcon size={16} color="var(--clay-dark)" />
                  <span>Lifetime Access</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="var(--olive-dark)" />
                  <span>Commercial License</span>
                </div>
              </div>
            </div>

            {/* Right: Clay 3D Composition Scene */}
            <div className="hero-scene-col" style={{ position: 'relative', width: '100%' }}>
              <HeroScene />
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENEFITS PILL STRIP */}
      <section style={{ position: 'relative' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              padding: '16px 20px',
              backgroundColor: 'var(--cream-light)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-clay)',
            }}
          >
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px', borderRadius: '12px', cursor: 'default' }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--clay-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown)', boxShadow: '0 4px 10px rgba(96, 68, 46, 0.15)' }}>
                <DownloadCloud size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brown)' }}>Instant Download</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Get access immediately</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px', borderRadius: '12px', cursor: 'default' }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--olive-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--olive-dark)', boxShadow: '0 4px 10px rgba(127, 135, 106, 0.2)' }}>
                <InfinityIcon size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brown)' }}>Lifetime Access</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Yours forever</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px', borderRadius: '12px', cursor: 'default' }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--terracotta-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--terracotta-dark)', boxShadow: '0 4px 10px rgba(201, 130, 103, 0.25)' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brown)' }}>Commercial License</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Personal & client work</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px', borderRadius: '12px', cursor: 'default' }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown)', boxShadow: '0 4px 10px rgba(96, 68, 46, 0.12)' }}>
                <Award size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brown)' }}>High Quality</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Carefully crafted assets</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px', borderRadius: '12px', cursor: 'default' }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--clay-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown)', boxShadow: '0 4px 10px rgba(96, 68, 46, 0.15)' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brown)' }}>Free Updates</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Continuous improvements</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR CATEGORIES */}
      <section>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brown)' }}>Popular Categories</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginTop: '4px' }}>
                Curated toolkits organized by your creative medium.
              </p>
            </div>
            <Link
              to="/collections"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.92rem',
                fontWeight: 700,
                color: 'var(--terracotta-dark)',
              }}
            >
              <span>View all categories</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}
          >
            {CATEGORIES.slice(0, 5).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. CINEMATIC COLLECTION GRID (Multi-Row Wrapping Grid, 2 per row on mobile) */}
      <section>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '28px',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.3rem)', fontWeight: 800, color: 'var(--brown)' }}>
                Cinematic Collection
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginTop: '4px' }}>
                Everything you need for that perfect cinematic feel.
              </p>
            </div>

            <Link
              to="/collections/luts"
              style={{
                fontSize: '0.92rem',
                fontWeight: 700,
                color: 'var(--terracotta-dark)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>View collection</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Multi-Row Product Grid */}
          <div
            className="home-products-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '22px',
            }}
          >
            {cinematicProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL SPLIT BANNERS */}
      <section style={{ position: 'relative' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Banner 1: For the Cinematic Creator */}
          <div
            style={{
              backgroundColor: 'var(--cream-light)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '40px 48px',
              boxShadow: 'var(--shadow-clay)',
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              alignItems: 'center',
              gap: '32px',
              position: 'relative',
              overflow: 'hidden',
            }}
            className="editorial-banner"
          >
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--olive-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                LUTs & Presets
              </span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--brown)', marginTop: '6px', marginBottom: '12px' }}>
                For the Cinematic Creator
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--muted)', maxWidth: '440px', marginBottom: '24px', lineHeight: 1.6 }}>
                LUTs & Presets crafted to bring your story to life. Calibrated for modern mirrorless cameras & cinema workflows.
              </p>
              <Link to="/collections/luts" className="btn-primary">
                <span>Explore LUTs & Presets</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right Artwork with Micro-Interaction Spring Tilt */}
            <motion.div
              whileHover={{ y: -8, scale: 1.04, rotate: 2 }}
              transition={{ type: 'spring', stiffness: 280, damping: 14 }}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img
                  src="/assets/clay/LUTS.png"
                  alt=""
                  style={{ width: '130px', objectFit: 'contain', filter: 'drop-shadow(0 15px 25px rgba(101, 109, 84, 0.25))' }}
                />
                <img
                  src="/assets/clay/CAMERA.png"
                  alt=""
                  style={{ width: '150px', objectFit: 'contain', filter: 'drop-shadow(0 18px 28px rgba(96, 68, 46, 0.2))' }}
                />
              </div>
            </motion.div>
          </div>

          {/* Banner 2: For the Designer */}
          <div
            style={{
              backgroundColor: 'var(--cream-light)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '40px 48px',
              boxShadow: 'var(--shadow-clay)',
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              alignItems: 'center',
              gap: '32px',
              position: 'relative',
              overflow: 'hidden',
            }}
            className="editorial-banner"
          >
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--terracotta)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                PSDs, Fonts & Assets
              </span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--brown)', marginTop: '6px', marginBottom: '12px' }}>
                For the Designer
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--muted)', maxWidth: '440px', marginBottom: '24px', lineHeight: 1.6 }}>
                PSDs, mockups, icons & 3D assets to speed up your workflow. Drop in your artwork and export in seconds.
              </p>
              <Link to="/collections/psds" className="btn-primary">
                <span>Explore Design Assets</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right Artwork with Micro-Interaction Spring Tilt */}
            <motion.div
              whileHover={{ y: -8, scale: 1.04, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 280, damping: 14 }}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img
                  src="/assets/clay/PSDS.png"
                  alt=""
                  style={{ width: '140px', objectFit: 'contain', filter: 'drop-shadow(0 18px 28px rgba(201, 130, 103, 0.25))' }}
                />
                <img
                  src="/assets/clay/FONT ASSET.png"
                  alt=""
                  style={{ width: '130px', objectFit: 'contain', filter: 'drop-shadow(0 16px 26px rgba(96, 68, 46, 0.2))' }}
                />
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 6. UGC / CREATOR SHOWCASE */}
      <section>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brown)' }}>Made With Template Theory</h2>
                <span
                  style={{
                    backgroundColor: 'var(--clay-light)',
                    color: 'var(--brown-dark)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  #templatetheory
                </span>
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--muted)' }}>
                Real creations from talented creators around the world.
              </p>
            </div>

            <Link to="/shop" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
              View more creations →
            </Link>
          </div>

          {/* Masonry-Style UGC Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
              gap: '20px',
            }}
          >
            {UGC_DATA.map((item) => (
              <motion.div
                key={item.id}
                onClick={() => setSelectedUgc(item)}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  aspectRatio: '1 / 1.15',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-clay)',
                  border: '1px solid var(--border)',
                }}
                className="ugc-card"
              >
                <img
                  src={item.image}
                  alt={item.caption}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease',
                  }}
                  className="ugc-img"
                />

                {/* Gradient Overlay & Tag */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    padding: '18px 16px',
                    background: 'linear-gradient(to top, rgba(33, 25, 19, 0.85) 0%, transparent 100%)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--white)' }}>
                      {item.creatorHandle}
                    </span>
                    <p style={{ fontSize: '0.72rem', color: 'var(--clay-light)', marginTop: '2px' }}>
                      Used: {item.productName}
                    </p>
                  </div>

                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--white)',
                    }}
                  >
                    <ExternalLink size={14} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SEE THE DIFFERENCE (BEFORE / AFTER) */}
      <section>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--brown)' }}>See the Difference</h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--muted)', marginTop: '6px' }}>
              One click. Completely different mood. Drag the slider to compare.
            </p>
          </div>

          <div
            style={{
              maxWidth: '960px',
              margin: '0 auto',
              position: 'relative',
            }}
          >
            <BeforeAfterSlider
              beforeImage="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop&sat=-35&bri=-10"
              afterImage="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop&sat=30&hue=10"
              beforeLabel="RAW UNGRADED"
              afterLabel="TEMPLATE THEORY FILM TONE"
              aspectRatio="16 / 9"
            />
          </div>
        </div>
      </section>

      {/* 8. WHAT'S INSIDE? */}
      <section>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--brown)' }}>What's Inside?</h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--muted)', marginTop: '6px' }}>
              Quality you can count on across all creative tools.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '18px',
            }}
          >
            {/* Card 1: Presets */}
            <motion.div
              className="clay-card"
              whileHover={{ y: -8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              style={{ padding: '24px 16px', textAlign: 'center', cursor: 'default' }}
            >
              <motion.img
                whileHover={{ rotate: 10, scale: 1.1 }}
                src="/assets/clay/PRESET.png"
                alt="Presets"
                style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto 12px' }}
              />
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brown)', display: 'block' }}>20</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.04em' }}>PRESETS</span>
            </motion.div>

            {/* Card 2: LUTs */}
            <motion.div
              className="clay-card"
              whileHover={{ y: -8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              style={{ padding: '24px 16px', textAlign: 'center', cursor: 'default' }}
            >
              <motion.img
                whileHover={{ rotate: -10, scale: 1.1 }}
                src="/assets/clay/LUTS.png"
                alt="LUTs"
                style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto 12px' }}
              />
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brown)', display: 'block' }}>16</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.04em' }}>LUTs</span>
            </motion.div>

            {/* Card 3: PSDs */}
            <motion.div
              className="clay-card"
              whileHover={{ y: -8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              style={{ padding: '24px 16px', textAlign: 'center', cursor: 'default' }}
            >
              <motion.img
                whileHover={{ rotate: 12, scale: 1.1 }}
                src="/assets/clay/PSDS.png"
                alt="PSDs"
                style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto 12px' }}
              />
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brown)', display: 'block' }}>10</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.04em' }}>PSD FILES</span>
            </motion.div>

            {/* Card 4: Assets */}
            <motion.div
              className="clay-card"
              whileHover={{ y: -8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              style={{ padding: '24px 16px', textAlign: 'center', cursor: 'default' }}
            >
              <motion.img
                whileHover={{ rotate: -12, scale: 1.1 }}
                src="/assets/clay/CUBE.png"
                alt="Assets"
                style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto 12px' }}
              />
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brown)', display: 'block' }}>25+</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.04em' }}>ASSETS</span>
            </motion.div>

            {/* Card 5: Bonus */}
            <motion.div
              className="clay-card"
              whileHover={{ y: -8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              style={{ padding: '24px 16px', textAlign: 'center', cursor: 'default' }}
            >
              <motion.img
                whileHover={{ rotate: 15, scale: 1.1 }}
                src="/assets/clay/FONT ASSET.png"
                alt="Freebies"
                style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto 12px' }}
              />
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--terracotta)', display: 'block' }}>BONUS</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.04em' }}>FREEBIES</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 9. CREATOR COMMUNITY CTA BANNER */}
      <section>
        <div className="container">
          <div
            style={{
              backgroundColor: 'var(--cream-light)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '48px 40px',
              boxShadow: 'var(--shadow-clay)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '32px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '8px' }}>
                Join 10,000+ Creators Building Amazing Projects
              </h3>
              <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: '540px' }}>
                Get early access to drops, exclusive discount codes, free toolkits, and creative tutorials.
              </p>
            </div>

            <Link to="/shop" className="btn-terracotta" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              <span>Join Our Community</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. NEWSLETTER */}
      <section>
        <div className="container">
          <div
            style={{
              backgroundColor: 'var(--cream-dark)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '36px 40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cream-light)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--terracotta)',
                }}
              >
                <Mail size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brown)' }}>Stay in the Loop</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                  New products, freebies & creator tips — straight to your inbox.
                </p>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleNewsletterSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                maxWidth: '460px',
              }}
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--border)',
                  backgroundColor: 'var(--white)',
                  outline: 'none',
                  color: 'var(--brown)',
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '12px 24px', fontSize: '0.9rem' }}
              >
                {newsletterStatus === 'subscribed' ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* UGC Modal */}
      {selectedUgc && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 350,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={() => setSelectedUgc(null)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(33, 25, 19, 0.65)',
              backdropFilter: 'blur(6px)',
            }}
          />

          <div
            style={{
              position: 'relative',
              backgroundColor: 'var(--cream-light)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              maxWidth: '720px',
              width: '100%',
              boxShadow: 'var(--shadow-floating)',
              zIndex: 351,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
            }}
            className="ugc-modal-grid"
          >
            <img
              src={selectedUgc.image}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--terracotta)', textTransform: 'uppercase' }}>
                  Creator Spotlight
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brown)', marginTop: '4px' }}>
                  {selectedUgc.creatorName}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '4px' }}>
                  {selectedUgc.creatorHandle}
                </p>
                <p style={{ fontSize: '0.95rem', color: 'var(--text)', marginTop: '16px', lineHeight: 1.6 }}>
                  "{selectedUgc.caption}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '20px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Product Used:</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brown)', marginTop: '2px' }}>
                  {selectedUgc.productName}
                </h4>
                <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                  <button
                    onClick={() => {
                      const slug = selectedUgc.productSlug;
                      setSelectedUgc(null);
                      navigate(`/product/${slug}`);
                    }}
                    className="btn-primary"
                    style={{ flex: 1, padding: '10px 16px', fontSize: '0.88rem' }}
                  >
                    View Product (${selectedUgc.productPrice})
                  </button>
                  <button
                    onClick={() => setSelectedUgc(null)}
                    className="btn-secondary"
                    style={{ padding: '10px 16px', fontSize: '0.88rem' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .home-products-grid {
          display: grid !important;
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          gap: 22px !important;
        }

        @media (max-width: 1100px) {
          .home-products-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 18px !important;
          }
        }

        @media (max-width: 900px) {
          .hero-section { padding-top: 10px !important; }
          .hero-grid { 
            display: flex !important; 
            flex-direction: column !important; 
            text-align: center; 
            gap: 20px !important; 
            width: 100% !important;
            max-width: 100% !important;
          }
          .hero-scene-col { 
            order: -1 !important; 
            width: 100% !important;
            max-width: 100% !important;
            margin-bottom: 4px !important;
          }
          .hero-copy-col { 
            order: 1 !important; 
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 4px !important;
            box-sizing: border-box !important;
          }
          .hero-copy-col h1 {
            font-size: clamp(2.1rem, 7.5vw, 2.7rem) !important;
            word-break: break-word !important;
            line-height: 1.15 !important;
          }
          .hero-copy-col p { 
            margin-left: auto; 
            margin-right: auto;
            max-width: 100% !important;
            font-size: 0.92rem !important;
            line-height: 1.55 !important;
          }
          .hero-copy-col div { justify-content: center; }
          .editorial-banner { grid-template-columns: 1fr !important; text-align: center; }
          .ugc-modal-grid { grid-template-columns: 1fr !important; max-height: 85vh; overflow-y: auto; }
        }

        @media (max-width: 768px) {
          /* Exactly 2 cards per row on mobile / phone */
          .home-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .home-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
        }

        .ugc-card:hover .ugc-img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};
