'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Lock } from 'lucide-react';
import { MODULE_LABELS } from '@/lib/permissions';
import type { Permission } from '@/lib/supabase';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('permissions')
      .select('*')
      .order('module, name');
    if (data) setPermissions(data as Permission[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = permissions.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.module.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Permissions" subtitle="View all system permissions" />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 animate-in">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                All Permissions ({filtered.length})
              </CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading permissions...</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(grouped).map(([module, perms]) => (
                  <div key={module}>
                    <h3 className="text-sm font-semibold mb-3 text-primary">
                      {MODULE_LABELS[module] || module}
                      <Badge variant="secondary" className="ml-2">{perms.length}</Badge>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {perms.map((p) => (
                        <div
                          key={p.id}
                          className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">{p.display_name || p.name}</p>
                            <Badge variant="outline" className="text-xs">{p.action}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {p.description || p.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
