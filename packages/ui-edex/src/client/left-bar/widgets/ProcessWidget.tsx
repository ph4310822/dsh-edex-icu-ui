/**
 * PROCESS widget (SimVitals reference): the top-processes table restyled as
 * the sidebar's stacked scenario-card list — selectable-looking dark slate
 * cards with a bold title line and a muted detail line, one per process.
 * Same `processes` hook slice; only the presentation changed (match: partial
 * per analysis).
 */
import type { ProcessSample } from '@danielng23/dsh-host-system-metrics/types'
import type { LeftWidgetHooks } from '../../widgets/types.ts'
import css from './ProcessWidget.module.css'

/** One scenario-style card for a process. */
function ScenarioCard({ proc }: { proc: ProcessSample }) {
  return (
    <div className={css.card}>
      <div className={css.cardTitleRow}>
        <span className={css.cardTitle}>{proc.name}</span>
        <span className={css.cardCpu}>{proc.cpuPct.toFixed(1)}%</span>
      </div>
      <div className={css.cardBody}>pid {proc.pid} · mem {proc.memPct.toFixed(1)}%</div>
    </div>
  )
}

/** Process widget: scenario-card list + loadavg footer. */
export function ProcessWidget({ usePanel }: LeftWidgetHooks) {
  const processes = usePanel(s => s.processes)
  const loadavg = usePanel(s => s.loadavg)
  return (
    <>
      <div className={css.body}>
        {processes.map(proc => <ScenarioCard key={proc.pid} proc={proc} />)}
      </div>
      <div className={css.foot}>
        <span className={css.footText}>loadavg {loadavg.map(value => value.toFixed(2)).join(' ')}</span>
      </div>
    </>
  )
}
