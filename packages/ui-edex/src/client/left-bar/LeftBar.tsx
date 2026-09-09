/**
 * Left bar: a vertical stack of swappable system widgets — info
 * (clock/specs), CPU telemetry, and top processes. The composition lives in
 * the LEFT_WIDGETS registry below: add, remove, or reorder a widget by
 * editing one line (its implementation lives in its own folder under
 * widgets/), and every section shares the same chrome via WidgetSection.
 */
import type { LeftWidgetHooks, LeftWidgetSlot } from '../widgets/types.ts'
import { WidgetSection } from '../widgets/WidgetSection.tsx'
import { CpuWidget } from './widgets/CpuWidget.tsx'
import { InfoWidget } from './widgets/InfoWidget.tsx'
import { ProcessWidget } from './widgets/ProcessWidget.tsx'
import css from './LeftBar.module.css'

/** The left panel's widget composition (top to bottom). */
const LEFT_WIDGETS: LeftWidgetSlot[] = [
  { id: 'info', Component: InfoWidget },
  { id: 'cpu', title: 'CPU', Component: CpuWidget },
  // Flex-fills the leftover bar height so the table runs into the loadavg
  // footer the widget itself renders.
  { id: 'processes', title: 'PROCESSES', fill: true, Component: ProcessWidget },
]

/** The left column content (rendered inside the eDEX shell's left bar). */
export function LeftBar({ usePanel }: LeftWidgetHooks) {
  return (
    <div className={css.panel} data-testid="edex-left-bar">
      {LEFT_WIDGETS.map(widget => (
        <WidgetSection key={widget.id} slot={widget}>
          <widget.Component usePanel={usePanel} />
        </WidgetSection>
      ))}
    </div>
  )
}