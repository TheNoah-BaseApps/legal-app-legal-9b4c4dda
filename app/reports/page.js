'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CaseReportTable from '@/components/reports/CaseReportTable';
import EngagementReportTable from '@/components/reports/EngagementReportTable';
import ExportButtons from '@/components/reports/ExportButtons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [caseReport, setCaseReport] = useState(null);
  const [engagementReport, setEngagementReport] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const fetchCaseReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const url = new URL('/api/reports/cases', window.location.origin);
      
      if (dateRange.startDate) {
        url.searchParams.append('startDate', dateRange.startDate);
      }
      if (dateRange.endDate) {
        url.searchParams.append('endDate', dateRange.endDate);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch case report');
      }

      const data = await response.json();
      setCaseReport(data.data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEngagementReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const url = new URL('/api/reports/engagements', window.location.origin);
      
      if (dateRange.startDate) {
        url.searchParams.append('startDate', dateRange.startDate);
      }
      if (dateRange.endDate) {
        url.searchParams.append('endDate', dateRange.endDate);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch engagement report');
      }

      const data = await response.json();
      setEngagementReport(data.data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and export detailed reports
          </p>
        </div>
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Date Range Filter</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Start Date</label>
            <DatePicker
              value={dateRange.startDate}
              onChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">End Date</label>
            <DatePicker
              value={dateRange.endDate}
              onChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="cases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cases">Case Reports</TabsTrigger>
          <TabsTrigger value="engagements">Engagement Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="cases" className="space-y-4">
          <div className="flex justify-between items-center">
            <Button onClick={fetchCaseReport} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Case Report'}
            </Button>
            {caseReport && (
              <ExportButtons
                data={caseReport.cases}
                filename="case-report"
                type="cases"
              />
            )}
          </div>
          
          {loading ? (
            <Skeleton className="h-96" />
          ) : caseReport ? (
            <CaseReportTable report={caseReport} />
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Click "Generate Case Report" to view data</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="engagements" className="space-y-4">
          <div className="flex justify-between items-center">
            <Button onClick={fetchEngagementReport} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Engagement Report'}
            </Button>
            {engagementReport && (
              <ExportButtons
                data={engagementReport.engagements}
                filename="engagement-report"
                type="engagements"
              />
            )}
          </div>
          
          {loading ? (
            <Skeleton className="h-96" />
          ) : engagementReport ? (
            <EngagementReportTable report={engagementReport} />
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Click "Generate Engagement Report" to view data</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}