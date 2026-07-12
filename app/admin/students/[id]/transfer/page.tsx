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
import { ArrowLeft, ArrowRightLeft, RefreshCw } from 'lucide-react';

export default function TransferStudentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [student, setStudent] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toBranchId, setToBranchId] = useState('');
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');

  const fetchData = useCallback(async () => {
    const { data, error } = await supabase
      .from('students')
      .select(`*, profile:profiles!students_user_id_fkey(first_name, last_name, email)`)
      .eq('id', id)
      .maybeSingle();
    if (error || !data) {
      toast.error('Student not found');
      router.push('/admin/students');
      return;
    }
    setStudent(data);

    const { data: b } = await supabase.from('branches').select('*').eq('is_active', true).order('name');
    if (b) setBranches(b);

    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTransfer = async () => {
    if (!toBranchId) { toast.error('Please select a target branch'); return; }
    if (!reason.trim()) { toast.error('Please provide a reason for transfer'); return; }
    setSaving(true);
    try {
      const fromBranchId = student?.profile?.branch_id || null;

      const { error: te } = await supabase.from('student_transfers').insert({
        student_id: id,
        from_branch_id: fromBranchId,
        to_branch_id: toBranchId,
        transfer_date: new Date().toISOString().split('T')[0],
        reason: reason,
        remarks: remarks || null,
        status: 'completed',
      });
      if (te) throw new Error(te.message);

      // Update student's profile branch
      if (student?.user_id) {
        await supabase.from('profiles').update({ branch_id: toBranchId }).eq('id', student.user_id);
      }

      toast.success('Student transferred successfully');
      router.push(`/admin/students/${id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to transfer student');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Transfer Student" subtitle="" />
        <div className="p-6 max-w-2xl mx-auto"><div className="animate-pulse h-48 bg-muted rounded-lg" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Transfer Student" subtitle={`${student?.profile?.first_name} ${student?.profile?.last_name}`} />

      <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6 animate-in">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowRightLeft className="h-5 w-5 text-primary" />Transfer Student
            </CardTitle>
            <CardDescription>Transfer the student to a different branch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Student</span>
                <Badge variant="secondary">{student?.profile?.first_name} {student?.profile?.last_name}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Admission No</span>
                <Badge variant="outline" className="font-mono">{student?.admission_number}</Badge>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Transfer To Branch *</Label>
              <Select value={toBranchId} onValueChange={setToBranchId}>
                <SelectTrigger><SelectValue placeholder="Select target branch" /></SelectTrigger>
                <SelectContent>
                  {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Reason for Transfer *</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Family relocation, academic reasons..." rows={2} />
            </div>

            <div className="space-y-1.5">
              <Label>Additional Remarks</Label>
              <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional notes..." rows={3} />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button onClick={handleTransfer} disabled={saving}>
                {saving ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Transferring...</> : <><ArrowRightLeft className="h-4 w-4 mr-2" />Transfer Student</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
