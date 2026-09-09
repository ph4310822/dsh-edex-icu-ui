/**
 * Shared section chrome for shell-bar widgets: the card with the optional
 * amber heading and layout variants (fill leftover height, compact, bleed).
 * Rendered by the left/right/bottom bars for every entry in their widget
 * registry, so all widgets share one visual vocabulary — no divider lines
 * between sections.
 */
import type { ReactNode } from 'react'
import type { WidgetSlot } from './types.ts'
import css from './WidgetSection.module.css'

export function WidgetSection<P>({ slot, children }: { slot: WidgetSlot<P>; children: ReactNode }) {
  const { id, title, fill, compact, bleed } = slot
  const classes = [css.section]
  if (fill === true) classes.push(css.fill)
  if (compact === true) classes.push(css.compact)
  if (bleed === true) classes.push(css.bleed)
  return (
    <section className={classes.join(' ')} data-widget={id}>
      {title !== undefined && <div className={css.title}>{title}</div>}
      {children}
    </section>
  )
}