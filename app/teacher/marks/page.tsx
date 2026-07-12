'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Target } from 'lucide-react';

const studentMarksData = [
  { id: 1, rollNo: '001', name: 'Aarav Sharma', midterm: 85, unit1: 92, unit2: 78, assignment: 88, total: 343 },
  { id: 2, rollNo: '002', name: 'Bhavna Kapoor', midterm: 92, unit1: 88, unit2: 95, assignment: 91, total: 366 },
  { id: 3, rollNo: '003', name: 'Chirag Singh', midterm: 78, unit1: 85, unit2: 80, assignment: 82, total: 325 },
  { id: 4, rollNo: '004', name: 'Diya Patel', midterm: 95, unit1: 90, unit2: 93, assignment: 89, total: 367 },
  { id: 5, rollNo: '005', name: 'Esha Gupta', midterm: 88, unit1: 86, unit2: 87, assignment: 85, total: 346 },
  { id: 6, rollNo: '006', name: 'Faizan Khan', midterm: 82, unit1: 79, unit2: 84, assignment: 80, total: 325 },
  { id: 7, rollNo: '007', name: 'Gina Desai', midterm: 90, unit1: 93, unit2: 89, assignment: 92, total: 364 },
  { id: 8, rollNo: '008', name: 'Harsh Verma', midterm: 75, unit1: 82, unit2: 76, assignment: 79, total: 312 },
];

export default function MarksPage() {
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [selectedExam, setSelectedExam] = useState('midterm');
  const [marks, setMarks] = useState<Record<number, Record<string, number>>>(
    studentMarksData.reduce(
      (acc, student) => ({
        ...acc,
        [student.id]: {
          midterm: student.midterm,
          unit1: student.unit1,
          unit2: student.unit2,
          assignment: student.assignment,
        },
      }),
      {}
    )
  );

  const handleMarkChange = (studentId: number, exam: string, value: string) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [exam]: parseInt(value) || 0,
      },
    }));
  };

  const examTypes = [
    { value: 'midterm', label: 'Midterm', maxMarks: 100 },
    { value: 'unit1', label: 'Unit Test 1', maxMarks: 50 },
    { value: 'unit2', label: 'Unit Test 2', maxMarks: 50 },
    { value: 'assignment', label: 'Assignment', maxMarks: 50 },
  ];

  const currentExam = examTypes.find((e) => e.value === selectedExam);
  const maxMarks = currentExam?.maxMarks || 100;

  const getGrade = (marks: number, maxMarks: number): string => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
  };

  const classAverage =
    studentMarksData.reduce((sum, student) => sum + (marks[student.id][selectedExam] || 0), 0) /
    studentMarksData.length;

  const highestMark = Math.max(...studentMarksData.map((s) => marks[s.id][selectedExam] || 0));
  const lowestMark = Math.min(...studentMarksData.map((s) => marks[s.id][selectedExam] || 0));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Marks Entry" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Exam/Assessment</label>
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="midterm">Midterm (100)</SelectItem>
                <SelectItem value="unit1">Unit Test 1 (50)</SelectItem>
                <SelectItem value="unit2">Unit Test 2 (50)</SelectItem>
                <SelectItem value="assignment">Assignment (50)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Class Average</p>
                  <p className="text-3xl font-bold text-gray-900">{classAverage.toFixed(1)}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Highest Mark</p>
                  <p className="text-3xl font-bold text-gray-900">{highestMark}</p>
                </div>
                <Target className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Lowest Mark</p>
                  <p className="text-3xl font-bold text-gray-900">{lowestMark}</p>
                </div>
                <BarChart3 className="w-10 h-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Max Marks</p>
                  <p className="text-3xl font-bold text-gray-900">{maxMarks}</p>
                </div>
                <Badge className="bg-blue-600">{currentExam?.label}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Marks Entry Table */}
        <Card>
          <CardHeader>
            <CardTitle>Enter {currentExam?.label} Marks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll No</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Marks (/{maxMarks})
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Percentage</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {studentMarksData.map((student) => {
                    const studentMark = marks[student.id][selectedExam] || 0;
                    const percentage = ((studentMark / maxMarks) * 100).toFixed(1);
                    const grade = getGrade(studentMark, maxMarks);

                    const gradeColor = {
                      'A+': 'bg-green-100 text-green-800',
                      A: 'bg-green-100 text-green-800',
                      'B+': 'bg-blue-100 text-blue-800',
                      B: 'bg-blue-100 text-blue-800',
                      C: 'bg-yellow-100 text-yellow-800',
                      F: 'bg-red-100 text-red-800',
                    }[grade] || 'bg-gray-100 text-gray-800';

                    return (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{student.rollNo}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{student.name}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            max={maxMarks}
                            value={studentMark}
                            onChange={(e) => handleMarkChange(student.id, selectedExam, e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                          {percentage}%
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={gradeColor}>{grade}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex gap-3">
              <Button className="flex-1">Submit Marks</Button>
              <Button variant="outline" className="flex-1">
                Save as Draft
              </Button>
              <Button variant="outline" className="flex-1">
                Export to CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {['A+', 'A', 'B+', 'B', 'C', 'F'].map((gr) => {
                const count = studentMarksData.filter(
                  (s) => getGrade(marks[s.id][selectedExam] || 0, maxMarks) === gr
                ).length;

                return (
                  <div key={gr} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600 mt-1">Grade {gr}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
