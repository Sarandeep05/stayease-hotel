import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, BedDouble, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../../lib/api';
import { EmptyState, PageLoader, StarRating, currency } from '../../components/ui';
import type { Hotel } from '../../types';

export default function ManagerHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get<Hotel[]>('/hotels/manager/mine')
      .then((res) => setHotels(res.data))
      .catch((e) => toast.error(apiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id: string) => {
    if (!confirm('Delete this hotel and all its rooms?')) return;
    try {
      await api.delete(`/hotels/${id}`);
      toast.success('Hotel deleted');
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My hotels</h1>
        <Link to="/manager/hotels/new" className="btn-primary">
          <Plus className="h-4 w-4" /> Add hotel
        </Link>
      </div>

      {hotels.length === 0 ? (
        <EmptyState title="No hotels yet" subtitle="Create your first property to start receiving bookings." />
      ) : (
        <div className="space-y-4">
          {hotels.map((h) => (
            <div key={h.id} className="card flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800">{h.name}</h3>
                  <span className="badge bg-slate-100 text-slate-600">{h.status}</span>
                </div>
                <p className="text-sm text-slate-500">
                  {h.city}
                  {h.country ? `, ${h.country}` : ''}
                </p>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                  <StarRating value={h.averageRating} size={14} />
                  <span>
                    {h.averageRating.toFixed(1)} ({h.reviewCount}) · from {currency(h.startingPrice)}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/manager/hotels/${h.id}/rooms`} className="btn-secondary px-3 py-1.5 text-xs">
                  <BedDouble className="h-4 w-4" /> Rooms
                </Link>
                <Link to={`/manager/hotels/${h.id}/edit`} className="btn-secondary px-3 py-1.5 text-xs">
                  <Pencil className="h-4 w-4" /> Edit
                </Link>
                <button onClick={() => remove(h.id)} className="btn-danger px-3 py-1.5 text-xs">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
