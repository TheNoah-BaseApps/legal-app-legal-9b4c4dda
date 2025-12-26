'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';

export default function CaseReportTable({ report }) {
  const columns = [
    {
      id: 'case_id',
      header: 'Case ID',
      accessor: (row) => row.case_id,
      sortable: true
    },
    {
      id: 'case_title',
      header: 'Title',
      accessor: (row) => row.case_title,
      sortable: true
    },
    {
      id: 'customer_name',
      header: 'Client',
      accessor: (row) => row.customer_name,
      sortable: true
    },
    {
      id: 'case_status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.case_status} type="case" />,
      sortable: true
    },
    {
      id: 'attorney_name',
      header: 'Attorney',
      accessor: (row) => row.attorney_name || 'Unassigned',
      sortable: true
    },
    {
      id: 'filing_date',
      header: 'Filing Date',
      accessor: (row) => row.filing_date ? new Date(row.filing_date).toLocaleDateString() : 'N/A',
      sortable: true
    },
    {
      id: 'engagement_count',
      header: 'Engagements',
      accessor: (row) => row.engagement_count || 0,
      sortable: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {report.summary?.map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm">{item.case_status}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{item.count}</p>
              <p className="text-xs text-muted-foreground">
                {item.with_hearings} with hearings
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={report.cases || []} />
        </CardContent>
      </Card>

      {report.attorneyWorkload && (
        <Card>
          <CardHeader>
            <CardTitle>Attorney Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.attorneyWorkload.map((attorney, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <span className="font-medium">{attorney.name}</span>
                  <div className="text-right">
                    <p className="text-sm">
                      <span className="font-semibold">{attorney.active_cases}</span> active
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {attorney.total_cases} total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}