'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui';
import { Save, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SchoolSettings {
  schoolName: string;
  principalName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  affiliation: string;
  establishedYear: string;
  academicYear: string;
  currency: string;
  language: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SchoolSettings>({
    schoolName: 'ABC Senior Secondary School',
    principalName: 'Dr. John Smith',
    email: 'principal@abcschool.edu',
    phone: '+91-9876543210',
    address: '123 Education Street',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    affiliation: 'CBSE',
    establishedYear: '1995',
    academicYear: '2024-2025',
    currency: 'INR',
    language: 'English',
  });

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SchoolSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert([settings]);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="School Settings" />
        <div className="p-8 text-center">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="School Settings" />

      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">School Settings</h1>

        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
            <AlertCircle className="w-5 h-5" />
            Settings saved successfully!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* School Information */}
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name
                </label>
                <input
                  type="text"
                  value={settings.schoolName}
                  onChange={(e) => handleInputChange('schoolName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Principal Name
                </label>
                <input
                  type="text"
                  value={settings.principalName}
                  onChange={(e) => handleInputChange('principalName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Affiliation
                </label>
                <select
                  value={settings.affiliation}
                  onChange={(e) => handleInputChange('affiliation', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>CBSE</option>
                  <option>ICSE</option>
                  <option>State Board</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Established
                </label>
                <input
                  type="text"
                  value={settings.establishedYear}
                  onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={settings.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={settings.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={settings.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  value={settings.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </CardContent>
          </Card>

          {/* Academic Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Academic Year
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2024-2025"
                  value={settings.academicYear}
                  onChange={(e) => handleInputChange('academicYear', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>INR</option>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Settings
                </label>
                <Button variant="outline" className="w-full mb-2">
                  Create Backup
                </Button>
                <Button variant="outline" className="w-full mb-2">
                  Restore Backup
                </Button>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advanced Options
                </label>
                <Button variant="outline" className="w-full mb-2">
                  Import Data
                </Button>
                <Button variant="outline" className="w-full mb-2">
                  Export Data
                </Button>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maintenance
                </label>
                <Button variant="outline" className="w-full">
                  View Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 gap-2 px-8 py-3 text-lg"
          >
            <Save className="w-5 h-5" />
            Save All Settings
          </Button>
        </div>

        {/* Info Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">Important</p>
                <p className="text-sm text-blue-800">
                  Changes to school information and settings will be reflected across the entire system.
                  Please ensure accuracy before saving. For critical settings changes, a backup is recommended.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
