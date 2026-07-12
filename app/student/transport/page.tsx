'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Users, Phone, AlertCircle } from 'lucide-react';

interface Stop {
  id: string;
  name: string;
  time: string;
  location: string;
}

interface Route {
  id: string;
  name: string;
  number: string;
  vehicle: string;
  driver: string;
  driverPhone: string;
  status: 'active' | 'inactive';
  capacity: number;
  currentPassengers: number;
  stops: Stop[];
  estimatedDuration: string;
  fare: number;
}

const TransportPage = () => {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [expandedRoute, setExpandedRoute] = useState<string | null>('1');

  const routes: Route[] = [
    {
      id: '1',
      name: 'North Route (Via Market)',
      number: 'RT-01',
      vehicle: 'AC Bus',
      driver: 'Mr. Ramesh Singh',
      driverPhone: '9876543210',
      status: 'active',
      capacity: 50,
      currentPassengers: 38,
      estimatedDuration: '45 mins',
      fare: 100,
      stops: [
        { id: '1', name: 'City Centre Stop', time: '07:00 AM', location: 'City Centre' },
        { id: '2', name: 'Market Plaza', time: '07:15 AM', location: 'Market Plaza' },
        { id: '3', name: 'Hospital Junction', time: '07:30 AM', location: 'Hospital Area' },
        { id: '4', name: 'School Main Gate', time: '07:50 AM', location: 'School Campus' },
      ],
    },
    {
      id: '2',
      name: 'South Route (Via Park)',
      number: 'RT-02',
      vehicle: 'AC Bus',
      driver: 'Ms. Priya Sharma',
      driverPhone: '8765432109',
      status: 'active',
      capacity: 50,
      currentPassengers: 42,
      estimatedDuration: '50 mins',
      fare: 100,
      stops: [
        { id: '1', name: 'South Gate Stop', time: '07:05 AM', location: 'South Gate' },
        { id: '2', name: 'Green Park', time: '07:20 AM', location: 'Green Park Area' },
        { id: '3', name: 'Railway Station', time: '07:35 AM', location: 'Railway Station' },
        { id: '4', name: 'School Main Gate', time: '08:00 AM', location: 'School Campus' },
      ],
    },
    {
      id: '3',
      name: 'East Route (Via Airport)',
      number: 'RT-03',
      vehicle: 'AC Bus',
      driver: 'Mr. Vikram Kumar',
      driverPhone: '7654321098',
      status: 'active',
      capacity: 50,
      currentPassengers: 35,
      estimatedDuration: '55 mins',
      fare: 120,
      stops: [
        { id: '1', name: 'Airport Area Stop', time: '06:45 AM', location: 'Airport Area' },
        { id: '2', name: 'Tech Park', time: '07:10 AM', location: 'Tech Park' },
        { id: '3', name: 'Business District', time: '07:30 AM', location: 'Business District' },
        { id: '4', name: 'School Main Gate', time: '08:10 AM', location: 'School Campus' },
      ],
    },
    {
      id: '4',
      name: 'West Route (Via Residential)',
      number: 'RT-04',
      vehicle: 'AC Bus',
      driver: 'Mr. Arun Patel',
      driverPhone: '6543210987',
      status: 'active',
      capacity: 45,
      currentPassengers: 28,
      estimatedDuration: '40 mins',
      fare: 80,
      stops: [
        { id: '1', name: 'Residential Complex A', time: '07:20 AM', location: 'Residential Complex A' },
        { id: '2', name: 'Residential Complex B', time: '07:35 AM', location: 'Residential Complex B' },
        { id: '3', name: 'Commercial Hub', time: '07:45 AM', location: 'Commercial Hub' },
        { id: '4', name: 'School Main Gate', time: '08:00 AM', location: 'School Campus' },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const getCapacityPercentage = (current: number, total: number) => {
    return Math.round((current / total) * 100);
  };

  const getCapacityColor = (percentage: number) => {
    if (percentage > 90) return 'text-red-600';
    if (percentage > 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Transport" />
      <div className="container mx-auto px-4 py-8">
        {/* Important Notice */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 mb-1">Transport Schedule Notice</p>
              <p className="text-sm text-blue-800">
                All buses operate on a fixed schedule. Please report any delays or issues to the transport office.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Routes Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-blue-600">{routes.length}</p>
              <p className="text-sm text-gray-600">Active Routes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-purple-600">
                {routes.reduce((acc, r) => acc + r.currentPassengers, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Passengers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-green-600">Rs 80-120</p>
              <p className="text-sm text-gray-600">Monthly Fare Range</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-orange-600">40-55</p>
              <p className="text-sm text-gray-600">Duration (mins)</p>
            </CardContent>
          </Card>
        </div>

        {/* Routes List */}
        <div className="space-y-4">
          {routes.map((route) => {
            const capacityPercentage = getCapacityPercentage(
              route.currentPassengers,
              route.capacity
            );
            const isExpanded = expandedRoute === route.id;

            return (
              <div key={route.id}>
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setExpandedRoute(isExpanded ? null : route.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg">{route.name}</h3>
                          <Badge className={getStatusColor(route.status)}>
                            {route.status}
                          </Badge>
                          <Badge variant="secondary">{route.number}</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-600">Duration</p>
                              <p className="font-medium">{route.estimatedDuration}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-600">Capacity</p>
                              <p className={`font-medium ${getCapacityColor(capacityPercentage)}`}>
                                {route.currentPassengers}/{route.capacity}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-600">Vehicle</p>
                              <p className="font-medium">{route.vehicle}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Monthly Fare</p>
                            <p className="font-medium">Rs {route.fare}</p>
                          </div>
                        </div>

                        {/* Capacity Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              capacityPercentage > 90
                                ? 'bg-red-600'
                                : capacityPercentage > 70
                                  ? 'bg-yellow-600'
                                  : 'bg-green-600'
                            }`}
                            style={{ width: `${capacityPercentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600">
                          {capacityPercentage}% capacity
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        {isExpanded ? 'Hide' : 'View'} Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Expanded Details */}
                {isExpanded && (
                  <Card className="mt-2 bg-gray-50 border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Route Details & Driver Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Driver Info */}
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Driver Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-gray-600">Name: </span>
                            <span className="font-medium">{route.driver}</span>
                          </p>
                          <p>
                            <span className="text-gray-600">Contact: </span>
                            <a href={`tel:${route.driverPhone}`} className="font-medium text-blue-600 hover:underline">
                              {route.driverPhone}
                            </a>
                          </p>
                        </div>
                      </div>

                      {/* Stops */}
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Stops ({route.stops.length})
                        </h4>
                        <div className="space-y-3">
                          {route.stops.map((stop, idx) => (
                            <div key={stop.id} className="flex items-start gap-3">
                              <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                                  {idx + 1}
                                </div>
                                {idx < route.stops.length - 1 && (
                                  <div className="w-0.5 h-8 bg-gray-300 my-1" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{stop.name}</p>
                                <p className="text-sm text-gray-600">{stop.location}</p>
                                <p className="text-sm font-semibold text-blue-600 mt-1">
                                  {stop.time}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button className="flex-1">Subscribe to Route</Button>
                        <Button variant="outline" className="flex-1">
                          Contact Driver
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Info */}
        <Card className="mt-8 bg-gray-100">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-1">Transport Office</p>
                <p className="text-gray-700">Phone: 1800-SCHOOL-1</p>
                <p className="text-gray-700">Email: transport@school.edu</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Emergency</p>
                <p className="text-gray-700">24/7 Support: 9999-911-911</p>
                <p className="text-gray-700">WhatsApp: Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransportPage;
