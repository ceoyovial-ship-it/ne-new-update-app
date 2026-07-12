'use client';

import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  GraduationCap,
  DollarSign,
  BookOpen,
  TrendingUp,
  Calendar,
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Students', value: '—', icon: Users, color: 'text-blue-600' },
    { label: 'Total Teachers', value: '—', icon: GraduationCap, color: 'text-green-600' },
    { label: 'Total Revenue', value: '₹—', icon: DollarSign, color: 'text-emerald-600' },
    { label: 'Active Classes', value: '—', icon: BookOpen, color: 'text-purple-600' },
  ];

  return (
    <div>
      <Header title="Dashboard" />
      <div className="space-y-6 p-4 lg:p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.profile.first_name}!
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening at your school today.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Authentication</span>
                <span className="font-medium text-success">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Database</span>
                <span className="font-medium text-success">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Admin Account</span>
                <span className="font-medium text-success">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
