'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, ArrowUpRight, RefreshCw, GraduationCap } from 'lucide-react';

export default function PromoteStudentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [student, setStudent] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toClassId, setToClassId] = useState('');
  const [toYearId, setToYearId] = useState('');
  const [remarks, setRemarks] = useState('');

  const fetchData = useCallback(async () => {
    const { data, error } = await supabase
      .from('students')
      .select(`*, profile:profiles!students_user_id_fkey(first_name, last_name), class:classes(name), academic_year:academic_years(name)`)
      .eq('id', id)
      .maybeSingle();
    if (error || !data) {
      toast.error('Student not found');
      router.push('/admin/students');
      return;
    }
    setStudent(data);

    const { data: c } = await supabase.from('classes').select('id, name, grade_level').eq('is_active', true).order('grade_level');
    if (c) setClasses(c);

    const { data: y } = await supabase.from('academic_years').select('*').order('start_date', { ascending: false });
    if (y) setAcademicYears(y);

    // Pre-select next year
    const nextYear = y?.find((ay) => !ay.is_current && ay.start_date > (data.academic_year?.start_date || ''));
    setToYearId(nextYear?.id || y?.[0]?.id || '');
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePromote = async () => {
    if (!toClassId) { toast.error('Please select a target class'); return; }
    if (!toYearId) { toast.error('Please select a target academic year'); return; }
    setSaving(true);
    try {
      // Record promotion
      const { error: pe } = await supabase.from('student_promotions').insert({
        student_id: id,
        from_class_id: student.class_id,
        to_class_id: toClassId,
        from_academic_year_id: student.academic_year_id,
        to_academic_year_id: toYearId,
        promotion_date: new Date().toISOString().split('T')[0],
        remarks: remarks || null,
      });
      if (pe) throw new Error(pe.message);

      // Update student
      const { error: se } = await supabase.from('students').update({
        class_id: toClassId,
        academic_year_id: toYearId,
      }).eq('id', id);
      if (se) throw new Error(se.message);

      toast.success('Student promoted successfully');
      router.push(`/admin/students/${id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to promote student');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Promote Student" subtitle="" />
        <div className="p-6 max-w-2xl mx-auto"><div className="animate-pulse h-48 bg-muted rounded-lg" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Promote Student" subtitle={`${student?.profile?.first_name} ${student?.profile?.last_name}`} />

      <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6 animate-in">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowUpRight className="h-5 w-5 text-primary" />Promote Student
            </CardTitle>
            <CardDescription>Move the student to a new class and academic year</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Class</span>
                <Badge variant="secondary">{student?.class?.name || 'Unassigned'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Academic Year</span>
                <Badge variant="secondary">{student?.academic_year?.name || '-'}</Badge>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Promote To Class *</Label>
              <Select value={toClassId} onValueChange={setToClassId}>
                <SelectTrigger><SelectValue placeholder="Select target class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Target Academic Year *</Label>
              <Select value={toYearId} onValueChange={setToYearId}>
                <SelectTrigger><SelectValue placeholder="Select academic year" /></SelectTrigger>
                <SelectContent>
                  {academicYears.map((y) => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Remarks</Label>
              <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional notes about this promotion..." rows={3} />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button onClick={handlePromote} disabled={saving}>
                {saving ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Promoting...</> : <><ArrowUpRight className="h-4 w-4 mr-2" />Promote Student</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
