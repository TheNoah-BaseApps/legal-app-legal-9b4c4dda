'use client';

import StatCard from '@/components/ui/StatCard';
import { Users, Briefcase, MessageSquare, TrendingUp } from 'lucide-react';

export default function DashboardStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Customers"
        value={stats.customers.total}
        icon={Users}
        description={`${stats.customers.active} active`}
      />
      <StatCard
        title="Total Cases"
        value={stats.cases.total}
        icon={Briefcase}
        description={`${stats.cases.active} active`}
      />
      <StatCard
        title="Engagements"
        value={stats.engagements.total}
        icon={MessageSquare}
        description={`${stats.engagements.thisMonth} this month`}
      />
      <StatCard
        title="Upcoming Hearings"
        value={stats.upcomingHearings?.length || 0}
        icon={TrendingUp}
        description="Next 30 days"
      />
    </div>
  );
}