import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, apiError } from '../../lib/api';
import { PageLoader, Spinner } from '../../components/ui';
import type { Hotel } from '../../types';

const ALL_AMENITIES = ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Parking', 'Pet Friendly', 'Business Center', 'Fireplace'];

const empty = {
  name: '',
  description: '',
  address: '',
  city: '',
  country: '',
  starRating: 3,
  amenities: [] as string[],
  images: '',
  policies: '',
  checkInTime: '14:00',
  checkOutTime: '11:00',
  status: 'ACTIVE',
};

export default function ManagerHotelEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ ...empty });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get<Hotel>(`/hotels/${id}`)
      .then((res) => {
        const h = res.data;
        setForm({
          name: h.name,
          description: h.description ?? '',
          address: h.address,
          city: h.city,
          country: h.country ?? '',
          starRating: h.starRating ?? 3,
          amenities: h.amenities ?? [],
          images: (h.images ?? []).join(', '),
          policies: h.policies ?? '',
          checkInTime: h.checkInTime ?? '14:00',
          checkOutTime: h.checkOutTime ?? '11:00',
          status: h.status,
        });
      })
      .catch((e) => toast.error(apiError(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleAmenity = (a: string) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      starRating: Number(form.starRating),
      images: form.images
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      if (isEdit) {
        await api.put(`/hotels/${id}`, payload);
        toast.success('Hotel updated');
      } else {
        await api.post('/hotels', payload);
        toast.success('Hotel created');
      }
      navigate('/manager/hotels');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{isEdit ? 'Edit hotel' : 'Add a hotel'}</h1>

      <form onSubmit={submit} className="card space-y-4 p-6">
        <div>
          <label className="label">Hotel name</label>
          <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Address</label>
            <input required className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <label className="label">City</label>
            <input required className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="label">Country</label>
            <input className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <div>
            <label className="label">Star rating</label>
            <select className="input" value={form.starRating} onChange={(e) => setForm({ ...form, starRating: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5].map((s) => (
                <option key={s} value={s}>
                  {s} star
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {ALL_AMENITIES.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => toggleAmenity(a)}
                className={`badge cursor-pointer ${
                  form.amenities.includes(a) ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Image URLs (comma separated)</label>
          <input className="input" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="https://..., https://..." />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Check-in</label>
            <input className="input" value={form.checkInTime} onChange={(e) => setForm({ ...form, checkInTime: e.target.value })} />
          </div>
          <div>
            <label className="label">Check-out</label>
            <input className="input" value={form.checkOutTime} onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Policies</label>
          <textarea className="input" rows={2} value={form.policies} onChange={(e) => setForm({ ...form, policies: e.target.value })} />
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Spinner className="h-5 w-5" /> : isEdit ? 'Save changes' : 'Create hotel'}
          </button>
          <button type="button" onClick={() => navigate('/manager/hotels')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
