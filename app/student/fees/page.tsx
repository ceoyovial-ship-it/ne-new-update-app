'use client';

import { Header } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FeesPage() {
  return (
    <div>
      <Header title="Fees" />
      <div className="p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This page is under development.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
