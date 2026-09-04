import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export interface FloatingClayPropProps {
  src: string;
  alt?: string;
  size?: number | string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  rotate?: number;
  zIndex?: number;
  opacity?: number;
  blur?: string;
  floatDuration?: number;
  parallaxFactor?: number;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const FloatingClayProp: React.FC<FloatingClayPropProps> = ({
  src,
  alt = 'Clay 3D Element',
  size = 90,
  top,
  bottom,
  left,
  right,
  rotate = 0,
  zIndex = 1,
  opacity = 0.85,
  blur = 'none',
  floatDuration = 6,
  parallaxFactor = 15,
  interactive = true,
  className = '',
  style = {},
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 60, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 15 });
  const springRotate = useSpring(rotate, { stiffness: 100, damping: 12 });

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const normalizedX = (e.clientX / innerWidth - 0.5) * 2;
      const normalizedY = (e.clientY / innerHeight - 0.5) * 2;

      mouseX.set(normalizedX * parallaxFactor);
      mouseY.set(normalizedY * parallaxFactor);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive, parallaxFactor, mouseX, mouseY]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        top,
        bottom,
        left,
        right,
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        zIndex,
        pointerEvents: interactive ? 'auto' : 'none',
        x: springX,
        y: springY,
        rotate: springRotate,
        filter: `drop-shadow(0 16px 28px rgba(96, 68, 46, 0.2)) ${blur !== 'none' ? `blur(${blur})` : ''}`,
        opacity,
        willChange: 'transform',
        ...style,
      }}
      className={`floating-clay-prop ${className}`}
      whileHover={
        interactive
          ? {
              scale: 1.18,
              rotate: rotate + 12,
              filter: 'drop-shadow(0 24px 36px rgba(201, 130, 103, 0.38))',
              transition: { type: 'spring', stiffness: 300, damping: 10 },
            }
          : undefined
      }
      whileTap={
        interactive
          ? {
              scale: 0.92,
              rotate: rotate - 15,
            }
          : undefined
      }
    >
      <motion.img
        src={src}
        alt={alt}
        animate={{
          y: [-8, 10, -8],
          rotate: [rotate - 3, rotate + 4, rotate - 3],
        }}
        transition={{
          duration: floatDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          userSelect: 'none',
          display: 'block',
          cursor: interactive ? 'grab' : 'default',
        }}
        draggable={false}
      />
    </motion.div>
  );
};
