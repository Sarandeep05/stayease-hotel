import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { api, apiError } from '../../lib/api';
import { EmptyState, PageLoader, StatusBadge, PaymentBadge, currency } from '../../components/ui';
import type { Booking, Paged } from '../../types';

export default function ManagerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get<Paged<Booking>>('/bookings/manager', { params: { size: 100 } })
      .then((res) => setBookings(res.data.content))
      .catch((e) => toast.error(apiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const act = async (id: string, action: 'cancel' | 'complete') => {
    try {
      await api.post(`/bookings/${id}/${action}`);
      toast.success(`Booking ${action === 'cancel' ? 'cancelled' : 'completed'}`);
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Property bookings</h1>

      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet" subtitle="Bookings for your hotels will appear here." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Hotel</th>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{b.reference}</td>
                  <td className="px-4 py-3">{b.hotelName}</td>
                  <td className="px-4 py-3">{b.customerName}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {format(new Date(b.checkIn), 'MMM d')} → {format(new Date(b.checkOut), 'MMM d')}
                  </td>
                  <td className="px-4 py-3">{currency(b.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PaymentBadge status={b.paymentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {b.status === 'CONFIRMED' && (
                        <button onClick={() => act(b.id, 'complete')} className="btn-secondary px-2 py-1 text-xs">
                          Complete
                        </button>
                      )}
                      {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                        <button onClick={() => act(b.id, 'cancel')} className="btn-danger px-2 py-1 text-xs">
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
