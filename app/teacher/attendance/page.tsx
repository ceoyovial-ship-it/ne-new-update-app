'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const studentsData = [
  { id: 1, name: 'Aarav Sharma', rollNo: '001', status: 'present' },
  { id: 2, name: 'Bhavna Kapoor', rollNo: '002', status: 'absent' },
  { id: 3, name: 'Chirag Singh', rollNo: '003', status: 'present' },
  { id: 4, name: 'Diya Patel', rollNo: '004', status: 'late' },
  { id: 5, name: 'Esha Gupta', rollNo: '005', status: 'present' },
  { id: 6, name: 'Faizan Khan', rollNo: '006', status: 'present' },
  { id: 7, name: 'Gina Desai', rollNo: '007', status: 'absent' },
  { id: 8, name: 'Harsh Verma', rollNo: '008', status: 'present' },
];

type AttendanceStatus = 'present' | 'absent' | 'late';

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>(
    studentsData.reduce((acc, student) => ({ ...acc, [student.id]: student.status as AttendanceStatus }), {})
  );
  const [submissionDate, setSubmissionDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAttendanceChange = (studentId: number, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const presentCount = Object.values(attendance).filter((status) => status === 'present').length;
  const absentCount = Object.values(attendance).filter((status) => status === 'absent').length;
  const lateCount = Object.values(attendance).filter((status) => status === 'late').length;

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Present
          </Badge>
        );
      case 'absent':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Absent
          </Badge>
        );
      case 'late':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Late
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Attendance" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10-A">Class 10-A</SelectItem>
                <SelectItem value="10-B">Class 10-B</SelectItem>
                <SelectItem value="9-A">Class 9-A</SelectItem>
                <SelectItem value="9-B">Class 9-B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={submissionDate}
              onChange={(e) => setSubmissionDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end gap-2">
            <Button className="flex-1">Mark All Present</Button>
            <Button variant="outline" className="flex-1">Reset</Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{studentsData.length}</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-sm text-green-700">Present</p>
              <p className="text-2xl font-bold text-green-900">{presentCount}</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-700">Absent</p>
              <p className="text-2xl font-bold text-red-900">{absentCount}</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <p className="text-sm text-yellow-700">Late</p>
              <p className="text-2xl font-bold text-yellow-900">{lateCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll No</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{student.rollNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.name}</td>
                      <td className="px-4 py-3">{getStatusBadge(attendance[student.id])}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'present')}
                            className={`px-2 py-1 rounded text-xs font-medium transition ${
                              attendance[student.id] === 'present'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            P
                          </button>
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'absent')}
                            className={`px-2 py-1 rounded text-xs font-medium transition ${
                              attendance[student.id] === 'absent'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            A
                          </button>
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'late')}
                            className={`px-2 py-1 rounded text-xs font-medium transition ${
                              attendance[student.id] === 'late'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            L
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex gap-3">
              <Button className="flex-1">Submit Attendance</Button>
              <Button variant="outline" className="flex-1">Save as Draft</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
