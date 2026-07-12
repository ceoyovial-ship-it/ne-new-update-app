'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth-context';
import { supabase, Profile, UserRole } from '@/lib/supabase';
import { User, Mail, Phone, MapPin, Calendar, Shield, CreditCard as Edit2, Save, X, Camera, Loader as Loader2, Briefcase, GraduationCap, Building2, Award, Users, CircleAlert as AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface RoleMeta {
  /** Optional role-specific fields to surface (e.g. department, class). */
  department?: string;
  qualification?: string;
  className?: string;
}

interface ProfileManagerProps {
  /** Extra role-specific metadata to display (read-only context). */
  roleMeta?: RoleMeta;
}

const PHONE_REGEX = /^[+]?[\d\s\-()]{7,16}$/;
const PINCODE_REGEX = /^[0-9]{3,10}$/;

export function ProfileManager({ roleMeta }: ProfileManagerProps) {
  const { user, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    date_of_birth: '',
    gender: '',
  });

  useEffect(() => {
    if (user?.profile) {
      const p = user.profile;
      setForm({
        first_name: p.first_name || '',
        last_name: p.last_name || '',
        phone: p.phone || '',
        address: p.address || '',
        city: p.city || '',
        state: p.state || '',
        pincode: p.pincode || '',
        date_of_birth: p.date_of_birth || '',
        gender: p.gender || '',
      });
    }
  }, [user?.profile]);

  if (!user) return null;

  const profile = user.profile;
  const role = profile.role;

  const getInitials = () =>
    `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || 'U';

  const roleLabels: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    admin: 'Administrator',
    principal: 'Principal',
    teacher: 'Teacher',
    student: 'Student',
    parent: 'Parent',
    accountant: 'Accountant',
    receptionist: 'Receptionist',
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.first_name.trim()) e.first_name = 'First name is required.';
    if (!form.last_name.trim()) e.last_name = 'Last name is required.';
    if (form.phone && !PHONE_REGEX.test(form.phone.trim())) e.phone = 'Enter a valid phone number.';
    if (form.pincode && !PINCODE_REGEX.test(form.pincode.trim())) e.pincode = 'Enter a valid pincode.';
    if (form.date_of_birth && Number.isNaN(new Date(form.date_of_birth).getTime())) {
      e.date_of_birth = 'Enter a valid date.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (saving) return;
    setSaving(true);
    try {
      const updates = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        pincode: form.pincode.trim() || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
      };
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2 MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      const avatarUrl = `${pub.publicUrl}?t=${Date.now()}`;

      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.user.id);
      if (dbErr) throw dbErr;

      await refreshProfile();
      toast.success('Profile photo updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const setField = (key: keyof typeof form, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: '' }));
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value?: string | null }) => (
    <div className="flex items-start gap-3 py-2.5">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary flex-shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground break-words">{value || 'Not set'}</p>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="grid lg:grid-cols-3 gap-6"
    >
      {/* Profile card */}
      <div className="lg:col-span-1 space-y-6">
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-blue-900 to-blue-700" />
          <div className="px-6 pb-6">
            <div className="relative -mt-12 mb-3">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
                  <AvatarImage src={profile.avatar_url} alt={getInitials()} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {editing && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Upload profile photo"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
            </div>

            <h2 className="text-xl font-bold text-foreground">
              {profile.first_name} {profile.last_name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary">{roleLabels[role]}</Badge>
              {profile.is_active ? (
                <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>

            <Separator className="my-4" />

            <div className="space-y-1">
              <InfoRow icon={Mail} label="Email" value={profile.email} />
              <InfoRow icon={Phone} label="Phone" value={profile.phone} />
              <InfoRow icon={MapPin} label="Address" value={[profile.address, profile.city, profile.state].filter(Boolean).join(', ') || null} />
            </div>

            <Button
              onClick={() => setEditing((p) => !p)}
              className="w-full mt-4 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 dark:from-blue-700 dark:to-blue-600 transition-all duration-200 hover:shadow-md"
            >
              {editing ? (
                <><X className="h-4 w-4 mr-2" /> Cancel</>
              ) : (
                <><Edit2 className="h-4 w-4 mr-2" /> Edit Profile</>
              )}
            </Button>
          </div>
        </div>

        {/* Role-specific context card */}
        {(roleMeta?.department || roleMeta?.qualification || roleMeta?.className) && (
          <div className="rounded-2xl border bg-card shadow-sm p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              {roleLabels[role]} Details
            </h3>
            <div className="space-y-1">
              {roleMeta.department && <InfoRow icon={Building2} label="Department" value={roleMeta.department} />}
              {roleMeta.qualification && <InfoRow icon={GraduationCap} label="Qualification" value={roleMeta.qualification} />}
              {roleMeta.className && <InfoRow icon={Users} label="Class" value={roleMeta.className} />}
            </div>
          </div>
        )}
      </div>

      {/* Details / edit form */}
      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border bg-card shadow-sm p-6 space-y-5"
            >
              <h3 className="text-lg font-semibold text-foreground">Edit Personal Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pf-first">First Name</Label>
                  <Input id="pf-first" value={form.first_name} onChange={(e) => setField('first_name', e.target.value)} aria-invalid={!!errors.first_name} />
                  {errors.first_name && <FieldError msg={errors.first_name} />}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-last">Last Name</Label>
                  <Input id="pf-last" value={form.last_name} onChange={(e) => setField('last_name', e.target.value)} aria-invalid={!!errors.last_name} />
                  {errors.last_name && <FieldError msg={errors.last_name} />}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pf-phone">Phone</Label>
                  <Input id="pf-phone" type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+91 98765 43210" aria-invalid={!!errors.phone} />
                  {errors.phone && <FieldError msg={errors.phone} />}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-dob">Date of Birth</Label>
                  <Input id="pf-dob" type="date" value={form.date_of_birth} onChange={(e) => setField('date_of_birth', e.target.value)} aria-invalid={!!errors.date_of_birth} />
                  {errors.date_of_birth && <FieldError msg={errors.date_of_birth} />}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pf-gender">Gender</Label>
                  <select
                    id="pf-gender"
                    value={form.gender}
                    onChange={(e) => setField('gender', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-pincode">Pincode</Label>
                  <Input id="pf-pincode" value={form.pincode} onChange={(e) => setField('pincode', e.target.value)} aria-invalid={!!errors.pincode} />
                  {errors.pincode && <FieldError msg={errors.pincode} />}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pf-address">Address</Label>
                <Textarea id="pf-address" value={form.address} onChange={(e) => setField('address', e.target.value)} rows={2} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pf-city">City</Label>
                  <Input id="pf-city" value={form.city} onChange={(e) => setField('city', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-state">State</Label>
                  <Input id="pf-state" value={form.state} onChange={(e) => setField('state', e.target.value)} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600">
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                </Button>
                <Button onClick={() => setEditing(false)} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border bg-card shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Profile Information</h3>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-1">
                <InfoRow icon={User} label="Full Name" value={`${profile.first_name} ${profile.last_name}`} />
                <InfoRow icon={Mail} label="Email" value={profile.email} />
                <InfoRow icon={Phone} label="Phone" value={profile.phone} />
                <InfoRow icon={Calendar} label="Date of Birth" value={profile.date_of_birth ? format(new Date(profile.date_of_birth), 'MMM d, yyyy') : null} />
                <InfoRow icon={User} label="Gender" value={profile.gender || null} />
                <InfoRow icon={Shield} label="Role" value={roleLabels[role]} />
                {roleMeta?.department && <InfoRow icon={Building2} label="Department" value={roleMeta.department} />}
                {roleMeta?.qualification && <InfoRow icon={GraduationCap} label="Qualification" value={roleMeta.qualification} />}
                {roleMeta?.className && <InfoRow icon={Users} label="Class" value={roleMeta.className} />}
              </div>

              <Separator className="my-4" />
              <div className="space-y-1">
                <InfoRow icon={MapPin} label="Address" value={profile.address} />
                <InfoRow icon={MapPin} label="City" value={profile.city} />
                <InfoRow icon={MapPin} label="State" value={profile.state} />
                <InfoRow icon={MapPin} label="Pincode" value={profile.pincode} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="text-xs text-destructive flex items-center gap-1">
      <AlertCircle className="h-3 w-3" aria-hidden="true" />
      {msg}
    </p>
  );
}
