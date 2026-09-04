import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useShopify } from '../../context/ShopifyContext';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ isOpen, onClose }) => {
  const { wishlist, toggleWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const { currencySymbol } = useShopify();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 200,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(79, 58, 41, 0.4)',
          backdropFilter: 'blur(4px)',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          backgroundColor: 'var(--cream-light)',
          borderLeft: '1px solid var(--border)',
          boxShadow: 'var(--shadow-floating)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 201,
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={20} color="var(--terracotta)" fill="var(--terracotta)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--brown)' }}>Saved Items</h3>
            <span
              style={{
                backgroundColor: 'var(--cream-dark)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--muted)',
              }}
            >
              {wishlistCount}
            </span>
          </div>
          <button onClick={onClose} aria-label="Close wishlist" style={{ color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {wishlist.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '14px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={28} color="var(--clay-dark)" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--brown)' }}>No saved items</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Click the heart icon on any product to save it for later.</p>
              </div>
            </div>
          ) : (
            wishlist.map((product) => (
              <div
                key={product.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  onClick={() => {
                    onClose();
                    navigate(`/product/${product.slug}`);
                  }}
                  style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', cursor: 'pointer' }}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4
                      onClick={() => {
                        onClose();
                        navigate(`/product/${product.slug}`);
                      }}
                      style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brown)', cursor: 'pointer' }}
                    >
                      {product.name}
                    </h4>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brown)' }}>
                      {currencySymbol}{product.price}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      onClick={() => {
                        addToCart(product);
                        onClose();
                      }}
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                    >
                      <ShoppingBag size={13} /> Add to Cart
                    </button>
                    <button
                      onClick={() => toggleWishlist(product)}
                      style={{ color: 'var(--muted)', padding: '4px' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
