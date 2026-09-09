/** System-monitor Host Remote serving `node:os` resource snapshots to the browser. */
import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { CommandResult, DirectoryListing, FilePreview, SystemMetricsSnapshot, SystemOverview, WriteResult } from './types.ts';
export type * from './types.ts';
/**
 * Remote-only service exposing host resource snapshots to the browser. Every
 * snapshot is projected directly from `node:os` at call time; no cache exists
 * to synchronize.
 * @typert service systemMetrics
 */
export declare class SystemMetricsService extends TypertRemoteService {
    constructor(ctx: Context);
    /**
     * Read the current host resource state.
     * @returns load averages, since-boot CPU busy ratio, memory, and uptime.
     */
    snapshot(): SystemMetricsSnapshot;
    /**
     * Read the rich system overview for the left system panel: per-core CPU
     * tick counts (the client computes usage deltas between polls), memory and
     * swap, thermal/power/hardware (best-effort), and top processes.
     * @returns the overview.
     */
    overview(): Promise<SystemOverview>;
    /**
     * List one directory for the filesystem browser.
     * @param path - absolute directory to list.
     * @returns the listing (or an error string when unreadable).
     */
    listDirectory(path: string): Promise<DirectoryListing>;
    /**
     * Read one file for the bottom-right preview pane / editor. Text payloads
     * are capped at 4 MiB, images at 4 MiB, videos at 12 MiB; oversized files
     * are truncated and flagged rather than refused. Kind is decided by
     * extension with a UTF-8 sniff fallback for unknown extensions.
     * @param path - absolute file path.
     * @returns the preview payload (or an error string when unreadable).
     */
    readFile(path: string): Promise<FilePreview>;
    /**
     * Write one text file from the bottom-right editor. Creates or replaces the
     * file at `path` with the given UTF-8 content; the parent directory must
     * exist. Trust surface matches `readFile`: the GUI already reads arbitrary
     * paths the host process can reach, so writing carries the same parity.
     * @param path - absolute file path.
     * @param content - full text content to persist.
     * @returns the write result (or an error string when unwritable).
     */
    writeFile(path: string, content: string): Promise<WriteResult>;
    /**
     * Run one shell command for the bottom-right terminal panel. Executes
     * `command` through `sh -c` with a 30s timeout and a 4 MiB output cap.
     * Non-zero exits return the captured output with the real exit code; a
     * command that cannot start (or times out) returns exitCode null.
     * Trust surface matches `writeFile`: the GUI already reads and writes
     * arbitrary paths the host process can reach, so executing commands the
     * operator types carries the same parity.
     * @param command - the shell command line to execute.
     * @returns captured stdout/stderr and the exit code.
     */
    runCommand(command: string): Promise<CommandResult>;
}
export default SystemMetricsService;
//# sourceMappingURL=index.d.ts.map