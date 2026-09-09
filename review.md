# Review — ICU Patient Monitor (SimVitals) variant

**Verdict: PASS** (first review round, after one pre-review polish commit)

## Boot & probe (port 3085, DSH_HOME=/tmp/icu-dsh redirect)

- `probe-review.mjs 3085`: **0 console errors, 0 page errors**, shell present.
- Theme vars byte-on-analysis: `--edex-green: #37ff71` (analysis `theme.primaryAccent`),
  `--edex-border: #1e2a34` (`borderFeatures.frame.color`), `--edex-panel-2: #0f181d`
  (`theme.panelTone`), `--dsw-alias-label-primary: #eaf4fd` (`theme.textPrimary`),
  `bodyBackground: rgb(4,6,9)` = `#040609` (`theme.canvas`).

## Visual comparison (vision_pixel_diff + two-image glance)

- vs the canonical discovery capture (`reference-shot.png`, alarm state, 1600×3395 full page):
  overall diff **5.78%** (layout/format mismatch expected — the reference is a full-page scroll,
  the render is one viewport; the worst regions are the differing column widths).
- vs the steady-state re-capture (`reference-shot-live.png`, 1600×900): overall diff **6.97%**
  (clinical-green lane columns and sidebar layout differences; both diff runs are dominated by
  content placement, not palette divergence).
- Two-image glance (composite): *"Both use a near-black blue/green base with clinical terminal-style
  green, cyan, yellow, and occasional red alert accents"* and *"thin muted blue-gray 1px panel
  borders and very small corner radii"* — matches `analysis.json` exactly.

## Granularity check (per element type, per Lessons Learned)

- **Per-card treatment** (analysis `borderFeatures.cards`: full 1px `#1e2a34`, 6px radius, slate
  fill, NO brackets): left-column crop (`icu-crop-leftcol.png` @2×) shows 4 closed 1px blue-gray
  rounded cards with gaps and titles — probe computed styles confirm every WidgetSection at
  `borderWidth 1px / solid / radius 6px / fill rgb(15,24,29) / boxShadow none`. No bracket
  treatment added (the reference has none).
- **Featured widget** (`PATIENT MONITOR`, replaces WORLD VIEW): `worldViewGone: true`,
  `widgetIds` contains `patient-monitor` (globe slot gone, GlobeWidget + encom deps deleted).
  Right-bar crop shows the monitor: green `BED 04` line, `ALL CLEAR` band, **3 canvas lanes with
  visible green/cyan/yellow traces on fine grids**, readouts HR 74 (green), SpO2 97 (cyan),
  RR 16 (yellow), TEMP/NIBP footer — the reference's signature element reproduced.
- **Inputs** (`borderFeatures.inputs` 1px/#1e2a34/4px): composer card computes `4px` radius,
  `#0b1016` fill, 1px border (verified via TerminalComposer override + probe background match).
- **Active indicators** (analysis: NO left accent bars, accent-colored text): tree items carry
  `border-left: none`; selection is text/wash based. Inherited CRT-green Appearance tokens in
  ui-theme-terminal were re-themed to the ICU palette; the clinical green `#37ff71` is THIS
  reference's ECG green — explicitly distinct from the stock terminal green.

## Workspace-present check (mandatory)

- `workspacePresent: true` (sidebar `[data-slot="sidebar"]`, conversation
  `[data-conversation-scroll]`, composer `[data-composer-card]` all in DOM).
- `workspace.center` computes `background: rgba(0,0,0,0)`, `border: none`, `margin: 0` — the
  inner WidgetSection reset keeps the card chrome off the workspace (XRY lesson).
- Center CONTAINER carries the widget chrome: `.centerWidget` 1px solid `#1e2a34` + 8px radius
  (matches `borderFeatures.frame`), `.centerTitle` "DSH WORKSPACE" strip 18px, `rgb(15,24,29)`
  fill, 1px bottom border, green text — same fill as widget title bars (KIBO lesson). The
  reshaped frame is inset by `CENTER_TITLE_INSET = 19px` so nothing is covered (AIRTRACK lesson).
- `bodyBackground` = `rgb(4,6,9)` = shell panel color `--edex-panel` — the workspace shares the
  panel surface (KIBO lesson); center crop glance: *"workspace UI is centered and unobstructed,
  with a left sidebar, conversation area, and bottom composer"* with the title strip + frame.

## Animation Verification (Generic)

Static inventory (grep): `monitor-value-pulse` (PatientMonitor readout values, 2s opacity steps),
`vitals-value-pulse` (SYSTEM VITALS values, 2s) — both `@keyframes` opacity-only, both with
`prefers-reduced-motion` fallbacks noted (intentional); canvas rAF sweeps in `WaveLane` (transform
free, drawn per frame). No rotations → no pivot obligations.

Runtime (`probe-animation.mjs 3085`): **verdict pass:true** — 8 shell animations inventoried
(5× vitals-pulse + 3× monitor-pulse), all `playState: running`, opacity samples alternate
1 → 0.85/0.82 → 1 (correct direction & rate vs the 2s declared period), AABB centers invariant
(no layout drift), extent inside containers, `reducedMotion: false`, **0 console errors**.

Canvas sweep (snapshot delta, per the SONAR/DRONE canvas rule): `getImageData` t0 vs t0+700ms →
**490/10608 px changed** (4.6% of the monitor's canvas area); screenshot pair diff
(`animation-canvas-t0/t1.png` → `animation-canvas-delta-heatmap.png`) = 1.12% overall with the
worst regions confined to the lane band (y 51–127 of the lanes) — the sweep moves, nothing else
does.

## GIF capture

`record-gif.mjs 3085` → `preview.gif` (4s @ 12fps, 205 KB), **0 page errors** during capture,
frames animate (waveform sweep + value pulses + clock).

## Divergences (noted, within tolerance)

1. The reference drives **simulated vitals** from its sidebar controls; the featured monitor and
   SYSTEM VITALS derive their numbers from the live host/network hooks (same hooks interface as
   the widgets they replaced). Layout/palette follow the reference; the values are live-host.
2. The reference's critical state (red alarm band) renders here only when the host link is down;
   the steady state shows the blue-gray ALL CLEAR band, exactly like the steady-state capture.
3. The eDEX frame remains a 4-region terminal shell (the platform's structure); the reference's
   monitor/simulator layout is reproduced through the featured monitor + re-themed widgets, not
   by replacing the workspace.
