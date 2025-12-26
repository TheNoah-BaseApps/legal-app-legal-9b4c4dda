'use client';

import DataTable from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function EngagementTable({ engagements, onDelete, onEdit, onView }) {
  const [deleteId, setDeleteId] = useState(null);

  const columns = [
    {
      id: 'engagement_id',
      header: 'Engagement ID',
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
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(row.id)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(row.id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteId(row.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <DataTable columns={columns} data={engagements} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Engagement"
        description="Are you sure you want to delete this engagement? This action cannot be undone."
        onConfirm={() => {
          onDelete(deleteId);
          setDeleteId(null);
        }}
        variant="destructive"
        confirmText="Delete"
      />
    </>
  );
}