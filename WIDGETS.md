# Widget Architecture

The shell bars are composed of **self-contained, swappable widgets**. Each bar
is a thin container that iterates a registry of widget slots; every widget
owns its component, its styles, and the snapshot slices it renders. Replacing
one means swapping a single registry entry (and its widget folder) without
touching the rest of the bar.

The three bars share one parent wrapper — `WidgetSection` — so every widget
gets the same chrome: an optional amber **title**, the **border** divider, and
the widget's own **customized view** underneath.

## The contract

A widget slot is defined by `packages/ui-edex/src/client/widgets/types.ts`:

```ts
interface WidgetSlot<P> {
  id: string             // Stable React key + data-widget attribute
  title?: string         // Optional amber section heading
  fill?: boolean         // Flex-fill the bar's leftover height
  compact?: boolean      // Tight padding for full-bleed widgets (globe)
  bleed?: boolean        // Zero the chrome padding (terminal, file list)
  Component: ComponentType<P>  // The widget body
}
```

`P` is the hooks object the widget receives:

- **Left widgets** receive `{ usePanel: SnapshotSelectorHook<PanelSnapshot> }`
- **Right widgets** receive `{ useNetwork: SnapshotSelectorHook<NetworkSnapshot>; color: string }`
- **Bottom widgets** receive `BottomWidgetHooks` — the filesystem selector plus
  the file-browser / editor / terminal actions (see the bottom-bar registry)

The snapshot selector hooks are the same ones the shell injects — widgets call
`usePanel(s => s.cpuBusy)` (or any slice) to subscribe to exactly the data
they render.

## The registry

Each bar file declares its composition as a typed array:

**`packages/ui-edex/src/client/left-bar/LeftBar.tsx`**

```ts
const LEFT_WIDGETS: LeftWidgetSlot[] = [
  { id: 'info', Component: InfoWidget },
  { id: 'cpu', title: 'CPU', Component: CpuWidget },
  { id: 'processes', title: 'PROCESSES', fill: true, Component: ProcessWidget },
]
```

**`packages/ui-edex/src/client/right-bar/RightBar.tsx`**

```ts
const RIGHT_WIDGETS: RightWidgetSlot[] = [
  { id: 'network-status', title: 'NETWORK STATUS', Component: NetworkStatusWidget },
  { id: 'globe', title: 'WORLD VIEW', compact: true, Component: GlobeWidget },
  { id: 'traffic', title: 'TRAFFIC', fill: true, Component: TrafficWidget },
]
```

**`packages/ui-edex/src/client/bottom-panel/BottomBar.tsx`**

```ts
const BOTTOM_WIDGETS: BottomWidgetSlot[] = [
  { id: 'files', title: 'DIR', fill: true, bleed: true, Component: FilesWidget },
  { id: 'preview', title: 'PREVIEW', fill: true, bleed: true, Component: PreviewWidget },
  { id: 'terminal', title: 'TERMINAL', fill: true, bleed: true, Component: TerminalWidget },
]
```

The bottom bar is a **horizontal** row; its per-widget column widths (17vw /
center region / 21.25vw) are pinned in `BottomBar.module.css` through the
`data-widget` attribute that `WidgetSection` stamps on every section.

Each entry is rendered by `WidgetSection` — the shared chrome wrapper that
provides the amber title, the border divider, and the layout variants.

## File layout

```
packages/ui-edex/src/client/
├── widgets/                          # Shared vocabulary
│   ├── types.ts                      # WidgetSlot, hooks interfaces
│   ├── WidgetSection.tsx             # Section chrome renderer
│   └── WidgetSection.module.css
│
├── left-bar/
│   ├── LeftBar.tsx                   # Registry + render loop
│   ├── LeftBar.module.css            # .panel only
│   └── widgets/
│       ├── InfoWidget.tsx + .module.css
│       ├── CpuWidget.tsx  + .module.css
│       └── ProcessWidget.tsx + .module.css
│
├── right-bar/
│   ├── RightBar.tsx                  # Registry + render loop
│   ├── RightBar.module.css           # .panel only
│   └── widgets/
│       ├── NetworkStatusWidget.tsx + .module.css
│       ├── GlobeWidget.tsx  + .module.css
│       └── TrafficWidget.tsx + .module.css
│
└── bottom-panel/
    ├── BottomBar.tsx                 # Registry + render loop (horizontal row)
    ├── BottomBar.module.css          # .panel + per-widget column widths
    └── widgets/
        ├── FilesWidget.tsx + .module.css
        ├── PreviewWidget.tsx + .module.css
        ├── EditorPane.tsx + .module.css   # CodeMirror helper of PreviewWidget
        └── TerminalWidget.tsx + .module.css
```

The shell frame (`frame/EdexShell.tsx`) mounts the three bars plus an **empty
top panel** — a full-width strip that overlays the shell's top edge above
every other layer (see `.topPanel` in `frame/EdexShell.module.css`). The
center region (the original UI) is also wrapped in the standard widget chrome
via the `center` widget slot — `CENTER_SLOT` in `EdexShell.tsx` — with an
empty title bar (like the info widget) and `bleed` padding, so the whole
canvas participates in the same widget vocabulary.

## Creating a new widget

1. **Create a folder** under `left-bar/widgets/`, `right-bar/widgets/`, or
   `bottom-panel/widgets/` with your `.tsx` and `.module.css` files.

2. **Export a component** that takes the hooks interface:

   ```tsx
   export function MyWidget({ usePanel }: LeftWidgetHooks) {
     const cpu = usePanel(s => s.cpuBusy)
     // ...
   }
   ```

3. **Import** it in the bar file and add one line to the registry:

   ```ts
   import { MyWidget } from './widgets/MyWidget.tsx'
   // ...
   const LEFT_WIDGETS = [
     { id: 'my-widget', title: 'MY WIDGET', Component: MyWidget },
     // ...existing entries
   ]
   ```

## Replacing an existing widget

- **Swap the component** in the registry entry — point `Component` at a
  different implementation.
- **Remove the entry** to drop the widget entirely.
- **Reorder** the array to change visual order.

The widget's old folder can be deleted once the registry no longer references
it. No other file in the bar or the shell needs to change.

## Section chrome variants

The `WidgetSection` wrapper supports four layout flags:

| Flag | Effect |
|------|--------|
| `fill` | `flex: 1; display: flex; flex-direction: column; min-height: 0` — fills the bar's leftover height |
| `compact` | `padding: 2px 4px` — tight padding for full-bleed content (the globe) |
| `bleed` | `padding: 0` — the widget body owns all inner spacing (bottom widgets); the title keeps its own inset |

Widgets tile with **no divider lines** between sections. These flags are set
per-entry in the registry. A widget that needs `fill` (e.g. the traffic chart)
sets `fill: true`; the section chrome handles the layout, and the widget's own
CSS only needs to manage its internal flex children. Bottom widgets use
`fill: true` + `bleed: true` so their full-bleed bodies (file rows, editor,
terminal output/input) stretch to the section's remaining height.
