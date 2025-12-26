'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, Briefcase, MessageSquare } from 'lucide-react';

export default function RecentActivity({ activity }) {
  const getIcon = (type) => {
    switch (type) {
      case 'customer':
        return <Users className="h-4 w-4" />;
      case 'case':
        return <Briefcase className="h-4 w-4" />;
      case 'engagement':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getLabel = (type) => {
    switch (type) {
      case 'customer':
        return 'New Customer';
      case 'case':
        return 'New Case';
      case 'engagement':
        return 'New Engagement';
      default:
        return 'Activity';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {activity.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{getLabel(item.type)}</p>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}