'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, Student, Class, Attendance, Mark } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  DollarSign,
  Bell,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';

interface ChildInfo {
  student: Student & { profile: { first_name: string; last_name: string; avatar_url?: string } };
  class: Class | null;
  attendancePercent: number;
  latestMarks: Mark[];
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user?.parent) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user?.parent) return;

    setLoading(true);

    // Fetch linked students (children)
    const { data: studentLinks } = await supabase
      .from('student_parents')
      .select(`
        student:students(
          *,
          profile:profiles(first_name, last_name, avatar_url)
        )
      `)
      .eq('parent_id', user.parent.id);

    if (studentLinks && studentLinks.length > 0) {
      const childrenData: ChildInfo[] = [];

      for (const link of studentLinks) {
        const student = link.student as any;

        // Fetch class
        let classData = null;
        if (student.class_id) {
          const { data } = await supabase
            .from('classes')
            .select('*')
            .eq('id', student.class_id)
            .maybeSingle();
          classData = data;
        }

        // Fetch attendance
        const { data: attData } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', student.id)
          .limit(30);

        const present = attData?.filter(a => a.status === 'present' || a.status === 'late').length || 0;
        const total = attData?.length || 1;
        const attPercent = Math.round((present / total) * 100);

        // Fetch latest marks
        const { data: marksData } = await supabase
          .from('marks')
          .select('*, exam:exams(name, total_marks)')
          .eq('student_id', student.id)
          .order('created_at', { ascending: false })
          .limit(3);

        childrenData.push({
          student,
          class: classData,
          attendancePercent: attPercent,
          latestMarks: marksData || [],
        });
      }

      setChildren(childrenData);
    }

    // Fetch notifications
    const { data: notifData } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.user.id)
      .is('is_read', false)
      .limit(5);

    if (notifData) {
      setNotifications(notifData);
    }

    setLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Parent Portal" subtitle={`${getGreeting()}, ${user?.profile.first_name}`} />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 animate-in">
        {/* Welcome */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              {getGreeting()}, {user?.profile.first_name}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor your child&apos;s academic progress and school activities
            </p>
          </CardContent>
        </Card>

        {/* Children Overview */}
        <div className="grid lg:grid-cols-2 gap-6">
          {children.map((child, index) => (
            <Card key={index} className="card-hover">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarImage src={child.student.profile?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xl font-semibold">
                      {child.student.profile?.first_name?.[0]}
                      {child.student.profile?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>
                      {child.student.profile?.first_name} {child.student.profile?.last_name}
                    </CardTitle>
                    <CardDescription>
                      {child.class?.name} - Roll No: {child.student.roll_number}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Attendance</p>
                    <p className="text-xl font-bold text-green-600">{child.attendancePercent}%</p>
                    <Progress value={child.attendancePercent} className="mt-2 h-1" />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Class Performance</p>
                    <p className="text-xl font-bold text-primary">78%</p>
                    <p className="text-xs text-muted-foreground mt-1">Rank: 5th</p>
                  </div>
                </div>

                {child.latestMarks.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Recent Results</p>
                    <div className="space-y-2">
                      {child.latestMarks.slice(0, 2).map((mark: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{mark.exam?.name}</span>
                          <Badge variant="secondary">
                            {mark.marks_obtained}/{mark.exam?.total_marks}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {children.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No children linked to your account</p>
              <p className="text-sm">Contact school administration for assistance</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary opacity-50" />
              <p className="font-medium">Attendance</p>
              <p className="text-xs text-muted-foreground">View records</p>
            </CardContent>
          </Card>
          <Card className="card-hover cursor-pointer">
            <CardContent className="pt-6 text-center">
              <GraduationCap className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-50" />
              <p className="font-medium">Academics</p>
              <p className="text-xs text-muted-foreground">Progress reports</p>
            </CardContent>
          </Card>
          <Card className="card-hover cursor-pointer">
            <CardContent className="pt-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-orange-500 opacity-50" />
              <p className="font-medium">Fees</p>
              <p className="text-xs text-muted-foreground">Payment status</p>
            </CardContent>
          </Card>
          <Card className="card-hover cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Bell className="h-8 w-8 mx-auto mb-2 text-blue-500 opacity-50" />
              <p className="font-medium">Notifications</p>
              <p className="text-xs text-muted-foreground">{notifications.length} new</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
