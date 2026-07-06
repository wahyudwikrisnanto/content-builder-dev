# Technical Guide

## Repository Layout

- `app/` is a Git submodule that points to `https://github.com/wahyudwikrisnanto/content-builder`.
- `design/` contains design references and supporting assets.
- `docs/` contains project documentation and non-code references.

## App Stack

The `app/` submodule is a Vue 3 + TypeScript project built with Vite. It is packaged as a library and publishes artifacts from `dist/`.

Key details from `app/package.json`:

- Package name: `tmdr-content-builder`
- Framework: Vue 3
- Language: TypeScript
- Build tool: Vite
- Syntax highlighting: `highlight.js`

## App Commands

Run all app commands from `app/`.

```bash
npm install
npm run dev
npm run build
npm run typecheck
npm run preview
```

## Code Architecture

Write component-driven, reusable, DRY Vue code.

- Split UI into small, single-responsibility components. If a component handles more than one concern, break it up.
- Before adding new markup or logic, check for an existing component/composable that already does it. Reuse or extend instead of duplicating.
- Extract shared logic (state, computed values, side effects) into composables (`use*.ts`) rather than repeating it across components.
- Extract repeated markup/style patterns into reusable components rather than copy-pasting.
- Keep components generic via props/slots/emits when the same UI shape appears in multiple places, instead of forking near-identical components.
- Prefer composition (composables, slots, provide/inject) over prop-drilling or inheritance-style duplication.
- Type props, emits, and composable returns explicitly — don't rely on inferred `any`.
- No copy-pasted blocks of three or more similar lines across files; factor them out.

## Naming

- Names must read clearly on their own — no cryptic abbreviations to save keystrokes (`btn`, `cfg`, `idx` when a loop needs it are fine; `elCfgMgr`, `hndlr`, `tgt` are not).
- Prefer a few extra characters over ambiguity: `selectedElement` not `selEl`, `isVisible` not `vis`.
- Booleans read as a question: `is`/`has`/`should`/`can` prefix (`isEditing`, `hasParent`).
- Functions are verbs describing the action: `clampPos`, `resolveVisibleSections` — not `posUtil`, `doStuff`.
- Composables: `use<Thing>` (`useCms`, `useAutoSize`), matching Vue convention.
- Components: multi-word PascalCase describing what they render (`ColorInput.vue`, `SearchableSelect.vue`), not generic (`Item.vue`, `Box.vue`) unless truly generic.
- Single-letter names only for tight, obvious loop/index variables (`i`, `e` for event) — never for anything holding domain data.

## Comments

- Write inline comments only for non-obvious WHY (hidden constraint, workaround, subtle invariant) — not WHAT the code does.
- Keep comments short: one line, direct. No multi-line blocks, no restating the code.
- Skip the comment if removing it wouldn't confuse a reader.

## Development Notes

- Treat `app/` as an external repository with its own history because it is a submodule.
- Root-level changes such as `.gitmodules`, `CLAUDE.md`, `design/`, and `docs/` belong to this repository, not the submodule.
- When changing app code, verify whether the change should be committed inside `app/` rather than only in the parent repository.
- Avoid editing generated output in `app/dist/` unless the task explicitly requires a release artifact update.

## Commit Format

Format: `<type>(<scope>): <short desc>`

- `type`: `feat`, `fix`, `refactor`, `docs`, `chore`, `test` — pick the one matching the actual change.
- `scope`: module/area touched (e.g. `editor`, `submodule`, `docs`).
- `short desc`: imperative mood, lowercase, no trailing period, ≤50 chars.

Add a body only when the "why" isn't obvious from the diff. Blank line, then body:

```text
<type>(<scope>): <short desc>

<body: why this change, not what it does>
```

Examples:

```text
feat(editor): add nested frame selection
```

```text
feat(submodule): add content-builder app

Register the Vue content builder repository as the app submodule.
```

```text
fix(canvas): correct zoom offset on resize
```
