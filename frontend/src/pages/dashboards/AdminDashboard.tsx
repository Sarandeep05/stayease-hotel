import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, CalendarCheck, Star, CircleDollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../../lib/api';
import { PageLoader, currency } from '../../components/ui';
import { StatCard, RevenueChart, RecentBookingsTable } from '../../components/dashboard';
import type { DashboardData } from '../../types';

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardData>('/dashboard/admin')
      .then((res) => setData(res.data))
      .catch((e) => toast.error(apiError(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return null;

  const s = data.stats;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
        <div className="flex gap-2">
          <Link to="/admin/users" className="btn-secondary">
            Manage users
          </Link>
          <Link to="/admin/hotels" className="btn-secondary">
            Manage hotels
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={Number(s.totalUsers)} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Hotels" value={`${s.activeHotels}/${s.totalHotels}`} icon={<Building2 className="h-5 w-5" />} />
        <StatCard label="Bookings" value={Number(s.totalBookings)} icon={<CalendarCheck className="h-5 w-5" />} />
        <StatCard label="Reviews" value={Number(s.totalReviews)} icon={<Star className="h-5 w-5" />} accent="text-amber-500" />
        <StatCard label="Customers" value={Number(s.customers)} />
        <StatCard label="Managers" value={Number(s.managers)} />
        <StatCard
          label="Platform revenue"
          value={currency(Number(s.platformRevenue))}
          icon={<CircleDollarSign className="h-5 w-5" />}
          accent="text-brand-600"
        />
      </div>

      <div className="mt-8">
        <RevenueChart data={data.charts} />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-800">Recent bookings</h2>
      <RecentBookingsTable rows={data.recent} />
    </div>
  );
}
