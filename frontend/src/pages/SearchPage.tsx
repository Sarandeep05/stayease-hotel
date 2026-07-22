import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import HotelCard from '../components/HotelCard';
import { EmptyState, Spinner } from '../components/ui';
import { api } from '../lib/api';
import type { Hotel, Paged } from '../types';

const AMENITIES = ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Parking', 'Pet Friendly'];

export default function SearchPage() {
  const [params] = useSearchParams();
  const destination = params.get('destination') ?? '';
  const checkIn = params.get('checkIn') ?? undefined;
  const checkOut = params.get('checkOut') ?? undefined;
  const guests = params.get('guests') ? Number(params.get('guests')) : undefined;

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [starRating, setStarRating] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('ratingDesc');

  const query = useMemo(
    () => ({ destination, minPrice, maxPrice, minRating, starRating, amenities: amenities.join(','), sortBy }),
    [destination, minPrice, maxPrice, minRating, starRating, amenities, sortBy]
  );

  useEffect(() => {
    setLoading(true);
    const requestParams: Record<string, unknown> = { destination, sortBy, size: 24 };
    if (minPrice) requestParams.minPrice = minPrice;
    if (maxPrice) requestParams.maxPrice = maxPrice;
    if (minRating) requestParams.minRating = minRating;
    if (starRating) requestParams.starRating = starRating;
    if (amenities.length) requestParams.amenities = amenities;

    api
      .get<Paged<Hotel>>('/hotels', { params: requestParams })
      .then((res) => {
        setHotels(res.data.content);
        setTotalElements(res.data.totalElements);
      })
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(query)]);

  const toggleAmenity = (a: string) =>
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <SearchBar initial={{ destination, checkIn, checkOut, guests }} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Filters */}
        <aside className="card h-fit p-5 lg:col-span-1">
          <h3 className="font-semibold text-slate-800">Filters</h3>

          <div className="mt-4">
            <label className="label">Price range (per night)</label>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Min" className="input" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <span className="text-slate-400">–</span>
              <input type="number" placeholder="Max" className="input" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
          </div>

          <div className="mt-4">
            <label className="label">Minimum guest rating</label>
            <select className="input" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
              <option value="">Any</option>
              <option value="3">3.0+</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
            </select>
          </div>

          <div className="mt-4">
            <label className="label">Star rating</label>
            <select className="input" value={starRating} onChange={(e) => setStarRating(e.target.value)}>
              <option value="">Any</option>
              {[5, 4, 3, 2, 1].map((s) => (
                <option key={s} value={s}>
                  {s} stars
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="label">Amenities</label>
            <div className="flex flex-col gap-2">
              {AMENITIES.map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                  {a}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <section className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {loading ? 'Searching…' : `${totalElements} hotel(s) found`}
              {destination ? ` in "${destination}"` : ''}
            </p>
            <select className="input max-w-[200px]" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="ratingDesc">Top rated</option>
              <option value="priceAsc">Price: low to high</option>
              <option value="priceDesc">Price: high to low</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner className="h-8 w-8" />
            </div>
          ) : hotels.length === 0 ? (
            <EmptyState title="No hotels match your search" subtitle="Try adjusting your filters or destination." />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {hotels.map((h) => (
                <HotelCard key={h.id} hotel={h} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
