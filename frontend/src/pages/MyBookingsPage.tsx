import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { api, apiError } from '../lib/api';
import { EmptyState, PageLoader, StatusBadge, PaymentBadge, currency } from '../components/ui';
import type { Booking, Paged } from '../types';
import ReviewModal from '../components/ReviewModal';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewHotel, setReviewHotel] = useState<{ id: string; name: string } | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get<Paged<Booking>>('/bookings/mine', { params: { size: 50 } })
      .then((res) => setBookings(res.data.content))
      .catch((e) => toast.error(apiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const cancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.post(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My bookings</h1>

      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet" subtitle="Start exploring hotels to make your first reservation." />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="card p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800">{b.hotelName}</h3>
                    <StatusBadge status={b.status} />
                    <PaymentBadge status={b.paymentStatus} />
                  </div>
                  <p className="text-sm text-slate-500">
                    {b.roomName} · Ref {b.reference}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {format(new Date(b.checkIn), 'MMM d, yyyy')} → {format(new Date(b.checkOut), 'MMM d, yyyy')} · {b.nights} night(s) · {b.numberOfRooms} room(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">{currency(b.totalPrice)}</p>
                  <div className="mt-2 flex flex-wrap justify-end gap-2">
                    <Link to={`/bookings/${b.id}`} className="btn-secondary px-3 py-1.5 text-xs">
                      Details
                    </Link>
                    {(b.status === 'CONFIRMED' || b.status === 'COMPLETED') && (
                      <button
                        onClick={() => setReviewHotel({ id: b.hotelId, name: b.hotelName ?? 'hotel' })}
                        className="btn-secondary px-3 py-1.5 text-xs"
                      >
                        Review
                      </button>
                    )}
                    {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                      <button onClick={() => cancel(b.id)} className="btn-danger px-3 py-1.5 text-xs">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewHotel && (
        <ReviewModal
          hotelId={reviewHotel.id}
          hotelName={reviewHotel.name}
          onClose={() => setReviewHotel(null)}
          onSaved={() => setReviewHotel(null)}
        />
      )}
    </div>
  );
}
