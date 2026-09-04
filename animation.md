# ClayDigital — Animation Specification

## Core Concept
The hero is ONE aligned composition:
- background organic clay blob stays behind
- decorative lines/dots stay in the background
- Presets, LUTs, PSDs, Albums, `.cube`, Camera sit above it
- all objects are positioned inside one `.hero-scene`, never against the viewport

## Layering
```text
Background z: 0
Decorations z: 10
Albums z: 20
Presets z: 30
LUTs z: 35
Camera z: 40
PSDs z: 45
Cube z: 50
```

## Scene
```css
.hero-scene {
  position: relative;
  width: min(100%, 680px);
  aspect-ratio: 1 / .82;
  transform-style: preserve-3d;
}
.scene-product {
  position: absolute;
  transform-style: preserve-3d;
}
```

Keep the original visual arrangement at all times. Products should overlap slightly but remain readable.

## Cursor Parallax
Track pointer relative to `.hero-scene`, normalize X/Y from -1 to +1.

Strength:
- background: 0.10
- decorations: 0.35
- products: 0.65
- foreground: 1.0

Maximum scene tilt:
- rotateX ±3deg
- rotateY ±4deg
Never exceed ±5deg / ±6deg.

Use smoothing / spring interpolation. Do not update React state on every pointer event.

## Individual Wobble
Different objects react differently:
- Presets 0.7
- LUTs 0.9
- PSDs 0.6
- Albums 0.8
- Cube 1.1
- Camera 0.5

Movement should be tiny and physical-looking, not floating wildly.

## Idle
When cursor is inactive:
- 0.5–1.5px movement
- 0.2–0.5deg rotation
- 4–7 second cycle

Almost imperceptible.

## Hover
Hovered object:
- scale ~1.025
- translateZ 10–14px
- tiny 0.5–1deg rotation
- slightly stronger shadow

Other objects barely react.

## Mouse Leave
Return smoothly to original positions over 600–900ms. Never snap.

## Mobile
Disable pointer parallax on touch devices. Keep the composition static or use extremely subtle idle motion.

## Reduced Motion
For `prefers-reduced-motion: reduce`:
- disable parallax
- disable wobble
- disable idle movement
- retain only simple opacity/color transitions

## Scroll Reveals
Below-hero sections:
`opacity 0 → 1` and `translateY 20px → 0`, 500–700ms, preferably using IntersectionObserver. Animate groups, not every tiny element.

## Cards
Category/product hover:
- lift 3–4px
- icon/image lift 3–5px
- subtle shadow increase

No spinning 3D cards, cursor trails, neon glow or aggressive parallax.

## Performance
Use `requestAnimationFrame`, refs/mutable values, and GPU-friendly `transform`/`opacity`. Avoid continuous layout-property animation.

## Suggested Architecture
```text
HeroScene
 ├── HeroSceneController
 ├── SceneBackground
 ├── SceneProduct
 ├── SceneDecoration
 └── useHeroParallax()
```

Central config:
```ts
{
  sceneRotateX: 3,
  sceneRotateY: 4,
  backgroundStrength: .10,
  decorationStrength: .35,
  productStrength: .65,
  foregroundStrength: 1,
  hoverScale: 1.025,
  hoverZ: 12,
  idleDuration: 6000,
  returnDuration: 750
}
```

Target feeling:
**“A carefully arranged pile of clay objects sitting on a soft paper surface, reacting naturally to my cursor.”**
