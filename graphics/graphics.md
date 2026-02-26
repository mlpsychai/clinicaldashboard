 # Nautical Drawing Recreation Project

## Source Material
A child's hand-drawn nautical scene on paper, drawn with red and blue markers. The drawing includes:
- **"Gio" text** — top-left, in a childlike hand
- **Large anchor** — top-left, with a ring (with small arrow tips), vertical shaft, crossbar, and two flukes
- **Small anchor with chain** — middle-left, connected by a chain of oval links
- **Ship** — center-right, with a curved hull, deck line, two cabins (each with a window), a mast, triangular sail, crow's nest circle, a small flag, and an X mark on the hull
- **Vertical wavy line** — blue, running down the center dividing the composition
- **Two horizontal wave rows** — blue, below the ship
- **Small sailboat** — bottom-right, blue/dark blue, with hull, mast, and sail
- **Curved arrow** — near the small sailboat (directional indicator)

The original image is a screenshot from a phone: `Screenshot_20260217_114811_Messages.jpg`

## Chosen Method: Clean Canvas 2D — Bold Marker Style

After evaluating 5 rendering methods side-by-side, **Method 2 (Clean Canvas — Bold Marker)** was selected. It uses:
- Standard **Canvas 2D API** only — no external libraries
- **Thick strokes** with `lineCap: 'round'` and `lineJoin: 'round'`
- **Solid fills** for flukes and flag
- Clean, confident lines with a children's-book-illustration feel

### Why this method won
- Closest to the bold marker energy of the original
- No dependencies (pure Canvas 2D)
- Predictable output (unlike Rough.js which randomizes each render)
- Easy to modify and extend

## Methods Evaluated

| # | Method | Library/Technique | Character |
|---|--------|-------------------|-----------|
| 1 | Rough.js — Sketchy | rough.js (jsdelivr CDN) | Hand-drawn jitter, hachure fills, unique each render |
| 2 | **Clean Canvas — Bold Marker** | **Canvas 2D API** | **Thick round strokes, solid fills, children's book feel** |
| 3 | Watercolor Effect | Canvas 2D multi-pass | Semi-transparent overlapping strokes with random offsets |
| 4 | Pixel Art — 8-bit | Canvas 2D (64px scaled up) | Low-res grid, nearest-neighbor scaling, retro game look |
| 5 | Geometric Minimal | Canvas 2D | Thin precise strokes, pure geometry, architectural |

## Technical Notes

### Canvas Setup
- Canvas size: **700×700** pixels
- Drawing is authored at 500×500 coordinates, then scaled via `ctx.scale(1.4, 1.4)`
- Wrapped in a `.paper` div with cream background (`#f5f0e8`), paper-like box shadow, and subtle gradient overlay
- Page background: dark navy (`#1a1a2e`)

### Color Palette
```
RED:       #c0392b  — anchors, ship, text (primary drawing color)
BLUE:      #2e4a8a  — waves, vertical water line
DARK_BLUE: #1a2d5a  — small sailboat
Paper:     #f5f0e8  — background
```

### Shape Coordinates (at 500×500 scale)
All coordinates below are in the 500×500 authoring space (pre-scale).

**"Gio" text:**
- G: arc at (107, 70), radius 22, angles -2.8 to 1.8
- i: line (130, 65) → (130, 92), dot at (130, 58) radius 3.5
- o: arc at (152, 80), radius 12

**Large anchor:**
- Ring: circle at (100, 150), radius 24
- Shaft: line (100, 174) → (100, 295)
- Crossbar: line (60, 225) → (140, 225)
- Left fluke: quadratic curve from (68, 288) through (55, 315) to (85, 320), closing to (100, 295)
- Right fluke: quadratic curve from (132, 288) through (145, 315) to (115, 320), closing to (100, 295)
- Arrow tips at ring edges

**Chain + small anchor:**
- Small ring: circle at (55, 380), radius 15
- 8 chain links: ellipses at (90 + i*20, 380), radii 8×5
- Small shaft: (55, 395) → (55, 435)
- Small crossbar: (38, 412) → (72, 412)
- Small flukes: similar quadratic curves

**Ship:**
- Hull: quadratic curves from (260, 395) through control points to (455, 395)
- Deck: line (268, 395) → (448, 395)
- Left cabin: rect at (295, 350), 42×45, window at (306, 361), 18×13
- Right cabin: rect at (385, 350), 42×45, window at (396, 361), 18×13
- Mast: line (355, 350) → (355, 225)
- Sail: triangle (355, 240) → (355, 345) → (300, 345)
- Crow's nest: circle at (355, 225), radius 8
- Flag: triangle (355, 218) → (382, 225) → (355, 232), filled
- X mark: two crossing lines in the (415–438, 355–383) area

**Waves:**
- Vertical wavy line: quadratic curves from (270, 225) down to (272, 445)
- Wave row 1: 5 quadratic arcs starting at (250, 455), 40px spacing
- Wave row 2: 4 quadratic arcs starting at (260, 475), 40px spacing

**Small sailboat:**
- Hull: quadratic curves from (380, 475) to (465, 475)
- Mast: line (420, 475) → (420, 430)
- Sail: quadratic from (420, 433) through (450, 448) to (442, 475)

## Rough.js CDN Note
If using Rough.js in a future iteration, the correct CDN URL is:
```
https://cdn.jsdelivr.net/npm/roughjs@4.6.6/bundled/rough.js
```
The cdnjs URL (`cdnjs.cloudflare.com/ajax/libs/rough.js/4.6.6/...`) returns a **404** — v4+ is not hosted there.

## Files Produced
- `nautical-methods.html` — gallery of all 5 methods side by side
- `nautical-bold-marker.html` — standalone final version (Method 2)

## Possible Next Steps
- Add animation (sequential draw-on effect) — was explored but removed per preference
- Parameterize shapes so coordinates can be adjusted via config object
- Export to PNG via `canvas.toDataURL()`
- Add interactivity (hover effects, click to highlight elements)
- Generate variations by randomizing positions/sizes slightly
- Port to Paper.js for more advanced path manipulation
- Create a React component version