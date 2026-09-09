/**
 * SYSTEM VITALS widget (replaces CPU, SimVitals reference): the monitor's
 * right numeric column as a live telemetry block — per-lane readout rows
 * (colored label, big value, muted sub-line) for the host's CPU/memory/load
 * channels, laid out like the reference's HR/SpO2/RR blocks.
 */
import type { LeftWidgetHooks } from '../../widgets/types.ts'
import css from './CpuWidget.module.css'

/** One readout row: colored label + big value + muted sub-line. */
function VitalRow({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: 'green' | 'cyan' | 'yellow' }) {
  return (
    <div className={css.vitalRow}>
      <span className={`${css.vitalLabel} ${tone === 'green' ? css.green : tone === 'cyan' ? css.cyan : css.yellow}`}>{label}</span>
      <span className={`${css.vitalValue} ${tone === 'green' ? css.green : tone === 'cyan' ? css.cyan : css.yellow}`}>{value}</span>
      <span className={css.vitalSub}>{sub}</span>
    </div>
  )
}

/** SYSTEM VITALS: host telemetry in the monitor's numeric-column language. */
export function CpuWidget({ usePanel }: LeftWidgetHooks) {
  const panel = usePanel(s => s)
  const cpu = panel.cpuBusy.length > 0
    ? Math.round(panel.cpuBusy.reduce((sum, value) => sum + value, 0) / panel.cpuBusy.length)
    : 0
  const memPct = panel.memoryTotalGiB > 0 ? Math.round((panel.memoryUsedGiB / panel.memoryTotalGiB) * 100) : 0
  const swapPct = panel.swapTotalGiB > 0 ? Math.round((panel.swapUsedGiB / panel.swapTotalGiB) * 100) : 0
  return (
    <div className={css.vitals}>
      <VitalRow label="CPU" value={String(cpu)} sub={`% · min ${Math.round(panel.cpuMin)} / max ${Math.round(panel.cpuMax)}`} tone="green" />
      <VitalRow label="MEM" value={String(memPct)} sub={`% of ${panel.memoryTotalGiB.toFixed(0)} GiB`} tone="cyan" />
      <VitalRow label="SWAP" value={String(swapPct)} sub={`% of ${panel.swapTotalGiB.toFixed(0)} GiB`} tone="yellow" />
      <VitalRow label="TEMP" value={panel.thermalLevel === null ? '--' : String(Math.round(panel.thermalLevel))} sub="thermal level" tone="green" />
      <VitalRow label="TASKS" value={String(panel.tasks)} sub="host processes" tone="cyan" />
      <div className={css.loadLine}>
        <span className={css.loadKey}>LOAD</span>
        <span className={css.loadValue}>{panel.loadavg.map(value => value.toFixed(2)).join('  ')}</span>
      </div>
    </div>
  )
}
