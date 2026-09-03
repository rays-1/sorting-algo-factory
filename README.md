# sorting-algo-factory

Futuristic industrial 3D sorting factory — sorting algorithms visualized as
crates on a conveyor driven by gantry robotics, monitored from a precision
engineering terminal (dark aerospace HUD + telemetry + procedural audio).

Stack: Vite 8 + React 19 + TypeScript 6 + Three.js (R3F + Drei) + Zustand +
GSAP + Web Audio. Package manager: `npm`.

## Install

```powershell
npm install
```

Requires Node 24 + npm 11 (verified 2026-09-03).

## Run

```powershell
npm run dev      # Vite dev server → http://localhost:5173
npm run build    # tsc -b && vite build → dist/
npm run preview  # serve the production build
npm run lint     # oxlint
```

## Test

```powershell
npm test                                   # all algorithm tests (vitest run)
npx vitest run src/algorithms/algorithms.test.ts   # single file
npx vitest run -t "sorts duplicates"       # single case by name
```

Algorithms are pure generators (`src/algorithms/`), so tests replay
`[...registry[id].generator(arr)]` through SWAP/OVERWRITE and assert the
result — no React/Three needed.

## Use

Pick an algorithm (bubble / quick / merge / insertion), a dataset
(random / reversed / nearly sorted / sorted / duplicates) and size, then
`RUN`. Shortcuts: `Space` run/hold, `→` step, `R` reset. Camera presets:
overview / inspection / gantry / topographic.

See `AGENTS.md` for architecture and contributor notes.
