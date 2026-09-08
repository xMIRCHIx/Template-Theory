import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronsLeftRight, Sparkles } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatio?: string;
  fallbackImage?: string;
  fitMode?: 'cover' | 'contain';
  style?: React.CSSProperties;
  className?: string;
}

const DEFAULT_FALLBACK = '';

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
  aspectRatio = 'auto',
  fallbackImage = DEFAULT_FALLBACK,
  fitMode = 'contain',
  style: customStyle,
  className,
}) => {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const [beforeError, setBeforeError] = useState(false);
  const [afterError, setAfterError] = useState(false);
  const [naturalAspect, setNaturalAspect] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Reset errors when image props change
  useEffect(() => {
    setBeforeError(false);
    setAfterError(false);
  }, [beforeImage, afterImage]);

  // Clean up any pending RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const activeBefore = beforeError ? (fallbackImage || afterImage) : (beforeImage || fallbackImage);
  const activeAfter = afterError ? (fallbackImage || beforeImage) : (afterImage || fallbackImage);

  // Automatically detect the image's original dimensions so no cropping occurs
  useEffect(() => {
    const src = activeAfter || activeBefore;
    if (!src) return;

    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setNaturalAspect(`${img.naturalWidth} / ${img.naturalHeight}`);
      }
    };
    img.src = src;
  }, [activeAfter, activeBefore]);

  const resolvedAspect = (aspectRatio === 'auto' || !aspectRatio)
    ? (naturalAspect || '16 / 9')
    : aspectRatio;

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pos = ((clientX - rect.left) / rect.width) * 100;
      setSliderPos(Math.max(0, Math.min(100, pos)));
      rafRef.current = null;
    });
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    handleMove(e.clientX);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: resolvedAspect,
        maxHeight: 'min(82vh, 720px)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        userSelect: 'none',
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow-clay)',
        touchAction: 'pan-y', // Natural vertical page scrolling on mobile
        backgroundColor: '#120f0d',
        transition: 'aspect-ratio 0.25s ease',
        transform: 'translateZ(0)', // Force GPU layer
        ...customStyle,
      }}
    >
      {/* ========================================================================= */}
      {/* 0. SOFT AMBIENT BACKDROP (Single GPU-Accelerated Layer)                    */}
      {/* ========================================================================= */}
      {activeAfter && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-10%',
            width: '120%',
            height: '120%',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
            transform: 'translateZ(0)',
          }}
        >
          <img
            src={activeAfter}
            alt=""
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(22px) brightness(0.6)',
              opacity: 0.35,
              transform: 'scale(1.1)',
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. BACKGROUND: AFTER IMAGE                                                */}
      {/* ========================================================================= */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: 'transparent',
          zIndex: 1,
        }}
      >
        <img
          src={activeAfter}
          alt={afterLabel}
          loading="eager"
          decoding="async"
          onError={() => setAfterError(true)}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            objectFit: fitMode,
            objectPosition: 'center',
            display: 'block',
            pointerEvents: 'none',
            zIndex: 1,
            imageRendering: 'auto',
            transform: 'translateZ(0)',
          }}
        />
      </div>

      {/* ========================================================================== */}
      {/* 2. FOREGROUND: BEFORE IMAGE (Clipped GPU Layer)                            */}
      {/* ========================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
          WebkitClipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
          pointerEvents: 'none',
          overflow: 'hidden',
          backgroundColor: 'transparent',
          zIndex: 2,
          willChange: 'clip-path',
          transform: 'translateZ(0)',
        }}
      >
        <img
          src={activeBefore}
          alt={beforeLabel}
          loading="eager"
          decoding="async"
          onError={() => setBeforeError(true)}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            objectFit: fitMode,
            objectPosition: 'center',
            display: 'block',
            pointerEvents: 'none',
            zIndex: 1,
            imageRendering: 'auto',
            transform: 'translateZ(0)',
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE DIVIDER HANDLE (Touch-friendly & Precision EW-Resize)      */}
      {/* ========================================================================= */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${sliderPos}%`,
          width: '56px',
          transform: 'translateX(-50%)',
          cursor: 'ew-resize',
          zIndex: 10,
          touchAction: 'none', // Only this handle captures horizontal dragging
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className="slider-handle-zone"
        aria-label="Drag slider to compare before and after looks"
      >
        {/* Center Vertical Divider Line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: '3px',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 12px rgba(0, 0, 0, 0.65), 0 0 4px rgba(255, 255, 255, 0.8)',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        />

        {/* Handle Knob with Glass Texture & Clay Glow */}
        <div
          style={{
            position: 'relative',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: '2.5px solid var(--cream-dark)',
            boxShadow: isDragging
              ? '0 6px 24px rgba(0, 0, 0, 0.6), 0 0 0 4px rgba(201, 130, 103, 0.55)'
              : '0 4px 18px rgba(0, 0, 0, 0.45), 0 0 0 2px rgba(255, 255, 255, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDragging ? 'var(--terracotta-dark)' : 'var(--brown)',
            pointerEvents: 'none',
            transform: isDragging ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease, color 0.15s ease',
          }}
        >
          <ChevronsLeftRight size={20} strokeWidth={2.5} />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BEFORE & AFTER FLOATING BADGES                                        */}
      {/* ========================================================================= */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          backgroundColor: 'rgba(24, 19, 16, 0.78)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: 'var(--white)',
          fontSize: '0.72rem',
          fontWeight: 800,
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          letterSpacing: '0.06em',
          pointerEvents: 'none',
          zIndex: 6,
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        {beforeLabel}
      </div>

      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: 'rgba(24, 19, 16, 0.78)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: 'var(--white)',
          fontSize: '0.72rem',
          fontWeight: 800,
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          letterSpacing: '0.06em',
          pointerEvents: 'none',
          zIndex: 6,
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <Sparkles size={11} color="var(--terracotta-light)" />
        {afterLabel}
      </div>
    </div>
  );
};

