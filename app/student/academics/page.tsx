'use client';

import { Header } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AcademicsPage() {
  return (
    <div>
      <Header title="Academics" />
      <div className="p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Academics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This page is under development.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
