'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/DatePicker';
import { toast } from 'sonner';

export default function CaseForm({ initialData = null, caseId = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [attorneys, setAttorneys] = useState([]);
  const [formData, setFormData] = useState({
    case_title: '',
    client_id: '',
    case_type: '',
    case_status: 'New',
    assigned_attorney: '',
    filing_date: '',
    court_name: '',
    hearing_date: '',
    ...initialData
  });

  useEffect(() => {
    fetchCustomers();
    fetchAttorneys();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setCustomers(data.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const fetchAttorneys = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAttorneys([]);
    } catch (error) {
      console.error('Failed to fetch attorneys:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = caseId ? `/api/cases/${caseId}` : '/api/cases';
      const method = caseId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save case');
      }

      toast.success(caseId ? 'Case updated successfully' : 'Case created successfully');
      router.push('/cases');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="case_title">Case Title *</Label>
          <Input
            id="case_title"
            value={formData.case_title}
            onChange={(e) => handleChange('case_title', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_id">Client *</Label>
          <Select value={formData.client_id} onValueChange={(val) => handleChange('client_id', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {customers.map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.customer_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="case_type">Case Type *</Label>
          <Input
            id="case_type"
            value={formData.case_type}
            onChange={(e) => handleChange('case_type', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="case_status">Status *</Label>
          <Select value={formData.case_status} onValueChange={(val) => handleChange('case_status', val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
              <SelectItem value="Dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="court_name">Court Name</Label>
          <Input
            id="court_name"
            value={formData.court_name}
            onChange={(e) => handleChange('court_name', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filing_date">Filing Date</Label>
          <DatePicker
            value={formData.filing_date}
            onChange={(date) => handleChange('filing_date', date)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hearing_date">Hearing Date</Label>
          <DatePicker
            value={formData.hearing_date}
            onChange={(date) => handleChange('hearing_date', date)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : caseId ? 'Update Case' : 'Create Case'}
        </Button>
      </div>
    </form>
  );
}