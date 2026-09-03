# AGENTS.md

## Project
- `sorting-algo-factory` — https://github.com/rays-1/sorting-algo-factory (`main`, initial commit `9874822`). Greenfield as of 2026-09-03: only `README.md` so far.
- Name implies sorting-algorithm implementations — confirm language and scope with user before scaffolding. Update this file when stack/manifest is added.

## Workspace
- Absolute path contains space: `C:\Users\rayst\OneDrive\Documents\sorting-algo` — always quote paths; use tool `workdir` param instead of `cd`/`Set-Location`.
- Shell is Windows PowerShell 5.1 on `win32` — chain with `; if ($?) { ... }`, not `&&`; quote with double quotes for interpolated strings.
- OneDrive-backed directory — if `Get-ChildItem` returns 0 entries, check `cmd /c "dir /a"` and OneDrive sync/hydration state before assuming empty.

## Git & Push Policy
- Remote `origin` = `https://github.com/rays-1/sorting-algo-factory.git` (`main`, `origin/HEAD -> origin/main`). Auth via `gh auth login` or `GH_TOKEN` / Git Credential Manager.
- **Every major feature/addition must be pushed to GitHub** — do not leave commits local. After `git add` + `git commit`, run `git push origin main` (or push feature branch and open PR if branching is adopted) and verify with `git status` and `git log --oneline -3`.
- Local git config: `user.name=rays-1`, `user.email=raystercarino@gmail.com` — override per-commit if needed.

## Tooling (none yet)
- No build, test, lint, formatter, or typecheck config detected — no `package.json`, `pyproject.toml`, `Makefile`, lockfile, or repo-local `opencode.json` (only global `~/.config/opencode/opencode.jsonc` with `{"$schema":"https://opencode.ai/config.json"}`).
- No CI workflows or pre-commit hooks present.
- After adding toolchain, document here: exact install, build, test, and single-test commands verified from config/scripts.

## Guidance for Next Session
- Prefer executable sources of truth (manifests/scripts) over prose when they conflict.
- Keep this file compact — only add lines an agent would likely miss without help; omit generic language conventions.
- When scaffolding, add minimal runnable example and verified command to run it, then replace the greenfield notice above.
