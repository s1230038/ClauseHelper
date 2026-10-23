# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

条文ビューワー (Clause Viewer) — a Next.js web app (https://www.clause-viewer.web-app.xyz/) that makes Japanese legal text easier to read:
- Pasted clause text is shown below with only article/paragraph numbers (第X条, 第X項, branch numbers 第X条のYのZ) converted from kanji numerals to Arabic numerals. Item numbers (号, e.g. 第二号) and other kanji numbers are intentionally left unchanged.
- Full-width round parentheses `（…）` in the clause can be collapsed/expanded.

The app lives entirely in `clause-helper-app/`; run all npm commands from there. UI text and code comments are in Japanese.

## Commands (run in `clause-helper-app/`)

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` — production build (uses `tsconfig.build.json`, which excludes `*.spec.tsx`)
- `npm run lint` — ESLint over `src`; `npm run format` — ESLint with `--fix` (Prettier runs via ESLint)
- `npm run stylelint` — stylelint with `--fix`
- `npm run secretlint` — secret scan
- `npm test` — Jest (jsdom, `--silent`). Single test: `npx jest src/components/ClauseViewerApp.spec.tsx -t "<test name>"`
- `npm run storybook` — Storybook on port 6006 (current stories are the default scaffold only)

Git hooks in `githooks/` (copy into `.git/hooks/`): pre-commit runs secretlint (blocks on failure), `format`, and `stylelint`; pre-push runs `npm ci` and `npm test`.

## Architecture

- `src/pages/index.tsx` renders `ClauseViewer`; `_app.tsx` adds Google Analytics (`src/lib/gtag.js`) and Vercel Speed Insights. `TermsOfUse.tsx` is the disclaimer page.
- `src/components/ClauseViewer.tsx` owns all state (`originalText`, `convertedText`, `selectedRange`) and passes setters down via props to small components (input/output textareas, copy button, collapse/expand buttons, range radio buttons). No state library.
- `src/logic/Kanji2Num.tsx` — `replaceKanjiClause2Num`: builds a replacement table from regex matches (branch numbers first, then 第X条/第X項), converts with `@geolonia/japanese-numeral`, and applies replacements **longest-first** so shorter matches don't clobber longer ones (e.g. 「十三」 must not become 「10三」). Also converts full-width digits to half-width.
- `src/logic/CollapseExpand.tsx` — parenthesis collapsing. Key design: collapsing/expanding never edits the current output incrementally. `collapseAndExpand` always re-derives from `originalText` (re-converted via `replaceKanjiClause2Num`), detects the current collapse level by finding `（…）` in `convertedText` (`getCurrentLevel`, -1 = nothing collapsed), computes a target level via a callback, then replaces every parenthesis block at that nesting level (0 = outermost) with `（…）`. A `（` immediately followed by `」` is not treated as an opening parenthesis. Unbalanced `）` throws.
- Range mode: `allLevels` collapses to level 0 / expands fully; `oneLevel` steps one nesting level at a time (logic lives in the button handlers in `ManipulateParentheses.tsx`).
- Shared types are in `src/components/Types.tsx`. Path aliases `@/*` and `~/*` map to `src/*`.

## Testing notes

- Tests are integration-style in `src/components/ClauseViewerApp.spec.tsx`: render `ClauseViewer`, fire change/click events, and compare full expected clause text. Elements are found by `data-testid`, which `next.config.js` strips in production builds.

## Lint rules worth knowing

ESLint enforces `import/order` alphabetized, `max-lines-per-function: 70`, `max-nested-callbacks: 3`, and Prettier formatting as errors.
