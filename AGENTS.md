# AGENTS.md

## Project
- `sorting-algo-factory` — https://github.com/rays-1/sorting-algo-factory (`main`). Futuristic industrial 3D sorting factory — crates on conveyor + gantry robotics, HUD control terminal. Spec in chat mega-prompt `§1-44`.
- Stack: Vite 8 + React 19 + TS 6 + Three + R3F + Drei + Zustand + GSAP + Web Audio.

## Workspace
- Absolute path contains space: `C:\Users\rayst\OneDrive\Documents\sorting-algo` — always quote paths; use tool `workdir` param instead of `cd`/`Set-Location`.
- Shell is Windows PowerShell 5.1 on `win32` — chain with `; if ($?) { ... }`, not `&&`; quote with double quotes for interpolated strings.
- OneDrive-backed directory — if `Get-ChildItem` returns 0 entries, check `cmd /c "dir /a"` and OneDrive sync/hydration state before assuming empty.

## Git & Push Policy
- Remote `origin` = `https://github.com/rays-1/sorting-algo-factory.git` (`main`, `origin/HEAD -> origin/main`). Auth via `gh auth login` or `GH_TOKEN` / Git Credential Manager.
- **Every major feature/addition must be pushed to GitHub** — do not leave commits local. After `git add` + `git commit`, run `git push origin main` (or push feature branch and open PR if branching is adopted) and verify with `git status` and `git log --oneline -3`.
- Local git config: `user.name=rays-1`, `user.email=raystercarino@gmail.com` — override per-commit if needed.

## Tooling
- Package manager: `npm` (lockfile `package-lock.json`). Install: `npm install` (workdir `C:\Users\rayst\OneDrive\Documents\sorting-algo`). Verified 2026-09-03: Node 24.19 + npm 11.17.
- Scripts (from `package.json:7`): `npm run dev` → Vite dev server; `npm run build` → `tsc -b && vite build`; `npm run preview` → Vite preview; `npm run lint` → `oxlint`; `npm test` → `vitest run`.
- Tests: `src/algorithms/algorithms.test.ts` (4 algos × 10 fixtures + sorted-marking). Single file: `npx vitest run src/algorithms/algorithms.test.ts`; single case: `npx vitest run -t "sorts duplicates"`. Test config lives in `vite.config.ts` (`defineConfig` from `vitest/config`).
- TS: `tsconfig.json` refs `tsconfig.app.json`/`tsconfig.node.json` (path alias `@` → `src`). Vite config `vite.config.ts:10` uses `import.meta.dirname`.
- No CI workflows or pre-commit hooks.

## Guidance for Next Session
- Prefer executable sources of truth (manifests/scripts) over prose when they conflict.
- Keep this file compact — only add lines an agent would likely miss without help; omit generic language conventions.
- When scaffolding, add minimal runnable example and verified command to run it, then replace the greenfield notice above.

## Architecture
- Entry: `src/main.tsx` → `src/App.tsx` (grid HUD + lazy `<Canvas>` via `Suspense`; never `getState()` in render — use hooks).
- `src/types/sorting.ts` defines `FactoryAction` + `SortingGenerator`; `src/algorithms/index.ts` registry drives UI. Algorithms are pure generators — no React/Three.
- `src/store/useFactoryStore.ts` holds `dataset`/`workingArray`/`playbackState`/`speed`/`pivot`/`sortedIndices`/telemetry; no meshes in store.
- `src/engine/SortingPlayback.ts` + `ActionExecutor.ts` handle cancellable GSAP timelines (`AbortController` + `generation` counter); `src/utils/audio.ts` is singleton `AudioContext`.
- `src/components/canvas/FactoryScene.tsx` is canvas root; `Crate.tsx` height = `0.52 + value*0.018`; slot math in `src/utils/math.ts:getSlotX`. `GantryCrane.tsx` exposes `GantryHandle` ref for executor.
