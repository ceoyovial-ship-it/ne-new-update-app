'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileManager } from '@/components/profile/profile-manager';
import { ChangePassword } from '@/components/auth/change-password';
import { useAuth } from '@/lib/auth-context';
import { supabase, Class, House, Parent, Profile } from '@/lib/supabase';
import { useEffect, useState as useReactState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Users, Lock, GraduationCap, UserCircle, Loader2 } from 'lucide-react';

interface ParentInfo {
  parent: Parent & { profile: Profile };
  relationship: string;
  is_primary: boolean;
}

export default function StudentProfile() {
  const [tab, setTab] = useState('profile');
  const { user } = useAuth();
  const [studentClass, setStudentClass] = useReactState<Class | null>(null);
  const [house, setHouse] = useReactState<House | null>(null);
  const [parents, setParents] = useReactState<ParentInfo[]>([]);
  const [loadingMeta, setLoadingMeta] = useReactState(true);

  useEffect(() => {
    const student = user?.student;
    if (!student) return;
    (async () => {
      if (student.class_id) {
        const { data } = await supabase.from('classes').select('*').eq('id', student.class_id).maybeSingle();
        if (data) setStudentClass(data);
      }
      if (student.house_id) {
        const { data } = await supabase.from('houses').select('*').eq('id', student.house_id).maybeSingle();
        if (data) setHouse(data);
      }
      const { data: parentLinks } = await supabase
        .from('student_parents')
        .select(`relationship, is_primary, parent:parents(*, profile:profiles(*))`)
        .eq('student_id', student.id);
      if (parentLinks) {
        setParents(parentLinks.map((p: any) => ({ parent: p.parent, relationship: p.relationship, is_primary: p.is_primary })));
      }
      setLoadingMeta(false);
    })();
  }, [user]);

  if (loadingMeta) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="My Profile" subtitle="Manage your account and security" />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="profile" className="gap-2">
              <UserCircle className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="student" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Student
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileManager roleMeta={{ className: studentClass?.name }} />
          </TabsContent>

          <TabsContent value="student">
            <StudentDetailsCard studentClass={studentClass} house={house} parents={parents} />
          </TabsContent>

          <TabsContent value="security">
            <div className="max-w-md">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChangePassword />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StudentDetailsCard({ studentClass, house, parents }: { studentClass: Class | null; house: House | null; parents: ParentInfo[] }) {
  const { user } = useAuth();
  if (!user?.student) return null;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Student Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Class" value={studentClass?.name || 'Not assigned'} />
            <Field label="Roll Number" value={user.student.roll_number || 'Not assigned'} />
            <Field label="House" value={house?.name || 'Not assigned'} />
            <Field label="Blood Group" value={user.student.blood_group || 'Not set'} />
            <Field label="Admission No" value={user.student.admission_number} />
            <Field label="Nationality" value={user.student.nationality || 'Not set'} />
          </div>
        </CardContent>
      </Card>

      {parents.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Parent / Guardian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {parents.map((p, i) => (
                <div key={i} className={`p-4 rounded-lg border ${p.is_primary ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                          {p.parent.profile?.first_name?.[0]}{p.parent.profile?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{p.parent.profile?.first_name} {p.parent.profile?.last_name}</p>
                        <p className="text-xs text-muted-foreground">{p.relationship}</p>
                      </div>
                    </div>
                    {p.is_primary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                  </div>
                  {p.parent.profile?.phone && <p className="text-sm text-muted-foreground"><Phone className="h-3 w-3 inline mr-1" />{p.parent.profile.phone}</p>}
                  {p.parent.profile?.email && <p className="text-sm text-muted-foreground"><Mail className="h-3 w-3 inline mr-1" />{p.parent.profile.email}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || 'Not set'}</p>
    </div>
  );
}
