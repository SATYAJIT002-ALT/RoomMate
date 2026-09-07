/**
 * RATE LIMITER & ACCOUNT LOCKOUT THROTTLER
 * Protects against brute-force attacks, credential stuffing, and unauthorized probing.
 */

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  lockedUntil: number | null;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;  // 10 minutes attempt window

const attemptStore = new Map<string, AttemptRecord>();

// Periodic cleanup of stale records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of attemptStore.entries()) {
    if (record.lockedUntil && record.lockedUntil < now && now - record.lastAttempt > ATTEMPT_WINDOW_MS) {
      attemptStore.delete(key);
    } else if (!record.lockedUntil && now - record.lastAttempt > ATTEMPT_WINDOW_MS) {
      attemptStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function checkRateLimit(identifier: string): {
  isLocked: boolean;
  remainingSeconds: number;
  remainingAttempts: number;
} {
  const now = Date.now();
  const record = attemptStore.get(identifier);

  if (!record) {
    return { isLocked: false, remainingSeconds: 0, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  // Check if currently locked out
  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { isLocked: true, remainingSeconds, remainingAttempts: 0 };
  }

  // If lockout expired, reset
  if (record.lockedUntil && record.lockedUntil <= now) {
    attemptStore.delete(identifier);
    return { isLocked: false, remainingSeconds: 0, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  // If window expired, reset
  if (now - record.firstAttempt > ATTEMPT_WINDOW_MS) {
    attemptStore.delete(identifier);
    return { isLocked: false, remainingSeconds: 0, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - record.count);
  return { isLocked: false, remainingSeconds: 0, remainingAttempts };
}

export function recordFailedAttempt(identifier: string): {
  isLocked: boolean;
  remainingSeconds: number;
  remainingAttempts: number;
} {
  const now = Date.now();
  let record = attemptStore.get(identifier);

  if (!record || now - record.firstAttempt > ATTEMPT_WINDOW_MS) {
    record = {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
      lockedUntil: null,
    };
  } else {
    record.count += 1;
    record.lastAttempt = now;

    if (record.count >= MAX_FAILED_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_DURATION_MS;
    }
  }

  attemptStore.set(identifier, record);

  const isLocked = Boolean(record.lockedUntil && record.lockedUntil > now);
  const remainingSeconds = isLocked && record.lockedUntil ? Math.ceil((record.lockedUntil - now) / 1000) : 0;
  const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - record.count);

  return { isLocked, remainingSeconds, remainingAttempts };
}

export function recordSuccessfulAttempt(identifier: string) {
  attemptStore.delete(identifier);
}
