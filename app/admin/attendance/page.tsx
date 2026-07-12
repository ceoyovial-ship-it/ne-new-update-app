'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Button } from '@/components/ui';
import { Calendar, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AttendanceRecord {
  id: string;
  studentName: string;
  class: string;
  date: string;
  status: string;
}

interface AttendanceSummary {
  class: string;
  present: number;
  absent: number;
  late: number;
  totalStudents: number;
}

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedClass, selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch classes
      const { data: classData } = await supabase
        .from('classes')
        .select('name')
        .order('name');

      if (classData) {
        setClasses(['All', ...classData.map(c => c.name)]);
      }

      // Fetch attendance
      let query = supabase
        .from('attendance')
        .select('*')
        .eq('date', selectedDate);

      if (selectedClass !== 'All') {
        query = query.eq('class', selectedClass);
      }

      const { data: attendanceData, error } = await query.order('studentName');

      if (error) throw error;
      setAttendance(attendanceData || []);

      // Calculate summary
      const summaryData = (classData || []).map(classItem => {
        const classAttendance = (attendanceData || []).filter(
          a => a.class === classItem.name
        );
        return {
          class: classItem.name,
          present: classAttendance.filter(a => a.status === 'present').length,
          absent: classAttendance.filter(a => a.status === 'absent').length,
          late: classAttendance.filter(a => a.status === 'late').length,
          totalStudents: classAttendance.length,
        };
      });
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-50';
      case 'absent':
        return 'bg-red-50';
      case 'late':
        return 'bg-yellow-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Attendance Management" />

      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Attendance Overview</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {summary.map((item) => (
            <Card key={item.class}>
              <CardContent className="pt-6">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 mb-3">{item.class}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600 font-medium">Present</span>
                      <span className="font-bold">{item.present}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600 font-medium">Absent</span>
                      <span className="font-bold">{item.absent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-600 font-medium">Late</span>
                      <span className="font-bold">{item.late}</span>
                    </div>
                  </div>
                  {item.totalStudents > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Attendance Rate</span>
                        <span className="font-bold">
                          {Math.round(((item.present + item.late) / item.totalStudents) * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Attendance Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Details - {selectedDate}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading attendance...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Class</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {attendance.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          No attendance records found
                        </td>
                      </tr>
                    ) : (
                      attendance.map((record) => (
                        <tr key={record.id} className={`hover:${getStatusBgColor(record.status)}`}>
                          <td className="px-6 py-4 text-sm text-gray-900">{record.studentName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{record.class}</td>
                          <td className="px-6 py-4 text-sm">
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Attendance Marked</p>
                  <p className="text-2xl font-bold text-gray-900">{attendance.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Average Attendance Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {attendance.length > 0
                      ? Math.round(
                          (attendance.filter(a => a.status === 'present').length / attendance.length) * 100
                        )
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
