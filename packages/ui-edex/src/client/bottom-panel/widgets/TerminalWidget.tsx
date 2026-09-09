/**
 * Terminal widget: a real shell surface on the host. Commands execute through
 * the `systemMetrics.runCommand` Remote (`sh -c`, 30s timeout), so the
 * terminal drives the actual machine. `cd` is resolved client-side but
 * verified on the host with a real `cd <dir> && pwd` round-trip — a target
 * that does not exist prints the shell error and leaves the prompt put; a
 * valid target adopts the host's canonical path. Commands run prefixed with
 * the current directory; `clear` / `help` / `pwd` are local builtins, and
 * ↑/↓ recall history. The TERMINAL section heading comes from the shared
 * widget chrome (WidgetSection).
 */
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { BottomWidgetHooks } from '../../widgets/types.ts'
import css from './TerminalWidget.module.css'

/** One rendered terminal line. */
interface Line {
  readonly kind: 'cmd' | 'out' | 'err' | 'info'
  readonly text: string
}

const WELCOME: readonly Line[] = [
  { kind: 'info', text: 'ARIS shell — commands run on this machine (sh -c).' },
  { kind: 'info', text: 'help for builtins · ↑/↓ history · clear to reset' },
]

/** Resolve a `cd` argument against the current directory (dot-dot aware). */
function resolveCd(cwd: string, arg: string): string {
  if (arg === '' || arg === '~') return cwd
  const target = arg.startsWith('/') ? arg : `${cwd === '/' ? '' : cwd}/${arg}`
  const parts = target.split('/').filter(Boolean)
  const out: string[] = []
  for (const part of parts) {
    if (part === '.' || part === '') continue
    if (part === '..') out.pop()
    else out.push(part)
  }
  return `/${out.join('/')}`
}

/** Shell-quote a path for the `cd <dir> && <cmd>` prefix. */
function quote(path: string): string {
  return `'${path.replace(/'/g, `'\\''`)}'`
}

/** The terminal body (rendered inside the bottom bar's TERMINAL section). */
export function TerminalWidget({ useFiles, runCommand }: BottomWidgetHooks) {
  // The terminal follows the filesystem browser's directory (the DIR widget's
  // current path) until the operator runs a command of their own.
  const filesPath = useFiles(s => s.path)
  const initialCwd = filesPath

  const [lines, setLines] = useState<Line[]>(() => [...WELCOME])
  const [input, setInput] = useState('')
  const [cwd, setCwd] = useState(() => (initialCwd !== undefined && initialCwd !== '' ? initialCwd : '/'))
  const [busy, setBusy] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  // The terminal follows the filesystem browser's directory (initialCwd, which
  // arrives once the browser loads) until the operator runs a command.
  const touchedRef = useRef(false)

  // Keep the newest output in view (also re-pins while a command streams in).
  useEffect(() => {
    const el = scrollRef.current
    if (el !== null) el.scrollTop = el.scrollHeight
  }, [lines])

  // Follow the DIR widget's directory until the first command is executed.
  useEffect(() => {
    if (touchedRef.current) return
    if (initialCwd !== undefined && initialCwd !== '' && initialCwd !== cwd) {
      setCwd(initialCwd)
    }
  }, [initialCwd, cwd])

  const push = (kind: Line['kind'], text: string): void => {
    setLines(prev => [...prev, { kind, text }])
  }

  const execute = async (raw: string): Promise<void> => {
    const command = raw.trim()
    if (command === '') return
    touchedRef.current = true
    push('cmd', command)
    if (command === 'clear') {
      setLines([])
      return
    }
    if (command === 'help') {
      push('info', 'builtins: clear · help · pwd · cd <dir> — everything else runs on the host')
      return
    }
    if (command === 'pwd') {
      push('out', cwd)
      return
    }
    const cd = /^cd(?:\s+(.*))?$/.exec(command)
    if (cd !== null) {
      const target = resolveCd(cwd, (cd[1] ?? '').trim())
      setBusy(true)
      const result = await runCommand(`cd ${quote(target)} && pwd`)
      setBusy(false)
      if (result.exitCode === 0) {
        // Adopt the host's canonical path so symlinks (e.g. /tmp) resolve the
        // way the shell itself would resolve them.
        const canonical = result.stdout.trim().split('\n').filter(Boolean).pop() ?? target
        setCwd(canonical)
      } else {
        for (const chunk of result.stderr.split('\n')) push('err', chunk)
        if (result.exitCode !== null) push('err', `[exit ${result.exitCode}]`)
      }
      return
    }
    setBusy(true)
    const result = await runCommand(`cd ${quote(cwd)} && ${command}`)
    setBusy(false)
    for (const chunk of result.stdout.split('\n')) push('out', chunk)
    for (const chunk of result.stderr.split('\n')) push('err', chunk)
    if (result.exitCode !== null && result.exitCode !== 0) {
      push('err', `[exit ${result.exitCode}]`)
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      const command = input
      setInput('')
      setHistory(prev => (command.trim() === '' ? prev : [...prev, command]))
      setHistoryIndex(-1)
      void execute(command)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const next = Math.min(historyIndex + 1, history.length - 1)
      setHistoryIndex(next)
      if (history.length > 0) setInput(history[history.length - 1 - next] ?? '')
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const next = Math.max(historyIndex - 1, -1)
      setHistoryIndex(next)
      setInput(next === -1 ? '' : history[history.length - 1 - next] ?? '')
    }
  }

  return (
    <div className={css.root} data-testid="edex-terminal-widget" onClick={() => { inputRef.current?.focus() }}>
      <div className={css.bar}>
        <span className={css.barCwd} title={cwd}>{cwd}</span>
        <span className={css.barBusy}>{busy ? 'RUNNING' : 'READY'}</span>
      </div>
      <div className={css.scroll} ref={scrollRef} role="log" aria-live="polite">
        {lines.map((line, index) => (
          <div key={index} className={css[line.kind]}>
            {line.kind === 'cmd' ? (
              <>
                <span className={css.prompt}>{cwd} $</span> {line.text}
              </>
            ) : line.text}
          </div>
        ))}
      </div>
      <div className={css.in}>
        <span className={css.prompt}>{cwd} $</span>
        <input
          ref={inputRef}
          className={css.input}
          value={input}
          onChange={event => { setInput(event.target.value) }}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
          aria-label="Terminal input"
        />
      </div>
    </div>
  )
}