'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Download, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export default function FeesPage() {
  const [selectedChild, setSelectedChild] = useState('1');

  // Mock data - replace with actual API calls
  const children = [
    { id: '1', name: 'Sarah Johnson', grade: 'Grade 10' },
    { id: '2', name: 'Michael Johnson', grade: 'Grade 8' },
  ];

  const feesSummary = {
    totalFees: 150000,
    paidFees: 100000,
    pendingFees: 50000,
    dueDate: '2024-06-30',
  };

  const feeBreakdown = [
    { id: 1, description: 'Tuition Fee', amount: 80000, period: 'June 2024', status: 'paid', paidDate: '2024-06-01' },
    { id: 2, description: 'Laboratory Fee', amount: 15000, period: 'June 2024', status: 'paid', paidDate: '2024-06-01' },
    { id: 3, description: 'Activity Fee', amount: 5000, period: 'June 2024', status: 'paid', paidDate: '2024-06-01' },
    { id: 4, description: 'Tuition Fee', amount: 80000, period: 'July 2024', status: 'pending', dueDate: '2024-06-30' },
    { id: 5, description: 'Laboratory Fee', amount: 15000, period: 'July 2024', status: 'pending', dueDate: '2024-06-30' },
    { id: 6, description: 'Activity Fee', amount: 5000, period: 'July 2024', status: 'pending', dueDate: '2024-06-30' },
  ];

  const paymentHistory = [
    { id: 1, date: '2024-06-01', amount: 100000, method: 'Online Transfer', reference: 'TXN123456789', status: 'completed' },
    { id: 2, date: '2024-05-01', amount: 100000, method: 'Online Transfer', reference: 'TXN123456788', status: 'completed' },
    { id: 3, date: '2024-04-01', amount: 100000, method: 'Online Transfer', reference: 'TXN123456787', status: 'completed' },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-orange-100 text-orange-800',
      overdue: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const selectedChildData = children.find(c => c.id === selectedChild);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Fee Management" subtitle={`${selectedChildData?.name} - ${selectedChildData?.grade}`} />

      <main className="container mx-auto px-4 py-8">
        {/* Child Selection */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Child</label>
            <div className="flex flex-wrap gap-2">
              {children.map((child) => (
                <Button
                  key={child.id}
                  variant={selectedChild === child.id ? 'default' : 'outline'}
                  onClick={() => setSelectedChild(child.id)}
                  className="flex-1 sm:flex-none"
                >
                  {child.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fee Summary */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Fees</p>
                <p className="text-2xl font-bold text-gray-900">₹{(feesSummary.totalFees / 1000).toFixed(0)}K</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-2">Paid</p>
                <p className="text-2xl font-bold text-green-600">₹{(feesSummary.paidFees / 1000).toFixed(0)}K</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-2">Pending</p>
                <p className="text-2xl font-bold text-orange-600">₹{(feesSummary.pendingFees / 1000).toFixed(0)}K</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Due Date</p>
                <p className="text-xl font-bold text-gray-900">{feesSummary.dueDate}</p>
                <p className="text-xs text-gray-500 mt-1">Next Payment</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Payment Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Fees Paid</span>
                  <span className="text-sm font-bold text-gray-900">
                    {Math.round((feesSummary.paidFees / feesSummary.totalFees) * 100)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600"
                    style={{ width: `${(feesSummary.paidFees / feesSummary.totalFees) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3 mb-8">
          {/* Fee Breakdown */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Fee Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {feeBreakdown.map((fee) => (
                    <div
                      key={fee.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{fee.description}</p>
                          <p className="text-sm text-gray-600">{fee.period}</p>
                        </div>
                        <Badge className={getStatusBadge(fee.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(fee.status)}
                            {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                          </span>
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-gray-900">₹{fee.amount.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-500">
                          {fee.status === 'paid' && `Paid on ${fee.paidDate}`}
                          {fee.status === 'pending' && `Due by ${fee.dueDate}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full gap-2" size="lg">
                <CreditCard className="w-4 h-4" />
                Pay Pending Fees
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Download className="w-4 h-4" />
                Download Receipt
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Eye className="w-4 h-4" />
                View Fee Schedule
              </Button>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded mt-4">
                <p className="text-xs text-blue-900">
                  <span className="font-semibold">Secure Payment:</span> All transactions are encrypted and secure.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{payment.date}</p>
                      <p className="text-sm text-gray-600">Via {payment.method}</p>
                      <p className="text-xs text-gray-500 mt-1">Ref: {payment.reference}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">₹{payment.amount.toLocaleString('en-IN')}</p>
                      <Badge className={getStatusBadge(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
