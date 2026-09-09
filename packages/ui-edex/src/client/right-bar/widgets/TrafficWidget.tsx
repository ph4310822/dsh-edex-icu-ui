/**
 * Traffic widget: the dual up/down throughput sparkline over a light grid,
 * sized by ResizeObserver to the bar's leftover height.
 */
import { useEffect, useRef, useState } from 'react'
import type { RightWidgetHooks } from '../../widgets/types.ts'
import css from './TrafficWidget.module.css'

/** Dual up/down sparkline with a light grid overlay. The height is dynamic:
 *  the section flex-fills the bar's leftover space (screen − bottom panel −
 *  network status − globe), and a ResizeObserver sizes the SVG viewBox to
 *  match the box 1:1, so strokes render cleanly at any size. */
function TrafficChart({ up, down }: { up: readonly number[]; down: readonly number[] }) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ w: 316, h: 160 })

  useEffect(() => {
    const host = hostRef.current
    if (host === null) return
    const measure = (): void => {
      const rect = host.getBoundingClientRect()
      setSize({ w: Math.max(80, Math.floor(rect.width)), h: Math.max(48, Math.floor(rect.height)) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(host)
    return () => { ro.disconnect() }
  }, [])

  const { w, h } = size
  const PAD = 2  // viewBox padding so lines at the extremes never clip (stroke extends ±0.75px)
  const toPoints = (series: readonly number[]): string => {
    const max = Math.max(1, ...series)
    return series
      .map((value, index) => {
        const x = series.length <= 1 ? 0 : (index / (series.length - 1)) * w
        const y = PAD + (1 - value / max) * (h - 2 * PAD)
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }
  // Light grid: 4 horizontal bands × 8 vertical columns (1:1 viewBox = 1px strokes).
  const horizontalLines = [0.25, 0.5, 0.75].map(f => PAD + f * (h - 2 * PAD))
  const verticalLines = Array.from({ length: 7 }, (_, i) => (w / 8) * (i + 1))
  return (
    <div ref={hostRef} className={css.trafficChart}>
      <svg
        className={css.traffic}
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g stroke="currentColor" strokeOpacity="0.18" strokeWidth="1">
          {horizontalLines.map(y => <line key={`h${y}`} x1="0" y1={y} x2={w} y2={y} />)}
          {verticalLines.map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2={h} />)}
        </g>
        <polyline points={toPoints(down)} fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
        <polyline className={css.trafficUp} points={toPoints(up)} fill="none" strokeWidth="1.5" opacity="0.9" />
      </svg>
    </div>
  )
}

/** Traffic widget: up/down throughput header + chart. */
export function TrafficWidget({ useNetwork }: RightWidgetHooks) {
  const network = useNetwork(s => s)
  return (
    <>
      <div className={css.trafficHeader}>
        <span><span className={css.key}>UP</span> {network.upMbs.toFixed(2)} MB/s</span>
        <span><span className={css.key}>DOWN</span> {network.downMbs.toFixed(2)} MB/s</span>
      </div>
      <TrafficChart up={network.upHistory} down={network.downHistory} />
    </>
  )
}