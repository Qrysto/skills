import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAuditData, flushTelemetry, track } from '../src/telemetry.ts';

describe('usage telemetry and security audits', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv('DO_NOT_TRACK', '');
    vi.stubEnv('DISABLE_TELEMETRY', '');
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset().mockResolvedValue({ ok: true, json: async () => ({}) });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('never sends usage events even without environment opt-outs', async () => {
    track({ event: 'install', source: 'mattpocock/skills', skills: 'tdd', agents: 'codex' });
    track({ event: 'remove', skills: 'tdd', agents: 'codex' });
    track({ event: 'find', query: 'typescript', resultCount: '1' });
    track({ event: 'update', skillCount: '1', successCount: '1', failCount: '0' });
    track({ event: 'experimental_sync', skillCount: '1', successCount: '1', agents: 'codex' });
    await flushTelemetry();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('still fetches security audits from skills.sh', async () => {
    expect(await fetchAuditData('mattpocock/skills', ['ask-matt', 'tdd'])).toEqual({});
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const audit = new URL(fetchMock.mock.calls[0]![0]);
    expect(audit.origin + audit.pathname).toBe('https://www.skills.sh/tele/audit');
    expect(audit.searchParams.get('source')).toBe('mattpocock/skills');
    expect(audit.searchParams.get('skills')).toBe('ask-matt,tdd');
  });

  it.each(['DO_NOT_TRACK', 'DISABLE_TELEMETRY'])('honors %s for audit requests', async (env) => {
    vi.stubEnv(env, '1');
    expect(await fetchAuditData('mattpocock/skills', ['ask-matt'])).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
