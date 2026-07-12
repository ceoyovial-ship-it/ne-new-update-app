'use client';

export function logAudit(_entry: { action: string; targetEmail?: string }) {
  // Audit logging is a no-op in this build; wire to audit_logs table when needed.
}
