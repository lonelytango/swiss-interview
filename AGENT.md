# Project Guidelines

Instructions for AI coding agents working in this repository.

## Project Overview

**swiss-interview** is a browser-based frontend interview sandbox. It provides three modes:

- **Algorithm Playground:** TypeScript snippets run through Babel and report output in an in-app console.
- **React Sandbox:** TSX and CSS editors render into an isolated iframe preview with console forwarding.
- **Python Playground:** Python snippets run in-browser through Pyodide.

The product is a single-page React app with an IDE-like layout: header, mode selector, Monaco editors, resizable splits, preview panes, and console panes. It is deployed to GitHub Pages from `main`.

## Tech Stack & Core Libraries

- **Framework:** React 19 with Vite 8.
- **Language:** TypeScript with strict compiler settings.
- **Styling:** Tailwind CSS through `@tailwindcss/vite`, plus a small amount of global CSS in `src/index.css`.
- **Editors:** Monaco via `@monaco-editor/react`.
- **Runtime compilation:** `@babel/standalone` for TypeScript/TSX snippets.
- **Python runtime:** `pyodide`; runtime assets load from jsDelivr via `PYODIDE_INDEX_URL`.
- **Icons:** `lucide-react`.
- **Lint:** ESLint 9 flat config with TypeScript, React Hooks, and React Refresh rules.
- **Deployment:** GitHub Actions builds with Node 22 and deploys `dist` to GitHub Pages.

Prefer the existing stack before adding dependencies. Monaco, Babel, React, browser APIs, Tailwind, and Pyodide already cover most needs in this project.

## Critical Commands

- **Install:** `npm install` or `npm ci`
- **Dev:** `npm run dev` (Vite dev server, default port **3000**)
- **Build:** `npm run build` (`tsc -b && vite build`)
- **Lint:** `npm run lint`
- **Preview production bundle:** `npm run preview`

After substantive changes, run **`npm run build`**. Run **`npm run lint`** when changes affect TypeScript, React logic, or project configuration.

## Architecture & State Management

### Directory Structure

- **`src/App.tsx`:** Top-level app state, mode selection, run handling, keyboard shortcut, Babel execution for algorithm mode, Pyodide execution for Python mode, and routing between the three sandbox views.
- **`src/main.tsx`:** React root bootstrap.
- **`src/views/`:** Mode-level layout compositions:
  - `AlgorithmPlaygroundView.tsx`
  - `ReactSandboxView.tsx`
  - `PythonPlaygroundView.tsx`
- **`src/components/`:** Reusable UI pieces:
  - `CodeEditor.tsx` wraps Monaco and centralizes editor options.
  - `ResizableSplit.tsx` handles pointer-driven split panes.
  - `PreviewPanel.tsx` builds the iframe sandbox for React preview rendering.
  - `ConsolePanel.tsx`, `EditorPanel.tsx`, `AlgorithmPanel.tsx`, `PythonPanel.tsx`, and `ModeSelector.tsx` compose the workspace.
- **`src/constants/`:** Default starter code and runtime constants (`defaults.ts`, `pyodide.ts`).
- **`src/index.css`:** Tailwind import and small global element rules.
- **`.github/workflows/deploy.yml`:** GitHub Pages deployment.

There is no router, API layer, server, test suite, or global state store today. Do not introduce those structures preemptively.

### State

- Keep app-wide sandbox state in `App.tsx` unless it becomes genuinely shared and hard to reason about.
- Keep view-specific state near the view that owns it. For example, React preview console state currently lives in `ReactSandboxView`.
- Use `useState`, `useRef`, `useEffect`, and `useCallback` for local UI and runtime coordination. Avoid adding a state management library.

### Runtime Execution

- Algorithm snippets are transpiled with Babel presets `env` and `typescript`, then executed with `new Function` against a constrained fake console.
- React snippets are transpiled in `PreviewPanel`, injected into an iframe via `srcdoc`, and executed with a small CommonJS-style shim.
- The React preview iframe currently loads React, ReactDOM, and Tailwind from CDNs; preserve the iframe boundary when changing preview behavior.
- Python snippets lazy-load Pyodide on first run and reuse the instance through `pyodideRef`.
- Keep the Pyodide version in `src/constants/pyodide.ts` aligned with `package.json`.

When adding asynchronous work that can overlap, guard against stale updates. Use cleanup flags, abortable APIs where available, or explicit request ids depending on the API.

### GitHub Pages Base Path

`vite.config.ts` computes `base` from `BASE_PATH`, `GITHUB_REPOSITORY`, or `/`. Preserve this behavior unless deployment changes. GitHub Pages serves the app from `/<repo>/`, so hard-coded root-relative assumptions can break production.

## Coding Standards

### Components & Exports

- Components currently use **default exports**. Match the neighboring file unless there is a strong local reason to change.
- Define prop interfaces near the top of component files.
- Prefer clear function components and small local callbacks.
- Keep `CodeEditor` as the central place for Monaco defaults; callers can pass mode-specific `beforeMount` setup.

### TypeScript

- `strict` mode is enabled, along with unused checks and `erasableSyntaxOnly`.
- Avoid introducing new `any`. Use `unknown` and narrow external payloads, especially `postMessage`, Babel errors, and dynamic runtime values.
- Use `import type` for type-only imports.
- Do not silence compiler errors with broad casts. If a runtime boundary needs a cast, keep it narrow and explain it only if the code is not self-evident.

### Styling & UI

- Use Tailwind utility classes in JSX, matching the current dark IDE-like visual language.
- Use `lucide-react` for UI icons.
- Maintain stable full-height split-pane layouts with `min-h-0`, `overflow-hidden`, and explicit flex sizing where needed.
- Important controls should remain usable on small viewports and touch devices; split handles and buttons need reasonable hit targets.
- Avoid introducing a `cn`, `clsx`, or Tailwind merge helper unless conditional class logic becomes a project-wide pain.

### Comments

- Keep comments short and useful. Comments are welcome around runtime boundaries such as iframe injection, Monaco virtual typings, Babel transforms, and Pyodide loading.
- Remove placeholder comments from generated code when they no longer add context.

## Testing & Verification

There is no test runner configured today. For now:

- Use **`npm run build`** as the primary verification gate.
- Use **`npm run lint`** for static checks.
- For UI changes, run **`npm run dev`** and manually verify all affected modes:
  - Run TypeScript in Algorithm Playground and confirm console output/errors.
  - Run TSX/CSS in React Sandbox and confirm preview rendering plus console forwarding.
  - Run Python and confirm Pyodide loads and output/errors appear.
  - Drag split handles and check resizing behavior.

If adding tests later, prefer focused Vitest/Testing Library coverage for reusable logic and components before adding broad E2E infrastructure.

## What AI Agents Should Never Do

- Never commit secrets, `.env` files, or credentials.
- Never remove the iframe sandbox boundary for React preview execution without a deliberate security review.
- Never make user-authored sandbox code run in the parent app context.
- Never hard-code GitHub Pages paths in app code; use Vite base behavior.
- Never change the Pyodide CDN/version in only one place.
- Never install a dependency without first checking whether the current stack already solves the problem.
- Never run destructive git operations (`reset --hard`, force-push, deleting branches) unless explicitly requested.
