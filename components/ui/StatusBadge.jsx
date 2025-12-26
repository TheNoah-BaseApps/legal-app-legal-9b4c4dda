'use client';

import { Badge } from '@/components/ui/badge';

export default function StatusBadge({ status, type = 'customer' }) {
  const getVariant = () => {
    if (type === 'customer') {
      switch (status) {
        case 'Active':
          return 'default';
        case 'Inactive':
          return 'secondary';
        case 'Pending':
          return 'outline';
        case 'Archived':
          return 'destructive';
        default:
          return 'secondary';
      }
    }

    if (type === 'case') {
      switch (status) {
        case 'New':
          return 'default';
        case 'Open':
        case 'In Progress':
          return 'default';
        case 'Pending':
          return 'outline';
        case 'Closed':
          return 'secondary';
        case 'Dismissed':
          return 'destructive';
        default:
          return 'secondary';
      }
    }

    return 'secondary';
  };

  return (
    <Badge variant={getVariant()}>
      {status}
    </Badge>
  );
}