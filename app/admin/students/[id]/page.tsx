'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft, Pencil as Edit, User, GraduationCap, Users as UsersIcon, Calendar, DollarSign, FileText, HeartPulse, Phone, Mail, MapPin, CreditCard, Award, TrendingUp, Download } from 'lucide-react';
import type { StudentWithDetails } from '@/lib/student-types';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [student, setStudent] = useState<StudentWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);

  const fetchStudent = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select(
        `*,
        profile:profiles!students_user_id_fkey(*),
        class:classes(id, name, section, grade_level),
        house:houses(id, name, color),
        academic_year:academic_years(id, name),
        student_parents(
          id, relationship, is_primary,
          parent:parents(id, user_id, occupation,
            profile:profiles!parents_user_id_fkey(*)
          )
        ),
        student_medical(*),
        student_documents(*)
        `
      )
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      toast.error('Student not found');
      router.push('/admin/students');
      return;
    }

    const mapped = {
      ...data,
      parents: data.student_parents || [],
      medical: data.student_medical || null,
      documents: data.student_documents || [],
    } as StudentWithDetails;
    setStudent(mapped);

    // Fetch attendance
    const { data: att } = await supabase
      .from('attendance')
      .select('*, class:classes(name)')
      .eq('student_id', id)
      .order('date', { ascending: false })
      .limit(30);
    if (att) setAttendance(att);

    // Fetch fees
    const { data: feeData } = await supabase
      .from('student_fees')
      .select('*, fee_type:fee_types(name)')
      .eq('student_id', id)
      .order('created_at', { ascending: false });
    if (feeData) setFees(feeData);

    // Fetch marks
    const { data: marksData } = await supabase
      .from('marks')
      .select('*, exam:exams(name, total_marks, pass_marks)')
      .eq('student_id', id)
      .order('created_at', { ascending: false });
    if (marksData) setMarks(marksData);

    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Student Profile" subtitle="" />
        <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!student) return null;

  const fullName = `${student.profile?.first_name || ''} ${student.profile?.last_name || ''}`;
  const primaryParent = student.parents?.find((p) => p.is_primary) || student.parents?.[0];

  const attendanceStats = {
    present: attendance.filter((a) => a.status === 'present').length,
    absent: attendance.filter((a) => a.status === 'absent').length,
    late: attendance.filter((a) => a.status === 'late').length,
    total: attendance.length,
  };

  const feeStats = {
    paid: fees.filter((f) => f.status === 'paid').length,
    pending: fees.filter((f) => f.status === 'pending').length,
    overdue: fees.filter((f) => f.status === 'overdue').length,
    totalAmount: fees.reduce((sum, f) => sum + Number(f.amount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Student Profile" subtitle={fullName} />

      <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6 animate-in">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/students')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <Button size="sm" onClick={() => router.push(`/admin/students/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Student
          </Button>
        </div>

        {/* Profile Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={student.profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl">
                  {student.profile?.first_name?.[0] || '?'}
                  {student.profile?.last_name?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{fullName}</h2>
                <p className="text-sm text-muted-foreground font-mono">{student.admission_number}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">{student.class?.name || 'No Class'}</Badge>
                  {student.section && <Badge variant="outline">Section {student.section}</Badge>}
                  {student.roll_number && <Badge variant="outline">Roll #{student.roll_number}</Badge>}
                  {student.house && <Badge variant="outline" style={{ color: student.house.color }}>{student.house.name}</Badge>}
                  {student.archived ? (
                    <Badge variant="outline" className="bg-gray-100">Archived</Badge>
                  ) : student.is_active ? (
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  ) : (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="personal">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="parent">Parent</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="fees" className="hidden lg:block">Fees</TabsTrigger>
            <TabsTrigger value="exams" className="hidden lg:block">Results</TabsTrigger>
            <TabsTrigger value="documents" className="hidden lg:block">Documents</TabsTrigger>
            <TabsTrigger value="medical" className="hidden lg:block">Medical</TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoItem label="First Name" value={student.profile?.first_name} />
                  <InfoItem label="Last Name" value={student.profile?.last_name} />
                  <InfoItem label="Email" value={student.profile?.email} icon={Mail} />
                  <InfoItem label="Phone" value={student.profile?.phone} icon={Phone} />
                  <InfoItem label="Gender" value={student.gender || student.profile?.gender} />
                  <InfoItem label="Date of Birth" value={student.profile?.date_of_birth ? new Date(student.profile.date_of_birth).toLocaleDateString() : undefined} icon={Calendar} />
                  <InfoItem label="Blood Group" value={student.blood_group} icon={HeartPulse} />
                  <InfoItem label="Aadhaar Number" value={student.aadhaar_number} icon={CreditCard} />
                  <InfoItem label="Nationality" value={student.nationality || 'Indian'} />
                  <InfoItem label="Religion" value={student.religion} />
                  <InfoItem label="Caste" value={student.caste} />
                  <InfoItem label="Mother Tongue" value={student.mother_tongue} />
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem label="Permanent Address" value={student.profile?.address} icon={MapPin} />
                  <InfoItem label="Communication Address" value={student.communication_address || student.profile?.address} icon={MapPin} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Tab */}
          <TabsContent value="academic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoItem label="Admission Number" value={student.admission_number} />
                  <InfoItem label="Admission Date" value={student.admission_date ? new Date(student.admission_date).toLocaleDateString() : undefined} icon={Calendar} />
                  <InfoItem label="Academic Year" value={student.academic_year?.name} />
                  <InfoItem label="Class" value={student.class?.name} />
                  <InfoItem label="Section" value={student.section || student.class?.section} />
                  <InfoItem label="Roll Number" value={student.roll_number} />
                  <InfoItem label="House" value={student.house?.name} />
                  <InfoItem label="Previous School" value={student.previous_school} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parent Tab */}
          <TabsContent value="parent">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UsersIcon className="h-5 w-5 text-primary" />
                  Parent / Guardian Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.parents && student.parents.length > 0 ? (
                  <div className="space-y-4">
                    {student.parents.map((sp, i) => (
                      <div key={i} className="p-4 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">{sp.relationship}</Badge>
                          {sp.is_primary && <Badge className="bg-primary/10 text-primary">Primary</Badge>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <InfoItem label="Name" value={sp.parent?.profile ? `${sp.parent.profile.first_name} ${sp.parent.profile.last_name}` : '-'} />
                          <InfoItem label="Phone" value={sp.parent?.profile?.phone} icon={Phone} />
                          <InfoItem label="Email" value={sp.parent?.profile?.email} icon={Mail} />
                          <InfoItem label="Occupation" value={sp.parent?.occupation} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No parent/guardian information available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  Attendance Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-green-50 text-center">
                    <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
                    <p className="text-xs text-muted-foreground">Present</p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50 text-center">
                    <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
                    <p className="text-xs text-muted-foreground">Absent</p>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-50 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</p>
                    <p className="text-xs text-muted-foreground">Late</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50 text-center">
                    <p className="text-2xl font-bold text-blue-600">{attendanceStats.total > 0 ? Math.round((attendanceStats.present / attendanceStats.total) * 100) : 0}%</p>
                    <p className="text-xs text-muted-foreground">Attendance Rate</p>
                  </div>
                </div>
                {attendance.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr className="text-left">
                          <th className="p-3 font-semibold">Date</th>
                          <th className="p-3 font-semibold">Class</th>
                          <th className="p-3 font-semibold">Status</th>
                          <th className="p-3 font-semibold hidden sm:table-cell">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.map((a, i) => (
                          <tr key={i} className="border-t">
                            <td className="p-3">{new Date(a.date).toLocaleDateString()}</td>
                            <td className="p-3 text-muted-foreground">{a.class?.name || '-'}</td>
                            <td className="p-3">
                              <Badge
                                variant={a.status === 'present' ? 'default' : a.status === 'absent' ? 'destructive' : 'secondary'}
                                className={a.status === 'present' ? 'bg-green-100 text-green-700' : a.status === 'late' ? 'bg-yellow-100 text-yellow-700' : ''}
                              >
                                {a.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-muted-foreground hidden sm:table-cell">{a.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No attendance records</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Fee Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-green-50 text-center">
                    <p className="text-2xl font-bold text-green-600">{feeStats.paid}</p>
                    <p className="text-xs text-muted-foreground">Paid</p>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-50 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{feeStats.pending}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50 text-center">
                    <p className="text-2xl font-bold text-red-600">{feeStats.overdue}</p>
                    <p className="text-xs text-muted-foreground">Overdue</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50 text-center">
                    <p className="text-2xl font-bold text-blue-600">₹{feeStats.totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
                {fees.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr className="text-left">
                          <th className="p-3 font-semibold">Fee Type</th>
                          <th className="p-3 font-semibold">Amount</th>
                          <th className="p-3 font-semibold">Due Date</th>
                          <th className="p-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fees.map((f, i) => (
                          <tr key={i} className="border-t">
                            <td className="p-3">{f.fee_type?.name || '-'}</td>
                            <td className="p-3 font-medium">₹{Number(f.amount).toLocaleString()}</td>
                            <td className="p-3 text-muted-foreground">{f.due_date ? new Date(f.due_date).toLocaleDateString() : '-'}</td>
                            <td className="p-3">
                              <Badge
                                variant={f.status === 'paid' ? 'default' : f.status === 'overdue' ? 'destructive' : 'secondary'}
                                className={f.status === 'paid' ? 'bg-green-100 text-green-700' : f.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                              >
                                {f.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No fee records</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exam Results Tab */}
          <TabsContent value="exams">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5 text-primary" />
                  Examination Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {marks.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr className="text-left">
                          <th className="p-3 font-semibold">Exam</th>
                          <th className="p-3 font-semibold">Marks</th>
                          <th className="p-3 font-semibold">Grade</th>
                          <th className="p-3 font-semibold hidden sm:table-cell">Rank</th>
                          <th className="p-3 font-semibold hidden sm:table-cell">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marks.map((m, i) => (
                          <tr key={i} className="border-t">
                            <td className="p-3">{m.exam?.name || '-'}</td>
                            <td className="p-3 font-medium">{m.marks_obtained}/{m.exam?.total_marks || '-'}</td>
                            <td className="p-3">
                              <Badge variant="secondary">{m.grade || '-'}</Badge>
                            </td>
                            <td className="p-3 hidden sm:table-cell">{m.rank_in_class || '-'}</td>
                            <td className="p-3 text-muted-foreground hidden sm:table-cell">{m.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No examination results</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.documents && student.documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {student.documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{doc.document_type}</p>
                            <p className="text-xs text-muted-foreground">{doc.file_name || 'No filename'}</p>
                          </div>
                        </div>
                        {doc.file_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No documents uploaded</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical Tab */}
          <TabsContent value="medical">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HeartPulse className="h-5 w-5 text-primary" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.medical ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem label="Blood Group" value={student.medical.blood_group || student.blood_group} icon={HeartPulse} />
                    <InfoItem label="Allergies" value={student.medical.allergies} />
                    <InfoItem label="Medical Conditions" value={student.medical.medical_conditions} />
                    <InfoItem label="Medications" value={student.medical.medications} />
                    <InfoItem label="Emergency Contact" value={student.medical.emergency_contact_name} icon={Phone} />
                    <InfoItem label="Emergency Phone" value={student.medical.emergency_contact_phone} icon={Phone} />
                    <InfoItem label="Emergency Relation" value={student.medical.emergency_contact_relation} />
                    <InfoItem label="Last Checkup" value={student.medical.last_checkup ? new Date(student.medical.last_checkup).toLocaleDateString() : undefined} icon={Calendar} />
                    {student.medical.notes && (
                      <div className="col-span-full">
                        <InfoItem label="Notes" value={student.medical.notes} />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No medical information available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: any }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  );
}
