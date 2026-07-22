import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock, CheckCircle, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../../lib/api';
import { PageLoader, currency } from '../../components/ui';
import { StatCard, RecentBookingsTable } from '../../components/dashboard';
import type { DashboardData } from '../../types';

export default function CustomerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardData>('/dashboard/customer')
      .then((res) => setData(res.data))
      .catch((e) => toast.error(apiError(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return null;

  const s = data.stats;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Your travel dashboard</h1>
        <Link to="/search" className="btn-primary">
          Book a stay
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total bookings" value={Number(s.totalBookings)} icon={<CalendarCheck className="h-5 w-5" />} />
        <StatCard label="Upcoming stays" value={Number(s.upcomingStays)} icon={<Clock className="h-5 w-5" />} accent="text-amber-500" />
        <StatCard label="Completed" value={Number(s.completed)} icon={<CheckCircle className="h-5 w-5" />} accent="text-green-600" />
        <StatCard label="Total spent" value={currency(Number(s.totalSpent))} icon={<Wallet className="h-5 w-5" />} accent="text-brand-600" />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-800">Recent bookings</h2>
      <RecentBookingsTable rows={data.recent} />
    </div>
  );
}
