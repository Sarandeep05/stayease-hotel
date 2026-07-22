import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { api, apiError } from '../../lib/api';
import { PageLoader } from '../../components/ui';
import type { User } from '../../types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get<User[]>('/users')
      .then((res) => setUsers(res.data))
      .catch((e) => toast.error(apiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggle = async (u: User) => {
    try {
      await api.patch(`/users/${u.id}/status`, { enabled: !u.enabled });
      toast.success(`User ${!u.enabled ? 'enabled' : 'disabled'}`);
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Users</h1>

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Roles</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-700">{u.fullName}</td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map((r) => (
                      <span key={r} className="badge bg-brand-50 text-brand-700">
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${u.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.enabled ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(u)} className="btn-secondary px-3 py-1.5 text-xs">
                    {u.enabled ? 'Disable' : 'Enable'}
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
