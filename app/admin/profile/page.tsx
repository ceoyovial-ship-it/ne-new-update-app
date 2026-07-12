'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileManager } from '@/components/profile/profile-manager';
import { ChangePassword } from '@/components/auth/change-password';
import { Lock, UserCircle } from 'lucide-react';

export default function AdminProfilePage() {
  const [tab, setTab] = useState('profile');

  return (
    <div className="min-h-screen bg-background">
      <Header title="My Profile" subtitle="Manage your account and security" />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="profile" className="gap-2">
              <UserCircle className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileManager roleMeta={{ department: 'Administration' }} />
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
