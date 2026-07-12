'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Save, RefreshCw, User, GraduationCap, Users as UsersIcon, MapPin, HeartPulse } from 'lucide-react';
import { StudentFormData, emptyStudentForm, BLOOD_GROUPS, GENDERS } from '@/lib/student-types';

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [form, setForm] = useState<StudentFormData>({ ...emptyStudentForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<any>(null);

  const loadData = useCallback(async () => {
    const { data: c } = await supabase.from('classes').select('id, name, section, grade_level').eq('is_active', true).order('grade_level');
    if (c) setClasses(c);
    const { data: h } = await supabase.from('houses').select('id, name, color').order('name');
    if (h) setHouses(h);
    const { data: y } = await supabase.from('academic_years').select('*').order('start_date', { ascending: false });
    if (y) setAcademicYears(y);

    const { data, error } = await supabase
      .from('students')
      .select(`*,
        profile:profiles!students_user_id_fkey(*),
        student_parents(id, relationship, is_primary,
          parent:parents(id, occupation,
            profile:profiles!parents_user_id_fkey(*)
          )
        ),
        student_medical(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      toast.error('Student not found');
      router.push('/admin/students');
      return;
    }

    setStudentData(data);
    const primaryParent = data.student_parents?.find((p: any) => p.is_primary) || data.student_parents?.[0];
    const parentProfile = primaryParent?.parent?.profile;

    setForm({
      first_name: data.profile?.first_name || '',
      last_name: data.profile?.last_name || '',
      email: data.profile?.email || '',
      phone: data.profile?.phone || '',
      gender: data.gender || data.profile?.gender || '',
      date_of_birth: data.profile?.date_of_birth || '',
      blood_group: data.blood_group || '',
      aadhaar_number: data.aadhaar_number || '',
      avatar_url: data.profile?.avatar_url || '',
      admission_number: data.admission_number || '',
      admission_date: data.admission_date || '',
      academic_year_id: data.academic_year_id || '',
      class_id: data.class_id || '',
      section: data.section || '',
      roll_number: data.roll_number || '',
      house_id: data.house_id || '',
      father_name: primaryParent?.relationship === 'Father' ? (parentProfile ? `${parentProfile.first_name} ${parentProfile.last_name}` : '') : '',
      mother_name: primaryParent?.relationship === 'Mother' ? (parentProfile ? `${parentProfile.first_name} ${parentProfile.last_name}` : '') : '',
      guardian_name: primaryParent?.relationship === 'Guardian' ? (parentProfile ? `${parentProfile.first_name} ${parentProfile.last_name}` : '') : '',
      parent_phone: parentProfile?.phone || '',
      parent_email: parentProfile?.email || '',
      parent_occupation: primaryParent?.parent?.occupation || '',
      permanent_address: data.profile?.address || '',
      communication_address: data.communication_address || '',
      allergies: data.student_medical?.allergies || '',
      medical_conditions: data.student_medical?.medical_conditions || '',
      emergency_contact_name: data.student_medical?.emergency_contact_name || '',
      emergency_contact_phone: data.student_medical?.emergency_contact_phone || '',
      is_active: data.is_active ?? true,
    });
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (form.phone && !/^[+\d\s\-()]{10,15}$/.test(form.phone)) e.phone = 'Invalid phone';
    if (!form.gender) e.gender = 'Gender is required';
    if (!form.class_id) e.class_id = 'Class is required';
    if (form.aadhaar_number && !/^\d{12}$/.test(form.aadhaar_number.replace(/\s/g, ''))) e.aadhaar_number = 'Aadhaar must be 12 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fix the errors');
      return;
    }
    setSaving(true);
    try {
      // Update profile
      if (studentData?.user_id) {
        const { error: pe } = await supabase.from('profiles').update({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone || null,
          gender: form.gender,
          date_of_birth: form.date_of_birth || null,
          address: form.permanent_address || null,
        }).eq('id', studentData.user_id);
        if (pe) throw new Error(pe.message);
      }

      // Update student
      const { error: se } = await supabase.from('students').update({
        admission_number: form.admission_number,
        roll_number: form.roll_number || null,
        class_id: form.class_id || null,
        house_id: form.house_id || null,
        blood_group: form.blood_group || null,
        aadhaar_number: form.aadhaar_number || null,
        gender: form.gender,
        academic_year_id: form.academic_year_id || null,
        section: form.section || null,
        admission_date: form.admission_date || null,
        is_active: form.is_active,
        communication_address: form.communication_address || null,
      }).eq('id', id);
      if (se) throw new Error(se.message);

      // Update medical
      if (form.allergies || form.medical_conditions || form.emergency_contact_name) {
        await supabase.from('student_medical').upsert({
          student_id: id,
          allergies: form.allergies || null,
          medical_conditions: form.medical_conditions || null,
          blood_group: form.blood_group || null,
          emergency_contact_name: form.emergency_contact_name || null,
          emergency_contact_phone: form.emergency_contact_phone || null,
        }, { onConflict: 'student_id' });
      }

      toast.success('Student updated successfully');
      router.push(`/admin/students/${id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Edit Student" subtitle="" />
        <div className="p-6 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const sections = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Edit Student" subtitle={`${form.first_name} ${form.last_name}`} />

      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6 animate-in">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5 text-primary" />Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Admission Number</Label>
                <Input value={form.admission_number} onChange={(e) => update('admission_number', e.target.value)} className="font-mono" />
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
                <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Gender *</Label>
                <Select value={form.gender} onValueChange={(v) => update('gender', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
                {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Date of Birth</Label>
                <Input type="date" value={form.date_of_birth} onChange={(e) => update('date_of_birth', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Blood Group</Label>
                <Select value={form.blood_group} onValueChange={(v) => update('blood_group', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{BLOOD_GROUPS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Aadhaar Number</Label>
                <Input value={form.aadhaar_number} onChange={(e) => update('aadhaar_number', e.target.value)} maxLength={14} />
                {errors.aadhaar_number && <p className="text-xs text-red-500">{errors.aadhaar_number}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><GraduationCap className="h-5 w-5 text-primary" />Academic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Admission Date</Label>
                <Input type="date" value={form.admission_date} onChange={(e) => update('admission_date', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Academic Year</Label>
                <Select value={form.academic_year_id} onValueChange={(v) => update('academic_year_id', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{academicYears.map((y) => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Class *</Label>
                <Select value={form.class_id} onValueChange={(v) => update('class_id', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                {errors.class_id && <p className="text-xs text-red-500">{errors.class_id}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Section</Label>
                <Select value={form.section} onValueChange={(v) => update('section', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {sections.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Roll Number</Label>
                <Input value={form.roll_number} onChange={(e) => update('roll_number', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>House</Label>
                <Select value={form.house_id} onValueChange={(v) => update('house_id', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{houses.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><UsersIcon className="h-5 w-5 text-primary" />Parent / Guardian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5"><Label>Father's Name</Label><Input value={form.father_name} onChange={(e) => update('father_name', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Mother's Name</Label><Input value={form.mother_name} onChange={(e) => update('mother_name', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Guardian Name</Label><Input value={form.guardian_name} onChange={(e) => update('guardian_name', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Parent Phone</Label><Input value={form.parent_phone} onChange={(e) => update('parent_phone', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Parent Email</Label><Input type="email" value={form.parent_email} onChange={(e) => update('parent_email', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Occupation</Label><Input value={form.parent_occupation} onChange={(e) => update('parent_occupation', e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><MapPin className="h-5 w-5 text-primary" />Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5"><Label>Permanent Address</Label><Input value={form.permanent_address} onChange={(e) => update('permanent_address', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Communication Address</Label><Input value={form.communication_address} onChange={(e) => update('communication_address', e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><HeartPulse className="h-5 w-5 text-primary" />Medical Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Allergies</Label><Input value={form.allergies} onChange={(e) => update('allergies', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Medical Conditions</Label><Input value={form.medical_conditions} onChange={(e) => update('medical_conditions', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Emergency Contact Name</Label><Input value={form.emergency_contact_name} onChange={(e) => update('emergency_contact_name', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Emergency Contact Phone</Label><Input value={form.emergency_contact_phone} onChange={(e) => update('emergency_contact_phone', e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Status</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label>Account Status</Label>
              <Select value={form.is_active ? 'active' : 'inactive'} onValueChange={(v) => update('is_active', v === 'active')}>
                <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end pb-8">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Update Student</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
