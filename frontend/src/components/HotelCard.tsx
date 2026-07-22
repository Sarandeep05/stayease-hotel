import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { Hotel } from '../types';
import { StarRating, currency } from './ui';

const FALLBACK =
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=60';

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  const image = hotel.images?.[0] ? `${hotel.images[0]}?auto=format&fit=crop&w=800&q=60` : FALLBACK;
  return (
    <Link to={`/hotels/${hotel.id}`} className="card group overflow-hidden transition hover:shadow-md">
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={hotel.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK)}
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-800 line-clamp-1">{hotel.name}</h3>
          {hotel.starRating ? (
            <span className="badge bg-brand-50 text-brand-700">{hotel.starRating}★</span>
          ) : null}
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5" /> {hotel.city}
          {hotel.country ? `, ${hotel.country}` : ''}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <StarRating value={hotel.averageRating} size={14} />
          <span className="text-xs text-slate-500">
            {hotel.averageRating.toFixed(1)} ({hotel.reviewCount})
          </span>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <span className="text-xs text-slate-400">from</span>
            <p className="text-lg font-bold text-slate-900">
              {currency(hotel.startingPrice)}
              <span className="text-xs font-normal text-slate-500"> / night</span>
            </p>
          </div>
          <span className="text-sm font-semibold text-brand-600 group-hover:underline">View →</span>
        </div>
      </div>
    </Link>
  );
}
