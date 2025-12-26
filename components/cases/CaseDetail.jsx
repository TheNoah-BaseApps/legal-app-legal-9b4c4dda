'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/ui/StatusBadge';
import { Calendar, Gavel, User, FileText } from 'lucide-react';

export default function CaseDetail({ caseData }) {
  if (!caseData) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Case ID</p>
            <p className="font-medium">{caseData.case_id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Status</p>
            <StatusBadge status={caseData.case_status} type="case" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Case Title</p>
            <p className="font-medium">{caseData.case_title}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Case Type</p>
            <p className="font-medium">{caseData.case_type}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Client</p>
            <p className="font-medium">{caseData.customer_name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Assigned Attorney</p>
            <p className="font-medium">{caseData.attorney_name || 'Not assigned'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Court Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Gavel className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Court Name</p>
              <p className="font-medium">{caseData.court_name || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Filing Date</p>
              <p className="font-medium">
                {caseData.filing_date ? new Date(caseData.filing_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Hearing Date</p>
              <p className="font-medium">
                {caseData.hearing_date ? new Date(caseData.hearing_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}