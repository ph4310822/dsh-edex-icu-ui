/**
 * The swappable-widget vocabulary for the shell bars. A bar is a vertical
 * stack of self-contained widget sections; each widget owns its component,
 * its styles, and the snapshot slices it renders, so replacing one means
 * swapping a single registry entry (and its folder under widgets/) without
 * touching the rest of the bar.
 */
import type { ComponentType } from 'react'
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-ui-slots'
import type { CommandResult } from '@danielng23/dsh-host-system-metrics/types'
import type { FilesState, NetworkSnapshot, PanelSnapshot } from '../shared/types.ts'

/** Hooks handed to every left-panel widget. */
export interface LeftWidgetHooks {
  /** System telemetry snapshot selector (clock/specs, CPU, processes). */
  usePanel: SnapshotSelectorHook<PanelSnapshot>
}

/** Hooks handed to every right-panel widget. */
export interface RightWidgetHooks {
  /** Network snapshot selector (interface status + traffic history). */
  useNetwork: SnapshotSelectorHook<NetworkSnapshot>
  /** Current theme color — drives the globe palette. */
  color: string
}

/** Hooks handed to every bottom-panel widget. */
export interface BottomWidgetHooks {
  /** Filesystem snapshot selector (browser listing + preview state). */
  useFiles: SnapshotSelectorHook<FilesState>
  /** Fetch storage + the current directory listing. */
  refreshFiles: () => void
  /** Navigate into a directory (or '..' up). */
  navigateFiles: (name: string) => void
  /** Select a file in the current directory (highlights the list row). */
  selectFile: (name: string) => void
  /** Mark the open editor buffer dirty (called by the editor on doc changes). */
  markDirty: () => void
  /** Persist the editor buffer through the host `writeFile` Remote. */
  saveEditor: (content: string) => void
  /** Discard the dirty buffer and continue the paused navigation. */
  confirmDiscard: () => void
  /** Keep the dirty buffer and cancel the paused navigation. */
  cancelDiscard: () => void
  /** Run one shell command on the host for the terminal widget. */
  runCommand: (command: string) => Promise<CommandResult>
}

/** One section of a shell bar: a self-contained, swappable widget. */
export interface WidgetSlot<P> {
  /** Stable id (React key + `data-widget` attribute). */
  id: string
  /** Optional section heading shown above the widget body. */
  title?: string
  /** Whether the section flex-fills the bar's leftover height. */
  fill?: boolean
  /** Tight padding for full-bleed widgets (the globe). */
  compact?: boolean
  /** Zero the chrome padding so the widget body owns all inner spacing (terminal, file list). */
  bleed?: boolean
  /** The widget body component. */
  Component: ComponentType<P>
}

/** A left-panel widget slot. */
export type LeftWidgetSlot = WidgetSlot<LeftWidgetHooks>

/** A right-panel widget slot. */
export type RightWidgetSlot = WidgetSlot<RightWidgetHooks>

/** A bottom-panel widget slot. */
export type BottomWidgetSlot = WidgetSlot<BottomWidgetHooks>
