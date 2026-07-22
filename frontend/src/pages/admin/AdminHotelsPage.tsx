import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api, apiError } from '../../lib/api';
import { PageLoader, StarRating, currency } from '../../components/ui';
import type { Hotel, HotelStatus } from '../../types';

const STATUSES: HotelStatus[] = ['ACTIVE', 'INACTIVE', 'PENDING_APPROVAL'];

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get<Hotel[]>('/hotels/admin/all')
      .then((res) => setHotels(res.data))
      .catch((e) => toast.error(apiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const changeStatus = async (id: string, status: HotelStatus) => {
    try {
      await api.patch(`/hotels/${id}/status`, null, { params: { status } });
      toast.success('Status updated');
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this hotel?')) return;
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">All hotels</h1>

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Hotel</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hotels.map((h) => (
              <tr key={h.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-700">{h.name}</td>
                <td className="px-4 py-3 text-slate-500">
                  {h.city}
                  {h.country ? `, ${h.country}` : ''}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <StarRating value={h.averageRating} size={13} />
                    <span className="text-xs text-slate-500">({h.reviewCount})</span>
                  </div>
                </td>
                <td className="px-4 py-3">{currency(h.startingPrice)}</td>
                <td className="px-4 py-3">
                  <select
                    className="input py-1 text-xs"
                    value={h.status}
                    onChange={(e) => changeStatus(h.id, e.target.value as HotelStatus)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => remove(h.id)} className="btn-danger px-3 py-1.5 text-xs">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
