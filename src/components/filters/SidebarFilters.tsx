import React from 'react';
import { Star, RotateCcw } from 'lucide-react';

interface SidebarFiltersProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedCompat: string[];
  onToggleCompat: (compat: string) => void;
  maxPrice: number;
  onPriceChange: (val: number) => void;
  minRating: number;
  onRatingChange: (val: number) => void;
  onClearAll: () => void;
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedCompat,
  onToggleCompat,
  maxPrice,
  onPriceChange,
  minRating,
  onRatingChange,
  onClearAll,
}) => {
  const compatOptions = [
    { id: 'Lightroom (XMP)', label: 'Lightroom (XMP)' },
    { id: 'Lightroom Classic', label: 'Lightroom Classic' },
    { id: 'Photoshop (ACR)', label: 'Photoshop (ACR)' },
    { id: 'Mobile (DNG)', label: 'Mobile (DNG)' },
  ];

  const categoryOptions = [
    'All',
    'Portrait',
    'Travel',
    'Cinematic',
    'Moody',
    'Film',
    'Vintage',
    'Black & White',
    'Wedding',
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
    >
      {/* Filter Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brown)' }}>Filter</h3>
        <button
          onClick={onClearAll}
          style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'var(--terracotta)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <RotateCcw size={12} /> Clear All
        </button>
      </div>

      {/* Compatibility */}
      <div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '12px' }}>
          Compatibility
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {compatOptions.map((opt) => {
            const isChecked = selectedCompat.includes(opt.id);
            return (
              <label
                key={opt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  color: isChecked ? 'var(--brown-dark)' : 'var(--muted)',
                  cursor: 'pointer',
                  fontWeight: isChecked ? 600 : 400,
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleCompat(opt.id)}
                  style={{
                    accentColor: 'var(--brown)',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                  }}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Category List */}
      <div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '12px' }}>
          Category
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {categoryOptions.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <label
                key={cat}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  color: isSelected ? 'var(--brown-dark)' : 'var(--muted)',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                <input
                  type="radio"
                  name="subCategory"
                  checked={isSelected}
                  onChange={() => onSelectCategory(cat)}
                  style={{
                    accentColor: 'var(--brown)',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                  }}
                />
                <span>{cat}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brown)' }}>Price</h4>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brown)' }}>
            Up to ${maxPrice}
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="50"
          value={maxPrice}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          style={{
            width: '100%',
            accentColor: 'var(--brown)',
            cursor: 'pointer',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>
          <span>$10</span>
          <span>$50+</span>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '10px' }}>
          Rating
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[4.8, 4.5, 4.0].map((rate) => (
            <button
              key={rate}
              onClick={() => onRatingChange(minRating === rate ? 0 : rate)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: minRating === rate ? 'var(--cream-dark)' : 'transparent',
                border: minRating === rate ? '1px solid var(--border)' : '1px solid transparent',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    fill={i < Math.floor(rate) ? 'var(--gold)' : 'transparent'}
                    color="var(--gold)"
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--brown)' }}>
                {rate}+ & up
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* "Save More with Bundles" Promo Box */}
      <div
        style={{
          padding: '20px 18px',
          backgroundColor: 'var(--cream-light)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-clay)',
          position: 'relative',
          overflow: 'hidden',
          marginTop: '10px',
        }}
      >
        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '4px' }}>
          Save more with Bundles
        </h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '14px', lineHeight: 1.4 }}>
          Get premium preset & LUT bundles at special discounted bundle prices.
        </p>
        <button
          onClick={() => onSelectCategory('Cinematic')}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.82rem' }}
        >
          Explore Bundles
        </button>
      </div>
    </div>
  );
};
