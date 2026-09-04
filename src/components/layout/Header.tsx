import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Menu, X, ChevronDown, Sparkles } from 'lucide-react';
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
          <div
            className="header-logo-icon"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--clay) 0%, var(--terracotta) 100%)',
              boxShadow: '0 3px 12px rgba(201, 130, 103, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div
              className="header-logo-dot"
              style={{
                width: '11px',
                height: '11px',
                borderRadius: '50%',
                backgroundColor: 'var(--cream-light)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.18)',
              }}
            />
          </div>
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

          {/* Mobile Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brown)',
              backgroundColor: 'rgba(237, 227, 212, 0.5)',
              border: '1px solid rgba(229, 213, 193, 0.4)',
              borderRadius: '50%',
              cursor: 'pointer',
            }}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          style={{
            pointerEvents: 'auto',
            maxWidth: 'min(100%, 1400px)',
            margin: '8px auto 0 auto',
            backgroundColor: 'rgba(251, 247, 240, 0.96)',
            backdropFilter: 'blur(28px)',
            border: '1.5px solid rgba(255, 255, 255, 0.8)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 20px 45px rgba(91, 64, 42, 0.15)',
          }}
        >
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brown)' }}>Home</Link>
          <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brown)' }}>Shop</Link>
          <Link to="/collections" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brown)' }}>Collections</Link>
          <div style={{ paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {CATEGORIES.map((cat) => (
              <Link key={cat.id} to={`/collections/${cat.slug}`} onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 600 }}>
                • {cat.title}
              </Link>
            ))}
          </div>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brown)' }}>About</Link>
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brown)' }}>Contact</Link>
        </div>
      )}

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

        @media (max-width: 400px) {
          .header-logo-text {
            font-size: 0.96rem !important;
          }
        }
      `}</style>
    </div>
  );
};
