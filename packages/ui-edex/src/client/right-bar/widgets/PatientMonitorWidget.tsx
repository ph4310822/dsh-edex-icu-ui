/**
 * PATIENT MONITOR widget (featured, replaces WORLD VIEW): the SimVitals
 * reference's signature element — three waveform lanes (ECG green, PLETH
 * cyan, RESP/CO2 yellow) sweeping over a fine blue-gray grid, each with a
 * numeric readout block (label, big value, limits), and an alarm/status
 * strip. Live data: the right-bar network hook drives the vitals (ping
 * rhythm → HR, throughput → SpO2 jitter, wall clock → RR cadence) so the
 * widget stays wired like every other slot; the reference drives simulated
 * vitals (divergence noted in review.md).
 */
import { useEffect, useRef, useState } from 'react'
import type { RightWidgetHooks } from '../../widgets/types.ts'
import css from './PatientMonitorWidget.module.css'

/** One lane's draw state: a phase pointer scrolled by rAF time. */
const LANE_MS = 6000

/** Sine-ish synthetic trace generators per lane kind. */
function ecgY(phase: number): number {
  // QRS-like composite: baseline + P bump + QRS spike + T bump.
  const beat = phase % 1
  const base = Math.sin(beat * Math.PI * 2) * 0.06
  const p = Math.exp(-((beat - 0.18) ** 2) / 0.0012) * 0.16
  const qrs = Math.exp(-((beat - 0.36) ** 2) / 0.00004) * 1.0
  const q = Math.exp(-((beat - 0.34) ** 2) / 0.00006) * -0.22
  const t = Math.exp(-((beat - 0.52) ** 2) / 0.004) * 0.3
  return base + p + qrs + q + t
}

function plethY(phase: number): number {
  const beat = phase % 1
  const rise = Math.exp(-((beat - 0.3) ** 2) / 0.02)
  const dicrotic = Math.exp(-((beat - 0.55) ** 2) / 0.008) * 0.35
  return rise + dicrotic
}

function respY(phase: number): number {
  return (Math.sin(phase * Math.PI * 2 - Math.PI / 2) + 1) / 2
}

/** Canvas waveform lane: sweeps right-to-left on a rAF clock. */
function WaveLane({ kind, color }: { kind: 'ecg' | 'pleth' | 'resp'; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const startRef = useRef<number>(0)
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return
    const ctx = canvas.getContext('2d')
    if (ctx === null) return
    const trace = kind === 'ecg' ? ecgY : kind === 'pleth' ? plethY : respY
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let raf = 0
    if (startRef.current === 0) startRef.current = performance.now()
    const draw = (now: number): void => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (width > 0 && height > 0) {
        if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
          canvas.width = width * dpr
          canvas.height = height * dpr
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, width, height)
        // Fine grid: 8 vertical cells, 4 horizontal, blue-gray hairlines.
        ctx.strokeStyle = 'rgba(30, 42, 52, 0.55)'
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let gx = 1; gx < 8; gx += 1) {
          const x = Math.round((width / 8) * gx) + 0.5
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
        }
        for (let gy = 1; gy < 4; gy += 1) {
          const y = Math.round((height / 4) * gy) + 0.5
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
        }
        ctx.stroke()
        // The trace: newest sample at the right edge, sweeping left.
        const elapsed = now - startRef.current
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.beginPath()
        const mid = height / 2
        const amp = height * 0.36
        const samples = Math.max(48, Math.floor(width / 2))
        for (let sx = 0; sx <= samples; sx += 1) {
          const x = (sx / samples) * width
          const window: number = elapsed / LANE_MS - (1 - sx / samples) * 1.4
          const y = mid - trace(window) * amp
          if (sx === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [kind, color])
  return <canvas ref={canvasRef} className={css.laneCanvas} aria-hidden="true" />
}

/** Patient monitor widget: three lanes + numerics + alarm strip. */
export function PatientMonitorWidget({ useNetwork }: RightWidgetHooks) {
  const network = useNetwork(s => s)
  const [clock, setClock] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  // Host-derived vitals: the network ping rhythm anchors HR, throughput
  // jitter shifts SpO2, the wall-clock cadence drives RR (layout reference,
  // values synthetic — noted in review).
  const ping = network.network.pingMs ?? 20
  const hr = 74 + Math.round(ping) % 9
  const spo2 = 97 - Math.round(ping) % 3
  const rr = 12 + (clock.getSeconds() % 6)
  const temp = 36.6 + ((network.upMbs * 10) % 6) / 10
  const alarm: string = network.ok ? 'ALL CLEAR' : 'SIGNAL LOST'
  return (
    <div className={css.monitor} data-testid="edex-patient-monitor">
      <div className={css.bedLine}>
        <span className={css.bedId}>BED 04</span>
        <span className={css.bedMode}>DSH / TELEMETRY</span>
        <span className={css.bedClock}>{clock.toLocaleTimeString('en-GB', { hour12: false })}</span>
      </div>
      <div className={`${css.alarmBand} ${network.ok ? css.alarmClear : css.alarmAlert}`} data-testid="edex-alarm-band">{alarm}</div>
      <div className={css.lanes}>
        <div className={css.laneRow}>
          <div className={css.lane}>
            <span className={css.laneLabelGreen}>ECG II</span>
            <WaveLane kind="ecg" color="#37ff71" />
          </div>
          <div className={css.readout}>
            <div className={css.readoutLabelGreen}>HR</div>
            <div className={css.readValueGreen}>{network.ok ? hr : '--'}</div>
            <div className={css.readoutSub}>bpm · 120/50</div>
          </div>
        </div>
        <div className={css.laneRow}>
          <div className={css.lane}>
            <span className={css.laneLabelCyan}>PLETH</span>
            <WaveLane kind="pleth" color="#29dfff" />
          </div>
          <div className={css.readout}>
            <div className={css.readoutLabelCyan}>SpO2</div>
            <div className={css.readValueCyan}>{network.ok ? spo2 : '--'}</div>
            <div className={css.readoutSub}>% · 100/92</div>
          </div>
        </div>
        <div className={css.laneRow}>
          <div className={css.lane}>
            <span className={css.laneLabelYellow}>RESP / CO2</span>
            <WaveLane kind="resp" color="#ffd34e" />
          </div>
          <div className={css.readout}>
            <div className={css.readoutLabelYellow}>RR</div>
            <div className={css.readValueYellow}>{network.ok ? rr : '--'}</div>
            <div className={css.readoutSub}>/min · 30/8</div>
          </div>
        </div>
      </div>
      <div className={css.tempLine}>
        <span className={css.tempLabel}>TEMP</span>
        <span className={css.tempValue}>{network.ok ? `${temp.toFixed(1)}°C` : '--'}</span>
        <span className={css.tempLabel}>NIBP</span>
        <span className={css.tempValue}>{network.ok ? `${118 + (hr - 72)}/76` : '--/--'}</span>
      </div>
    </div>
  )
}
