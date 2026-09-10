import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-md, 12px)',
  style,
  className = '',
}) => {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        display: 'block',
        ...style,
      }}
    />
  );
};

// 1. Single Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--cream-light)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-clay)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Thumbnail Aspect Box */}
      <div style={{ aspectRatio: '1 / 1', width: '100%', padding: '12px' }}>
        <Skeleton width="100%" height="100%" borderRadius="var(--radius-md)" />
      </div>

      {/* Card Content */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width="60px" height="18px" borderRadius="4px" />
          <Skeleton width="45px" height="14px" borderRadius="4px" />
        </div>

        <Skeleton width="85%" height="22px" borderRadius="6px" />
        <Skeleton width="55%" height="16px" borderRadius="4px" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
          <Skeleton width="75px" height="24px" borderRadius="6px" />
          <Skeleton width="38px" height="38px" borderRadius="var(--radius-md)" />
        </div>
      </div>
    </div>
  );
};

// 2. Product Detail Page Skeleton (Split screen with before/after gallery & buying column)
export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', paddingBottom: '80px', paddingTop: '20px' }}>
      <div className="container">
        {/* Breadcrumb Skeleton */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <Skeleton width="50px" height="16px" borderRadius="4px" />
          <Skeleton width="12px" height="16px" borderRadius="2px" />
          <Skeleton width="80px" height="16px" borderRadius="4px" />
          <Skeleton width="12px" height="16px" borderRadius="2px" />
          <Skeleton width="140px" height="16px" borderRadius="4px" />
        </div>

        {/* 2-Column Split Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.18fr 1fr',
            gap: '40px',
            alignItems: 'start',
          }}
          className="pdp-split-grid"
        >
          {/* Left Media / Slider Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Skeleton
              width="100%"
              height="480px"
              borderRadius="var(--radius-xl)"
              style={{ maxHeight: 'min(82vh, 600px)', aspectRatio: '16 / 9' }}
            />
            {/* Thumbnail Row */}
            <div style={{ display: 'flex', gap: '10px', overflow: 'hidden' }}>
              <Skeleton width="72px" height="72px" borderRadius="12px" />
              <Skeleton width="72px" height="72px" borderRadius="12px" />
              <Skeleton width="72px" height="72px" borderRadius="12px" />
              <Skeleton width="72px" height="72px" borderRadius="12px" />
            </div>
          </div>

          {/* Right Product Buying Card */}
          <div
            style={{
              backgroundColor: 'var(--cream-light)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: 'var(--shadow-clay)',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <Skeleton width="90px" height="26px" borderRadius="var(--radius-full)" />
              <Skeleton width="70px" height="26px" borderRadius="var(--radius-full)" />
            </div>

            <Skeleton width="90%" height="38px" borderRadius="8px" />
            <Skeleton width="60%" height="20px" borderRadius="6px" />

            {/* Price Box */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', padding: '16px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
              <Skeleton width="110px" height="36px" borderRadius="8px" />
              <Skeleton width="70px" height="20px" borderRadius="6px" />
              <Skeleton width="80px" height="24px" borderRadius="var(--radius-full)" />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <Skeleton width="100%" height="52px" borderRadius="var(--radius-full)" />
              <Skeleton width="100%" height="48px" borderRadius="var(--radius-full)" />
            </div>

            {/* Feature Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              <Skeleton width="100%" height="40px" borderRadius="10px" />
              <Skeleton width="100%" height="40px" borderRadius="10px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Grid of Card Skeletons for Shop / Collections page
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '20px',
        width: '100%',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

// 4. Instant Top Route Progress Bar
export const RouteLoadingBar: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 99999,
        background: 'linear-gradient(90deg, var(--terracotta) 0%, #f5b02e 50%, var(--olive-dark) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmerPulse 1.2s ease-in-out infinite',
        boxShadow: '0 1px 8px rgba(201, 130, 103, 0.6)',
      }}
    />
  );
};
