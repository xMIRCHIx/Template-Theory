import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { PRODUCTS as LOCAL_PRODUCTS } from '../../data/products';
import { Product } from '../../types';
import { useShopify } from '../../context/ShopifyContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { products, currencySymbol } = useShopify();
  const catalog = products.length > 0 ? products : LOCAL_PRODUCTS;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isOpen && (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        e.preventDefault();
      }
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    const handlePopState = () => {
      if (isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      window.history.pushState({ searchModal: true }, '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  const handleClose = () => {
    onClose();
    if (window.history.state?.searchModal) {
      window.history.back();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults(catalog.slice(0, 4));
    }
  }, [isOpen, catalog]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(catalog.slice(0, 4));
      return;
    }
    const q = query.toLowerCase();
    const filtered = catalog.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.compatibility.some((c) => c.toLowerCase().includes(q))
    );
    setResults(filtered);
  }, [query, catalog]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '60px',
        paddingLeft: '14px',
        paddingRight: '14px',
        boxSizing: 'border-box',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(54, 38, 25, 0.65)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Modal Box */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '620px',
          backgroundColor: 'var(--cream-light)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 60px -10px rgba(79, 58, 41, 0.35)',
          overflow: 'hidden',
          zIndex: 10000,
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--white)',
          }}
        >
          <Search size={20} color="var(--brown)" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search presets, LUTs, PSDs, fonts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '1rem',
              color: 'var(--brown)',
              fontWeight: 600,
              minWidth: 0,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', padding: '4px', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}

          {/* Close / Cross Button */}
          <button
            onClick={handleClose}
            aria-label="Close search"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--cream-light)',
              border: '1.5px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brown)',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--terracotta-light)';
              e.currentTarget.style.color = 'var(--terracotta-dark)';
              e.currentTarget.style.transform = 'scale(1.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--cream-light)';
              e.currentTarget.style.color = 'var(--brown)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>

        {/* Quick Filter Tags */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--cream)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={13} /> Popular:
          </span>
          {['Film Tone', 'Cinematic LUT', 'Social PSD', 'Display Serif', '3D Clay'].map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              style={{
                fontSize: '0.78rem',
                backgroundColor: 'var(--cream-light)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                padding: '3px 10px',
                color: 'var(--brown)',
                fontWeight: 500,
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '16px 24px' }}>
          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
              <p>No products found matching "{query}"</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onClose();
                    navigate(`/product/${product.slug}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '10px 14px',
                    backgroundColor: 'var(--white)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'var(--clay-dark)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                  }}
                >
                  <img
                    src={product.thumbnail}
                    alt=""
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-sm)',
                      objectFit: 'cover',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--terracotta)', fontWeight: 700, textTransform: 'uppercase' }}>
                        {product.category}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brown)' }}>{product.name}</h4>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brown)' }}>
                      {currencySymbol}{product.price}
                    </span>
                    <ArrowRight size={16} color="var(--muted)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
