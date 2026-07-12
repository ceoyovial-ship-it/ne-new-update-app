'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Check, X, AlertCircle, Download } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function AttendancePage() {
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId') || '1';

  const attendanceData = {
    childName: 'Sarah Johnson',
    totalDays: 180,
    presentDays: 165,
    absentDays: 12,
    leaveDays: 3,
    percentage: 92,
  };

  const monthlyAttendance = [
    { month: 'January', present: 18, absent: 2, leave: 0, percentage: 90 },
    { month: 'February', present: 17, absent: 2, leave: 1, percentage: 89 },
    { month: 'March', present: 20, absent: 0, leave: 0, percentage: 100 },
    { month: 'April', present: 19, absent: 1, leave: 0, percentage: 95 },
    { month: 'May', present: 18, absent: 1, leave: 1, percentage: 90 },
    { month: 'June', present: 19, absent: 2, leave: 1, percentage: 87 },
  ];

  const recentAttendance = [
    { date: '2024-06-07', status: 'present', remark: 'On time' },
    { date: '2024-06-06', status: 'present', remark: 'On time' },
    { date: '2024-06-05', status: 'absent', remark: 'Medical Leave' },
    { date: '2024-06-04', status: 'present', remark: 'On time' },
    { date: '2024-06-03', status: 'present', remark: 'Late by 10 mins' },
    { date: '2024-06-02', status: 'leave', remark: 'Medical Leave' },
    { date: '2024-06-01', status: 'present', remark: 'On time' },
    { date: '2024-05-31', status: 'present', remark: 'On time' },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      leave: 'bg-yellow-100 text-yellow-800',
    };
    return variants[status] || variants.present;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'present') return <Check className="w-4 h-4" />;
    if (status === 'absent') return <X className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-30">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Attendance</h1>
            <p className="text-sm text-muted-foreground">{attendanceData.childName}</p>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download Report</span>
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Overall Attendance</p>
                <p className="text-3xl font-bold text-blue-600 mb-1">{attendanceData.percentage}%</p>
                <p className="text-xs text-gray-500">{attendanceData.presentDays} / {attendanceData.totalDays} days</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Present</p>
                <p className="text-3xl font-bold text-green-600">{attendanceData.presentDays}</p>
                <p className="text-xs text-gray-500">days</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Absent</p>
                <p className="text-3xl font-bold text-red-600">{attendanceData.absentDays}</p>
                <p className="text-xs text-gray-500">days</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Leave</p>
                <p className="text-3xl font-bold text-yellow-600">{attendanceData.leaveDays}</p>
                <p className="text-xs text-gray-500">days</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Days</p>
                <p className="text-3xl font-bold text-gray-900">{attendanceData.totalDays}</p>
                <p className="text-xs text-gray-500">academic year</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Attendance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyAttendance.map((month) => (
                <div key={month.month} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <span className="text-sm font-bold text-gray-900">{month.percentage}%</span>
                  </div>
                  <div className="flex gap-2 h-8 rounded-lg overflow-hidden bg-gray-100">
                    <div
                      className="bg-green-500 flex items-center justify-center text-white text-xs font-bold"
                      style={{ width: `${(month.present / 20) * 100}%` }}
                      title={`Present: ${month.present}`}
                    >
                      {month.present > 0 && month.present}
                    </div>
                    <div
                      className="bg-red-500 flex items-center justify-center text-white text-xs font-bold"
                      style={{ width: `${(month.absent / 20) * 100}%` }}
                      title={`Absent: ${month.absent}`}
                    >
                      {month.absent > 0 && month.absent}
                    </div>
                    <div
                      className="bg-yellow-500 flex items-center justify-center text-white text-xs font-bold"
                      style={{ width: `${(month.leave / 20) * 100}%` }}
                      title={`Leave: ${month.leave}`}
                    >
                      {month.leave > 0 && month.leave}
                    </div>
                    <div className="flex-1 bg-gray-100"></div>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span>P: {month.present}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span>A: {month.absent}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span>L: {month.leave}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAttendance.map((record) => (
                <div
                  key={record.date}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">{record.date}</span>
                    <Badge className={getStatusBadge(record.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(record.status)}
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{record.remark}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
