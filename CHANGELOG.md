# Changelog

## 0.1.0 (2026-09-09)

First release of the ICU patient-monitor theme variant.

- Clinical ICU theme from the SimVitals bedside-monitor reference: near-black
  blue-green canvas (#020405/#040609), clinical green #37ff71 accent, cyan
  #29dfff / yellow #ffd34e / alarm-red #d84351 semantics, 1px blue-gray
  #1e2a34 card borders with 6-8px radii, flat (no glow)
- Featured PATIENT MONITOR widget (replaces WORLD VIEW): three animated
  waveform lanes (ECG/PLETH/RESP) with numeric readouts, bed/status line,
  alarm band
- SYSTEM VITALS left widget (host telemetry in monitor numeric-column style)
- Scenario-card process list, bed-status network widget
- DSH WORKSPACE center chrome (title strip + 1px frame) with transparent
  workspace slot and canvas-matched workspace background tokens
- Renamed packages: @danielng23/dsh-edex-icu-ui (+ dsh-icu-client-ui-edex,
  dsh-icu-client-ui-theme-terminal, dsh-icu-host-system-metrics), all 0.1.0
