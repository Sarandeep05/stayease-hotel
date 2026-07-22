import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { api, apiError } from '../lib/api';
import { PageLoader, StatusBadge, PaymentBadge, currency } from '../components/ui';
import type { Booking } from '../types';

export default function BookingDetailPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!id) return;
    setLoading(true);
    api
      .get<Booking>(`/bookings/${id}`)
      .then((res) => setBooking(res.data))
      .catch((e) => toast.error(apiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const cancel = async () => {
    if (!booking || !confirm('Cancel this booking?')) return;
    try {
      await api.post(`/bookings/${booking.id}/cancel`);
      toast.success('Booking cancelled');
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  if (loading) return <PageLoader />;
  if (!booking) return <div className="p-10 text-center text-slate-500">Booking not found.</div>;

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/bookings" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to bookings
      </Link>

      <div className="card mt-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{booking.hotelName}</h1>
            <p className="text-sm text-slate-500">Ref {booking.reference}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={booking.status} />
            <PaymentBadge status={booking.paymentStatus} />
          </div>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {row('Room', booking.roomName)}
          {row('Guest', booking.customerName)}
          {row('Check-in', format(new Date(booking.checkIn), 'EEE, MMM d, yyyy'))}
          {row('Check-out', format(new Date(booking.checkOut), 'EEE, MMM d, yyyy'))}
          {row('Nights', booking.nights)}
          {row('Rooms', booking.numberOfRooms)}
          {row('Guests', booking.numberOfGuests)}
          {row('Price / night', currency(booking.pricePerNight))}
          {row('Total', <span className="text-brand-700">{currency(booking.totalPrice)}</span>)}
          {booking.specialRequests ? row('Requests', booking.specialRequests) : null}
        </div>

        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
          <button onClick={cancel} className="btn-danger mt-6 w-full">
            Cancel booking
          </button>
        )}
      </div>
    </div>
  );
}
