/**
 * CPU widget: per-core-pair sparklines with live percentages, the
 * TEMP/MIN/MAX/TASKS metric row, and the memory/swap block bars.
 */
import type { LeftWidgetHooks } from '../../widgets/types.ts'
import css from './CpuWidget.module.css'

/** Tiny SVG sparkline over a 0..100 series. */
function Sparkline({ data, width = 64, height = 18 }: { data: readonly number[]; width?: number; height?: number }) {
  const points = data
    .map((value, index) => {
      const x = data.length <= 1 ? 0 : (index / (data.length - 1)) * width
      const y = height - (Math.min(100, Math.max(0, value)) / 100) * height
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg
      className={css.spark}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {points !== '' && <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1" />}
    </svg>
  )
}

/** Segmented progress bar (block style). */
function BlockBar({ used, total }: { used: number; total: number }) {
  const blocks = 20
  const ratio = total > 0 ? Math.min(1, Math.max(0, used / total)) : 0
  const filled = Math.round(ratio * blocks)
  return (
    <div className={css.blockBar} aria-hidden="true">
      {Array.from({ length: blocks }, (_, index) => (
        <span key={index} className={index < filled ? css.blockOn : css.blockOff} />
      ))}
    </div>
  )
}

/** CPU core-pair section: sparkline + percentage per pair (#1-2, #3-4...). */
function CpuPairs({ busy, history }: { busy: readonly number[]; history: readonly (readonly number[])[] }) {
  const pairs: { label: string; pct: number; series: readonly number[] }[] = []
  for (let index = 0; index < busy.length; index += 2) {
    const a = busy[index] ?? 0
    const b = busy[index + 1]
    pairs.push({
      label: b === undefined ? `#${index + 1}` : `#${index + 1}-${index + 2}`,
      pct: Math.round((a + (b ?? a)) / (b === undefined ? 1 : 2)),
      series: history[index] ?? [],
    })
  }
  return (
    <div className={css.cpuPairs}>
      {pairs.map(pair => (
        <div key={pair.label} className={css.cpuPair}>
          <span className={css.cpuLabel}>{pair.label}</span>
          <Sparkline data={pair.series} />
          <span className={css.cpuPct}>{String(pair.pct).padStart(3, ' ')}%</span>
        </div>
      ))}
    </div>
  )
}

/** CPU widget: per-core telemetry + memory/swap usage. */
export function CpuWidget({ usePanel }: LeftWidgetHooks) {
  const panel = usePanel(s => s)
  return (
    <>
      <CpuPairs busy={panel.cpuBusy} history={panel.cpuHistory} />
      <div className={css.metricRow}>
        <div className={css.metric}><span className={css.metricKey}>TEMP</span><span>{panel.thermalLevel === null ? '--' : String(Math.round(panel.thermalLevel))}</span></div>
        <div className={css.metric}><span className={css.metricKey}>MIN</span><span>{String(Math.round(panel.cpuMin))}%</span></div>
        <div className={css.metric}><span className={css.metricKey}>MAX</span><span>{String(Math.round(panel.cpuMax))}%</span></div>
        <div className={css.metric}><span className={css.metricKey}>TASKS</span><span>{panel.tasks}</span></div>
      </div>
      <div className={css.memBlock}>
        <div className={css.memLabel}>
          <span>USING {panel.memoryUsedGiB.toFixed(1)} OF {panel.memoryTotalGiB.toFixed(1)} GiB</span>
          <span className={css.memPct}>{panel.memoryTotalGiB > 0 ? `${Math.round((panel.memoryUsedGiB / panel.memoryTotalGiB) * 100)}%` : ''}</span>
        </div>
        <BlockBar used={panel.memoryUsedGiB} total={panel.memoryTotalGiB} />
        <div className={css.memLabel}>
          <span>SWAP {panel.swapUsedGiB.toFixed(1)} / {panel.swapTotalGiB.toFixed(1)} GiB</span>
          <span className={css.memPct}>{panel.swapTotalGiB > 0 ? `${Math.round((panel.swapUsedGiB / panel.swapTotalGiB) * 100)}%` : ''}</span>
        </div>
        <BlockBar used={panel.swapUsedGiB} total={panel.swapTotalGiB} />
      </div>
    </>
  )
}