import React, { useEffect, useRef } from 'react';

export const HeroScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Layer Refs for zero-lag 120 FPS GPU parallax
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const shadowRef = useRef<HTMLDivElement | null>(null);
  const presetsRef = useRef<HTMLDivElement | null>(null);
  const lutsRef = useRef<HTMLDivElement | null>(null);
  const cubeRef = useRef<HTMLDivElement | null>(null);
  const psdsRef = useRef<HTMLDivElement | null>(null);
  const albumsRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);
  const leafRef = useRef<HTMLDivElement | null>(null);
  const orangeCircleRef = useRef<HTMLDivElement | null>(null);
  const bgCircleRef = useRef<HTMLDivElement | null>(null);
  const toolRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let isHovered = false;
    let isVisible = true;
    let animId: number;
    let idleTime = 0;

    let cachedRect: DOMRect | null = null;

    const handlePointerEnter = () => {
      if (containerRef.current) {
        cachedRect = containerRef.current.getBoundingClientRect();
      }
      isHovered = true;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!cachedRect && containerRef.current) {
        cachedRect = containerRef.current.getBoundingClientRect();
      }
      if (!cachedRect) return;
      const x = ((e.clientX - cachedRect.left) / cachedRect.width) * 2 - 1;
      const y = ((e.clientY - cachedRect.top) / cachedRect.height) * 2 - 1;
      mouseX = Math.max(-1, Math.min(1, x));
      mouseY = Math.max(-1, Math.min(1, y));
      isHovered = true;
    };

    const handlePointerLeave = () => {
      mouseX = 0;
      mouseY = 0;
      isHovered = false;
      cachedRect = null;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('pointerenter', handlePointerEnter, { passive: true });
      container.addEventListener('pointermove', handlePointerMove, { passive: true });
      container.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    }

    // Pause animation when scrolled off-screen for 100% smooth page scroll
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );

    if (container) {
      observer.observe(container);
    }

    const updateFrame = () => {
      if (isVisible) {
        idleTime += 0.012;
        const idleX = Math.sin(idleTime) * 0.035;
        const idleY = Math.cos(idleTime * 0.8) * 0.035;

        const targetX = isHovered ? mouseX : idleX;
        const targetY = isHovered ? mouseY : idleY;

        // Silky smooth spring lerp
        currentX += (targetX - currentX) * 0.065;
        currentY += (targetY - currentY) * 0.065;

        const nx = currentX;
        const ny = currentY;

        // 1. Scene tilt (Subtle natural perspective)
        if (sceneRef.current) {
          sceneRef.current.style.transform = `rotateX(${-ny * 1.6}deg) rotateY(${nx * 2.0}deg)`;
        }

        // 2. Base Floor Shadow
        if (shadowRef.current) {
          shadowRef.current.style.transform = `translate3d(${nx * 1.5}px, ${ny * 1.0}px, 0px)`;
        }

        // 3. Background Splatter Blob
        if (bgRef.current) {
          bgRef.current.style.transform = `translate3d(${nx * 2}px, ${ny * 1.5}px, 0px)`;
        }

        // 4. Background Clay Sphere
        if (bgCircleRef.current) {
          bgCircleRef.current.style.transform = `translate3d(${nx * 2.5}px, ${ny * 1.8}px, 6px)`;
        }

        // 5. Plant Leaf (Far Right)
        if (leafRef.current) {
          leafRef.current.style.transform = `translate3d(${nx * 3}px, ${ny * 2}px, 10px) rotate(${nx * 0.4}deg)`;
        }

        // 6. LUTs Folder (Back Left)
        if (lutsRef.current) {
          lutsRef.current.style.transform = `translate3d(${nx * 3.5}px, ${ny * 2.5}px, 12px) rotate(${-nx * 0.3}deg)`;
        }

        // 7. PSDs Folder (Back Right)
        if (psdsRef.current) {
          psdsRef.current.style.transform = `translate3d(${nx * 4}px, ${ny * 2.8}px, 14px) rotate(${nx * 0.3}deg)`;
        }

        // 8. Cube Badge (Foreground on top of circle)
        if (cubeRef.current) {
          cubeRef.current.style.transform = `translate3d(${nx * 8}px, ${ny * 5.5}px, 34px) rotate(${nx * 0.8}deg)`;
        }

        // 9. Orange Sphere & Tool Rod
        if (orangeCircleRef.current) {
          orangeCircleRef.current.style.transform = `translate3d(${nx * 4.5}px, ${ny * 3.2}px, 18px)`;
        }

        if (toolRef.current) {
          toolRef.current.style.transform = `translate3d(${nx * 4.5}px, ${ny * 3.2}px, 18px) rotate(${-20 + nx * 0.4}deg)`;
        }

        // 10. Presets Folder (Front Left)
        if (presetsRef.current) {
          presetsRef.current.style.transform = `translate3d(${nx * 5.5}px, ${ny * 3.8}px, 24px) rotate(${nx * 0.3}deg)`;
        }

        // 11. Albums Folder (Front Right)
        if (albumsRef.current) {
          albumsRef.current.style.transform = `translate3d(${nx * 5.5}px, ${ny * 3.8}px, 26px) rotate(${-nx * 0.3}deg)`;
        }

        // 12. Camera (Front Center)
        if (cameraRef.current) {
          cameraRef.current.style.transform = `translate3d(${nx * 6.5}px, ${ny * 4.5}px, 32px) rotate(${nx * 0.2}deg)`;
        }
      }

      animId = requestAnimationFrame(updateFrame);
    };

    animId = requestAnimationFrame(updateFrame);

    return () => {
      cancelAnimationFrame(animId);
      if (container) {
        container.removeEventListener('pointerenter', handlePointerEnter);
        container.removeEventListener('pointermove', handlePointerMove);
        container.removeEventListener('pointerleave', handlePointerLeave);
        observer.unobserve(container);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="hero-scene-wrapper"
      style={{
        position: 'relative',
        width: 'min(100%, 700px)',
        aspectRatio: '1 / 0.62',
        perspective: '1400px',
        margin: '0 auto',
        userSelect: 'none',
        touchAction: 'pan-y',
        pointerEvents: 'auto',
      }}
    >
      {/* 3D Aligned Scene Container */}
      <div
        ref={sceneRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.08s ease-out',
        }}
      >
        {/* 1. Natural Soft Ground Contact Shadow */}
        <div
          ref={shadowRef}
          style={{
            position: 'absolute',
            bottom: '-4%',
            left: '12%',
            width: '76%',
            height: '22%',
            zIndex: 2,
            pointerEvents: 'none',
            willChange: 'transform',
            opacity: 0.95,
          }}
        >
          <img
            src="/assets/clay/shadow.png"
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 8px 16px rgba(96, 68, 46, 0.35)) blur(0.5px)',
            }}
          />
        </div>

        {/* 2. Background Organic Clay Blob (BG ELEMENT.png) */}
        <div
          ref={bgRef}
          style={{
            position: 'absolute',
            top: '0%',
            left: '0%',
            width: '100%',
            height: '100%',
            zIndex: 1,
            pointerEvents: 'none',
            willChange: 'transform',
          }}
        >
          <img
            src="/assets/clay/BG ELEMENT.png"
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 14px 28px rgba(96, 68, 46, 0.06))',
            }}
          />
        </div>

        {/* 3. Background Clay Ball (Brown sphere behind central gap) */}
        <div
          ref={bgCircleRef}
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '42%',
            width: '18%',
            zIndex: 3,
            pointerEvents: 'none',
            willChange: 'transform',
          }}
        >
          <div className="clay-hover-pop">
            <img
              src="/assets/clay/bg circle.png"
              alt=""
              style={{
                width: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 18px rgba(96, 68, 46, 0.16))',
              }}
            />
          </div>
        </div>

        {/* 4. Plant Leaf Vase & Leaves (Far Right) */}
        <div
          ref={leafRef}
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '68%',
            width: '23%',
            zIndex: 4,
            willChange: 'transform',
          }}
        >
          <div className="clay-hover-pop">
            <img
              src="/assets/clay/leaf.png"
              alt=""
              style={{
                width: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 14px 24px rgba(101, 109, 84, 0.22))',
              }}
            />
          </div>
        </div>

        {/* 5. LUTs Olive Green Folder (Back Left — Stacked behind Presets) */}
        <div
          ref={lutsRef}
          style={{
            position: 'absolute',
            bottom: '24%',
            left: '26%',
            width: '30%',
            zIndex: 6,
            willChange: 'transform',
          }}
        >
          <div className="clay-hover-pop">
            <img
              src="/assets/clay/LUTS.png"
              alt="LUTs Collection"
              style={{
                width: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 14px 24px rgba(101, 109, 84, 0.25))',
              }}
            />
          </div>
        </div>

        {/* 6. PSDs Terracotta Red Folder (Back Right — Stacked behind Albums) */}
        <div
          ref={psdsRef}
          style={{
            position: 'absolute',
            bottom: '16%',
            left: '48%',
            width: '30%',
            zIndex: 8,
            willChange: 'transform',
          }}
        >
          <div className="clay-hover-pop">
            <img
              src="/assets/clay/PSDS.png"
              alt="PSD Templates"
              style={{
                width: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 16px 26px rgba(201, 130, 103, 0.28))',
              }}
            />
          </div>
        </div>

        {/* 7. Cube Badge (.cube directly on top of orange ball) */}
        <div
          ref={cubeRef}
          style={{
            position: 'absolute',
            bottom: '18%',
            left: '42.5%',
            width: '14.5%',
            zIndex: 45,
            willChange: 'transform',
          }}
        >
          <div className="clay-hover-pop">
            <img
              src="/assets/clay/CUBE.png"
              alt="Cube Asset"
              style={{
                width: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 16px 28px rgba(127, 135, 106, 0.4))',
              }}
            />
          </div>
        </div>

        {/* 8. Slanted Clay Tool Rod (Leaning beside Orange sphere) */}
        <div
          ref={toolRef}
          style={{
            position: 'absolute',
            bottom: '2%',
            left: '49%',
            width: '8%',
            zIndex: 18,
            pointerEvents: 'none',
            willChange: 'transform',
          }}
        >
          <img
            src="/assets/clay/TOOL.png"
            alt=""
            style={{
              width: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 8px 14px rgba(96, 68, 46, 0.2))',
            }}
          />
        </div>

        {/* 9. Orange Clay Sphere (Center midground resting on floor) */}
        <div
          ref={orangeCircleRef}
          style={{
            position: 'absolute',
            bottom: '4%',
            left: '42%',
            width: '16%',
            zIndex: 20,
            willChange: 'transform',
          }}
        >
          <div className="clay-hover-pop">
            <img
              src="/assets/clay/orange circle.png"
              alt=""
              style={{
                width: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 12px 20px rgba(201, 130, 103, 0.32))',
              }}
            />
          </div>
        </div>

        {/* 10. Presets Folder (Front Left — Grounded flat on floor) */}
        <div
          ref={presetsRef}
          style={{
            position: 'absolute',
            bottom: '0%',
            left: '16%',
            width: '33%',
            zIndex: 25,
            willChange: 'transform',
          }}
        >
          <div className="clay-hover-pop">
            <img
              src="/assets/clay/PRESET.png"
              alt="Lightroom Presets"
              style={{
                width: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 18px 28px rgba(96, 68, 46, 0.28))',
              }}
            />
          </div>
        </div>

        {/* 11. Albums Folder (Front Right — Grounded flat on floor) */}
        <div
          ref={albumsRef}
          style={{
            position: 'absolute',
            bottom: '0%',
            left: '52%',
            width: '28%',
            zIndex: 30,
            willChange: 'transform',
          }}
        >
          <div className="clay-hover-pop">
            <img
              src="/assets/clay/ALBMUN PSD.png"
              alt="Photo Albums"
              style={{
                width: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 16px 26px rgba(101, 109, 84, 0.26))',
              }}
            />
          </div>
        </div>

        {/* 12. Video Camera (Front Center — Resting on floor in front of orange sphere) */}
        <div
          ref={cameraRef}
          style={{
            position: 'absolute',
            bottom: '0%',
            left: '39%',
            width: '14%',
            zIndex: 40,
            willChange: 'transform',
          }}
        >
          <div className="clay-hover-pop">
            <img
              src="/assets/clay/CAMERA.png"
              alt="Camera Asset"
              style={{
                width: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 16px 26px rgba(96, 68, 46, 0.35))',
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        .clay-hover-pop {
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), filter 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          transform-origin: center bottom;
          display: inline-block;
          width: 100%;
        }
        .clay-hover-pop:hover {
          transform: scale(1.06) translateY(-4px);
          filter: brightness(1.04) drop-shadow(0 20px 32px rgba(96, 68, 46, 0.36)) !important;
          z-index: 60 !important;
        }
        @media (max-width: 768px) {
          .hero-scene-wrapper {
            width: min(100%, 460px) !important;
            aspect-ratio: 1 / 0.64 !important;
            margin-top: 10px !important;
          }
        }
      `}</style>
    </div>
  );
};
