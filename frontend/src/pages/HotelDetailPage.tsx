import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapPin, Check, Users, BedDouble } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../lib/api';
import { useAppSelector } from '../app/hooks';
import { PageLoader, StarRating, currency, EmptyState } from '../components/ui';
import type { Hotel, Paged, Review } from '../types';

const FALLBACK =
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=70';

export default function HotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get<Hotel>(`/hotels/${id}`),
      api.get<Paged<Review>>(`/reviews/hotel/${id}`),
    ])
      .then(([h, r]) => {
        setHotel(h.data);
        setReviews(r.data.content);
      })
      .catch((e) => toast.error(apiError(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const bookRoom = (roomId: string) => {
    if (!user) {
      toast('Please log in to book', { icon: '🔒' });
      navigate('/login', { state: { from: { pathname: `/hotels/${id}` } } });
      return;
    }
    if (!user.roles.includes('CUSTOMER')) {
      toast.error('Only customers can make bookings');
      return;
    }
    navigate(`/checkout/${roomId}`);
  };

  if (loading) return <PageLoader />;
  if (!hotel) return <EmptyState title="Hotel not found" />;

  const hero = hotel.images?.[0] ? `${hotel.images[0]}?auto=format&fit=crop&w=1200&q=70` : FALLBACK;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Header */}
      <div className="overflow-hidden rounded-xl">
        <img
          src={hero}
          alt={hotel.name}
          className="h-72 w-full object-cover sm:h-96"
          onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK)}
        />
      </div>

      <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">{hotel.name}</h1>
            {hotel.starRating ? <span className="badge bg-brand-50 text-brand-700">{hotel.starRating}★</span> : null}
          </div>
          <p className="mt-1 flex items-center gap-1 text-slate-500">
            <MapPin className="h-4 w-4" /> {hotel.address}, {hotel.city}
            {hotel.country ? `, ${hotel.country}` : ''}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <StarRating value={hotel.averageRating} />
            <span className="text-sm text-slate-600">
              {hotel.averageRating.toFixed(1)} · {hotel.reviewCount} review(s)
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">from</span>
          <p className="text-2xl font-bold text-brand-700">
            {currency(hotel.startingPrice)}
            <span className="text-sm font-normal text-slate-500"> / night</span>
          </p>
        </div>
      </div>

      {hotel.description && <p className="mt-4 max-w-3xl text-slate-600">{hotel.description}</p>}

      {/* Amenities */}
      {hotel.amenities?.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.map((a) => (
              <span key={a} className="badge bg-slate-100 text-slate-700">
                <Check className="mr-1 h-3.5 w-3.5 text-green-600" /> {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rooms */}
      <div className="mt-8">
        <h2 className="mb-3 text-xl font-bold text-slate-800">Available rooms</h2>
        {!hotel.rooms || hotel.rooms.length === 0 ? (
          <EmptyState title="No rooms listed yet" />
        ) : (
          <div className="space-y-4">
            {hotel.rooms.map((room) => (
              <div key={room.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{room.name}</h3>
                  <p className="text-sm text-slate-500">{room.description}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> {room.capacity} guests
                    </span>
                    <span className="flex items-center gap-1">
                      <BedDouble className="h-4 w-4" /> {room.bedCount ?? 1} bed(s)
                    </span>
                    <span className="badge bg-slate-100 text-slate-600">{room.type}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900">
                    {currency(room.pricePerNight)}
                    <span className="text-xs font-normal text-slate-500"> / night</span>
                  </p>
                  <button onClick={() => bookRoom(room.id)} className="btn-primary mt-2 w-full sm:w-auto">
                    Book now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Policies */}
      {hotel.policies && (
        <div className="mt-8">
          <h2 className="mb-2 text-lg font-semibold text-slate-800">Policies</h2>
          <p className="text-sm text-slate-600">{hotel.policies}</p>
        </div>
      )}

      {/* Reviews */}
      <div className="mt-8">
        <h2 className="mb-3 text-xl font-bold text-slate-800">Guest reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-slate-500">No reviews yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {reviews.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800">{r.customerName ?? 'Guest'}</p>
                  <StarRating value={r.rating} size={14} />
                </div>
                {r.title && <p className="mt-1 font-medium text-slate-700">{r.title}</p>}
                <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
        {user?.roles.includes('CUSTOMER') && (
          <div className="mt-4">
            <Link to="/bookings" className="text-sm font-semibold text-brand-600 hover:underline">
              Been here? Leave a review from your bookings →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
