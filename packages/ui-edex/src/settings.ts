/**
 * eDEX theme-color setting: the single durable accent that drives both the
 * shell frame's palette (`--edex-*`) and the terminal token override layer
 * over the original UI (`--dsw-alias-*`). One color in, a full CRT family
 * out — primary, dim midtone, dark border, and a faint tinted panel tone —
 * while the semantic accents (amber warn, red error, cyan info) stay fixed.
 * Shared by the Host loader entry (schema registration) and the browser half
 * (scope binding, token overrides, and the settings row).
 */
import z from '@deepseek-ai/schemastery'
import type { ThemeTokenOverrides } from '@deepseek-ai/dsh-client-ui-theme/client'

/** Settings namespace owned by the eDEX shell plugin. */
export const EDEX_SETTINGS_NAMESPACE = 'ui-edex'

/** Field carrying the selected theme color. */
export const THEME_COLOR_FIELD = 'themeColor'

/** The default theme color — the ICU monitor's clinical ECG green. */
export const DEFAULT_THEME_COLOR = '#37ff71'

/** Durable theme-color section shared by the Host schema and the browser scope. */
export interface EdexSettings {
  /** The accent color driving the whole eDEX palette. */
  themeColor: string
}

/** Durable theme-color schema; also the wire envelope the browser scope validates against. */
export const EdexSettingsSchema: z<EdexSettings> = z.object({
  [THEME_COLOR_FIELD]: z.string().default(DEFAULT_THEME_COLOR),
})

/** One selectable preset swatch. */
export interface ThemeColorPreset {
  /** Stable preset id (the swatch key). */
  id: string
  /** Locale key for the swatch's accessible name. */
  labelKey: string
  /** The accent color this preset applies. */
  color: string
}

/** Preset swatches offered in the Theme Color settings row. */
export const THEME_COLOR_PRESETS: readonly ThemeColorPreset[] = Object.freeze([
  { id: 'analyzed', labelKey: 'edex.preset.analyzed', color: '#37ff71' },
  { id: 'cyan', labelKey: 'edex.preset.cyan', color: '#29dfff' },
  { id: 'amber', labelKey: 'edex.preset.amber', color: '#ffd34e' },
  { id: 'red', labelKey: 'edex.preset.red', color: '#d84351' },
  { id: 'violet', labelKey: 'edex.preset.violet', color: '#c792ea' },
])

/**
 * The semantic accents that stay fixed across theme colors — the ICU
 * monitor's lane/alarm vocabulary: warn yellow (RESP/CO2 lane), alarm red
 * (critical alarm band), info cyan (PLETH/SpO2 lane).
 */
export const FIXED_ACCENTS = Object.freeze({
  amber: '#ffd34e',
  red: '#d84351',
  cyan: '#29dfff',
})

/**
 * The ICU monitor's measured surfaces (vision palette + pixel measurement on
 * the SimVitals reference): the monitor interior, the page canvas, the slate
 * panel/card fill, the blue-gray border and secondary text, and the near-black
 * input fill. The frame family is pinned to these instead of being derived
 * from the green accent — the reference's surfaces are blue-gray slate, NOT
 * green-tinted.
 */
export const ICU_SURFACES = Object.freeze({
  /** Monitor interior / deepest canvas. */
  background: '#020405',
  /** Page canvas (the surface the workspace shares with the panels). */
  canvas: '#040609',
  /** Slate panel/card fill (header, scenario cards, title strips). */
  panelTone: '#0f181d',
  /** Blue-gray 1px border. */
  border: '#1e2a34',
  /** Muted blue-gray secondary text. */
  textSecondary: '#7f96a8',
  /** Primary white text. */
  textPrimary: '#eaf4fd',
  /** Near-black input fill. */
  inputFill: '#0b1016',
})

/** The full eDEX palette derived from one accent color. */
export interface EdexPalette {
  /** The primary accent (text, icons, fills). */
  primary: string
  /** Muted midtone (secondary text, icon tints). */
  dim: string
  /** Dark border tone. */
  border: string
  /** Faint tinted panel background. */
  panel2: string
}

/** Normalize an #rgb/#rrggbb hex to lowercase #rrggbb, or null when invalid. */
export function normalizeHex(value: string): string | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim())
  if (match === null) return null
  const hex = match[1] as string
  if (hex.length === 3) return `#${hex.split('').map(c => c + c).join('')}`.toLowerCase()
  return `#${hex}`.toLowerCase()
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function channel(value: number): string {
  return clamp(value).toString(16).padStart(2, '0')
}

/** #rrggbb → 0..255 channels (the caller has already normalized). */
function hexToRgb(color: string): { r: number; g: number; b: number } {
  return {
    r: Number.parseInt(color.slice(1, 3), 16),
    g: Number.parseInt(color.slice(3, 5), 16),
    b: Number.parseInt(color.slice(5, 7), 16),
  }
}

/**
 * Derive the full eDEX family from one accent color. The ICU reference's
 * frame surfaces are blue-gray slate measured off the monitor (NOT tone-derived
 * from the green accent), so dim/border/panel2 are pinned to the measured
 * `ICU_SURFACES` values; only `primary` follows the selected accent.
 */
export function paletteFor(color: string): EdexPalette {
  return {
    primary: normalizeHex(color) ?? DEFAULT_THEME_COLOR,
    dim: ICU_SURFACES.textSecondary,
    border: ICU_SURFACES.border,
    panel2: ICU_SURFACES.panelTone,
  }
}

/** The eDEX shell frame's CSS variables for one palette (amber/red/cyan stay in the stylesheet). */
export function shellVarsFor(palette: EdexPalette): Record<string, string> {
  return {
    '--edex-green': palette.primary,
    '--edex-dim': palette.dim,
    '--edex-border': palette.border,
    '--edex-panel-2': palette.panel2,
  }
}

/**
 * The full `--edex-*` variable set for the ORIGINAL UI (the composer, sidebar,
 * and conversation scrollbar live outside the shell frame, so the theme CSS
 * resolves these from `body` — set there by the browser half, with the static
 * accents joining the dynamic palette). The shell frame defines its own copy
 * on `.shell` and overrides it inline, so the two never fight.
 */
export function bodyVarsFor(palette: EdexPalette): Record<string, string> {
  return {
    ...shellVarsFor(palette),
    '--edex-amber': FIXED_ACCENTS.amber,
    '--edex-red': FIXED_ACCENTS.red,
    '--edex-cyan': FIXED_ACCENTS.cyan,
  }
}

/** One override-layer token value pair; both palettes carry the same value (the terminal skin is scheme-invariant). */
function both(value: string): { light: string; dark: string } {
  return { light: value, dark: value }
}

/**
 * The token override layer that recolors the whole original UI — every label
 * token that feeds icon glyphs included — from one palette. `label-tertiary`
 * and `label-caption` are the specific tokens behind the small icons beside
 * tool names (Bash / Read / Think / …) and their separators, so overriding
 * them is what makes those glyphs theme-colored like every other icon.
 */
export function tokenOverridesFor(palette: EdexPalette): ThemeTokenOverrides {
  return {
    // The workspace shares the monitor's canvas (KIBO lesson: a pure-black
    // workspace reads as a different surface than the themed panels).
    '--dsw-alias-bg-base': both(ICU_SURFACES.canvas),
    '--dsw-alias-bg-layer-1': both(ICU_SURFACES.canvas),
    '--dsw-alias-bg-layer-2': both(ICU_SURFACES.panelTone),
    '--dsw-alias-bg-overlay': both(ICU_SURFACES.canvas),
    '--dsw-alias-border-l1': both(palette.border),
    '--dsw-alias-border-l2': both(palette.dim),
    '--dsw-alias-border-l3': both(palette.primary),
    '--dsw-alias-brand-primary': both(palette.primary),
    '--dsw-alias-label-primary': both(ICU_SURFACES.textPrimary),
    '--dsw-alias-label-primary-bluish': both(palette.primary),
    '--dsw-alias-label-primary-dimmed': both(palette.dim),
    '--dsw-alias-label-secondary': both(palette.dim),
    '--dsw-alias-label-tertiary': both(palette.dim),
    '--dsw-alias-label-caption': both(palette.dim),
    '--dsw-alias-state-error-primary': both(FIXED_ACCENTS.red),
    '--dsw-alias-state-success-primary': both(palette.primary),
    '--dsw-alias-state-warn-primary': both(FIXED_ACCENTS.amber),
    '--dsw-alias-state-business-primary': both(palette.primary),
    '--dsw-alias-button-info-fill': both(palette.primary),
    '--dsw-alias-button-info-hover': both(palette.dim),
    '--dsw-specific-sidebar-fill': both(ICU_SURFACES.canvas),
    '--dsw-specific-input-major': both(ICU_SURFACES.inputFill),
  }
}
