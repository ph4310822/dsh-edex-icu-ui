/**
 * NETWORK STATUS widget (SimVitals reference): the monitor's bed/status line
 * language — a green BED id line, muted mode text, and the interface facts
 * as spec lines (muted keys, white values). Same `useNetwork` hook slice
 * (match: partial per analysis).
 */
import type { RightWidgetHooks } from '../../widgets/types.ts'
import css from './NetworkStatusWidget.module.css'

/** Network status widget: bed-status-styled interface readout. */
export function NetworkStatusWidget({ useNetwork }: RightWidgetHooks) {
  const network = useNetwork(s => s)
  return (
    <>
      <div className={css.bedLine}>
        <span className={css.bedId}>BED 04</span>
        <span className={css.bedMode}>{network.ok ? 'LINK ACTIVE' : 'LINK DOWN'}</span>
      </div>
      <div className={css.specLine}><span className={css.key}>INTERFACE</span><span>{network.network.interfaceName}</span></div>
      <div className={css.specLine}><span className={css.key}>STATE</span><span className={network.ok ? css.valueOk : css.valueAlert}>{network.network.state}</span></div>
      <div className={css.specLine}><span className={css.key}>IP</span><span>{network.network.ip ?? '—'}</span></div>
      <div className={css.specLine}><span className={css.key}>PING</span><span>{network.network.pingMs === null ? '—' : `${network.network.pingMs.toFixed(0)}ms`}</span></div>
    </>
  )
}
