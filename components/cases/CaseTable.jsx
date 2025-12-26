'use client';

import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function CaseTable({ cases, onDelete, onEdit, onView }) {
  const [deleteId, setDeleteId] = useState(null);

  const columns = [
    {
      id: 'case_id',
      header: 'Case ID',
      accessor: (row) => row.case_id,
      sortable: true
    },
    {
      id: 'case_title',
      header: 'Case Title',
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
      id: 'case_type',
      header: 'Type',
      accessor: (row) => row.case_type,
      sortable: true
    },
    {
      id: 'case_status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.case_status} type="case" />,
      sortable: true
    },
    {
      id: 'hearing_date',
      header: 'Hearing Date',
      accessor: (row) => row.hearing_date ? new Date(row.hearing_date).toLocaleDateString() : 'N/A',
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
      <DataTable columns={columns} data={cases} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Case"
        description="Are you sure you want to delete this case? This action cannot be undone."
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