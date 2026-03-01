# Interactive Turntable UI

A pixel-faithful, interactive recreation of the **Technics SL-1200MK2** turntable — built entirely in React. Spin the platter, drop the needle, pitch up or down, and play your own MP3s.

Originally designed in Figma → [View the Figma file](https://www.figma.com/design/tKFQtz0FZTKC79eJOKYhkQ/Interactive-Turntable-UI)

---

## Features

- **Spinning vinyl platter** — layered SVG grooves and light effects rotate at the correct 33⅓ RPM speed
- **Draggable tone arm** — drag the arm over the record to begin playback; lift it off to pause
- **Pitch slider** — ±8% pitch control with tick marks, snaps to 0 when close to centre
- **Start / Stop motor** — toggle the platter motor independently of the tone arm
- **MP3 upload** — load any MP3 from your device; ID3 tags (title, artist, embedded cover art) are parsed automatically
- **Album art upload** — swap the vinyl label with any image
- **Design controls panel** — tweak background colour, noise overlay, turntable scale, shadow, title gradient, and more in real time (press `D` to toggle)
- **Sound effects** — tone arm drop, pickup, and vinyl scratch audio cues

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| Animation | Motion (Framer Motion) |
| UI primitives | Radix UI / shadcn/ui |
| Audio | Web Audio API (native) |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm

### Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

The output is written to `dist/`.

---

## Project Structure

```
src/
├── app/
│   ├── App.tsx                        # Root — layout, file upload, design controls
│   ├── components/
│   │   ├── DesignControlPanel.tsx     # Live design tweak panel (toggle with D)
│   │   └── turntable/
│   │       ├── Turntable.tsx          # Orchestrates all turntable parts + audio engine
│   │       ├── Chassis.tsx            # Wood-texture body and base plate
│   │       ├── Platter.tsx            # Spinning vinyl with scrub support
│   │       ├── ToneArm.tsx            # Draggable tone arm with angle tracking
│   │       ├── PitchSlider.tsx        # ±8% pitch fader
│   │       ├── StartButton.tsx        # Motor on/off toggle
│   │       ├── NavigationButtons.tsx  # Track navigation
│   │       └── Footer.tsx             # Credits footer
│   ├── data/
│   │   └── tracks.ts                  # Built-in demo track definitions
│   └── utils/
│       └── parseId3.ts                # ID3 tag parser for uploaded MP3s
└── assets/                            # SVGs, textures, audio samples
```

---

## Usage

1. **Play the demo track** — click Start, then drag the tone arm onto the vinyl
2. **Upload your own music** — click *Upload MP3* to load a track from your device
3. **Change album art** — click *Upload Cover* to replace the vinyl label image
4. **Adjust pitch** — drag the pitch fader up (+) or down (−); it snaps back to 0 at centre
5. **Scrub** — click and drag the vinyl platter directly to scrub through the track
6. **Design controls** — press `D` (or click the ⚙ button) to open the design panel

---

## Attributions

- UI components from [shadcn/ui](https://ui.shadcn.com/) — [MIT License](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md)
- Photos from [Unsplash](https://unsplash.com) — [Unsplash License](https://unsplash.com/license)
