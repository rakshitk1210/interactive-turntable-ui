# Figma → Code: Changes Required

Reference design: [Figma — Updated UI for Turntable](https://www.figma.com/design/SDYZhfOGSjS2J5jleExLvs/Ideas?node-id=728-2965)

Screenshot of target state:

![Target Design](https://www.figma.com/api/mcp/asset/54ef75a0-b205-4519-9ead-646e7c732d50)

---

## Summary of Changes

| # | Area | Current | Target | Priority |
|---|------|---------|--------|----------|
| 1 | Background color | `#111111` | `#171818` | High |
| 2 | Title font | Generic `font-black` | `Alfa Slab One` (Google Font) | High |
| 3 | Title gradient | neutral-400 → neutral-700 | `white → #171818` | High |
| 4 | Chassis inner shadow | Missing | `inset 0px 0px 11px 11px rgba(152,152,152,0.26)` | Medium |
| 5 | Vinyl disks | Hand-coded SVG circles | Figma image assets | High |
| 6 | Tone arm rendering | SVG paths from imports | Single flat image asset | High |
| 7 | Play button inner circle | `bg-[#252527]` + SVG icon | Image assets (Ellipse20 + Elements) | Medium |
| 8 | Navigation button borders | `#252a2c` (near-invisible) | `#e7e8e9` (clearly visible) | High |
| 9 | Track info — title size | `text-2xl` | `text-[24px]` (same, but explicit) | Low |
| 10 | Track info — subtitle | `text-neutral-500 text-sm` | `text-white opacity-80 text-[16px]` | Medium |
| 11 | Track info — title format | `{title} by {artist}` | `{TITLE} by {artist}` (title uppercased) | Low |
| 12 | Footer opacity | No opacity | `opacity-50` on entire footer | Medium |
| 13 | Footer text color | `text-[#F2F5F7]` | `text-white` | Low |
| 14 | Pitch slider vertical line | CSS div `bg-[#b7b7b7]` | Image asset (`imgVector13`) | Low |
| 15 | Bug: `Track` type import | Circular import path | Define `Track` interface locally | Critical |
| 16 | Bug: Audio cleanup | Empty `return () => {}` | Pause and unload audio on unmount | Critical |

---

## 1. Background Color

**File:** `src/app/App.tsx`

```diff
- <div className="min-h-screen bg-[#111111] ...">
+ <div className="min-h-screen bg-[#171818] ...">
```

---

## 2 & 3. Title Font + Gradient

**File:** `src/app/App.tsx`

The title uses **Alfa Slab One** from Google Fonts. Add the font import to `index.html` or `index.css`.

```html
<!-- index.html <head> -->
<link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap" rel="stylesheet">
```

Then update the `<h1>` in `App.tsx`:

```diff
- <h1 className="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-b from-neutral-400 to-neutral-700 opacity-20 tracking-tighter leading-none mb-[-40px] z-0 select-none pointer-events-none">
+ <h1 className="text-[120px] font-['Alfa_Slab_One',sans-serif] text-transparent bg-clip-text bg-gradient-to-b from-white to-[#171818] to-[75.61%] leading-normal mb-[-40px] z-0 select-none pointer-events-none">
```

---

## 4. Chassis Inner Shadow

**File:** `src/app/components/turntable/Chassis.tsx`

The white chassis now has an inset shadow that gives it a physical rim/depth feel.

```diff
- <div className="absolute inset-0 bg-white rounded-[48px]" />
+ <div className="absolute inset-0 bg-white rounded-[48px] shadow-[inset_0px_0px_11px_11px_rgba(152,152,152,0.26)]" />
```

---

## 5. Vinyl Disk Layers — Replace SVG Circles with Image Assets

**File:** `src/app/components/turntable/Platter.tsx`

The Figma design now uses pre-rendered image assets for all vinyl disk layers instead of hand-coded SVG circles. This removes the need for all the inline `<svg>` + `<defs>` + `<filter>` blocks.

### New Asset URLs (from Figma, valid for 7 days — download and commit to `src/assets/`)

| Variable | Asset URL | Usage |
|----------|-----------|-------|
| `imgOuterDisk` | `https://www.figma.com/api/mcp/asset/8065c0c6-dc72-4591-b68b-a6a3a1a2cffc` | Gold outer rim ring (440.37px) |
| `imgDisk` | `https://www.figma.com/api/mcp/asset/d65aca08-1b42-4939-b4fc-2d113d31f000` | Main vinyl body (428.868px) |
| `imgDisk1` | `https://www.figma.com/api/mcp/asset/f4609342-28ea-4dd5-948d-f9d476a2cb92` | Groove ring 1 with inner shadow (353.282px) |
| `imgDisk2` | `https://www.figma.com/api/mcp/asset/60a9a343-72b7-429f-9e18-4e79b24b23c7` | Groove ring 2 with inner shadow (289.198px) |
| `imgDisk3` | `https://www.figma.com/api/mcp/asset/c16d5671-7e51-43c1-a45b-8c13ee9e80d9` | Center hub disk (57.511px) |
| `imgCenterPin` | `https://www.figma.com/api/mcp/asset/a08a297f-24a9-461f-960d-ea8b8eca5d2c` | Center spindle pin |
| `imgEllipse17` | `https://www.figma.com/api/mcp/asset/08d77634-22dd-42ee-b4ea-6d35d49fe7f3` | Center ellipse highlight (9.859px) |
| `imgImage51` | `https://www.figma.com/api/mcp/asset/54ef75a0-b205-4519-9ead-646e7c732d50` | Platter base / strobe ring (480px) — already in use |

### New Platter inner structure (the "This rotates" group):

Replace the entire vinyl assembly (Layers 1–7 + defs block) inside `Platter.tsx` with:

```tsx
{/* Outer disk (gold rim) */}
<div className="absolute left-[19.82px] top-[19.81px] size-[440.37px]">
  <img alt="" className="absolute block size-full" src={imgOuterDisk} />
</div>

{/* Main vinyl + groove rings + album cover */}
<div className="absolute left-[25.57px] top-[25.57px]">
  {/* Main vinyl body */}
  <div className="absolute left-0 top-0 size-[428.868px]">
    <img alt="" className="absolute block size-full" src={imgDisk} />
  </div>
  {/* Groove ring 1 */}
  <div className="absolute left-[37.79px] top-[37.79px] size-[353.282px]">
    <img alt="" className="absolute block size-full" src={imgDisk1} />
  </div>
  {/* Groove ring 2 */}
  <div className="absolute left-[69.84px] top-[69.83px] size-[289.198px]">
    <img alt="" className="absolute block size-full" src={imgDisk2} />
  </div>
  {/* Album cover */}
  <div className="absolute left-[108.45px] top-[108.45px] size-[211.969px] rounded-[211.757px] overflow-hidden">
    {track?.cover ? (
      <img
        src={track.cover}
        alt="Album Cover"
        className="absolute size-full object-cover"
        style={{ width: '317.889px', height: '258.444px', left: '-23.74px', top: '-18.23px', maxWidth: 'none' }}
      />
    ) : (
      <div className="w-full h-full bg-neutral-800" />
    )}
  </div>
  {/* Center hub disk */}
  <div className="absolute left-[185.68px] top-[185.68px] size-[57.511px]">
    <img alt="" className="absolute block size-full" src={imgDisk3} />
  </div>
  {/* Center pin */}
  <div className="absolute left-[209.5px] top-[209.5px] size-[9.859px]">
    <div className="absolute" style={{ inset: '-16.67% -100% -100% -16.67%' }}>
      <img alt="" className="block size-full" src={imgCenterPin} />
    </div>
  </div>
</div>

{/* Center ellipse highlight (does not rotate with platter) */}
<div className="absolute left-[235.08px] top-[235.07px] size-[9.859px]">
  <img alt="" className="absolute block size-full" src={imgEllipse17} />
</div>
```

> **Note:** The `imgEllipse17` (center highlight dot) should sit **outside** the rotating group so it stays stationary. Currently the center pin is inside the rotating group — move this element outside.

---

## 6. Tone Arm — Replace SVG Paths with Image Asset

**File:** `src/app/components/turntable/ToneArm.tsx`

The complex SVG path implementation (which references paths from `svg-s1u9gou7sr.ts`) should be replaced with a single flat image asset. The rotation, pivot logic, and drag interaction remain identical.

### New Asset

| Variable | Asset URL |
|----------|-----------|
| `imgFrame68` | `https://www.figma.com/api/mcp/asset/c8a2fb81-baa6-4697-8fdf-a68737d8932d` |

Download and save as `src/assets/tone-arm.png`.

### What changes in `ToneArm.tsx`:

Replace the entire `<svg>` block (the `<defs>`, static arm holder circle, and `<motion.g>` with all paths) with:

```tsx
{/* Static Arm Holder (background circle) — stays put */}
<div
  className="absolute rounded-full bg-[#F8F8F8]"
  style={{
    width: PIVOT_X * 2,
    height: PIVOT_X * 2,
    left: 0,
    top: 0,
    // The inner shadow from the original filter
    boxShadow: 'inset 0 0 10px 2px rgba(53,53,53,0.05)',
  }}
/>

{/* Rotating Arm Image */}
<motion.div
  id="Arm"
  initial={false}
  animate={{ rotate: rotationOffset }}
  style={{ originX: `${PIVOT_X}px`, originY: `${PIVOT_Y}px`, position: 'absolute', top: 0, left: 0 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
>
  <img
    src={imgFrame68}
    alt="Tone Arm"
    className="block"
    style={{ width: '194.562px', height: '459.783px', maxWidth: 'none' }}
    draggable={false}
  />
</motion.div>
```

The hit area div remains unchanged.

---

## 7. Play/Start Button — Inner Circle and Icon

**File:** `src/app/components/turntable/StartButton.tsx`

The Figma design uses image assets for the inner circle background and the play icon. The outer button shape and gradient background are unchanged.

### New Assets

| Variable | Asset URL | Usage |
|----------|-----------|-------|
| `imgEllipse20` | `https://www.figma.com/api/mcp/asset/51e2f203-d926-4794-a187-b69fc36d39a6` | Inner circle background glow (56px) |
| `imgElements` | `https://www.figma.com/api/mcp/asset/18288e1f-8ea7-48ec-81fe-69726c3ade93` | Play icon (inside 24px container) |

### What changes:

Replace the inner circle div:

```diff
- <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[56px] h-[56px] rounded-full bg-[#252527] flex items-center justify-center shadow-inner">
-   <div className="w-[24px] h-[24px] flex items-center justify-center">
-     {isPlaying ? (
-       <svg ...pause icon... />
-     ) : (
-       <svg ...play icon... />
-     )}
-   </div>
- </div>
+ <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[56px]">
+   <img alt="" className="absolute block size-full" src={imgEllipse20} />
+ </div>
+ <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[24px]">
+   {isPlaying ? (
+     <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
+       <path d={svgPaths.p1f46df00} fill="#4CC35B" />
+     </svg>
+   ) : (
+     <img alt="" className="absolute block size-full" style={{ inset: '15.62% 17.71%' }} src={imgElements} />
+   )}
+ </div>
```

> **Note:** The Figma only shows the play (stopped) state using `imgElements`. Keep the existing green SVG pause icon for the playing state since that state isn't in this Figma frame.

---

## 8. Navigation Button Borders

**File:** `src/app/components/turntable/NavigationButtons.tsx`

The current border color `#252a2c` is nearly invisible against the dark `#171818` background. The Figma specifies `#e7e8e9` (light grey), which matches the design system's `--border/borderprimary` token.

```diff
- className="... border-[1.5px] border-[#252a2c] ..."
+ className="... border-[1.5px] border-[#e7e8e9] ..."
```

Apply to both the Prev and Next buttons.

---

## 9, 10 & 11. Track Info — Subtitle Style + Title Format

**File:** `src/app/App.tsx`

```diff
  {/* Track Info */}
  <div className="mt-12 text-center space-y-2">
-     <h2 className="text-2xl text-white font-medium tracking-wide">
-         {currentTrack.title} by {currentTrack.artist}
+     <h2 className="text-[24px] text-white font-medium font-['Inter',sans-serif] leading-normal">
+         {currentTrack.title.toUpperCase()} by {currentTrack.artist}
      </h2>
-     <p className="text-neutral-500 text-sm">
-         Move the tone arm over the vinyl to listen to music.
+     <p className="text-white opacity-80 text-[16px] font-['Inter',sans-serif] leading-normal">
+         Move the tone arm over the vinyl to listen to music.
      </p>
  </div>
```

---

## 12 & 13. Footer — Opacity + Text Color

**File:** `src/app/components/turntable/Footer.tsx`

```diff
- <div className="w-full max-w-[1561px] flex justify-between items-center text-[#F2F5F7] text-[16px] font-medium font-['Inter'] mt-16 px-8">
+ <div className="w-full max-w-[1561px] flex justify-between items-center text-white text-[16px] font-medium font-['Inter',sans-serif] mt-16 px-8 opacity-50">
```

---

## 14. Pitch Slider Vertical Line — Image Asset

**File:** `src/app/components/turntable/PitchSlider.tsx`

The vertical reference line is now an image asset in the Figma rather than a `<div>`.

### New Asset

| Variable | Asset URL |
|----------|-----------|
| `imgVector13` | `https://www.figma.com/api/mcp/asset/10c45fb6-1e9b-4eee-bb3d-a523565fbd49` |

```diff
- <div className="absolute left-[13px] top-[12px] h-[223px] w-[1px] bg-[#b7b7b7] pointer-events-none" />
+ <div className="absolute left-[13px] top-[12px] h-[223px] w-0 pointer-events-none">
+   <img alt="" className="absolute block size-full" style={{ inset: '0 -0.52px' }} src={imgVector13} />
+ </div>
```

---

## 15. Bug Fix: `Track` Type Circular Import

**File:** `src/app/data/tracks.ts`

The file imports `Track` from `'../../data/tracks'` — which resolves to itself. Define the interface in the same file.

```diff
- import { Track } from '../../data/tracks';
-
+ export interface Track {
+   title: string;
+   artist: string;
+   cover: string;
+   url: string;
+ }
+
  export const TRACKS: Track[] = [
```

Then update all other files that import `Track` to use the correct path:

```diff
- import { Track } from '../../data/tracks';
+ import { Track } from '../data/tracks';
```

Affected files:
- `src/app/components/turntable/Turntable.tsx`
- `src/app/components/turntable/Platter.tsx`

---

## 16. Bug Fix: Audio Cleanup on Unmount

**File:** `src/app/components/turntable/Turntable.tsx`

The cleanup function in the audio `useEffect` is empty, which means audio continues playing if the component ever unmounts.

```diff
  return () => {
-    // cleanup
+    if (audioRef.current) {
+      audioRef.current.pause();
+      audioRef.current.src = '';
+      audioRef.current = null;
+    }
  };
```

---

## Assets to Download & Commit

All Figma MCP asset URLs expire after **7 days**. Download all assets immediately and save them to `src/assets/`:

| File | URL | Size |
|------|-----|------|
| `platter-base.png` | `https://www.figma.com/api/mcp/asset/54ef75a0-b205-4519-9ead-646e7c732d50` | 480px (strobe ring) |
| `disk-outer.png` | `https://www.figma.com/api/mcp/asset/8065c0c6-dc72-4591-b68b-a6a3a1a2cffc` | 440.37px |
| `disk-main.png` | `https://www.figma.com/api/mcp/asset/d65aca08-1b42-4939-b4fc-2d113d31f000` | 428.868px |
| `disk-groove-1.png` | `https://www.figma.com/api/mcp/asset/f4609342-28ea-4dd5-948d-f9d476a2cb92` | 353.282px |
| `disk-groove-2.png` | `https://www.figma.com/api/mcp/asset/60a9a343-72b7-429f-9e18-4e79b24b23c7` | 289.198px |
| `disk-center-hub.png` | `https://www.figma.com/api/mcp/asset/c16d5671-7e51-43c1-a45b-8c13ee9e80d9` | 57.511px |
| `center-pin.png` | `https://www.figma.com/api/mcp/asset/a08a297f-24a9-461f-960d-ea8b8eca5d2c` | ~10px |
| `center-ellipse.png` | `https://www.figma.com/api/mcp/asset/08d77634-22dd-42ee-b4ea-6d35d49fe7f3` | 9.859px |
| `tone-arm.png` | `https://www.figma.com/api/mcp/asset/c8a2fb81-baa6-4697-8fdf-a68737d8932d` | 194.562 × 459.783px |
| `play-button-inner.png` | `https://www.figma.com/api/mcp/asset/51e2f203-d926-4794-a187-b69fc36d39a6` | 56px |
| `play-icon.png` | `https://www.figma.com/api/mcp/asset/18288e1f-8ea7-48ec-81fe-69726c3ade93` | 24px play icon |
| `pitch-line.png` | `https://www.figma.com/api/mcp/asset/10c45fb6-1e9b-4eee-bb3d-a523565fbd49` | 1px × 223px line |

---

---

# Interactivity Specification (from Figma documentation frames)

The following three Figma frames document the intended interactive behaviour for the platter, tone arm, and pitch slider. They define the **rules** the code must follow — not just how things look.

---

## A. Platter Rotation — Static Base vs. Rotating Vinyl

**Figma node:** [722:2597 — Turner Component](https://www.figma.com/design/SDYZhfOGSjS2J5jleExLvs/Ideas?node-id=722-2597)

The frame shows three platter states: bare base only, full vinyl at rest, and full vinyl mid-rotation (88.26°).

### What this clarifies

The platter has two **structurally separate** layers:

| Layer | Element | Behaviour |
|-------|---------|-----------|
| Static | `imgImage51` — 480px strobe/dot ring | **Never rotates** |
| Rotating | "This rotates" group — OuterDisk + all inner disks + album cover + center pin | Spins at playback rate |
| Static | `imgEllipse17` — 9.859px center highlight dot | **Stays fixed** (sits on top of rotating group) |

### Current bug in `Platter.tsx`

The current code wraps everything (including the strobe image) inside a single spinning `motion.div`, then counter-rotates the strobe image with `animationDirection: 'reverse'` to fake the separation. This is fragile and incorrect. The correct structure is:

```tsx
{/* Static — never spins */}
<img src={imgImage51} className="absolute rounded-full size-[480px]" />

{/* Rotating — driven by motor + pitch */}
<motion.div style={{ rotate: ..., originX: 'center', originY: 'center' }}>
  <img src={imgOuterDisk} ... />
  {/* ... all other disk layers and album cover ... */}
  <img src={imgCenterPin} ... />
</motion.div>

{/* Static — sits on top, does not rotate */}
<img src={imgEllipse17} className="absolute" style={{ left: '235.08px', top: '235.07px', width: '9.859px', height: '9.859px' }} />
```

This removes the `animationDirection: 'reverse'` hack entirely and uses a single `motion.div` driven by a `useAnimationFrame` or `animate` loop tied to `isPlaying` and `playbackRate`.

> **Recommendation:** Switch from CSS `animate-spin` to Motion's `animate={{ rotate: 360 }}` with `transition={{ duration, repeat: Infinity, ease: 'linear' }}` so playback rate changes take effect immediately without needing to restart the animation.

---

## B. Tone Arm — States, Angles & Playback Trigger

**Figma node:** [723:2624 — Arm Design](https://www.figma.com/design/SDYZhfOGSjS2J5jleExLvs/Ideas?node-id=723-2624)

The frame documents three arm positions with written behavioural rules.

### Three documented states

| State | Visual | Designer's note |
|-------|--------|-----------------|
| **Default / Rest** | Arm tilted to the right, resting on arm holder | "Arm stays like this by default. This is also the max angle the arm can reach." |
| **Arm on vinyl** | Arm swept left, needle touching the record | "MUSIC SHOULD ONLY PLAY WHEN ARM IS DROPPED ON THE VINYL." |
| **Max angle** | Arm swept fully left/inward | "The arm should not rotate beyond this angle." |

### Arm holder circle

The designer explicitly notes: *"Arm is placed on top of an arm holder which is currently missing in the design."*

The arm holder is the light grey/white circle visible in all three states behind the arm's pivot point. It is **static** (does not rotate). Currently `ToneArm.tsx` renders a plain `<circle cx="97.28" cy="97.28" r="97.28" fill="#F8F8F8">` inside the SVG as the holder — this is already there in the existing code. When migrating to the image-asset approach (Change #6), this circle needs to be preserved as a separate static element behind the arm image.

### Playback trigger — correcting the logic

The designer's rule: **music plays when the arm is over the vinyl (swept inward), not at rest.**

Current code in `Turntable.tsx`:
```ts
const isArmOnRecord = armAngle > -10 && armAngle < 35;
```

From the visual: the rest/default position is the arm tilted to the right (the positive-angle side in the current atan2 system). Sweeping the arm inward (toward the vinyl) moves the angle further negative. The correct condition is:

```ts
// Arm is on the record when it has swept past a threshold toward the vinyl
// Rest = ~-27°, On vinyl = any angle more inward than the threshold (~-10° or 0°)
const isArmOnRecord = armAngle > -10 && armAngle < MAX_ANGLE;
```

> **Note:** The designer's written note ("if rotation angle is less than -35") appears to use an inverted angle convention vs. the code. Based on the **visual** documentation and the existing atan2 implementation, the current threshold of `armAngle > -10` is directionally correct — the arm is on the record when it has swept inward past approximately -10°. However this threshold should be tuned against actual visual testing.

### Angle constraints

| Constraint | Current value | Figma says |
|------------|--------------|------------|
| `MIN_ANGLE` (furthest inward) | `-35` | Max angle the arm can reach (don't go further) |
| `MAX_ANGLE` (rest/rightmost) | `30` | Default rest position — also the max right angle |
| Default rest angle | `-27` | Matches "default state" visual |

These values are already correctly set in `ToneArm.tsx`. No change needed to the angle constraints themselves.

### Snap-to-rest on drag end

When the user releases the arm, if it's past the rest threshold, it should spring back smoothly to `-27°`. The current `handleDragEnd` in `Turntable.tsx` does this via `setState` which bypasses the Motion spring. Fix:

```ts
// In ToneArm.tsx — expose the animation controls
const armControls = useAnimation();

// In handleDragEnd in Turntable.tsx
if (armAngle < -20) {
  // Let Motion animate the snap, not a raw state jump
  armControls.start({ rotate: -27 - ASSET_ROTATION });
  setArmAngle(-27);
}
```

---

## C. Pitch Slider — Behaviour & Direction

**Figma node:** [724:2729 — Pitch Component](https://www.figma.com/design/SDYZhfOGSjS2J5jleExLvs/Ideas?node-id=724-2729)

The frame documents three slider positions with their intended audio effect.

### Three documented states

| State | Knob position (px from groove top) | Pitch value | Audio effect |
|-------|-------------------------------------|-------------|--------------|
| **Default pitch** | `top: 103px` (middle of 223px groove) | `1.0` | Normal speed and sound |
| **Max pitch** | `top: 12px` (near top) | `1.08` | Faster rotation, music speeds up |
| **Min pitch** | `top: 195px` (near bottom) | `0.92` | Slower rotation, music slows down |

### Direction confirmed: UP = faster, DOWN = slower

This is **standard UI convention** (not physical Technics convention where pushing DOWN increases pitch). The current `valueToY` mapping in `PitchSlider.tsx` is already correct:

```ts
// 1.08 (max/faster) → 0px (top)
// 0.92 (min/slower) → 223px (bottom)
const pct = (1.08 - clamped) / (1.08 - 0.92); // 0 at top, 1 at bottom
return pct * GROOVE_HEIGHT;
```

✅ No change needed to the mapping logic.

### Label fix — bottom label should be `-8`, not `+8`

The current `PitchSlider.tsx` has a long comment block debating whether the bottom label is `+8` or `-8`. The Figma's **Min Pitch** state definitively shows the knob at the bottom = slower = negative pitch offset. The bottom label should read `-8`.

```diff
- <div className="h-[4px] flex items-center"><span>-8</span></div>  {/* currently shows "+8" */}
+ <div className="h-[4px] flex items-center"><span>-8</span></div>
```

### Snap to centre behaviour

When the user releases the slider close to `1.0`, it should snap precisely to centre. This is already in the code:

```ts
if (Math.abs(value - 1.0) < 0.005) {
  onChange(1.0);
}
```

The Figma confirms the centre position is correct (knob at `top: 103px` out of a 0–223px range = 46.2% = exactly centre). ✅ No change needed.

### Pitch effect on platter speed

The `playbackRate` prop is passed from `Turntable` → `Platter`. The Figma spec confirms:

- Pitch `1.08` → vinyl spins **faster** → `duration = 1.8 / 1.08 = 1.667s` per rotation ✅
- Pitch `0.92` → vinyl spins **slower** → `duration = 1.8 / 0.92 = 1.957s` per rotation ✅
- Pitch `1.0` → normal speed → `duration = 1.8s` per rotation ✅

Current `Platter.tsx` calculation `const duration = 1.8 / safeRate` is correct. ✅

---

## Implementation Order (Updated)

1. **Download all assets** (they expire in 7 days)
2. Fix `Track` type import bug (#15 — unblocks TypeScript)
3. Fix audio cleanup bug (#16)
4. Fix pitch slider bottom label (`+8` → `-8`) — 1 line change
5. Update background color + title font/gradient (#1, #2, #3 — quick wins)
6. Update footer opacity + nav button borders (#8, #12, #13 — quick wins)
7. Update track info subtitle styling (#10, #11)
8. Fix platter structure — separate static base from rotating vinyl group (Spec A)
9. Replace vinyl disk SVGs with image assets in `Platter.tsx` (#5)
10. Replace tone arm SVG with image asset in `ToneArm.tsx` (#6), preserve static arm holder circle
11. Fix arm snap-to-rest to use Motion animation instead of raw state set (Spec B)
12. Update play button inner circle to image asset (#7)
13. Update chassis inner shadow (#4)
14. Update pitch slider vertical line to image asset (#14)
15. Remove debug overlay and clean up comment blocks
