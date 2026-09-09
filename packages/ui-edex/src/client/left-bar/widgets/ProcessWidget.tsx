/**
 * Process widget: the top-processes table (scrolls to fill the leftover bar
 * height) with the loadavg footer pinned beneath it.
 */
import type { ProcessSample } from '@danielng23/dsh-host-system-metrics/types'
import type { LeftWidgetHooks } from '../../widgets/types.ts'
import css from './ProcessWidget.module.css'

/** Top-processes table. */
function ProcessTable({ processes }: { processes: readonly ProcessSample[] }) {
  return (
    <table className={css.procTable}>
      <thead>
        <tr>
          <th>PID</th>
          <th>NAME</th>
          <th className={css.num}>CPU%</th>
          <th className={css.num}>MEM%</th>
        </tr>
      </thead>
      <tbody>
        {processes.map(proc => (
          <tr key={proc.pid}>
            <td>{proc.pid}</td>
            <td className={css.procName}>{proc.name}</td>
            <td className={css.num}>{proc.cpuPct.toFixed(1)}</td>
            <td className={css.num}>{proc.memPct.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Process widget: top processes table + loadavg footer. */
export function ProcessWidget({ usePanel }: LeftWidgetHooks) {
  const processes = usePanel(s => s.processes)
  const loadavg = usePanel(s => s.loadavg)
  return (
    <>
      <div className={css.body}>
        <ProcessTable processes={processes} />
      </div>
      <div className={css.foot}>
        <span className={css.footText}>loadavg {loadavg.map(value => value.toFixed(2)).join(' ')}</span>
      </div>
    </>
  )
}