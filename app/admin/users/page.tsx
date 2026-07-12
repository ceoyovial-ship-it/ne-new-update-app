'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { toast } from 'sonner';
import { Search, Plus, MoveHorizontal as MoreHorizontal, Eye, CreditCard as Edit, Trash2, KeyRound, Ban, CircleCheck as CheckCircle, Users as UsersIcon, Shield, Mail, Phone, Building2, Calendar, UserCheck, UserX, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ROLE_DISPLAY_NAMES, ALL_ROLES } from '@/lib/permissions';
import type { Profile, UserRole, Branch } from '@/lib/supabase';

export default function UserManagementPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [viewUser, setViewUser] = useState<Profile | null>(null);
  const [deleteUser, setDeleteUser] = useState<Profile | null>(null);
  const [resetUser, setResetUser] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (profilesData) setProfiles(profilesData as Profile[]);

    const { data: branchesData } = await supabase
      .from('branches')
      .select('*')
      .eq('is_active', true);
    if (branchesData) setBranches(branchesData as Branch[]);

    const { data: classesData } = await supabase
      .from('classes')
      .select('id, name, section')
      .eq('is_active', true);
    if (classesData) setClasses(classesData);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = profiles.filter((p) => {
    const matchSearch =
      !search ||
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone || '').includes(search);
    const matchRole = roleFilter === 'all' || p.role === roleFilter;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.is_active) ||
      (statusFilter === 'inactive' && !p.is_active);
    return matchSearch && matchRole && matchStatus;
  });

  const branchName = (id?: string) =>
    id ? branches.find((b) => b.id === id)?.name || '-' : '-';

  const handleToggleActive = async (profile: Profile) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !profile.is_active })
      .eq('id', profile.id);
    if (error) {
      toast.error('Failed to update user status');
    } else {
      toast.success(`User ${!profile.is_active ? 'activated' : 'deactivated'}`);
      fetchData();
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').delete().eq('id', deleteUser.id);
    if (error) {
      toast.error('Failed to delete user');
    } else {
      toast.success('User deleted');
      setDeleteUser(null);
      fetchData();
    }
    setSaving(false);
  };

  const handleResetPassword = async () => {
    if (!resetUser) return;
    setSaving(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetUser.email);
    if (error) {
      toast.error('Failed to send reset email');
    } else {
      toast.success('Password reset email sent');
      setResetUser(null);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="User Management" subtitle="Manage all system users" />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 animate-in">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-primary">{profiles.length}</p>
                </div>
                <div className="p-2 rounded-full bg-primary/10">
                  <UsersIcon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{profiles.filter(p => p.is_active).length}</p>
                </div>
                <div className="p-2 rounded-full bg-green-100">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-bold text-red-600">{profiles.filter(p => !p.is_active).length}</p>
                </div>
                <div className="p-2 rounded-full bg-red-100">
                  <UserX className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold text-blue-600">{profiles.filter(p => ['super_admin','admin','principal'].includes(p.role)).length}</p>
                </div>
                <div className="p-2 rounded-full bg-blue-100">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-primary" />
                All Users ({filtered.length})
              </CardTitle>
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {ALL_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_DISPLAY_NAMES[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="p-3 font-semibold">User</th>
                    <th className="p-3 font-semibold hidden md:table-cell">Email</th>
                    <th className="p-3 font-semibold hidden lg:table-cell">Phone</th>
                    <th className="p-3 font-semibold">Role</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold hidden lg:table-cell">Branch</th>
                    <th className="p-3 font-semibold hidden xl:table-cell">Created</th>
                    <th className="p-3 font-semibold hidden xl:table-cell">Last Login</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-3"><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-4 w-24" /></div></td>
                        <td className="p-3 hidden md:table-cell"><Skeleton className="h-4 w-32" /></td>
                        <td className="p-3 hidden lg:table-cell"><Skeleton className="h-4 w-20" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-16" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-14" /></td>
                        <td className="p-3 hidden lg:table-cell"><Skeleton className="h-4 w-20" /></td>
                        <td className="p-3 hidden xl:table-cell"><Skeleton className="h-4 w-20" /></td>
                        <td className="p-3 hidden xl:table-cell"><Skeleton className="h-4 w-20" /></td>
                        <td className="p-3 text-right"><Skeleton className="h-8 w-8 ml-auto" /></td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => (
                      <tr key={p.id} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={p.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                                {p.first_name[0]}
                                {p.last_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {p.first_name} {p.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground md:hidden truncate">
                                {p.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground">
                          {p.email}
                        </td>
                        <td className="p-3 hidden lg:table-cell text-muted-foreground">
                          {p.phone || '-'}
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary">
                            {ROLE_DISPLAY_NAMES[p.role as UserRole] || p.role}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={p.is_active ? 'default' : 'destructive'}
                            className={p.is_active ? 'bg-green-100 text-green-700' : ''}
                          >
                            {p.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-3 hidden lg:table-cell text-muted-foreground">
                          {branchName(p.branch_id)}
                        </td>
                        <td className="p-3 hidden xl:table-cell text-muted-foreground">
                          {format(new Date(p.created_at), 'MMM d, yyyy')}
                        </td>
                        <td className="p-3 hidden xl:table-cell text-muted-foreground">
                          {p.last_login ? format(new Date(p.last_login), 'MMM d, yyyy') : 'Never'}
                        </td>
                        <td className="p-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewUser(p)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditUser(p)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setResetUser(p)}>
                                <KeyRound className="h-4 w-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleActive(p)}>
                                {p.is_active ? (
                                  <>
                                    <Ban className="h-4 w-4 mr-2" />
                                    Disable Account
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activate Account
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteUser(p)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Add/Edit User Modal */}
      {(addOpen || editUser) && (
        <UserFormDialog
          user={editUser}
          branches={branches}
          classes={classes}
          onClose={() => {
            setAddOpen(false);
            setEditUser(null);
          }}
          onSaved={() => {
            setAddOpen(false);
            setEditUser(null);
            fetchData();
          }}
        />
      )}

      {/* View User Dialog */}
      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={viewUser.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xl">
                    {viewUser.first_name[0]}
                    {viewUser.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">
                    {viewUser.first_name} {viewUser.last_name}
                  </p>
                  <Badge variant="secondary">
                    {ROLE_DISPLAY_NAMES[viewUser.role as UserRole] || viewUser.role}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {viewUser.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {viewUser.phone || 'Not provided'}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {branchName(viewUser.branch_id)}
                </div>
                {viewUser.department && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    {viewUser.department}
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Joined {format(new Date(viewUser.created_at), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteUser?.first_name} {deleteUser?.last_name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Confirmation */}
      <AlertDialog open={!!resetUser} onOpenChange={(open) => !open && setResetUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              A password reset email will be sent to {resetUser?.email}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword} disabled={saving}>
              {saving ? 'Sending...' : 'Send Reset Email'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function UserFormDialog({
  user,
  branches,
  classes,
  onClose,
  onSaved,
}: {
  user: Profile | null;
  branches: Branch[];
  classes: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    role: user?.role || ('student' as UserRole),
    branch_id: user?.branch_id || '',
    department: user?.department || '',
    class_id: '',
    section: '',
    status: user?.is_active ? 'active' : 'inactive',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.first_name.trim()) e.first_name = 'First name is required';
    if (!formData.last_name.trim()) e.last_name = 'Last name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email format';
    if (!user && !formData.password) e.password = 'Password is required';
    else if (!user && formData.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (formData.phone && !/^[\d+\-\s()]{10,15}$/.test(formData.phone)) e.phone = 'Invalid phone number';
    if (!formData.role) e.role = 'Role is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);

    try {
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            branch_id: formData.branch_id || null,
            department: formData.department || null,
            is_active: formData.status === 'active',
          })
          .eq('id', user.id);

        if (error) throw error;
        toast.success('User updated successfully');
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;
        if (authData.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            branch_id: formData.branch_id || null,
            department: formData.department || null,
            is_active: formData.status === 'active',
            must_change_password: true,
          });

          if (profileError) throw profileError;
        }
        toast.success('User created successfully');
      }
      onSaved();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const showClassField = formData.role === 'teacher' || formData.role === 'student';

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {user ? 'Update user information' : 'Create a new system user'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5">
            <Label>First Name *</Label>
            <Input
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
            {errors.first_name && <p className="text-xs text-red-500">{errors.first_name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Last Name *</Label>
            <Input
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
            {errors.last_name && <p className="text-xs text-red-500">{errors.last_name}</p>}
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +91 9876543210"
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_DISPLAY_NAMES[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!user && (
            <div className="space-y-1.5 col-span-2">
              <Label>Password *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Branch</Label>
            <Select
              value={formData.branch_id}
              onValueChange={(v) => setFormData({ ...formData, branch_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Input
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>
          {showClassField && (
            <>
              <div className="space-y-1.5">
                <Label>Class</Label>
                <Select
                  value={formData.class_id}
                  onValueChange={(v) => setFormData({ ...formData, class_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Section</Label>
                <Input
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  placeholder="e.g. A, B, C"
                />
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => setFormData({ ...formData, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
