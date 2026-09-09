/**
 * Terminal theme plugin, browser half: registers the CRT `terminal` theme with
 * the theme service (alias-token overrides over the dark base palette) and
 * contributes one Appearance row that activates it. Purely additive — the
 * default surface is untouched, so every existing slot/widget keeps working
 * and picks up the palette automatically.
 */
import type { Context } from '@deepseek-ai/cordis'
import type { ThemeTokens } from '@deepseek-ai/dsh-client-ui-theme/client'
// Type-only: pulls the theme plugin's Context merge (ctx.theme) into this compilation.
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale) into this
// compilation.
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the settings surface's slot contract (the
// settings.general.item SlotMap merge) into this compilation.
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { NS, zh, en } from './locales.ts'
import { TerminalThemeRow, type TerminalThemeRowInjected } from './TerminalThemeRow.tsx'

/** Theme id this plugin registers (the setTheme argument). */
export const THEME_ID = 'terminal'

/** Bare observable snapshot source (getSnapshot + subscribe). */
export interface ObservableSource<T> {
  getSnapshot(): T
  subscribe(listener: () => void): () => void
}

/**
 * ICU patient-monitor palette as alias-token overrides (measured off the
 * SimVitals reference — analysis.json theme.*). Replaces the inherited CRT
 * green family: clinical green #37ff71 accent, near-black blue-green canvas,
 * slate panels, blue-gray borders, white primary text. NOTE: the green here
 * is THIS reference's ECG green, not the stock terminal green.
 */
const TOKENS: ThemeTokens = {
  '--dsw-alias-bg-base': '#040609',
  '--dsw-alias-bg-layer-1': '#040609',
  '--dsw-alias-bg-layer-2': '#0f181d',
  '--dsw-alias-bg-overlay': '#040609',
  '--dsw-alias-border-l1': '#1e2a34',
  '--dsw-alias-border-l2': '#7f96a8',
  '--dsw-alias-brand-primary': '#37ff71',
  '--dsw-alias-label-primary': '#eaf4fd',
  '--dsw-alias-label-secondary': '#7f96a8',
  '--dsw-alias-state-error-primary': '#d84351',
  '--dsw-alias-state-success-primary': '#37ff71',
  '--dsw-alias-state-warn-primary': '#ffd34e',
  '--dsw-specific-sidebar-fill': '#040609',
}

/** Required services: slot registry for the Appearance row, the theme service, and locale. */
export const inject = ['slots', 'theme', 'locale']

/**
 * Client plugin body: register the terminal theme and the Appearance row that
 * selects it.
 * @param ctx - client root context.
 */
export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-theme-terminal: dictionaries')

  const disposeTheme = ctx.theme.register({ id: THEME_ID, colorScheme: 'dark', tokens: TOKENS })
  ctx.effect(() => () => void disposeTheme(), 'ui-theme-terminal: theme registration')

  // "Is the terminal theme active" source for the row's hook seat; re-reads
  // the active theme on every theme/change and is disposable with the fiber.
  const terminalActiveSource: ObservableSource<boolean> = {
    getSnapshot: () => ctx.theme.getTheme().active.id === THEME_ID,
    subscribe: (listener) => ctx.on('theme/change', () => listener()),
  }

  // The built-in Appearance row occupies settings.general.item at order 10;
  // this row joins it (list slot, additive) at order 11.
  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'appearance-terminal',
    order: 11,
    locale: NS,
    inject: (): TerminalThemeRowInjected => ({
      setTerminal: () => { ctx.theme.setTheme(THEME_ID) },
      hooks: { terminalActive: terminalActiveSource },
    }),
  }, TerminalThemeRow))
}
