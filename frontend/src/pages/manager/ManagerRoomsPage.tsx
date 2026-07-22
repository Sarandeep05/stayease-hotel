import { FormEvent, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Trash2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../../lib/api';
import { EmptyState, PageLoader, Spinner, currency } from '../../components/ui';
import type { Room } from '../../types';

const emptyRoom = {
  name: '',
  type: 'STANDARD',
  description: '',
  pricePerNight: 100,
  capacity: 2,
  bedCount: 1,
  totalUnits: 5,
  amenities: 'WiFi, Air Conditioning, TV',
  images: '',
  active: true,
};

export default function ManagerRoomsPage() {
  const { id: hotelId } = useParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyRoom });
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!hotelId) return;
    setLoading(true);
    api
      .get<Room[]>(`/rooms/hotel/${hotelId}`)
      .then((res) => setRooms(res.data))
      .catch((e) => toast.error(apiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [hotelId]);

  const resetForm = () => {
    setForm({ ...emptyRoom });
    setEditingId(null);
  };

  const startEdit = (r: Room) => {
    setEditingId(r.id);
    setForm({
      name: r.name,
      type: r.type,
      description: r.description ?? '',
      pricePerNight: r.pricePerNight,
      capacity: r.capacity,
      bedCount: r.bedCount ?? 1,
      totalUnits: r.totalUnits,
      amenities: (r.amenities ?? []).join(', '),
      images: (r.images ?? []).join(', '),
      active: r.active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      pricePerNight: Number(form.pricePerNight),
      capacity: Number(form.capacity),
      bedCount: Number(form.bedCount),
      totalUnits: Number(form.totalUnits),
      amenities: form.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await api.put(`/rooms/${editingId}`, payload);
        toast.success('Room updated');
      } else {
        await api.post(`/rooms/hotel/${hotelId}`, payload);
        toast.success('Room added');
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (roomId: string) => {
    if (!confirm('Delete this room?')) return;
    try {
      await api.delete(`/rooms/${roomId}`);
      toast.success('Room deleted');
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/manager/hotels" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to my hotels
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold text-slate-900">Manage rooms</h1>

      {/* Form */}
      <form onSubmit={submit} className="card mb-8 space-y-4 p-6">
        <h2 className="font-semibold text-slate-800">{editingId ? 'Edit room' : 'Add a room'}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Room name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option>STANDARD</option>
              <option>DELUXE</option>
              <option>SUITE</option>
              <option>SINGLE</option>
              <option>DOUBLE</option>
            </select>
          </div>
          <div>
            <label className="label">Price / night</label>
            <input type="number" min={1} required className="input" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">Capacity (guests)</label>
            <input type="number" min={1} required className="input" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">Beds</label>
            <input type="number" min={1} className="input" value={form.bedCount} onChange={(e) => setForm({ ...form, bedCount: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">Total units</label>
            <input type="number" min={1} required className="input" value={form.totalUnits} onChange={(e) => setForm({ ...form, totalUnits: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Amenities (comma separated)</label>
            <input className="input" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
          </div>
          <div>
            <label className="label">Image URLs (comma separated)</label>
            <input className="input" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          Active (available for booking)
        </label>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Spinner className="h-5 w-5" /> : editingId ? 'Save room' : <><Plus className="h-4 w-4" /> Add room</>}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel edit
            </button>
          )}
        </div>
      </form>

      {/* List */}
      {rooms.length === 0 ? (
        <EmptyState title="No rooms yet" subtitle="Add your first room type above." />
      ) : (
        <div className="space-y-3">
          {rooms.map((r) => (
            <div key={r.id} className="card flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800">{r.name}</h3>
                  <span className="badge bg-slate-100 text-slate-600">{r.type}</span>
                  {!r.active && <span className="badge bg-red-100 text-red-700">Inactive</span>}
                </div>
                <p className="text-sm text-slate-500">
                  {currency(r.pricePerNight)} / night · {r.capacity} guests · {r.totalUnits} units
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(r)} className="btn-secondary px-3 py-1.5 text-xs">
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button onClick={() => remove(r.id)} className="btn-danger px-3 py-1.5 text-xs">
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
