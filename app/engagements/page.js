'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EngagementTable from '@/components/engagements/EngagementTable';
import SearchBar from '@/components/ui/SearchBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function EngagementsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [engagements, setEngagements] = useState([]);
  const [filteredEngagements, setFilteredEngagements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEngagements();
  }, []);

  useEffect(() => {
    filterEngagements();
  }, [engagements, searchTerm]);

  const fetchEngagements = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/engagements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch engagements');
      }

      const data = await response.json();
      setEngagements(data.data);
      setFilteredEngagements(data.data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterEngagements = () => {
    let filtered = engagements;

    if (searchTerm) {
      filtered = filtered.filter(engagement =>
        engagement.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        engagement.engagement_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        engagement.engagement_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEngagements(filtered);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/engagements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete engagement');
      }

      toast.success('Engagement deleted successfully');
      fetchEngagements();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const thisMonth = new Date().getMonth();
  const thisMonthEngagements = engagements.filter(e => {
    const engagementMonth = new Date(e.engagement_date).getMonth();
    return engagementMonth === thisMonth;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Engagements</h1>
          <p className="text-muted-foreground">
            Track client interactions
          </p>
        </div>
        <Button onClick={() => router.push('/engagements/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Log Engagement
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Engagements</p>
              <p className="text-2xl font-bold">{engagements.length}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold text-blue-600">{thisMonthEngagements}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg per Client</p>
              <p className="text-2xl font-bold text-purple-600">
                {engagements.length > 0 ? Math.round(engagements.length / new Set(engagements.map(e => e.client_id)).size) : 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search engagements..."
      />

      <EngagementTable
        engagements={filteredEngagements}
        onDelete={handleDelete}
        onEdit={(id) => router.push(`/engagements/${id}/edit`)}
        onView={(id) => router.push(`/engagements/${id}`)}
      />
    </div>
  );
}