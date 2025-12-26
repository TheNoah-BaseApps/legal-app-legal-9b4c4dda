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

export default function CustomerForm({ initialData = null, customerId = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    contact_person: '',
    contact_number: '',
    email_address: '',
    industry_type: '',
    registration_date: new Date().toISOString().split('T')[0],
    customer_status: 'Active',
    address_line: '',
    ...initialData
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = customerId ? `/api/customers/${customerId}` : '/api/customers';
      const method = customerId ? 'PUT' : 'POST';

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
        throw new Error(data.error || 'Failed to save customer');
      }

      toast.success(customerId ? 'Customer updated successfully' : 'Customer created successfully');
      router.push('/customers');
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
          <Label htmlFor="customer_name">Customer Name *</Label>
          <Input
            id="customer_name"
            value={formData.customer_name}
            onChange={(e) => handleChange('customer_name', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact Person *</Label>
          <Input
            id="contact_person"
            value={formData.contact_person}
            onChange={(e) => handleChange('contact_person', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email_address">Email Address *</Label>
          <Input
            id="email_address"
            type="email"
            value={formData.email_address}
            onChange={(e) => handleChange('email_address', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_number">Contact Number *</Label>
          <Input
            id="contact_number"
            value={formData.contact_number}
            onChange={(e) => handleChange('contact_number', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry_type">Industry Type *</Label>
          <Input
            id="industry_type"
            value={formData.industry_type}
            onChange={(e) => handleChange('industry_type', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer_status">Status *</Label>
          <Select value={formData.customer_status} onValueChange={(val) => handleChange('customer_status', val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="registration_date">Registration Date *</Label>
          <DatePicker
            value={formData.registration_date}
            onChange={(date) => handleChange('registration_date', date)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address_line">Address</Label>
        <Textarea
          id="address_line"
          value={formData.address_line}
          onChange={(e) => handleChange('address_line', e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : customerId ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
}