# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

条文ビューワー (Clause Viewer) — a static web app (https://www.clause-viewer.web-app.xyz/) that makes Japanese legal text easier to read:
- Pasted clause text is shown below with only article/paragraph numbers (第X条, 第X項, branch numbers 第X条のYのZ) converted from kanji numerals to Arabic numerals. Item numbers (号, e.g. 第二号) and other kanji numbers are intentionally left unchanged.
- Full-width round parentheses `（…）` in the clause can be collapsed/expanded.

The app lives entirely in `clause-helper-app/`; run all npm commands from there. UI text and code comments are in Japanese.

**The only dependency is `typescript` (v7).** No framework, bundler, test library, linter, or `@types/node`. Keep it that way: Node built-ins used by tests/scripts are declared by hand in `types/node.d.ts` — add declarations there when using a new Node API.

## Commands (run in `clause-helper-app/`, Node >= 22.18)

- `npm run dev` — serves `public/` + `dist/js/` at http://localhost:3000 and recompiles `src/` when files change (it polls mtimes because `tsc --watch` does not detect changes on WSL `/mnt/c`)
- `npm run build` — `scripts/build.ts` copies `public/` to `dist/` (filling in `%GA_MEASUREMENT_ID%` from the environment), then `tsc -p tsconfig.build.json` compiles `src/` to `dist/js/`
- `npm start` — serves the built `dist/`
- `npm run typecheck` — type-checks `src`, specs, and `scripts`
- `npm test` — `node --test "src/**/*.spec.ts"`. Single test: `node --test --test-name-pattern="<name>" "src/**/*.spec.ts"`

Tests and scripts run as `.ts` directly via Node type stripping, so code must use erasable syntax only (no enums, namespaces, or parameter properties; `erasableSyntaxOnly` enforces this). Relative imports use the `.ts` extension; `rewriteRelativeImportExtensions` turns them into `.js` in the browser build.

Git hooks in `githooks/` (copy into `.git/hooks/`): pre-commit runs `typecheck`; pre-push runs `npm ci` and `npm test`.

## Architecture

- `public/index.html` holds the markup. `src/main.ts` looks up elements by id and passes them to `mountClauseViewer`. `src/analytics.ts` loads gtag.js only when the `ga-measurement-id` meta tag has a real value. `public/TermsOfUse.html` is the disclaimer page (`/TermsOfUse` works through Vercel `cleanUrls` and the dev server).
- `src/app/ClauseViewer.ts` contains `ClauseViewerState` (original text, converted text, selected range, collapse/expand) and `mountClauseViewer`, which wires events and re-renders. It takes small structural element interfaces instead of DOM types, so tests can pass fake elements.
- `src/logic/Kanji2Num.ts` — `replaceKanjiClause2Num` builds a replacement table from regex matches (branch numbers first, then 第X条/第X項). It converts using `JapaneseNumeral.ts` (a replacement for `@geolonia/japanese-numeral` that handles only 一–九/十/百/千), applies replacements **longest-first** so shorter matches don't clobber longer ones (e.g. 「十三」 must not become 「10三」), and converts full-width digits to half-width.
- `src/logic/CollapseExpand.ts` — collapsing and expanding never edit the current output step by step. `collapseAndExpand` always starts again from `originalText` (re-converted). It finds the current collapse level by locating `（…）` in `convertedText` (`getCurrentLevel`; -1 means nothing is collapsed), computes a target level with a callback, then replaces every parenthesis block at that nesting level (0 = outermost) with `（…）`. A `（` immediately followed by `」` does not count as an opening parenthesis. An unbalanced `）` throws.
- Range mode: `allLevels` collapses to level 0 and expands fully; `oneLevel` moves one nesting level at a time.

## Testing notes

`src/app/ClauseViewer.spec.ts` drives the app through a fake DOM defined in the spec (`FakeElement`/`FakeRadio`, `render()`, `fireEvent`). This mimics the old Testing Library API. The fake ids mirror `public/index.html`. If you change element ids or wiring in `main.ts`/`index.html`, update the fake `render()` as well; no test covers the real HTML.
