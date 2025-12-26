'use client';

import { useRouter } from 'next/navigation';
import EngagementForm from '@/components/engagements/EngagementForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewEngagementPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Log Engagement</h1>
          <p className="text-muted-foreground">
            Record a new client interaction
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Details</CardTitle>
        </CardHeader>
        <CardContent>
          <EngagementForm />
        </CardContent>
      </Card>
    </div>
  );
}