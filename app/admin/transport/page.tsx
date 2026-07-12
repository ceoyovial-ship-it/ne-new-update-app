'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Bus, Users, MapPin, Clock, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminTransportPage() {
  const routes = [
    { id: 'R001', routeName: 'Route A - City Center', stops: 12, students: 45, driver: 'Rajesh Kumar', vehicleNo: 'UP32AB1234', status: 'active' },
    { id: 'R002', routeName: 'Route B - North Area', stops: 8, students: 32, driver: 'Amit Singh', vehicleNo: 'UP32CD5678', status: 'active' },
    { id: 'R003', routeName: 'Route C - South Zone', stops: 10, students: 38, driver: 'Sunil Verma', vehicleNo: 'UP32EF9012', status: 'active' },
    { id: 'R004', routeName: 'Route D - East Colony', stops: 6, students: 25, driver: 'Vikram Patel', vehicleNo: 'UP32GH3456', status: 'maintenance' },
  ];

  const totalRoutes = routes.length;
  const totalVehicles = routes.length;
  const totalStudents = routes.reduce((sum, r) => sum + r.students, 0);
  const activeRoutes = routes.filter(r => r.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Transport Management" subtitle="Manage bus routes and vehicles" />

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Routes</p>
                  <p className="text-2xl font-bold">{totalRoutes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Bus className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vehicles</p>
                  <p className="text-2xl font-bold">{totalVehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Routes</p>
                  <p className="text-2xl font-bold">{activeRoutes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Routes Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bus Routes</CardTitle>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Route
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route ID</TableHead>
                  <TableHead>Route Name</TableHead>
                  <TableHead className="text-center">Stops</TableHead>
                  <TableHead className="text-center">Students</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Vehicle No.</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.id}</TableCell>
                    <TableCell>{route.routeName}</TableCell>
                    <TableCell className="text-center">{route.stops}</TableCell>
                    <TableCell className="text-center">{route.students}</TableCell>
                    <TableCell>{route.driver}</TableCell>
                    <TableCell className="text-muted-foreground">{route.vehicleNo}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={route.status === 'active' ? 'default' : 'secondary'}>
                        {route.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
