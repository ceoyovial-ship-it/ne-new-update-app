'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileManager } from '@/components/profile/profile-manager';
import { ChangePassword } from '@/components/auth/change-password';
import { useAuth } from '@/lib/auth-context';
import { supabase, Student, Class, Profile } from '@/lib/supabase';
import { useEffect, useState as useReactState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Lock, Users, UserCircle, GraduationCap, Loader2, Phone, Mail } from 'lucide-react';

interface ChildInfo {
  student: Student & { profile: Profile; class: Class | null };
  relationship: string;
  is_primary: boolean;
}

export default function ParentProfilePage() {
  const [tab, setTab] = useState('profile');
  const { user } = useAuth();
  const [children, setChildren] = useReactState<ChildInfo[]>([]);
  const [loadingChildren, setLoadingChildren] = useReactState(true);

  useEffect(() => {
    const parent = user?.parent;
    if (!parent) return;
    (async () => {
      const { data: links } = await supabase
        .from('student_parents')
        .select(`relationship, is_primary, student:students(*, profile:profiles(*), class:classes(*))`)
        .eq('parent_id', parent.id);
      if (links) {
        setChildren(links.map((l: any) => ({ student: l.student, relationship: l.relationship, is_primary: l.is_primary })));
      }
      setLoadingChildren(false);
    })();
  }, [user]);

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
            <TabsTrigger value="children" className="gap-2">
              <Users className="h-4 w-4" />
              Children
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileManager roleMeta={{ qualification: user?.parent?.occupation ? `${user.parent.occupation}${user.parent.qualification ? ` • ${user.parent.qualification}` : ''}` : undefined }} />
          </TabsContent>

          <TabsContent value="children">
            <ChildrenCard children={children} loading={loadingChildren} />
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

function ChildrenCard({ children, loading }: { children: ChildInfo[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (children.length === 0) {
    return (
      <Card className="shadow-sm max-w-2xl">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>No children linked to your account yet.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
      {children.map((c, i) => (
        <Card key={i} className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                  {c.student.profile?.first_name?.[0]}{c.student.profile?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{c.student.profile?.first_name} {c.student.profile?.last_name}</p>
                <p className="text-xs text-muted-foreground">{c.relationship}</p>
              </div>
              {c.is_primary && <Badge variant="secondary" className="ml-auto">Primary</Badge>}
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground"><GraduationCap className="h-4 w-4 inline mr-2 text-primary" />{c.student.class?.name || 'No class assigned'}</p>
              <p className="text-muted-foreground">Admission: {c.student.admission_number}</p>
              {c.student.profile?.phone && <p className="text-muted-foreground"><Phone className="h-4 w-4 inline mr-2 text-primary" />{c.student.profile.phone}</p>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
