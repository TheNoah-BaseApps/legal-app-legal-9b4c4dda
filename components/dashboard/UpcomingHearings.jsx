'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import Link from 'next/link';

export default function UpcomingHearings({ hearings }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Hearings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hearings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No upcoming hearings</p>
        ) : (
          <div className="space-y-4">
            {hearings.map((hearing) => (
              <Link
                key={hearing.id}
                href={`/cases/${hearing.id}`}
                className="block p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{hearing.case_title}</p>
                    <p className="text-sm text-muted-foreground">{hearing.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{hearing.court_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(hearing.hearing_date).toLocaleDateString()}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {hearing.case_status}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}