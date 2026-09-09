/**
 * Network status widget: interface name, link state, IP, and ping — the top
 * of the right bar.
 */
import type { RightWidgetHooks } from '../../widgets/types.ts'
import css from './NetworkStatusWidget.module.css'

/** Network status widget: interface state readout. */
export function NetworkStatusWidget({ useNetwork }: RightWidgetHooks) {
  const network = useNetwork(s => s)
  return (
    <>
      <div className={css.specLine}><span className={css.key}>INTERFACE</span><span>{network.network.interfaceName}</span></div>
      <div className={css.specLine}><span className={css.key}>STATE</span><span>{network.network.state}</span></div>
      <div className={css.specLine}><span className={css.key}>IP</span><span>{network.network.ip ?? '—'}</span></div>
      <div className={css.specLine}><span className={css.key}>PING</span><span>{network.network.pingMs === null ? '—' : `${network.network.pingMs.toFixed(0)}ms`}</span></div>
    </>
  )
}