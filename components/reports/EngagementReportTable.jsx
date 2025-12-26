'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';

export default function EngagementReportTable({ report }) {
  const columns = [
    {
      id: 'engagement_id',
      header: 'ID',
      accessor: (row) => row.engagement_id,
      sortable: true
    },
    {
      id: 'customer_name',
      header: 'Client',
      accessor: (row) => row.customer_name,
      sortable: true
    },
    {
      id: 'engagement_type',
      header: 'Type',
      cell: (row) => <Badge>{row.engagement_type}</Badge>,
      sortable: true
    },
    {
      id: 'engagement_channel',
      header: 'Channel',
      accessor: (row) => row.engagement_channel,
      sortable: true
    },
    {
      id: 'engagement_date',
      header: 'Date',
      accessor: (row) => new Date(row.engagement_date).toLocaleDateString(),
      sortable: true
    },
    {
      id: 'recorder_name',
      header: 'Recorded By',
      accessor: (row) => row.recorder_name,
      sortable: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">By Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.summaryByType?.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{item.engagement_type}</span>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">By Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.summaryByChannel?.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{item.engagement_channel}</span>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.topClients?.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm truncate">{item.customer_name}</span>
                  <Badge variant="outline">{item.engagement_count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={report.engagements || []} />
        </CardContent>
      </Card>
    </div>
  );
}