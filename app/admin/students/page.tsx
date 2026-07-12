'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Search, Plus, MoveHorizontal as MoreHorizontal, Eye, CreditCard as Edit, Trash2, TrendingUp, Users, UserCheck, UserX, Download, Printer, GraduationCap, ArrowUpRight, Archive, ArrowRightLeft, ChevronRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { StudentWithDetails, generateAdmissionNumber } from '@/lib/student-types';

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select(
        `*,
        profile:profiles!students_user_id_fkey(id, first_name, last_name, email, phone, avatar_url, date_of_birth, gender, address, city, state, pincode),
        class:classes(id, name, section, grade_level),
        house:houses(id, name, color),
        academic_year:academic_years(id, name),
        student_parents(
          id, relationship, is_primary,
          parent:parents(id, user_id, occupation,
            profile:profiles!parents_user_id_fkey(id, first_name, last_name, email, phone)
          )
        ),
        student_medical(id, allergies, medical_conditions, medications, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, notes),
        student_documents(id, document_type, file_name, file_url, uploaded_at)
        `
      )
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load students');
      console.error(error);
    } else {
      const mapped = (data || []).map((s: any) => ({
        ...s,
        parents: s.student_parents || [],
        medical: s.student_medical || null,
        documents: s.student_documents || [],
      }));
      setStudents(mapped as StudentWithDetails[]);
    }

    const { data: classesData } = await supabase
      .from('classes')
      .select('id, name, section, grade_level')
      .eq('is_active', true)
      .order('grade_level');
    if (classesData) setClasses(classesData);

    const { data: yearsData } = await supabase
      .from('academic_years')
      .select('*')
      .order('start_date', { ascending: false });
    if (yearsData) setAcademicYears(yearsData);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const availableSections = useMemo(() => {
    const sections = new Set<string>();
    students.forEach((s) => {
      if (s.section) sections.add(s.section);
      if (s.class?.section) sections.add(s.class.section);
    });
    return Array.from(sections).sort();
  }, [students]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const fullName = `${s.profile?.first_name || ''} ${s.profile?.last_name || ''}`.toLowerCase();
      const matchSearch =
        !search ||
        fullName.includes(search.toLowerCase()) ||
        (s.admission_number || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.profile?.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.roll_number || '').includes(search);
      const matchClass = classFilter === 'all' || s.class_id === classFilter;
      const matchSection =
        sectionFilter === 'all' || s.section === sectionFilter || s.class?.section === sectionFilter;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && s.is_active) ||
        (statusFilter === 'inactive' && !s.is_active) ||
        (statusFilter === 'archived' && s.archived);
      const matchYear = yearFilter === 'all' || s.academic_year_id === yearFilter;
      return matchSearch && matchClass && matchSection && matchStatus && matchYear;
    });
  }, [students, search, classFilter, sectionFilter, statusFilter, yearFilter]);

  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.is_active && !s.archived).length;
    const now = new Date();
    const newThisMonth = students.filter((s) => {
      if (!s.admission_date) return false;
      const d = new Date(s.admission_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const boys = students.filter((s) => s.gender === 'Male' || s.profile?.gender === 'Male').length;
    const girls = students.filter((s) => s.gender === 'Female' || s.profile?.gender === 'Female').length;
    return { total, active, newThisMonth, boys, girls };
  }, [students]);

  const classDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    students.forEach((s) => {
      const name = s.class?.name || 'Unassigned';
      dist[name] = (dist[name] || 0) + 1;
    });
    return Object.entries(dist).map(([name, count]) => ({ name, count }));
  }, [students]);

  const chartColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#ef4444'];

  const handleDelete = async () => {
    if (!deleteId) return;
    setArchiving(true);
    const { error } = await supabase.from('students').delete().eq('id', deleteId);
    if (error) {
      toast.error('Failed to delete student');
    } else {
      toast.success('Student deleted successfully');
      setDeleteId(null);
      fetchData();
    }
    setArchiving(false);
  };

  const handleArchive = async (student: StudentWithDetails) => {
    const { error } = await supabase
      .from('students')
      .update({ archived: true, archived_at: new Date().toISOString(), is_active: false })
      .eq('id', student.id);
    if (error) {
      toast.error('Failed to archive student');
    } else {
      toast.success('Student archived');
      fetchData();
    }
  };

  const exportCSV = () => {
    const headers = [
      'Admission No', 'Name', 'Roll Number', 'Class', 'Section', 'Gender',
      'Parent Name', 'Phone', 'Email', 'Status',
    ];
    const rows = filtered.map((s) => [
      s.admission_number,
      `${s.profile?.first_name || ''} ${s.profile?.last_name || ''}`,
      s.roll_number || '',
      s.class?.name || '',
      s.section || s.class?.section || '',
      s.gender || s.profile?.gender || '',
      s.parents?.find((p) => p.is_primary)?.parent?.profile
        ? `${s.parents.find((p) => p.is_primary)!.parent.profile!.first_name} ${s.parents.find((p) => p.is_primary)!.parent.profile!.last_name}`
        : '',
      s.profile?.phone || '',
      s.profile?.email || '',
      s.archived ? 'Archived' : s.is_active ? 'Active' : 'Inactive',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const printList = () => {
    window.print();
  };

  const parentName = (s: StudentWithDetails) => {
    const primary = s.parents?.find((p) => p.is_primary);
    if (primary?.parent?.profile) {
      return `${primary.parent.profile.first_name} ${primary.parent.profile.last_name}`;
    }
    const first = s.parents?.[0]?.parent?.profile;
    return first ? `${first.first_name} ${first.last_name}` : '-';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Student Management" subtitle="Manage all student records" />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 animate-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
                </div>
                <div className="p-2 rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="p-2 rounded-full bg-green-100">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">New This Month</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.newThisMonth}</p>
                </div>
                <div className="p-2 rounded-full bg-blue-100">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Boys</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.boys}</p>
                </div>
                <div className="p-2 rounded-full bg-indigo-100">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Girls</p>
                  <p className="text-2xl font-bold text-pink-600">{stats.girls}</p>
                </div>
                <div className="p-2 rounded-full bg-pink-100">
                  <UserX className="h-5 w-5 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Class Distribution Chart */}
        {classDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Class-wise Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={classDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      background: 'hsl(var(--popover))',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {classDistribution.map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Student List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Student List ({filtered.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>
                <Button variant="outline" size="sm" onClick={printList}>
                  <Printer className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
                <Button size="sm" onClick={() => router.push('/admin/students/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, admission no, email, roll no..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sectionFilter} onValueChange={setSectionFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {availableSections.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {academicYears.map((y) => (
                    <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="p-3 font-semibold">Admission No</th>
                    <th className="p-3 font-semibold">Photo</th>
                    <th className="p-3 font-semibold">Student Name</th>
                    <th className="p-3 font-semibold hidden md:table-cell">Roll No</th>
                    <th className="p-3 font-semibold hidden lg:table-cell">Class</th>
                    <th className="p-3 font-semibold hidden lg:table-cell">Section</th>
                    <th className="p-3 font-semibold hidden xl:table-cell">Gender</th>
                    <th className="p-3 font-semibold hidden xl:table-cell">Parent</th>
                    <th className="p-3 font-semibold hidden 2xl:table-cell">Phone</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-3"><Skeleton className="h-4 w-20" /></td>
                        <td className="p-3"><Skeleton className="h-9 w-9 rounded-full" /></td>
                        <td className="p-3"><Skeleton className="h-4 w-28" /></td>
                        <td className="p-3 hidden md:table-cell"><Skeleton className="h-4 w-12" /></td>
                        <td className="p-3 hidden lg:table-cell"><Skeleton className="h-4 w-16" /></td>
                        <td className="p-3 hidden lg:table-cell"><Skeleton className="h-4 w-10" /></td>
                        <td className="p-3 hidden xl:table-cell"><Skeleton className="h-4 w-12" /></td>
                        <td className="p-3 hidden xl:table-cell"><Skeleton className="h-4 w-20" /></td>
                        <td className="p-3 hidden 2xl:table-cell"><Skeleton className="h-4 w-20" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-14" /></td>
                        <td className="p-3 text-right"><Skeleton className="h-8 w-8 ml-auto" /></td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-muted-foreground">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s) => (
                      <tr
                        key={s.id}
                        className="border-t hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/students/${s.id}`)}
                      >
                        <td className="p-3 font-mono text-xs">{s.admission_number}</td>
                        <td className="p-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={s.profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                              {s.profile?.first_name?.[0] || '?'}
                              {s.profile?.last_name?.[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                        </td>
                        <td className="p-3 font-medium">
                          {s.profile?.first_name} {s.profile?.last_name}
                        </td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground">
                          {s.roll_number || '-'}
                        </td>
                        <td className="p-3 hidden lg:table-cell text-muted-foreground">
                          {s.class?.name || '-'}
                        </td>
                        <td className="p-3 hidden lg:table-cell text-muted-foreground">
                          {s.section || s.class?.section || '-'}
                        </td>
                        <td className="p-3 hidden xl:table-cell text-muted-foreground">
                          {s.gender || s.profile?.gender || '-'}
                        </td>
                        <td className="p-3 hidden xl:table-cell text-muted-foreground">
                          {parentName(s)}
                        </td>
                        <td className="p-3 hidden 2xl:table-cell text-muted-foreground">
                          {s.profile?.phone || '-'}
                        </td>
                        <td className="p-3">
                          {s.archived ? (
                            <Badge variant="outline" className="bg-gray-100">Archived</Badge>
                          ) : s.is_active ? (
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          ) : (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </td>
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/admin/students/${s.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/students/${s.id}/edit`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/students/${s.id}/promote`)}>
                                <ArrowUpRight className="h-4 w-4 mr-2" />
                                Promote
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/students/${s.id}/transfer`)}>
                                <ArrowRightLeft className="h-4 w-4 mr-2" />
                                Transfer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleArchive(s)}>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteId(s.id)}
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this student? This action cannot be undone and will remove all related records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={archiving}
              className="bg-red-600 hover:bg-red-700"
            >
              {archiving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
