'use client';

import { Header } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditStudentPage() {
  return (
    <div>
      <Header title="Edit Student" />
      <div className="p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Student</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This page is under development.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
