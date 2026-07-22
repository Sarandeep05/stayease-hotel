import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { differenceInCalendarDays, format, addDays } from 'date-fns';
import toast from 'react-hot-toast';
import { api, apiError } from '../lib/api';
import { PageLoader, currency, Spinner } from '../components/ui';
import type { Booking, PaymentMethod, Room } from '../types';

export default function CheckoutPage() {
  const { roomId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const today = format(new Date(), 'yyyy-MM-dd');
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [checkIn, setCheckIn] = useState(params.get('checkIn') ?? today);
  const [checkOut, setCheckOut] = useState(params.get('checkOut') ?? format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(params.get('guests') ? Number(params.get('guests')) : 2);
  const [specialRequests, setSpecialRequests] = useState('');

  const [method, setMethod] = useState<PaymentMethod>('CARD');
  const [card, setCard] = useState({ cardNumber: '', cardHolder: '', expiry: '', cvv: '' });

  useEffect(() => {
    if (!roomId) return;
    api
      .get<Room>(`/rooms/${roomId}`)
      .then((res) => setRoom(res.data))
      .catch((e) => toast.error(apiError(e)))
      .finally(() => setLoading(false));
  }, [roomId]);

  const nights = useMemo(() => {
    const n = differenceInCalendarDays(new Date(checkOut), new Date(checkIn));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [checkIn, checkOut]);

  const total = room ? nights * room.pricePerNight * rooms : 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (nights <= 0) {
      toast.error('Check-out must be after check-in');
      return;
    }
    setSubmitting(true);
    try {
      // 1) Create booking
      const { data: booking } = await api.post<Booking>('/bookings', {
        roomId,
        checkIn,
        checkOut,
        numberOfRooms: rooms,
        numberOfGuests: guests,
        specialRequests,
      });

      // 2) Pay for it
      await api.post('/payments', {
        bookingId: booking.id,
        method,
        ...(method === 'CARD' ? card : {}),
      });

      toast.success('Booking confirmed! 🎉');
      navigate(`/bookings/${booking.id}`, { replace: true });
    } catch (err) {
      toast.error(apiError(err, 'Booking failed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!room) return <div className="p-10 text-center text-slate-500">Room not found.</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Complete your booking</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form */}
        <form onSubmit={submit} className="space-y-6 lg:col-span-2">
          <div className="card p-5">
            <h2 className="mb-4 font-semibold text-slate-800">Trip details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Check-in</label>
                <input type="date" min={today} className="input" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
              <div>
                <label className="label">Check-out</label>
                <input type="date" min={checkIn} className="input" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
              <div>
                <label className="label">Rooms</label>
                <input type="number" min={1} className="input" value={rooms} onChange={(e) => setRooms(Math.max(1, Number(e.target.value)))} />
              </div>
              <div>
                <label className="label">Guests</label>
                <input type="number" min={1} className="input" value={guests} onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))} />
              </div>
            </div>
            <div className="mt-4">
              <label className="label">Special requests (optional)</label>
              <textarea className="input" rows={2} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-4 font-semibold text-slate-800">Payment</h2>
            <div className="mb-4">
              <label className="label">Method</label>
              <select className="input" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                <option value="CARD">Credit / Debit Card</option>
                <option value="UPI">UPI</option>
                <option value="NETBANKING">Net Banking</option>
                <option value="WALLET">Wallet</option>
              </select>
            </div>

            {method === 'CARD' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Card number</label>
                  <input className="input" placeholder="4242 4242 4242 4242" value={card.cardNumber} onChange={(e) => setCard({ ...card, cardNumber: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Cardholder name</label>
                  <input className="input" value={card.cardHolder} onChange={(e) => setCard({ ...card, cardHolder: e.target.value })} />
                </div>
                <div>
                  <label className="label">Expiry</label>
                  <input className="input" placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
                </div>
                <div>
                  <label className="label">CVV</label>
                  <input className="input" placeholder="123" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
                </div>
              </div>
            )}
            <p className="mt-3 text-xs text-slate-400">
              Simulated gateway — any details work. Use a card ending in <code>0000</code> to test a decline.
            </p>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? <Spinner className="h-5 w-5" /> : `Pay ${currency(total)} & confirm`}
          </button>
        </form>

        {/* Summary */}
        <aside className="card h-fit p-5">
          <h2 className="font-semibold text-slate-800">{room.name}</h2>
          <p className="text-sm text-slate-500">{room.type}</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Price / night</span>
              <span>{currency(room.pricePerNight)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nights</span>
              <span>{nights}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Rooms</span>
              <span>{rooms}</span>
            </div>
            <div className="my-2 border-t border-slate-200" />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-brand-700">{currency(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
