import { useEffect, useRef, useState, useCallback } from 'react';

export interface ParallaxOffsets {
  sceneRotateX: number;
  sceneRotateY: number;
  bgX: number;
  bgY: number;
  presetsX: number;
  presetsY: number;
  presetsRot: number;
  lutsX: number;
  lutsY: number;
  lutsRot: number;
  psdsX: number;
  psdsY: number;
  psdsRot: number;
  albumsX: number;
  albumsY: number;
  albumsRot: number;
  cubeX: number;
  cubeY: number;
  cubeRot: number;
  cameraX: number;
  cameraY: number;
  cameraRot: number;
  fontX: number;
  fontY: number;
  fontRot: number;
  toolX: number;
  toolY: number;
  toolRot: number;
}

const DEFAULT_OFFSETS: ParallaxOffsets = {
  sceneRotateX: 0,
  sceneRotateY: 0,
  bgX: 0,
  bgY: 0,
  presetsX: 0,
  presetsY: 0,
  presetsRot: 0,
  lutsX: 0,
  lutsY: 0,
  lutsRot: 0,
  psdsX: 0,
  psdsY: 0,
  psdsRot: 0,
  albumsX: 0,
  albumsY: 0,
  albumsRot: 0,
  cubeX: 0,
  cubeY: 0,
  cubeRot: 0,
  cameraX: 0,
  cameraY: 0,
  cameraRot: 0,
  fontX: 0,
  fontY: 0,
  fontRot: 0,
  toolX: 0,
  toolY: 0,
  toolRot: 0,
};

export const useHeroParallax = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [offsets, setOffsets] = useState<ParallaxOffsets>(DEFAULT_OFFSETS);
  const targetRef = useRef({ x: 0, y: 0, isHovered: false });
  const currentRef = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);
  const idleAngle = useRef(0);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 to 1
    targetRef.current = {
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
      isHovered: true,
    };
  }, []);

  const handlePointerLeave = useCallback(() => {
    targetRef.current = { x: 0, y: 0, isHovered: false };
  }, []);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const animate = () => {
      idleAngle.current += 0.015;
      const idleX = Math.sin(idleAngle.current) * 0.12;
      const idleY = Math.cos(idleAngle.current * 0.8) * 0.12;

      // Spring lerp factor: faster when hovered, gentle return when left
      const lerp = targetRef.current.isHovered ? 0.07 : 0.035;

      const targetX = targetRef.current.isHovered ? targetRef.current.x : idleX;
      const targetY = targetRef.current.isHovered ? targetRef.current.y : idleY;

      currentRef.current.x += (targetX - currentRef.current.x) * lerp;
      currentRef.current.y += (targetY - currentRef.current.y) * lerp;

      const nx = currentRef.current.x;
      const ny = currentRef.current.y;

      // Calculate layered offsets as per animation.md specifications
      setOffsets({
        sceneRotateX: -ny * 3.0, // Max ±3deg
        sceneRotateY: nx * 4.0,  // Max ±4deg

        bgX: nx * 4,
        bgY: ny * 4,

        presetsX: nx * 14 * 0.7,
        presetsY: ny * 12 * 0.7,
        presetsRot: nx * 1.5 * 0.7,

        lutsX: nx * 18 * 0.9,
        lutsY: ny * 15 * 0.9,
        lutsRot: -nx * 2.0 * 0.9,

        psdsX: nx * 12 * 0.6,
        psdsY: ny * 10 * 0.6,
        psdsRot: nx * 1.2 * 0.6,

        albumsX: nx * 15 * 0.8,
        albumsY: ny * 14 * 0.8,
        albumsRot: -nx * 1.6 * 0.8,

        cubeX: nx * 22 * 1.1,
        cubeY: ny * 18 * 1.1,
        cubeRot: nx * 3.0 * 1.1,

        cameraX: nx * 10 * 0.5,
        cameraY: ny * 8 * 0.5,
        cameraRot: nx * 0.8 * 0.5,

        fontX: nx * 14 * 0.75,
        fontY: ny * 12 * 0.75,
        fontRot: -nx * 1.4 * 0.75,

        toolX: nx * 16 * 0.85,
        toolY: ny * 14 * 0.85,
        toolRot: nx * 2.0 * 0.85,
      });

      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  return {
    containerRef,
    offsets,
    handlePointerMove,
    handlePointerLeave,
  };
};
