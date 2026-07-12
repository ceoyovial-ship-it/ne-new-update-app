'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Search, User, LogIn, KeyRound, Shield, Trash2, UserPlus, UserCog } from 'lucide-react';

interface AuditLogRow {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  actor?: { first_name: string; last_name: string; email: string; avatar_url: string | null } | null;
}

const ACTION_ICONS: Record<string, typeof User> = {
  'user.create': UserPlus,
  'user.update': UserCog,
  'user.delete': Trash2,
  'user.login': LogIn,
  'user.logout': LogIn,
  'user.password_reset': KeyRound,
  'user.activate': UserCog,
  'user.deactivate': UserCog,
  'user.role_change': Shield,
  'role.create': Shield,
  'role.update': Shield,
  'role.delete': Trash2,
  'role.permission_change': KeyRound,
};

const ACTION_LABELS: Record<string, string> = {
  'user.create': 'User Created',
  'user.update': 'User Updated',
  'user.delete': 'User Deleted',
  'user.login': 'Login',
  'user.logout': 'Logout',
  'user.password_reset': 'Password Reset',
  'user.activate': 'Account Activated',
  'user.deactivate': 'Account Deactivated',
  'user.role_change': 'Role Changed',
  'role.create': 'Role Created',
  'role.update': 'Role Updated',
  'role.delete': 'Role Deleted',
  'role.permission_change': 'Permissions Changed',
};

const ACTION_COLORS: Record<string, string> = {
  'user.create': 'text-green-600 bg-green-100',
  'user.update': 'text-blue-600 bg-blue-100',
  'user.delete': 'text-red-600 bg-red-100',
  'user.login': 'text-blue-600 bg-blue-100',
  'user.logout': 'text-gray-600 bg-gray-100',
  'user.password_reset': 'text-amber-600 bg-amber-100',
  'user.activate': 'text-green-600 bg-green-100',
  'user.deactivate': 'text-red-600 bg-red-100',
  'user.role_change': 'text-purple-600 bg-purple-100',
  'role.create': 'text-green-600 bg-green-100',
  'role.update': 'text-blue-600 bg-blue-100',
  'role.delete': 'text-red-600 bg-red-100',
  'role.permission_change': 'text-amber-600 bg-amber-100',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('audit_logs')
      .select(
        `id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at,
         actor:profiles!audit_logs_user_id_fkey(first_name, last_name, email, avatar_url)`
      )
      .order('created_at', { ascending: false })
      .limit(200);

    if (actionFilter !== 'all') {
      query = query.eq('action', actionFilter);
    }

    const { data } = await query;
    if (data) setLogs(data as unknown as AuditLogRow[]);
    setLoading(false);
  }, [actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filtered = logs.filter((log) => {
    if (!search) return true;
    const actorName = log.actor
      ? `${log.actor.first_name} ${log.actor.last_name} ${log.actor.email}`
      : '';
    const targetEmail = log.new_values?.target_email || '';
    return (
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      actorName.toLowerCase().includes(search.toLowerCase()) ||
      targetEmail.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Audit Logs" subtitle="Track all user and security actions" />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 animate-in">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Activity Log ({filtered.length})
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="user.create">User Created</SelectItem>
                    <SelectItem value="user.update">User Updated</SelectItem>
                    <SelectItem value="user.delete">User Deleted</SelectItem>
                    <SelectItem value="user.login">Login</SelectItem>
                    <SelectItem value="user.logout">Logout</SelectItem>
                    <SelectItem value="user.password_reset">Password Reset</SelectItem>
                    <SelectItem value="user.activate">Account Activated</SelectItem>
                    <SelectItem value="user.deactivate">Account Deactivated</SelectItem>
                    <SelectItem value="user.role_change">Role Changed</SelectItem>
                    <SelectItem value="role.create">Role Created</SelectItem>
                    <SelectItem value="role.update">Role Updated</SelectItem>
                    <SelectItem value="role.delete">Role Deleted</SelectItem>
                    <SelectItem value="role.permission_change">Permissions Changed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No audit logs found</p>
              </div>
            ) : (
              <ScrollArea className="h-[70vh] pr-4">
                <div className="space-y-2">
                  {filtered.map((log) => {
                    const Icon = ACTION_ICONS[log.action] || History;
                    const colorClass = ACTION_COLORS[log.action] || 'text-gray-600 bg-gray-100';
                    const actorName = log.actor
                      ? `${log.actor.first_name} ${log.actor.last_name}`
                      : 'System';
                    const targetEmail = log.new_values?.target_email || log.new_values?.email;
                    const detailText = log.new_values?.name || log.new_values?.role || '';

                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                      >
                        <div className={`p-2 rounded-full ${colorClass} flex-shrink-0`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">
                              {ACTION_LABELS[log.action] || log.action}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {log.entity_type || 'system'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            <span className="font-medium text-foreground">{actorName}</span>
                            {targetEmail && ` → ${targetEmail}`}
                            {detailText && ` (${detailText})`}
                          </p>
                          {log.old_values && log.new_values && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {Object.keys(log.old_values).map((key) => (
                                <span key={key} className="mr-2">
                                  {key}: {String(log.old_values![key])} →{' '}
                                  {String(log.new_values![key])}
                                </span>
                              ))}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                            {log.ip_address && ` • ${log.ip_address}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
