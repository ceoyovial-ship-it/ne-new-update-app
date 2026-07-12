'use client';

import { supabase } from './supabase';

export type AuditAction =
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  | 'user.login'
  | 'user.logout'
  | 'user.password_reset'
  | 'user.activate'
  | 'user.deactivate'
  | 'user.role_change'
  | 'role.create'
  | 'role.update'
  | 'role.delete'
  | 'role.permission_change';

export interface AuditEntry {
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  targetEmail?: string;
  details?: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const insert: any = {
      user_id: session.user.id,
      action: entry.action,
      entity_type: entry.targetType || null,
      entity_id: entry.targetId || null,
      old_values: entry.oldValues || null,
      new_values: { ...entry.newValues, target_email: entry.targetEmail, ...entry.details } || null,
    };

    if (typeof window !== 'undefined') {
      insert.user_agent = navigator.userAgent;
    }

    await supabase.from('audit_logs').insert(insert);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
