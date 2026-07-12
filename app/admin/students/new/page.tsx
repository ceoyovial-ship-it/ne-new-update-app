'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  User,
  GraduationCap,
  Users as UsersIcon,
  MapPin,
  HeartPulse,
  FileText,
  Save,
  ArrowLeft,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { StudentFormData, emptyStudentForm, BLOOD_GROUPS, GENDERS, generateAdmissionNumber } from '@/lib/student-types';

export default function AddStudentPage() {
  const router = useRouter();
  const [form, setForm] = useState<StudentFormData>({ ...emptyStudentForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);

  useEffect(() => {
    const f = async () => {
      const { data: c } = await supabase.from('classes').select('id, name, section, grade_level').eq('is_active', true).order('grade_level');
      if (c) setClasses(c);
      const { data: h } = await supabase.from('houses').select('id, name, color').order('name');
      if (h) setHouses(h);
      const { data: y } = await supabase.from('academic_years').select('*').order('start_date', { ascending: false });
      if (y) setAcademicYears(y);
      const currentYear = y?.find((ay) => ay.is_current);
      setForm((prev) => ({
        ...prev,
        admission_number: generateAdmissionNumber(),
        academic_year_id: currentYear?.id || y?.[0]?.id || '',
      }));
    };
    f();
  }, []);

  const update = (field: keyof StudentFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.first_name.trim()) e.first_name = 'First name is required';
    if (!form.last_name.trim()) e.last_name = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (form.phone && !/^[+\d\s\-()]{10,15}$/.test(form.phone)) e.phone = 'Invalid phone number';
    if (!form.gender) e.gender = 'Gender is required';
    if (!form.date_of_birth) e.date_of_birth = 'Date of birth is required';
    if (!form.admission_number.trim()) e.admission_number = 'Admission number is required';
    if (!form.class_id) e.class_id = 'Class is required';
    if (!form.academic_year_id) e.academic_year_id = 'Academic year is required';
    if (form.aadhaar_number && !/^\d{12}$/.test(form.aadhaar_number.replace(/\s/g, ''))) e.aadhaar_number = 'Aadhaar must be 12 digits';
    if (!form.father_name.trim() && !form.mother_name.trim() && !form.guardian_name.trim())
      e.father_name = 'At least one parent/guardian name is required';
    if (form.parent_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parent_email)) e.parent_email = 'Invalid email';
    if (form.emergency_contact_phone && !/^[+\d\s\-()]{10,15}$/.test(form.emergency_contact_phone)) e.emergency_contact_phone = 'Invalid phone';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fix the errors before saving');
      return;
    }
    setSaving(true);
    try {
      // 1. Create auth user
      const tempPassword = `Stu${Date.now().toString().slice(-6)}`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: tempPassword,
      });
      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Failed to create user account');

      const userId = authData.user.id;

      // 2. Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        role: 'student',
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || null,
        gender: form.gender,
        date_of_birth: form.date_of_birth || null,
        address: form.permanent_address || null,
        avatar_url: form.avatar_url || null,
        is_active: form.is_active,
        must_change_password: true,
      });
      if (profileError) throw new Error(profileError.message);

      // 3. Create student record
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: userId,
          admission_number: form.admission_number,
          roll_number: form.roll_number || null,
          class_id: form.class_id || null,
          house_id: form.house_id || null,
          blood_group: form.blood_group || null,
          aadhaar_number: form.aadhaar_number || null,
          gender: form.gender,
          academic_year_id: form.academic_year_id || null,
          section: form.section || null,
          admission_date: form.admission_date || new Date().toISOString().split('T')[0],
          is_active: form.is_active,
          communication_address: form.communication_address || null,
        })
        .select('id')
        .single();
      if (studentError) throw new Error(studentError.message);

      const studentId = studentData.id;

      // 4. Create parent profile if parent info provided
      if (form.father_name || form.mother_name || form.guardian_name) {
        const parentName = form.father_name || form.mother_name || form.guardian_name;
        const nameParts = parentName.split(' ');
        const parentEmail = form.parent_email || `parent_${studentId}@school.local`;
        const { data: parentAuth } = await supabase.auth.signUp({
          email: parentEmail,
          password: `Par${Date.now().toString().slice(-6)}`,
        });

        if (parentAuth.user) {
          await supabase.from('profiles').insert({
            id: parentAuth.user.id,
            role: 'parent',
            first_name: nameParts[0] || parentName,
            last_name: nameParts.slice(1).join(' ') || '-',
            email: parentEmail,
            phone: form.parent_phone || null,
            is_active: true,
            must_change_password: true,
          });

          const { data: parentRecord } = await supabase
            .from('parents')
            .insert({
              user_id: parentAuth.user.id,
              occupation: form.parent_occupation || null,
              is_active: true,
            })
            .select('id')
            .single();

          if (parentRecord) {
            await supabase.from('student_parents').insert({
              student_id: studentId,
              parent_id: parentRecord.id,
              relationship: form.father_name ? 'Father' : form.mother_name ? 'Mother' : 'Guardian',
              is_primary: true,
              emergency_contact: true,
            });
          }
        }
      }

      // 5. Create medical record
      if (form.allergies || form.medical_conditions || form.emergency_contact_name) {
        await supabase.from('student_medical').insert({
          student_id: studentId,
          allergies: form.allergies || null,
          medical_conditions: form.medical_conditions || null,
          blood_group: form.blood_group || null,
          emergency_contact_name: form.emergency_contact_name || null,
          emergency_contact_phone: form.emergency_contact_phone || null,
        });
      }

      toast.success('Student added successfully');
      router.push('/admin/students');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add student');
    } finally {
      setSaving(false);
    }
  };

  const sections = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Add New Student" subtitle="Create a new student record" />

      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6 animate-in">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Admission Number *</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.admission_number}
                    onChange={(e) => update('admission_number', e.target.value)}
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => update('admission_number', generateAdmissionNumber())}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                {errors.admission_number && <p className="text-xs text-red-500">{errors.admission_number}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>First Name *</Label>
                <Input value={form.first_name} onChange={(e) => update('first_name', e.target.value)} />
                {errors.first_name && <p className="text-xs text-red-500">{errors.first_name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Last Name *</Label>
                <Input value={form.last_name} onChange={(e) => update('last_name', e.target.value)} />
                {errors.last_name && <p className="text-xs text-red-500">{errors.last_name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 9876543210" />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Gender *</Label>
                <Select value={form.gender} onValueChange={(v) => update('gender', v)}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Date of Birth *</Label>
                <Input type="date" value={form.date_of_birth} onChange={(e) => update('date_of_birth', e.target.value)} />
                {errors.date_of_birth && <p className="text-xs text-red-500">{errors.date_of_birth}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Blood Group</Label>
                <Select value={form.blood_group} onValueChange={(v) => update('blood_group', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Aadhaar Number</Label>
                <Input
                  value={form.aadhaar_number}
                  onChange={(e) => update('aadhaar_number', e.target.value)}
                  placeholder="XXXX XXXX XXXX"
                  maxLength={14}
                />
                {errors.aadhaar_number && <p className="text-xs text-red-500">{errors.aadhaar_number}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-primary" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Admission Date</Label>
                <Input type="date" value={form.admission_date} onChange={(e) => update('admission_date', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Academic Year *</Label>
                <Select value={form.academic_year_id} onValueChange={(v) => update('academic_year_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent>
                    {academicYears.map((y) => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.academic_year_id && <p className="text-xs text-red-500">{errors.academic_year_id}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Class *</Label>
                <Select value={form.class_id} onValueChange={(v) => update('class_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.class_id && <p className="text-xs text-red-500">{errors.class_id}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Section</Label>
                <Select value={form.section} onValueChange={(v) => update('section', v)}>
                  <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {sections.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Roll Number</Label>
                <Input value={form.roll_number} onChange={(e) => update('roll_number', e.target.value)} placeholder="e.g. 01" />
              </div>
              <div className="space-y-1.5">
                <Label>House</Label>
                <Select value={form.house_id} onValueChange={(v) => update('house_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Select house" /></SelectTrigger>
                  <SelectContent>
                    {houses.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parent Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UsersIcon className="h-5 w-5 text-primary" />
              Parent / Guardian Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Father's Name</Label>
                <Input value={form.father_name} onChange={(e) => update('father_name', e.target.value)} />
                {errors.father_name && <p className="text-xs text-red-500">{errors.father_name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Mother's Name</Label>
                <Input value={form.mother_name} onChange={(e) => update('mother_name', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Guardian Name</Label>
                <Input value={form.guardian_name} onChange={(e) => update('guardian_name', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Parent Phone</Label>
                <Input value={form.parent_phone} onChange={(e) => update('parent_phone', e.target.value)} placeholder="+91 9876543210" />
              </div>
              <div className="space-y-1.5">
                <Label>Parent Email</Label>
                <Input type="email" value={form.parent_email} onChange={(e) => update('parent_email', e.target.value)} />
                {errors.parent_email && <p className="text-xs text-red-500">{errors.parent_email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Occupation</Label>
                <Input value={form.parent_occupation} onChange={(e) => update('parent_occupation', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label>Permanent Address</Label>
                <Input value={form.permanent_address} onChange={(e) => update('permanent_address', e.target.value)} placeholder="House No, Street, City, State, Pincode" />
              </div>
              <div className="space-y-1.5">
                <Label>Communication Address</Label>
                <Input value={form.communication_address} onChange={(e) => update('communication_address', e.target.value)} placeholder="Same as permanent if blank" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HeartPulse className="h-5 w-5 text-primary" />
              Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Allergies</Label>
                <Input value={form.allergies} onChange={(e) => update('allergies', e.target.value)} placeholder="e.g. Penicillin, Peanuts" />
              </div>
              <div className="space-y-1.5">
                <Label>Medical Conditions</Label>
                <Input value={form.medical_conditions} onChange={(e) => update('medical_conditions', e.target.value)} placeholder="e.g. Asthma, Diabetes" />
              </div>
              <div className="space-y-1.5">
                <Label>Emergency Contact Name</Label>
                <Input value={form.emergency_contact_name} onChange={(e) => update('emergency_contact_name', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Emergency Contact Phone</Label>
                <Input value={form.emergency_contact_phone} onChange={(e) => update('emergency_contact_phone', e.target.value)} placeholder="+91 9876543210" />
                {errors.emergency_contact_phone && <p className="text-xs text-red-500">{errors.emergency_contact_phone}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Documents
            </CardTitle>
            <CardDescription className="text-xs">Upload documents after student creation. For now, note the documents to collect.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Birth Certificate', 'Aadhaar', 'Transfer Certificate', 'Previous Marks Memo'].map((doc) => (
                <div key={doc} className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">{doc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label>Account Status</Label>
              <Select
                value={form.is_active ? 'active' : 'inactive'}
                onValueChange={(v) => update('is_active', v === 'active')}
              >
                <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end pb-8">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Student
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
