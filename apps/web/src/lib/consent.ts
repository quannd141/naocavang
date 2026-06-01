/**
 * Cookie/consent preference stored in localStorage. We only use functional
 * storage (session), so consent is an acknowledgement rather than a tracking
 * opt-in — but we still version it so a policy change can re-prompt.
 */

const CONSENT_KEY = 'nao-ca-vang:consent';
export const CONSENT_VERSION = 1;

export interface ConsentRecord {
  version: number;
  acceptedAt: string;
}

/** Parse a stored value; returns null if absent, malformed, or stale version. */
export function parseConsent(raw: string | null, currentVersion = CONSENT_VERSION): ConsentRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (typeof parsed.version !== 'number' || parsed.version !== currentVersion) return null;
    if (typeof parsed.acceptedAt !== 'string') return null;
    return { version: parsed.version, acceptedAt: parsed.acceptedAt };
  } catch {
    return null;
  }
}

/** Whether the current-version consent has been recorded. SSR-safe (false on server). */
export function hasConsented(): boolean {
  if (typeof window === 'undefined') return false;
  return parseConsent(window.localStorage.getItem(CONSENT_KEY)) !== null;
}

/** Persist acceptance for the current policy version. */
export function recordConsent(acceptedAt: string): void {
  if (typeof window === 'undefined') return;
  const record: ConsentRecord = { version: CONSENT_VERSION, acceptedAt };
  window.localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
}
