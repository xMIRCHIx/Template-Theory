import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, ChevronDown, ChevronRight, Sparkles, Compass, FolderKanban, Info, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { CATEGORIES } from '../../data/categories';
import { Magnetic } from '../ui/Magnetic';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenWishlist: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenWishlist }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCategoriesDropdownOpen(false);
  }, [location]);

  return (
    <div
      className="header-sticky-wrapper"
      style={{
        position: 'sticky',
        top: '12px',
        zIndex: 100,
        width: '100%',
        paddingLeft: '16px',
        paddingRight: '16px',
        pointerEvents: 'none',
        boxSizing: 'border-box',
      }}
    >
      <header
        className="dynamic-island-nav"
        style={{
          pointerEvents: 'auto',
          maxWidth: 'min(100%, 1400px)',
          margin: '0 auto',
          backgroundColor: isScrolled ? 'rgba(251, 247, 240, 0.88)' : 'rgba(251, 247, 240, 0.75)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1.5px solid rgba(255, 255, 255, 0.75)',
          borderRadius: 'var(--radius-full)',
          boxShadow: isScrolled
            ? '0 16px 40px rgba(91, 64, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
            : '0 10px 28px rgba(91, 64, 42, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box',
        }}
      >
        {/* Left: Brand Logo Mark */}
        <Link
          to="/"
          className="header-logo-link"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <img
            src="/images/logo-square.png"
            alt="Template Theory Logo"
            className="header-logo-icon"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
              boxShadow: '0 3px 12px rgba(30, 98, 59, 0.28)',
              border: '1px solid rgba(30, 98, 59, 0.18)',
            }}
          />
          <span
            className="header-logo-text"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--brown-dark)',
              letterSpacing: '-0.03em',
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            Template Theory
          </span>
        </Link>

        {/* Center: Glass Nav Pills */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(237, 227, 212, 0.45)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(229, 213, 193, 0.4)',
          }}
          className="desktop-nav"
        >
          <Link
            to="/"
            style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: location.pathname === '/' ? 'var(--white)' : 'var(--brown)',
              backgroundColor: location.pathname === '/' ? 'var(--brown)' : 'transparent',
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              transition: 'all 0.2s ease',
              boxShadow: location.pathname === '/' ? '0 4px 12px rgba(96, 68, 46, 0.25)' : 'none',
            }}
          >
            Home
          </Link>

          <Link
            to="/shop"
            style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: location.pathname === '/shop' ? 'var(--white)' : 'var(--brown)',
              backgroundColor: location.pathname === '/shop' ? 'var(--brown)' : 'transparent',
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              transition: 'all 0.2s ease',
              boxShadow: location.pathname === '/shop' ? '0 4px 12px rgba(96, 68, 46, 0.25)' : 'none',
            }}
          >
            Shop
          </Link>

          <Link
            to="/collections"
            style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: location.pathname === '/collections' ? 'var(--white)' : 'var(--brown)',
              backgroundColor: location.pathname === '/collections' ? 'var(--brown)' : 'transparent',
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: location.pathname === '/collections' ? '0 4px 12px rgba(96, 68, 46, 0.25)' : 'none',
            }}
          >
            Collections
            <span
              style={{
                fontSize: '0.62rem',
                backgroundColor: location.pathname === '/collections' ? 'var(--terracotta)' : 'var(--terracotta-light)',
                color: location.pathname === '/collections' ? 'var(--white)' : 'var(--terracotta-dark)',
                padding: '2px 6px',
                borderRadius: '6px',
                fontWeight: 800,
              }}
            >
              New
            </span>
          </Link>

          {/* Categories Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
            onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
          >
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.92rem',
                fontWeight: 700,
                color: location.pathname.startsWith('/collections/') ? 'var(--white)' : 'var(--brown)',
                backgroundColor: location.pathname.startsWith('/collections/') ? 'var(--brown)' : 'transparent',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                transition: 'all 0.2s ease',
              }}
            >
              Categories <ChevronDown size={14} />
            </button>

            {isCategoriesDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '260px',
                  backgroundColor: 'rgba(251, 247, 240, 0.94)',
                  backdropFilter: 'blur(20px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.8)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 20px 45px rgba(91, 64, 42, 0.15)',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 110,
                  animation: 'dropScale 0.2s ease',
                }}
              >
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/collections/${cat.slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--brown-dark)',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--cream-dark)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <img src={cat.iconImage} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                    <span>{cat.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/about"
            style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: location.pathname === '/about' ? 'var(--white)' : 'var(--brown)',
              backgroundColor: location.pathname === '/about' ? 'var(--brown)' : 'transparent',
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              transition: 'all 0.2s ease',
            }}
          >
            About
          </Link>

          <Link
            to="/contact"
            style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: location.pathname === '/contact' ? 'var(--white)' : 'var(--brown)',
              backgroundColor: location.pathname === '/contact' ? 'var(--brown)' : 'transparent',
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              transition: 'all 0.2s ease',
            }}
          >
            Contact
          </Link>
        </nav>

        {/* Right: Glass Actions */}
        <div
          className="header-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          {/* Search Trigger */}
          <Magnetic intensity={0.4} range={60}>
            <button
              onClick={onOpenSearch}
              aria-label="Search"
              className="nav-action-btn search-btn"
              style={{
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brown)',
                backgroundColor: 'rgba(237, 227, 212, 0.5)',
                border: '1px solid rgba(229, 213, 193, 0.4)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--white)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(237, 227, 212, 0.5)')}
            >
              <Search size={18} />
            </button>
          </Magnetic>

          {/* Wishlist Trigger */}
          <Magnetic intensity={0.4} range={60}>
            <button
              onClick={onOpenWishlist}
              aria-label="Wishlist"
              className="nav-action-btn wishlist-btn"
              style={{
                position: 'relative',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brown)',
                backgroundColor: 'rgba(237, 227, 212, 0.5)',
                border: '1px solid rgba(229, 213, 193, 0.4)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--white)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(237, 227, 212, 0.5)')}
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '18px',
                    height: '18px',
                    backgroundColor: 'var(--terracotta)',
                    color: 'var(--white)',
                    borderRadius: '50%',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(201, 130, 103, 0.5)',
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </button>
          </Magnetic>

          {/* Cart Trigger */}
          <Magnetic intensity={0.35} range={70}>
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Cart"
              className="nav-action-btn cart-btn"
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--brown)',
                color: 'var(--white)',
                boxShadow: '0 4px 14px rgba(96, 68, 46, 0.25)',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.04)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(96, 68, 46, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(96, 68, 46, 0.25)';
              }}
            >
              <ShoppingBag size={17} />
              <span className="cart-text">Cart</span>
              {totalItems > 0 && (
                <span
                  className="cart-badge"
                  style={{
                    backgroundColor: 'var(--terracotta)',
                    color: 'var(--white)',
                    borderRadius: 'var(--radius-full)',
                    padding: '2px 6px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                  }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </Magnetic>

          {/* Animated 3-Line Hamburger Micro-interaction Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brown)',
              backgroundColor: isMobileMenuOpen ? 'var(--cream-dark)' : 'rgba(237, 227, 212, 0.55)',
              border: isMobileMenuOpen ? '1px solid var(--terracotta)' : '1px solid rgba(229, 213, 193, 0.5)',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isMobileMenuOpen ? '0 0 0 3px rgba(201, 130, 103, 0.2)' : 'none',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* 3 Morphing Hamburger Lines (Smooth Spring Transition to X) */}
            <div
              style={{
                width: '16px',
                height: '13px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: '16px',
                  height: '2px',
                  backgroundColor: isMobileMenuOpen ? 'var(--terracotta-dark)' : 'var(--brown)',
                  borderRadius: '2px',
                  transition: 'all 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
                  transformOrigin: 'center',
                  transform: isMobileMenuOpen ? 'translateY(5.5px) rotate(45deg)' : 'translateY(0) rotate(0)',
                }}
              />
              <span
                style={{
                  display: 'block',
                  width: isMobileMenuOpen ? '0px' : '16px',
                  height: '2px',
                  backgroundColor: 'var(--brown)',
                  borderRadius: '2px',
                  opacity: isMobileMenuOpen ? 0 : 1,
                  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isMobileMenuOpen ? 'scaleX(0)' : 'scaleX(1)',
                }}
              />
              <span
                style={{
                  display: 'block',
                  width: '16px',
                  height: '2px',
                  backgroundColor: isMobileMenuOpen ? 'var(--terracotta-dark)' : 'var(--brown)',
                  borderRadius: '2px',
                  transition: 'all 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
                  transformOrigin: 'center',
                  transform: isMobileMenuOpen ? 'translateY(-5.5px) rotate(-45deg)' : 'translateY(0) rotate(0)',
                }}
              />
            </div>
          </button>
        </div>
      </header>

      {/* Animated Mobile Menu Drawer with Smooth Spring Micro-interactions */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            style={{
              pointerEvents: 'auto',
              maxWidth: 'min(100%, 1400px)',
              margin: '8px auto 0 auto',
              backgroundColor: 'rgba(251, 247, 240, 0.97)',
              backdropFilter: 'blur(32px) saturate(190%)',
              WebkitBackdropFilter: 'blur(32px) saturate(190%)',
              border: '1.5px solid rgba(255, 255, 255, 0.9)',
              borderRadius: 'var(--radius-xl)',
              padding: '16px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '0 24px 50px rgba(91, 64, 42, 0.18), 0 4px 14px rgba(91, 64, 42, 0.08)',
              overflow: 'hidden',
            }}
          >
            {/* Primary Nav Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { to: '/', label: 'Home', icon: Compass },
                { to: '/shop', label: 'Shop All Presets & Assets', icon: Sparkles },
                { to: '/collections', label: 'Collections', icon: FolderKanban, badge: 'New' },
              ].map((item, idx) => {
                const isActive = location.pathname === item.to;
                const IconComp = item.icon;
                return (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.2 }}
                  >
                    <Link
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.98rem',
                        fontWeight: 700,
                        color: isActive ? '#ffffff' : 'var(--brown)',
                        backgroundColor: isActive ? 'var(--brown)' : 'transparent',
                        textDecoration: 'none',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <IconComp size={18} color={isActive ? 'var(--terracotta-light)' : 'var(--terracotta)'} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            backgroundColor: isActive ? 'var(--terracotta)' : 'var(--terracotta-light)',
                            color: isActive ? '#ffffff' : 'var(--terracotta-dark)',
                            padding: '2px 7px',
                            borderRadius: '6px',
                            fontWeight: 800,
                          }}
                        >
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight size={16} opacity={0.6} />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Category Chips Grid */}
            <div
              style={{
                marginTop: '4px',
                marginBottom: '4px',
                padding: '10px 12px',
                backgroundColor: 'rgba(237, 227, 212, 0.45)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(229, 213, 193, 0.5)',
              }}
            >
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Browse Categories
              </span>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '6px',
                }}
              >
                {CATEGORIES.map((cat) => {
                  const isCatActive = location.pathname === `/collections/${cat.slug}`;
                  return (
                    <Link
                      key={cat.id}
                      to={`/collections/${cat.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '7px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.84rem',
                        fontWeight: isCatActive ? 800 : 600,
                        color: isCatActive ? 'var(--terracotta-dark)' : 'var(--brown)',
                        backgroundColor: isCatActive ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                        border: isCatActive ? '1px solid var(--terracotta-light)' : '1px solid rgba(255, 255, 255, 0.7)',
                        textDecoration: 'none',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      <img src={cat.iconImage} alt="" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Secondary Pages (About / Contact) */}
            <div style={{ display: 'flex', gap: '8px', paddingTop: '2px' }}>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: location.pathname === '/about' ? '#ffffff' : 'var(--brown)',
                  backgroundColor: location.pathname === '/about' ? 'var(--brown)' : 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(229, 213, 193, 0.4)',
                  textDecoration: 'none',
                }}
              >
                <Info size={15} />
                <span>About</span>
              </Link>

              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: location.pathname === '/contact' ? '#ffffff' : 'var(--brown)',
                  backgroundColor: location.pathname === '/contact' ? 'var(--brown)' : 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(229, 213, 193, 0.4)',
                  textDecoration: 'none',
                }}
              >
                <MessageSquare size={15} />
                <span>Contact</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes dropScale {
          from { opacity: 0; transform: translate(-50%, -8px) scale(0.96); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }

        .dynamic-island-nav {
          height: 62px;
          padding-left: 22px;
          padding-right: 16px;
        }
        .nav-action-btn.search-btn,
        .nav-action-btn.wishlist-btn {
          width: 40px;
          height: 40px;
        }
        .nav-action-btn.cart-btn {
          padding: 8px 16px;
          border-radius: var(--radius-full);
        }

        @media (max-width: 960px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }

        @media (max-width: 768px) {
          .header-sticky-wrapper {
            top: 8px !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          .dynamic-island-nav {
            height: 50px !important;
            padding-left: 12px !important;
            padding-right: 10px !important;
            box-shadow: 0 8px 24px rgba(91, 64, 42, 0.08) !important;
          }
          .header-logo-icon {
            width: 28px !important;
            height: 28px !important;
          }
          .header-logo-dot {
            width: 8px !important;
            height: 8px !important;
          }
          .header-logo-text {
            font-size: 1.05rem !important;
            letter-spacing: -0.02em !important;
          }
          .header-actions {
            gap: 5px !important;
          }
          .nav-action-btn.search-btn,
          .nav-action-btn.wishlist-btn {
            width: 32px !important;
            height: 32px !important;
          }
          .nav-action-btn.search-btn svg,
          .nav-action-btn.wishlist-btn svg {
            width: 15px !important;
            height: 15px !important;
          }
          .nav-action-btn.cart-btn {
            width: 32px !important;
            height: 32px !important;
            padding: 0 !important;
            border-radius: 50% !important;
            justify-content: center !important;
          }
          .nav-action-btn.cart-btn svg {
            width: 15px !important;
            height: 15px !important;
          }
          .cart-text {
            display: none !important;
          }
          .cart-badge {
            position: absolute !important;
            top: -3px !important;
            right: -3px !important;
            padding: 1px 4px !important;
            font-size: 0.62rem !important;
          }
          .mobile-menu-btn {
            width: 32px !important;
            height: 32px !important;
          }
        }

        .mobile-menu-btn:active {
          transform: scale(0.88) !important;
        }

        .nav-action-btn:active {
          transform: scale(0.90) !important;
        }

        @media (max-width: 400px) {
          .header-logo-text {
            font-size: 0.96rem !important;
          }
        }
      `}</style>
    </div>
  );
};
