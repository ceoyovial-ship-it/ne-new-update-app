'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Shield, KeyRound, Lock, CircleCheck as CheckCircle2, Users as UsersIcon, Save } from 'lucide-react';
import { ROLE_DISPLAY_NAMES, ROLE_DESCRIPTIONS, ALL_ROLES, MODULE_LABELS } from '@/lib/permissions';
import type { Role, Permission, UserRole } from '@/lib/supabase';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: rolesData } = await supabase.from('roles').select('*').order('name');
    if (rolesData) setRoles(rolesData as Role[]);

    const { data: permsData } = await supabase
      .from('permissions')
      .select('*')
      .order('module, name');
    if (permsData) setPermissions(permsData as Permission[]);

    const { data: rpData } = await supabase
      .from('role_permissions')
      .select('role_id, permission_id');

    if (rpData) {
      const map: Record<string, string[]> = {};
      rpData.forEach((rp: any) => {
        if (!map[rp.role_id]) map[rp.role_id] = [];
        map[rp.role_id].push(rp.permission_id);
      });
      setRolePermissions(map);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const permCount = (roleId: string) => rolePermissions[roleId]?.length || 0;

  const permName = (permId: string) => permissions.find((p) => p.id === permId)?.name || '';

  const handleEditPermissions = (role: Role) => {
    setEditRole(role);
    setSelectedPerms(rolePermissions[role.id] || []);
  };

  const handleSavePermissions = async () => {
    if (!editRole) return;
    setSaving(true);

    try {
      const existing = rolePermissions[editRole.id] || [];
      const toAdd = selectedPerms.filter((id) => !existing.includes(id));
      const toRemove = existing.filter((id) => !selectedPerms.includes(id));

      if (toAdd.length > 0) {
        const { error } = await supabase.from('role_permissions').insert(
          toAdd.map((permId) => ({
            role_id: editRole.id,
            permission_id: permId,
          }))
        );
        if (error) throw error;
      }

      for (const permId of toRemove) {
        await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', editRole.id)
          .eq('permission_id', permId);
      }

      toast.success('Permissions updated');
      setEditRole(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const groupedPerms = permissions.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Roles" subtitle="Manage system roles and their permissions" />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 animate-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ALL_ROLES.map((roleName) => {
            const role = roles.find((r) => r.name === roleName);
            if (!role) return null;
            return (
              <Card key={role.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary">{permCount(role.id)} perms</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{role.display_name}</CardTitle>
                  <CardDescription className="text-xs">
                    {ROLE_DESCRIPTIONS[roleName as UserRole]}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleEditPermissions(role)}
                  >
                    <KeyRound className="h-4 w-4 mr-2" />
                    Manage Permissions
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-primary" />
              Role Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="p-3 font-semibold">Role</th>
                    <th className="p-3 font-semibold">Description</th>
                    <th className="p-3 font-semibold">Permissions</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                        Loading roles...
                      </td>
                    </tr>
                  ) : (
                    roles.map((role) => (
                      <tr key={role.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-medium">{role.display_name}</td>
                        <td className="p-3 text-muted-foreground">{role.description}</td>
                        <td className="p-3">
                          <Badge variant="secondary">{permCount(role.id)}</Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPermissions(role)}
                          >
                            <Lock className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permission Editor Dialog */}
      <Dialog open={!!editRole} onOpenChange={(open) => !open && setEditRole(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {editRole?.display_name} - Permissions
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {Object.entries(groupedPerms).map(([module, perms]) => (
                <div key={module}>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 border-b pb-1">
                    {MODULE_LABELS[module] || module}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {perms.map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedPerms.includes(p.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPerms([...selectedPerms, p.id]);
                            } else {
                              setSelectedPerms(selectedPerms.filter((id) => id !== p.id));
                            }
                          }}
                        />
                        <span className="text-sm">{p.display_name || p.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRole(null)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Permissions'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
