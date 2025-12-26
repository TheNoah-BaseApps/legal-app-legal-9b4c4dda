'use client';

import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function CustomerTable({ customers, onDelete, onEdit, onView }) {
  const [deleteId, setDeleteId] = useState(null);

  const columns = [
    {
      id: 'customer_id',
      header: 'Customer ID',
      accessor: (row) => row.customer_id,
      sortable: true
    },
    {
      id: 'customer_name',
      header: 'Customer Name',
      accessor: (row) => row.customer_name,
      sortable: true
    },
    {
      id: 'contact_person',
      header: 'Contact Person',
      accessor: (row) => row.contact_person,
      sortable: true
    },
    {
      id: 'email_address',
      header: 'Email',
      accessor: (row) => row.email_address,
      sortable: true
    },
    {
      id: 'industry_type',
      header: 'Industry',
      accessor: (row) => row.industry_type,
      sortable: true
    },
    {
      id: 'customer_status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.customer_status} type="customer" />,
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
      <DataTable columns={columns} data={customers} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Customer"
        description="Are you sure you want to delete this customer? This action cannot be undone."
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