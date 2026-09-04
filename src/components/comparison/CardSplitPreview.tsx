import React, { useState, useRef } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface CardSplitPreviewProps {
  beforeImage: string;
  afterImage: string;
  altText: string;
}

export const CardSplitPreview: React.FC<CardSplitPreviewProps> = ({ beforeImage, afterImage, altText }) => {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPos = ((e.clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(10, Math.min(90, newPos)));
  };

  const handlePointerLeave = () => {
    setPos(50);
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1.05',
        overflow: 'hidden',
        cursor: 'ew-resize',
        backgroundColor: 'var(--cream-dark)',
      }}
    >
      {/* After image (right / background) */}
      <img
        src={afterImage}
        alt={`${altText} after`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Before image (left / clipped) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${pos}%`,
          height: '100%',
          overflow: 'hidden',
          transition: 'width 0.1s ease-out',
        }}
      >
        <img
          src={beforeImage}
          alt={`${altText} before`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: containerRef.current ? `${containerRef.current.clientWidth}px` : '320px',
            height: '100%',
            maxWidth: 'none',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Divider */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${pos}%`,
          width: '2px',
          backgroundColor: 'var(--white)',
          boxShadow: '0 0 8px rgba(0,0,0,0.35)',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          transition: 'left 0.1s ease-out',
        }}
      >
        {/* Center Split Knob */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brown)',
          }}
        >
          <ChevronsLeftRight size={14} />
        </div>
      </div>
    </div>
  );
};
