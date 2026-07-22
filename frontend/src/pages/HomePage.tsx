import { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles, Wallet, Headphones } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import HotelCard from '../components/HotelCard';
import { Spinner } from '../components/ui';
import { api } from '../lib/api';
import type { Hotel, Paged } from '../types';

const features = [
  { icon: Wallet, title: 'Best Price Guarantee', text: 'Transparent pricing with no hidden fees.' },
  { icon: ShieldCheck, title: 'Secure Booking', text: 'Protected payments and instant confirmation.' },
  { icon: Sparkles, title: 'Handpicked Hotels', text: 'Curated stays rated by real travellers.' },
  { icon: Headphones, title: '24/7 Support', text: 'We are here whenever you need us.' },
];

export default function HomePage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Paged<Hotel>>('/hotels', { params: { sortBy: 'ratingDesc', size: 8 } })
      .then((res) => setHotels(res.data.content))
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-700 to-brand-500 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Find your next stay
          </h1>
          <p className="mt-4 max-w-xl text-lg text-brand-50">
            Search deals on hotels, homes, and much more — book with ease on StayEase.
          </p>
          <div className="mt-8">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="card p-5">
              <f.icon className="h-8 w-8 text-brand-600" />
              <h3 className="mt-3 font-semibold text-slate-800">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top rated */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <h2 className="mb-6 text-2xl font-bold text-slate-800">Top rated stays</h2>
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-8 w-8" />
          </div>
        ) : hotels.length === 0 ? (
          <p className="text-slate-500">No hotels available yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {hotels.map((h) => (
              <HotelCard key={h.id} hotel={h} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
