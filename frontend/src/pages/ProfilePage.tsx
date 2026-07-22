import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { api, apiError } from '../lib/api';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setUser } from '../features/auth/authSlice';
import { Spinner } from '../components/ui';
import type { User } from '../types';

export default function ProfilePage() {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });
  const [savingPwd, setSavingPwd] = useState(false);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put<User>('/users/me', { fullName, phone });
      dispatch(setUser(data));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSavingPwd(true);
    try {
      await api.post('/users/me/change-password', pwd);
      toast.success('Password changed');
      setPwd({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My profile</h1>

      <form onSubmit={saveProfile} className="card space-y-4 p-6">
        <h2 className="font-semibold text-slate-800">Account details</h2>
        <div>
          <label className="label">Full name</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input bg-slate-50" value={user?.email ?? ''} disabled />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="label">Roles</label>
          <div className="flex gap-2">
            {user?.roles.map((r) => (
              <span key={r} className="badge bg-brand-50 text-brand-700">
                {r}
              </span>
            ))}
          </div>
        </div>
        <button type="submit" disabled={savingProfile} className="btn-primary">
          {savingProfile ? <Spinner className="h-5 w-5" /> : 'Save changes'}
        </button>
      </form>

      <form onSubmit={changePassword} className="card mt-6 space-y-4 p-6">
        <h2 className="font-semibold text-slate-800">Change password</h2>
        <div>
          <label className="label">Current password</label>
          <input type="password" required className="input" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} />
        </div>
        <div>
          <label className="label">New password</label>
          <input type="password" required minLength={6} className="input" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} />
        </div>
        <button type="submit" disabled={savingPwd} className="btn-primary">
          {savingPwd ? <Spinner className="h-5 w-5" /> : 'Update password'}
        </button>
      </form>
    </div>
  );
}
