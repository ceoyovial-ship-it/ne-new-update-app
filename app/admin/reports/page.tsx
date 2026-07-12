'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui';
import { Download, FileText, BarChart3, TrendingUp } from 'lucide-react';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    class: '',
    semester: '',
    startDate: '',
    endDate: '',
  });

  const reports: ReportType[] = [
    {
      id: 'student-performance',
      name: 'Student Performance Report',
      description: 'Comprehensive analysis of student marks and grades',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'bg-blue-50 border-blue-200',
    },
    {
      id: 'attendance',
      name: 'Attendance Report',
      description: 'Attendance records and analysis by class and date',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'bg-green-50 border-green-200',
    },
    {
      id: 'class-summary',
      name: 'Class Summary Report',
      description: 'Overview of class performance and statistics',
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-purple-50 border-purple-200',
    },
    {
      id: 'fee-collection',
      name: 'Fee Collection Report',
      description: 'Financial tracking and fee payment records',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'bg-orange-50 border-orange-200',
    },
    {
      id: 'exam-analysis',
      name: 'Exam Analysis Report',
      description: 'Detailed analysis of exam results and statistics',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'bg-red-50 border-red-200',
    },
    {
      id: 'staff-report',
      name: 'Staff Report',
      description: 'Teacher and staff information and assignments',
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-indigo-50 border-indigo-200',
    },
  ];

  const handleGenerateReport = (reportId: string) => {
    console.log(`Generating report: ${reportId}`, filters);
    // Report generation logic would go here
  };

  const handleExportPDF = () => {
    console.log('Exporting to PDF');
  };

  const handleExportExcel = () => {
    console.log('Exporting to Excel');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Reports & Analytics" />

      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Reports & Analytics</h1>

        {!selectedReport ? (
          <>
            {/* Report Selection Grid */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Report Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((report) => (
                  <Card
                    key={report.id}
                    className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${report.color}`}
                    onClick={() => setSelectedReport(report.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="flex justify-center mb-3 text-gray-700">
                          {report.icon}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{report.name}</h3>
                        <p className="text-sm text-gray-600">{report.description}</p>
                        <Button
                          className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(report.id);
                          }}
                        >
                          Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Report Generation Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">42</div>
                    <p className="text-sm text-gray-600">Reports Generated</p>
                    <p className="text-xs text-gray-500 mt-1">This month</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">156</div>
                    <p className="text-sm text-gray-600">Total Reports</p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">28</div>
                    <p className="text-sm text-gray-600">Scheduled Reports</p>
                    <p className="text-xs text-gray-500 mt-1">Active</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">4.2 GB</div>
                    <p className="text-sm text-gray-600">Storage Used</p>
                    <p className="text-xs text-gray-500 mt-1">Report archives</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Report Configuration */}
            <Button
              variant="outline"
              onClick={() => setSelectedReport(null)}
              className="mb-6"
            >
              Back to Reports
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {reports.find(r => r.id === selectedReport)?.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Class
                        </label>
                        <select
                          value={filters.class}
                          onChange={(e) => setFilters({ ...filters, class: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Classes</option>
                          <option value="6A">Class 6 - A</option>
                          <option value="6B">Class 6 - B</option>
                          <option value="7A">Class 7 - A</option>
                          <option value="7B">Class 7 - B</option>
                          <option value="8A">Class 8 - A</option>
                          <option value="8B">Class 8 - B</option>
                          <option value="9A">Class 9 - A</option>
                          <option value="9B">Class 9 - B</option>
                          <option value="10A">Class 10 - A</option>
                          <option value="10B">Class 10 - B</option>
                          <option value="11A">Class 11 - A</option>
                          <option value="11B">Class 11 - B</option>
                          <option value="12A">Class 12 - A</option>
                          <option value="12B">Class 12 - B</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Semester
                        </label>
                        <select
                          value={filters.semester}
                          onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Semesters</option>
                          <option value="1">Semester 1</option>
                          <option value="2">Semester 2</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <Button
                          onClick={() => handleGenerateReport(selectedReport)}
                          className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                        >
                          <BarChart3 className="w-4 h-4" />
                          Generate Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Export Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={handleExportPDF}
                      className="w-full flex gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export as PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleExportExcel}
                      className="w-full flex gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export as Excel
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full flex gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View Online
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full flex gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Email Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Report Information</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div>
                      <p className="text-gray-600">Format</p>
                      <p className="font-medium text-gray-900">Professional PDF / Excel</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Includes</p>
                      <p className="font-medium text-gray-900">Charts, Tables & Analysis</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Generation Time</p>
                      <p className="font-medium text-gray-900">2-5 seconds</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
