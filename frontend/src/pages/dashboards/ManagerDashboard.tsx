import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, BedDouble, CalendarCheck, CircleDollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../../lib/api';
import { PageLoader, currency } from '../../components/ui';
import { StatCard, RevenueChart, RecentBookingsTable } from '../../components/dashboard';
import type { DashboardData } from '../../types';

export default function ManagerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardData>('/dashboard/manager')
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
        <h1 className="text-2xl font-bold text-slate-900">Manager dashboard</h1>
        <div className="flex gap-2">
          <Link to="/manager/hotels" className="btn-secondary">
            My hotels
          </Link>
          <Link to="/manager/bookings" className="btn-secondary">
            Bookings
          </Link>
          <Link to="/manager/hotels/new" className="btn-primary">
            Add hotel
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Hotels" value={Number(s.totalHotels)} icon={<Building2 className="h-5 w-5" />} />
        <StatCard label="Rooms" value={Number(s.totalRooms)} icon={<BedDouble className="h-5 w-5" />} />
        <StatCard label="Bookings" value={Number(s.totalBookings)} icon={<CalendarCheck className="h-5 w-5" />} />
        <StatCard label="Confirmed" value={Number(s.confirmed)} accent="text-green-600" />
        <StatCard label="Revenue" value={currency(Number(s.revenue))} icon={<CircleDollarSign className="h-5 w-5" />} accent="text-brand-600" />
      </div>

      <div className="mt-8">
        <RevenueChart data={data.charts} />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-800">Recent bookings</h2>
      <RecentBookingsTable rows={data.recent} />
    </div>
  );
}
