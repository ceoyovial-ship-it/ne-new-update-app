'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, Clock, MapPin, Users, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminEventsPage() {
  const events = [
    { id: 'E001', title: 'Annual Sports Day', date: '2024-12-20', time: '09:00 AM', venue: 'Main Ground', type: 'Sports', status: 'upcoming', attendees: 500 },
    { id: 'E002', title: 'Science Exhibition', date: '2024-12-15', time: '10:00 AM', venue: 'Science Block', type: 'Academic', status: 'upcoming', attendees: 200 },
    { id: 'E003', title: 'Parent-Teacher Meeting', date: '2024-12-10', time: '02:00 PM', venue: 'Auditorium', type: 'Meeting', status: 'completed', attendees: 350 },
    { id: 'E004', title: 'Cultural Festival', date: '2024-12-25', time: '06:00 PM', venue: 'Open Air Theatre', type: 'Cultural', status: 'upcoming', attendees: 800 },
    { id: 'E005', title: 'Alumni Meet', date: '2024-12-30', time: '05:00 PM', venue: 'Conference Hall', type: 'Social', status: 'upcoming', attendees: 150 },
  ];

  const upcoming = events.filter(e => e.status === 'upcoming').length;
  const totalEvents = events.length;
  const totalAttendees = events.reduce((sum, e) => sum + e.attendees, 0);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Sports: 'bg-green-100 text-green-700',
      Academic: 'bg-blue-100 text-blue-700',
      Meeting: 'bg-yellow-100 text-yellow-700',
      Cultural: 'bg-purple-100 text-purple-700',
      Social: 'bg-pink-100 text-pink-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Events Management" subtitle="Schedule and manage school events" />

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">{upcoming}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Attendance</p>
                  <p className="text-2xl font-bold">{totalAttendees}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Venues</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Events</CardTitle>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Event
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Expected</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.time}</TableCell>
                    <TableCell>{event.venue}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{event.attendees}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>
                        {event.status}
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
