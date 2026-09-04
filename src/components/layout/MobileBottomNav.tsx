import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Search, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface MobileBottomNavProps {
  onOpenSearch: () => void;
  onOpenWishlist: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenSearch,
  onOpenWishlist,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();

  // Hide on checkout / order success pages to avoid distracting user
  const isCheckoutFlow = location.pathname === '/checkout' || location.pathname === '/order-success';
  if (isCheckoutFlow) return null;

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      isActive: location.pathname === '/',
      onClick: () => navigate('/'),
    },
    {
      id: 'collections',
      label: 'Explore',
      icon: Compass,
      isActive: location.pathname.startsWith('/collections') || location.pathname === '/shop',
      onClick: () => navigate('/collections'),
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      isActive: false,
      onClick: onOpenSearch,
    },
    {
      id: 'wishlist',
      label: 'Saved',
      icon: Heart,
      isActive: false,
      badge: wishlistCount,
      onClick: onOpenWishlist,
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingBag,
      isActive: false,
      badge: totalItems,
      onClick: () => setIsCartOpen(true),
      isPrimary: true,
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '12px',
        left: '12px',
        right: '12px',
        zIndex: 990,
        display: 'none', // Shown on mobile via CSS class
      }}
      className="mobile-bottom-dock"
    >
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          backgroundColor: 'rgba(251, 247, 240, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(229, 213, 193, 0.75)',
          borderRadius: '26px',
          boxShadow: '0 12px 36px rgba(91, 64, 42, 0.18), 0 2px 8px rgba(0,0,0,0.06)',
          padding: '6px 8px',
          maxWidth: '460px',
          margin: '0 auto',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              aria-label={item.label}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 12px',
                borderRadius: '18px',
                color: isActive ? 'var(--brown)' : 'var(--muted)',
                backgroundColor: isActive ? 'rgba(237, 227, 212, 0.7)' : 'transparent',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                minWidth: '56px',
              }}
              className="mobile-nav-btn"
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  color={isActive ? 'var(--brown-dark)' : 'var(--muted)'}
                />
                {item.badge && item.badge > 0 ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-10px',
                      backgroundColor: 'var(--terracotta)',
                      color: 'var(--white)',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      width: '17px',
                      height: '17px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(201, 130, 103, 0.4)',
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: isActive ? 800 : 600,
                  marginTop: '2px',
                  color: isActive ? 'var(--brown-dark)' : 'var(--muted)',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .mobile-bottom-dock {
            display: block !important;
          }
          body {
            padding-bottom: 74px !important;
          }
        }
        .mobile-nav-btn:active {
          transform: scale(0.92);
        }
      `}</style>
    </div>
  );
};
