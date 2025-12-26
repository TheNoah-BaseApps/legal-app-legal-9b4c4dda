'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';

export default function CalendarView({ hearings = [] }) {
  const hearingDates = hearings
    .filter(h => h.hearing_date)
    .map(h => new Date(h.hearing_date));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hearing Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="multiple"
          selected={hearingDates}
          className="rounded-md border"
        />
        <div className="mt-4 space-y-2">
          {hearings.slice(0, 5).map((hearing) => (
            <div key={hearing.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium text-sm">{hearing.case_title}</p>
                <p className="text-xs text-muted-foreground">{hearing.court_name}</p>
              </div>
              <p className="text-sm">{new Date(hearing.hearing_date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}