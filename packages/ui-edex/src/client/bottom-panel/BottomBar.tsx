/**
 * Bottom bar: a horizontal row of swappable bottom widgets — filesystem
 * browser, file preview/editor, and host terminal. The composition lives in
 * the BOTTOM_WIDGETS registry below: add, remove, or reorder a widget by
 * editing one line (its implementation lives in its own folder under
 * widgets/), and every section shares the same chrome via WidgetSection. The
 * per-widget column widths (left-bar width / center region / right-bar
 * width) are pinned in BottomBar.module.css via the `data-widget` attribute.
 */
import type { BottomWidgetHooks, BottomWidgetSlot } from '../widgets/types.ts'
import { WidgetSection } from '../widgets/WidgetSection.tsx'
import { FilesWidget } from './widgets/FilesWidget.tsx'
import { PreviewWidget } from './widgets/PreviewWidget.tsx'
import { TerminalWidget } from './widgets/TerminalWidget.tsx'
import css from './BottomBar.module.css'

/** The bottom panel's widget composition (left to right). */
const BOTTOM_WIDGETS: BottomWidgetSlot[] = [
  // Full-bleed bodies: the widgets own their inner spacing (file rows,
  // editor, terminal output/input), so each section drops the chrome padding.
  // The files widget renders the directory path as its own title (dynamic);
  // the terminal widget has no section title (its own bar shows the cwd).
  { id: 'files', fill: true, bleed: true, Component: FilesWidget },
  { id: 'preview', title: 'PREVIEW', fill: true, bleed: true, Component: PreviewWidget },
  { id: 'terminal', fill: true, bleed: true, Component: TerminalWidget },
]

/** The bottom row content (rendered inside the eDEX shell's bottom bar). */
export function BottomBar(props: BottomWidgetHooks) {
  return (
    <div className={css.panel} data-testid="edex-bottom-bar">
      {BOTTOM_WIDGETS.map(widget => (
        <WidgetSection key={widget.id} slot={widget}>
          <widget.Component {...props} />
        </WidgetSection>
      ))}
    </div>
  )
}