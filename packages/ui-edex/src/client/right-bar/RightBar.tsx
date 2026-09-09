/**
 * Right bar: a vertical stack of swappable network widgets — interface
 * status, the world-view globe, and traffic charts. The composition lives in
 * the RIGHT_WIDGETS registry below: add, remove, or reorder a widget by
 * editing one line (its implementation lives in its own folder under
 * widgets/), and every section shares the same chrome via WidgetSection.
 */
import type { RightWidgetHooks, RightWidgetSlot } from '../widgets/types.ts'
import { WidgetSection } from '../widgets/WidgetSection.tsx'
import { GlobeWidget } from './widgets/GlobeWidget.tsx'
import { NetworkStatusWidget } from './widgets/NetworkStatusWidget.tsx'
import { TrafficWidget } from './widgets/TrafficWidget.tsx'
import css from './RightBar.module.css'

/** The right panel's widget composition (top to bottom). */
const RIGHT_WIDGETS: RightWidgetSlot[] = [
  { id: 'network-status', title: 'NETWORK STATUS', Component: NetworkStatusWidget },
  // Compact padding so the square globe fills more of the bar.
  { id: 'globe', title: 'WORLD VIEW', compact: true, Component: GlobeWidget },
  // Flex-fills the bar's leftover height (screen − bottom panel − other sections).
  { id: 'traffic', title: 'TRAFFIC', fill: true, Component: TrafficWidget },
]

/** The right column content (rendered inside the eDEX shell's right bar). */
export function RightBar({ useNetwork, color }: RightWidgetHooks) {
  return (
    <div className={css.panel} data-testid="edex-right-bar">
      {RIGHT_WIDGETS.map(widget => (
        <WidgetSection key={widget.id} slot={widget}>
          <widget.Component useNetwork={useNetwork} color={color} />
        </WidgetSection>
      ))}
    </div>
  )
}