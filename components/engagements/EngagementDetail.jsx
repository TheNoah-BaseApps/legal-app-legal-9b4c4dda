'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, MessageSquare, FileText } from 'lucide-react';

export default function EngagementDetail({ engagement }) {
  if (!engagement) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Engagement Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Engagement ID</p>
            <p className="font-medium">{engagement.engagement_id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Type</p>
            <Badge>{engagement.engagement_type}</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Client</p>
            <p className="font-medium">{engagement.customer_name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Channel</p>
            <p className="font-medium">{engagement.engagement_channel}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{new Date(engagement.engagement_date).toLocaleDateString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Contact Person</p>
            <p className="font-medium">{engagement.contact_person || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Recorded By</p>
              <p className="font-medium">{engagement.recorder_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Outcome</p>
              <p className="font-medium">{engagement.engagement_outcome || 'N/A'}</p>
            </div>
          </div>
          {engagement.engagement_notes && (
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="font-medium whitespace-pre-wrap">{engagement.engagement_notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}