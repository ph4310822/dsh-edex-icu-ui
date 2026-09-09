# ICU Patient Monitor (SimVitals) — Analysis

**Reference**: web-discovered — https://simvitals.diethos.com/ (direction: "hospital ICU patient monitor").
Captures: `reference-shot.png` (parent's discovery capture — cardiac-arrest alarm state) and
`reference-shot-live.png` (steady-state re-capture with vitals params; live traces confirmed by
pixel measurement: 5.3k green + 5.4k cyan px inside the waveform lanes).

## Theme

| Token | Value | Evidence |
|---|---|---|
| Background (monitor interior / canvas) | `#020405` | dominant cluster 94.7% of monitor region |
| Canvas (page) | `#040609` | dominant cluster 67% of page |
| Panel tone (header/sidebar cards) | `#0f181d` | header cluster (13.8%) |
| Primary accent (clinical green) | `#37ff71` | measure-accent2 green bucket modal, p50=p25=p75 |
| Secondary accent (cyan) | `#29dfff` | cyan bucket modal |
| Warn yellow | `#ffd34e` | yellow bucket modal |
| Alarm red | `#d84351` | red bucket modal (alarm band `CARDIAC ARREST · NO BP · TEMP LOW`) |
| Text primary (white) | `#eaf4fd` | bright-text cluster |
| Text secondary / borders | `#7f96a8` / `#1e2a34` | bright-text + blue bucket modal |
| Glow | none (flat clinical) | vision: "flat, high-contrast, utilitarian" |

## Border language

- **Frame** (monitor enclosure, header, sidebar): full closed **1px solid `#1e2a34`**, **8px radius**, no glow.
- **Cards** (scenario cards, side widgets): full closed **1px solid `#1e2a34`**, **6px radius**, dark slate fill, no brackets.
- **Dividers**: thin subdued blue-gray 1px rules (`#1a262e`) between lanes/rows; fine ~1px gridlines inside lanes.
- **Inputs**: 1px `#1e2a34`, ~4px radius, near-black `#0b1016` fill.
- **Active indicators**: NO left accent bars — active state is accent-colored **text** (green bed ID, cyan checked controls, bright values). Semantic colors carry state: green normal, cyan O2, yellow resp, red critical.

## Layout regions

App header (full-width panel) → monitor enclosure (large rounded dark panel): bed/status line
(green BED 04, muted TRAINING / DEMO, clock) → alarm band (ALL CLEAR steady / red critical) →
3 waveform lanes (ECG II green / PLETH cyan / RESP-CO2 yellow) + right numeric column (HR, SpO2+PI,
RR with muted limits) → right sidebar: Controls heading, two-column vital inputs, Alarm/Running
toggles, stacked scenario cards.

## Widget reconciliation

| Reference widget | eDEX slot | Match |
|---|---|---|
| HR/SpO2/RR numeric readouts | `cpu` (SYSTEM MONITOR gauges) | high |
| Bed status line | `network-status` | partial |
| Scenario cards | `processes` | partial |
| **ECG/PLETH/RESP waveform lanes + numeric column** | **featured → `globe` (WORLD VIEW)** | — |

**Featured widget**: `PATIENT MONITOR` — multi-lane animated waveform monitor (green ECG, cyan
pleth, yellow resp sweeps on a fine grid) with per-lane numeric readouts and an alarm/status strip.
This is the simulator's signature element and replaces the `WORLD VIEW` globe.

## Implementation notes

- Clinical green `#37ff71` is THIS reference's primary accent — distinct from any inherited CRT-green
  theme tokens, which must be re-themed to this palette.
- Waveform animation: canvas/sweep-based; verified per Animation Verification (Generic) via
  snapshot-delta evidence (waveform pixels change between frames, confined to lane extents).
- No glow anywhere: keep box-shadows off the cards; the reference is flat.
