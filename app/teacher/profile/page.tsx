'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileManager } from '@/components/profile/profile-manager';
import { ChangePassword } from '@/components/auth/change-password';
import { useAuth } from '@/lib/auth-context';
import { Lock, Briefcase, UserCircle, GraduationCap, Award, Building2 } from 'lucide-react';

export default function TeacherProfilePage() {
  const [tab, setTab] = useState('profile');
  const { user } = useAuth();

  const teacher = user?.teacher;

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
            <TabsTrigger value="teacher" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Teaching
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileManager
              roleMeta={{
                department: teacher?.specialization,
                qualification: teacher?.qualification,
              }}
            />
          </TabsContent>

          <TabsContent value="teacher">
            <div className="max-w-2xl">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Teaching Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Field icon={Building2} label="Employee ID" value={teacher?.employee_id} />
                    <Field icon={Award} label="Qualification" value={teacher?.qualification} />
                    <Field icon={GraduationCap} label="Specialization" value={teacher?.specialization} />
                    <Field icon={Briefcase} label="Experience" value={teacher ? `${teacher.experience_years} years` : undefined} />
                    <Field icon={GraduationCap} label="Head of Dept" value={teacher?.is_hod ? 'Yes' : 'No'} />
                    <Field icon={Briefcase} label="Class Teacher" value={teacher?.is_class_teacher ? 'Yes' : 'No'} />
                    {teacher?.join_date && <Field icon={Building2} label="Join Date" value={new Date(teacher.join_date).toLocaleDateString()} />}
                  </div>
                </CardContent>
              </Card>
            </div>
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

function Field({ icon: Icon, label, value }: { icon: typeof Lock; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary flex-shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground break-words">{value || 'Not set'}</p>
      </div>
    </div>
  );
}
