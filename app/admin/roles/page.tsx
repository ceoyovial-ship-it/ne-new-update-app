'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Shield,
  KeyRound,
  Lock,
  CircleCheck as CheckCircle2,
  Users as UsersIcon,
  Save,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { ROLE_DISPLAY_NAMES, ROLE_DESCRIPTIONS, ALL_ROLES, MODULE_LABELS } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';
import type { Role, Permission, UserRole } from '@/lib/supabase';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editRoleDetails, setEditRoleDetails] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);

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

      logAudit({
        action: 'role.permission_change',
        targetType: 'role',
        targetId: editRole.id,
        details: { role: editRole.name, added: toAdd.length, removed: toRemove.length },
      });

      toast.success('Permissions updated');
      setEditRole(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteRole) return;
    if (deleteRole.is_system) {
      toast.error('System roles cannot be deleted');
      setDeleteRole(null);
      return;
    }
    setSaving(true);
    try {
      const { error: rpError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', deleteRole.id);
      if (rpError) throw rpError;

      const { error } = await supabase.from('roles').delete().eq('id', deleteRole.id);
      if (error) throw error;

      logAudit({
        action: 'role.delete',
        targetType: 'role',
        targetId: deleteRole.id,
        details: { role: deleteRole.name },
      });

      toast.success('Role deleted');
      setDeleteRole(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete role');
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
          {roles.map((role) => {
            const roleEnum = ALL_ROLES.find((r) => r === role.name) as UserRole | undefined;
            return (
              <Card key={role.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      {role.is_system && <Badge variant="outline">System</Badge>}
                      <Badge variant="secondary">{permCount(role.id)} perms</Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{role.display_name}</CardTitle>
                  <CardDescription className="text-xs">
                    {role.description || (roleEnum ? ROLE_DESCRIPTIONS[roleEnum] : '')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleEditPermissions(role)}
                  >
                    <KeyRound className="h-4 w-4 mr-2" />
                    Manage Permissions
                  </Button>
                  {!role.is_system && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditRoleDetails(role)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700"
                        onClick={() => setDeleteRole(role)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-primary" />
                Role Overview
              </CardTitle>
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="p-3 font-semibold">Role</th>
                    <th className="p-3 font-semibold">Description</th>
                    <th className="p-3 font-semibold">Permissions</th>
                    <th className="p-3 font-semibold">Type</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
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
                        <td className="p-3">
                          {role.is_system ? (
                            <Badge variant="outline">System</Badge>
                          ) : (
                            <Badge variant="secondary">Custom</Badge>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPermissions(role)}
                            >
                              <Lock className="h-4 w-4 mr-1" />
                              Perms
                            </Button>
                            {!role.is_system && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditRoleDetails(role)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => setDeleteRole(role)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
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
            <DialogDescription>
              Toggle permissions for this role. Changes take effect immediately for users with this role.
            </DialogDescription>
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

      {/* Add/Edit Role Dialog */}
      {(addOpen || editRoleDetails) && (
        <RoleFormDialog
          role={editRoleDetails}
          onClose={() => {
            setAddOpen(false);
            setEditRoleDetails(null);
          }}
          onSaved={() => {
            setAddOpen(false);
            setEditRoleDetails(null);
            fetchData();
          }}
        />
      )}

      {/* Delete Role Confirmation */}
      <AlertDialog
        open={!!deleteRole}
        onOpenChange={(open) => !open && setDeleteRole(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role &quot;{deleteRole?.display_name}&quot;? This
              will remove all associated permissions. Users assigned to this role may lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RoleFormDialog({
  role,
  onClose,
  onSaved,
}: {
  role: Role | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    display_name: role?.display_name || '',
    description: role?.description || '',
    is_system: role?.is_system || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = 'Role key is required';
    if (!formData.display_name.trim()) e.display_name = 'Display name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);

    try {
      if (role) {
        const { error } = await supabase
          .from('roles')
          .update({
            display_name: formData.display_name,
            description: formData.description,
          })
          .eq('id', role.id);
        if (error) throw error;

        logAudit({
          action: 'role.update',
          targetType: 'role',
          targetId: role.id,
          details: { name: formData.name, display_name: formData.display_name },
        });

        toast.success('Role updated');
      } else {
        const { data, error } = await supabase
          .from('roles')
          .insert({
            name: formData.name.toLowerCase().replace(/\s+/g, '_'),
            display_name: formData.display_name,
            description: formData.description,
            is_system: false,
          })
          .select()
          .single();
        if (error) throw error;

        logAudit({
          action: 'role.create',
          targetType: 'role',
          targetId: data.id,
          details: { name: data.name, display_name: data.display_name },
        });

        toast.success('Role created');
      }
      onSaved();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{role ? 'Edit Role' : 'Create New Role'}</DialogTitle>
          <DialogDescription>
            {role ? 'Update role details' : 'Define a new custom role for your school'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Role Key *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. librarian"
              disabled={!!role}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            <p className="text-xs text-muted-foreground">
              Used internally. Cannot be changed after creation.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Display Name *</Label>
            <Input
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder="e.g. Librarian"
            />
            {errors.display_name && <p className="text-xs text-red-500">{errors.display_name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this role"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
