# Configuration JSON Feature Plan

A CKEditor-style configuration object passed as a prop to `ContentBuilder`. All fields are optional — omitting any config or any field within it falls back to the current defaults, so existing usage is unaffected.

---

## 1. TypeScript Interface

```ts
// app/src/types.ts  (additions)

export interface CanvasPreset {
  label: string
  w: number
  h: number
  /** If true, this is the default size loaded on mount. Auto-set when only one preset is provided. */
  default?: boolean
}

export type SidebarSection = 'elements' | 'layers' | 'textStyles'

export interface SidebarConfig {
  /**
   * Which sections to show, and in what order.
   * Omitting this field shows all three in the default order.
   * Pass an empty array to hide the sidebar entirely via config
   * (alternative to the toolbar toggle).
   */
  sections?: SidebarSection[]

  /**
   * Fine-grained control per section.
   * Keys are section ids; values override visibility / label.
   */
  sectionOptions?: Partial<Record<SidebarSection, {
    label?: string
    hidden?: boolean
  }>>
}

export type CanvasHeightMode = 'flexible' | 'fixed'

export interface BuilderConfig {
  /**
   * Canvas size presets shown in the toolbar dropdown.
   * - If empty or omitted: falls back to the built-in PRESETS array.
   * - If exactly one item: that size is applied as the default on mount
   *   and the dropdown is not rendered (no point picking from one option).
   * - If multiple: shown in the dropdown as today; first item marked
   *   `default: true` (or the first item if none are marked) is applied on mount.
   */
  canvasSizes?: CanvasPreset[]

  /** Sidebar panel configuration. */
  sidebar?: SidebarConfig

  /**
   * Initial canvas height behaviour.
   * 'flexible' — canvas grows to fit content (flexibleHeight = true).
   * 'fixed'    — canvas has a fixed height the user can set (flexibleHeight = false).
   * Default: 'fixed'.
   */
  canvasHeightMode?: CanvasHeightMode

  /**
   * Whether to show the "Scale content to fit" toggle in the preset dropdown.
   * Default: true.
   */
  showScaleToggle?: boolean
}
```

---

## 2. Canvas Size Presets

### Behaviour rules

| Scenario | Result |
|---|---|
| `canvasSizes` omitted / `undefined` | Built-in presets (Blog Post, Landing Page, Email…) used as today |
| `canvasSizes: []` (empty array) | Same as omitted — falls back to built-in |
| `canvasSizes` has exactly **1** item | Applied as default on mount; preset dropdown button hidden |
| `canvasSizes` has **≥ 2** items | Shown in dropdown; first item where `default: true` (or index 0) applied on mount |

### Mount-time default application

On `ContentBuilder` mount, if `config.canvasSizes` has items, apply the default preset **only when no existing JSON was loaded** (i.e. the `modelValue` prop is empty/blank). This prevents clobbering a saved document.

```ts
// ContentBuilder.vue — onMounted addition
onMounted(() => {
  if (modelValue.value) {
    cms.importJson(modelValue.value)
  } else {
    const defaultPreset = resolveDefaultPreset(props.config?.canvasSizes)
    if (defaultPreset) cms.setCanvas(defaultPreset.w, defaultPreset.h)
  }
})

// helper (composables/config.ts)
export function resolveDefaultPreset(presets?: CanvasPreset[]): CanvasPreset | null {
  if (!presets?.length) return null
  return presets.find(p => p.default) ?? presets[0]
}
```

### Toolbar changes

```ts
// Toolbar.vue
const presets = computed(() =>
  props.config?.canvasSizes?.length ? props.config.canvasSizes : BUILT_IN_PRESETS
)
const singlePreset = computed(() => presets.value.length === 1)
```

- When `singlePreset`, replace the dropdown button with a plain size readout (no `chevron-down`, no dropdown).
- When multiple, render as today.

---

## 3. Sidebar Configuration

### Hidden sections

```ts
// resolved in Sidebar.vue
const visibleTabs = computed(() => {
  const cfg = inject<SidebarConfig | undefined>(SIDEBAR_CONFIG_KEY)
  const order: SidebarSection[] = cfg?.sections ?? ['elements', 'layers', 'textStyles']
  return order
    .map(id => TABS.find(t => t.id === id))
    .filter((t): t is Tab => {
      if (!t) return false
      const opt = cfg?.sectionOptions?.[t.id]
      return opt?.hidden !== true
    })
})
```

### Label override

```ts
const tabLabel = (id: SidebarSection): string =>
  cfg?.sectionOptions?.[id]?.label ?? DEFAULT_LABELS[id]
```

### Entire sidebar hidden via config

If `config.sidebar.sections` is an empty array (`[]`), `visibleTabs` resolves to `[]`. The sidebar component renders nothing and the wrapper in `ContentBuilder` can `v-if="visibleTabs.length"` to remove the sidebar from the layout entirely.

> This is **separate** from the toolbar toggle (`sidebarHidden` state), which is a runtime toggle. Config-level hiding is permanent for the session.

---

## 4. Canvas Height Mode

`canvasHeightMode` sets the **initial** `flexibleHeight` state:

```ts
// ContentBuilder.vue — onMounted
if (props.config?.canvasHeightMode === 'flexible') {
  cms.state.flexibleHeight = true
} else if (props.config?.canvasHeightMode === 'fixed') {
  cms.state.flexibleHeight = false
}
// undefined → leave at current default (false)
```

The user can still toggle it at runtime via the toolbar button; this config only controls the initial value.

---

## 5. `ContentBuilder` Prop Integration

```ts
// ContentBuilder.vue
const props = defineProps<{
  plugins?: CmsPlugin[]
  config?: BuilderConfig
}>()
```

Config is passed down via `provide` so child components (`Toolbar`, `Sidebar`) can read it without prop-drilling:

```ts
// composables/useBuilderConfig.ts
import { provide, inject } from 'vue'
import type { BuilderConfig } from '../types'

const CONFIG_KEY = Symbol('builder-config')

export function provideBuilderConfig(config: BuilderConfig | undefined): void {
  provide(CONFIG_KEY, config ?? {})
}

export function useBuilderConfig(): BuilderConfig {
  return inject(CONFIG_KEY, {})
}
```

Called in `ContentBuilder.vue` setup:
```ts
provideBuilderConfig(props.config)
```

---

## 6. Usage Examples

### Minimal — single canvas size (no dropdown, auto-default)

```ts
<ContentBuilder
  v-model="json"
  :config="{
    canvasSizes: [{ label: 'Email', w: 600, h: 800 }],
  }"
/>
```

### Full config

```ts
<ContentBuilder
  v-model="json"
  :config="{
    canvasSizes: [
      { label: 'Desktop', w: 1440, h: 900, default: true },
      { label: 'Mobile',  w: 375,  h: 812 },
    ],
    sidebar: {
      sections: ['elements', 'layers'], // hide 'textStyles' tab
      sectionOptions: {
        elements: { label: 'Add' },    // rename tab
      },
    },
    canvasHeightMode: 'flexible',
    showScaleToggle: false,
  }"
/>
```

### Hide sidebar entirely via config

```ts
:config="{ sidebar: { sections: [] } }"
```

---

## 7. Files to Create / Modify

| File | Change |
|---|---|
| `app/src/types.ts` | Add `BuilderConfig`, `SidebarConfig`, `SidebarSection`, `CanvasHeightMode`; update `CanvasPreset` with `default?` |
| `app/src/composables/useBuilderConfig.ts` | New — `provideBuilderConfig` + `useBuilderConfig` |
| `app/src/composables/config.ts` | New — `resolveDefaultPreset`, `resolveVisibleTabs` helpers |
| `app/src/ContentBuilder.vue` | Accept `config` prop, call `provideBuilderConfig`, apply height mode and default preset on mount |
| `app/src/components/Toolbar.vue` | Read config via `useBuilderConfig`; compute `presets`, `singlePreset`, `showScaleToggle` |
| `app/src/components/Sidebar.vue` | Read config; compute `visibleTabs` with order + hidden support |

---

## 8. Migration / Backwards Compatibility

- All `BuilderConfig` fields optional → existing `<ContentBuilder v-model="json" />` with no `:config` prop works unchanged.
- Built-in `PRESETS` in Toolbar remain the fallback when `canvasSizes` is absent.
- `flexibleHeight` default stays `false` when `canvasHeightMode` is absent.
- Sidebar shows all three tabs in the original order when `sidebar` is absent.
