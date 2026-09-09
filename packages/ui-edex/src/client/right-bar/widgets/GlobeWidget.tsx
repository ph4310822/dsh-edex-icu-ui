/**
 * Globe widget: the encom-globe WebGL world view with endpoint markers and
 * spline links, plus the endpoint lat/lon readout pinned to the pane corner.
 */
import { useEffect, useRef } from 'react'
// Vendored local encom-globe checkout (modified; see vendor/encom-globe).
import Globe from '../../../../vendor/encom-globe/src/Globe.js'
import { generateGlobeTiles } from '../../shared/tiles.ts'
import type { RightWidgetHooks } from '../../widgets/types.ts'
import css from './GlobeWidget.module.css'

/** Sample endpoints (lat/lon) drawn on the globe. */
const ENDPOINTS: readonly { label: string; lat: number; lon: number }[] = [
  { label: 'US-WEST', lat: 34.05, lon: -118.24 },
  { label: 'US-EAST', lat: 40.71, lon: -74.01 },
  { label: 'EU-CENTRAL', lat: 48.86, lon: 2.35 },
  { label: 'AP-SOUTH', lat: 1.35, lon: 103.82 },
  { label: 'AP-NORTHEAST', lat: 35.68, lon: 139.69 },
]

/** The encom-globe rendering size (1:1; the canvas is CSS-scaled to the pane). */
const GLOBE_WIDTH = 320
const GLOBE_HEIGHT = 320

/** WebGL world view: an encom-globe instance with the endpoint markers chained by splines. */
function WorldView({ color }: { color: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (host === null) return
    let raf = 0
    let globe: Globe | null = null
    let disposed = false
    try {
      globe = new Globe(GLOBE_WIDTH, GLOBE_HEIGHT, {
        baseColor: color,
        markerColor: color,
        pinColor: '#5ad1e0',
        satelliteColor: color,
        font: 'Inconsolata',
        introLinesDuration: 1200,
        maxMarkers: ENDPOINTS.length + 2,
        // The hex-particle surface: generated at runtime (the library's
        // precomputed grid.js is ~960 KB; this keeps the bundle small).
        tiles: generateGlobeTiles(),
      })
    } catch {
      return // no WebGL: leave the pane empty rather than crashing the panel
    }
    host.appendChild(globe.domElement)
    const loop = (): void => {
      if (globe !== null && globe.active) globe.tick()
      raf = requestAnimationFrame(loop)
    }
    globe.init(() => {
      if (disposed) return
      let first = true
      for (const endpoint of ENDPOINTS) {
        globe?.addMarker(endpoint.lat, endpoint.lon, endpoint.label, !first)
        first = false
      }
      raf = requestAnimationFrame(loop)
    })
    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      if (globe !== null) {
        globe.destroy()
        globe.domElement.remove()
      }
    }
  }, [color])

  return <div ref={hostRef} className={css.globeHost} data-testid="edex-world-view" />
}

/** Globe widget: world view + endpoint readout. */
export function GlobeWidget({ color }: RightWidgetHooks) {
  return (
    <div className={css.globePane}>
      <WorldView color={color} />
      <div className={css.endpoints}>
        {ENDPOINTS.map(endpoint => (
          <div key={endpoint.label} className={css.endpoint}>
            <span className={css.endpointName}>{endpoint.label}</span>
            <span className={css.endpointCoord}>{endpoint.lat.toFixed(2)}°N {Math.abs(endpoint.lon).toFixed(2)}°{endpoint.lon < 0 ? 'W' : 'E'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}