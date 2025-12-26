'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function EngagementForm({ initialData = null, engagementId = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    client_id: '',
    engagement_type: '',
    engagement_date: new Date().toISOString().split('T')[0],
    engagement_channel: '',
    contact_person: '',
    engagement_outcome: '',
    engagement_notes: '',
    ...initialData
  });

  useEffect(() => {
    fetchCustomers();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = engagementId ? `/api/engagements/${engagementId}` : '/api/engagements';
      const method = engagementId ? 'PUT' : 'POST';

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
        throw new Error(data.error || 'Failed to save engagement');
      }

      toast.success(engagementId ? 'Engagement updated successfully' : 'Engagement created successfully');
      router.push('/engagements');
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
          <Label htmlFor="engagement_type">Engagement Type *</Label>
          <Select value={formData.engagement_type} onValueChange={(val) => handleChange('engagement_type', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Meeting">Meeting</SelectItem>
              <SelectItem value="Call">Call</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Video Conference">Video Conference</SelectItem>
              <SelectItem value="Document Review">Document Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="engagement_channel">Channel *</Label>
          <Select value={formData.engagement_channel} onValueChange={(val) => handleChange('engagement_channel', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Phone">Phone</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="In-Person">In-Person</SelectItem>
              <SelectItem value="Video">Video</SelectItem>
              <SelectItem value="Portal">Portal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="engagement_date">Date *</Label>
          <DatePicker
            value={formData.engagement_date}
            onChange={(date) => handleChange('engagement_date', date)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
            id="contact_person"
            value={formData.contact_person}
            onChange={(e) => handleChange('contact_person', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="engagement_outcome">Outcome</Label>
          <Input
            id="engagement_outcome"
            value={formData.engagement_outcome}
            onChange={(e) => handleChange('engagement_outcome', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="engagement_notes">Notes</Label>
        <Textarea
          id="engagement_notes"
          value={formData.engagement_notes}
          onChange={(e) => handleChange('engagement_notes', e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : engagementId ? 'Update Engagement' : 'Log Engagement'}
        </Button>
      </div>
    </form>
  );
}