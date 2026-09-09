/**
 * Preview widget: renders the file selected in the filesystem browser —
 * text files open a vim-capable CodeMirror editor (see EditorPane), images and
 * videos render from their data: payloads, and a message shows for everything
 * else. Empty until a file is selected. The PREVIEW section heading comes from
 * the shared widget chrome (WidgetSection).
 */
import type { BottomWidgetHooks } from '../../widgets/types.ts'
import css from './PreviewWidget.module.css'
import { EditorPane } from './EditorPane.tsx'

/** The file's display name from its path. */
function fileName(path: string): string {
  const index = path.lastIndexOf('/')
  return index >= 0 ? path.slice(index + 1) : path
}

/** The preview body (rendered inside the bottom bar's PREVIEW section). */
export function PreviewWidget({ useFiles, markDirty, saveEditor, confirmDiscard, cancelDiscard }: BottomWidgetHooks) {
  const files = useFiles(s => s)
  const preview = files.preview
  const editor = files.editor

  return (
    <div className={css.root} data-testid="edex-preview-widget">
      <div className={css.header}>
        {preview !== null && (
          <span className={css.file} title={preview.path}>{fileName(preview.path)}</span>
        )}
      </div>
      <div className={css.body}>
        {preview === null && <div className={css.hint}>NO FILE SELECTED</div>}
        {preview !== null && preview.error !== null && (
          <div className={css.error}>{preview.error}</div>
        )}
        {preview !== null && preview.error === null && preview.kind === 'text' && (
          <EditorPane
            key={preview.path}
            path={preview.path}
            content={preview.text ?? ''}
            readOnly={preview.truncated}
            editor={editor}
            onMarkDirty={markDirty}
            onSave={saveEditor}
            onDiscard={confirmDiscard}
            onCancelDiscard={cancelDiscard}
          />
        )}
        {preview !== null && preview.error === null && preview.kind === 'image' && preview.dataUrl !== null && (
          <img className={css.media} src={preview.dataUrl} alt={fileName(preview.path)} />
        )}
        {preview !== null && preview.error === null && preview.kind === 'video' && preview.dataUrl !== null && (
          <video className={css.media} src={preview.dataUrl} controls />
        )}
        {preview !== null && preview.error === null && preview.kind === 'unsupported' && (
          <div className={css.error}>CANNOT PREVIEW THIS FILE TYPE</div>
        )}
        {preview !== null && preview.truncated && preview.kind !== 'text' && (
          <div className={css.truncated}>PREVIEW TRUNCATED ({preview.sizeBytes} BYTES)</div>
        )}
      </div>
    </div>
  )
}