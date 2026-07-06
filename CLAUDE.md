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

## Development Notes

- Treat `app/` as an external repository with its own history because it is a submodule.
- Root-level changes such as `.gitmodules`, `CLAUDE.md`, `design/`, and `docs/` belong to this repository, not the submodule.
- When changing app code, verify whether the change should be committed inside `app/` rather than only in the parent repository.
- Avoid editing generated output in `app/dist/` unless the task explicitly requires a release artifact update.

## Commit Format

Use this commit format:

```text
feat(module): short desc
```

If extra explanation is needed, add a blank line and then the longer description:

```text
feat(module): short desc

Longer description when needed.
```

Examples:

```text
feat(editor): add nested frame selection
```

```text
feat(submodule): add content-builder app

Register the Vue content builder repository as the app submodule.
```
