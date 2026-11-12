const AUDIT_URL = 'https://www.skills.sh/tele/audit';

interface InstallTelemetryData {
  event: 'install';
  source: string;
  skills: string;
  agents: string;
  global?: '1';
  skillFiles?: string; // JSON stringified { skillName: relativePath }
  /** User-facing URL that can be passed back to `skills add`. */
  installUrl?: string;
  /** Caller-provided JSON attached to this install telemetry event. */
  metadata?: string;
  /**
   * Source type for different hosts:
   * - 'github': GitHub repository (default, uses raw.githubusercontent.com)
   * - 'raw': Direct URL to SKILL.md (generic raw URL)
   * - Provider IDs like 'mintlify', 'huggingface', etc.
   */
  sourceType?: string;
}

interface RemoveTelemetryData {
  event: 'remove';
  source?: string;
  skills: string;
  agents: string;
  global?: '1';
  sourceType?: string;
}

interface UpdateTelemetryData {
  event: 'update';
  scope?: string;
  skillCount: string;
  successCount: string;
  failCount: string;
}

interface FindTelemetryData {
  event: 'find';
  query: string;
  resultCount: string;
  interactive?: '1';
}

interface SyncTelemetryData {
  event: 'experimental_sync';
  skillCount: string;
  successCount: string;
  agents: string;
}

type TelemetryData =
  | InstallTelemetryData
  | RemoveTelemetryData
  | UpdateTelemetryData
  | FindTelemetryData
  | SyncTelemetryData;

/** Compatibility hooks: usage telemetry is disabled in this fork. */
export function setDetectedAgent(_agentName: string | null): void {}

export function setVersion(_version: string): void {}

/** Audit requests retain the existing environment opt-outs independently of usage tracking. */
function isAuditEnabled(): boolean {
  return !process.env.DISABLE_TELEMETRY && !process.env.DO_NOT_TRACK;
}

// ─── Security audit data ───

export interface PartnerAudit {
  risk: 'safe' | 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  alerts?: number;
  score?: number;
  analyzedAt: string;
}

export type SkillAuditData = Record<string, PartnerAudit>;
export type AuditResponse = Record<string, SkillAuditData>;

/**
 * Fetch security audit results for skills from the audit API.
 * Returns null on any error or timeout — never blocks installation.
 */
export async function fetchAuditData(
  source: string,
  skillSlugs: string[],
  timeoutMs = 3000
): Promise<AuditResponse | null> {
  if (!isAuditEnabled()) return null;
  if (skillSlugs.length === 0) return null;

  try {
    const params = new URLSearchParams({
      source,
      skills: skillSlugs.join(','),
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${AUDIT_URL}?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return null;
    return (await response.json()) as AuditResponse;
  } catch {
    return null;
  }
}

/** Kept for existing callers; this fork never sends usage events. */
export function track(_data: TelemetryData): void {}

/** No usage requests are queued, so CLI exit never needs to wait for them. */
export async function flushTelemetry(_timeoutMs = 5000): Promise<void> {}
