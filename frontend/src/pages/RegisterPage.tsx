import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hotel } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../lib/api';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { Spinner } from '../components/ui';
import type { AuthResponse, Role } from '../types';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'CUSTOMER' as Role,
  });
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', form);
      dispatch(setCredentials(data));
      toast.success('Account created!');
      navigate(form.role === 'HOTEL_MANAGER' ? '/dashboard/manager' : '/', { replace: true });
    } catch (err) {
      toast.error(apiError(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 flex flex-col items-center">
        <Hotel className="h-10 w-10 text-brand-600" />
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-500">Join StayEase in seconds</p>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-6">
        <div>
          <label className="label">Full name</label>
          <input required className="input" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" required className="input" value={form.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div>
          <label className="label">Phone (optional)</label>
          <input className="input" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+1..." />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" required minLength={6} className="input" value={form.password} onChange={(e) => update('password', e.target.value)} />
        </div>
        <div>
          <label className="label">I want to</label>
          <select className="input" value={form.role} onChange={(e) => update('role', e.target.value)}>
            <option value="CUSTOMER">Book hotels (Customer)</option>
            <option value="HOTEL_MANAGER">List my property (Hotel Manager)</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Spinner className="h-5 w-5" /> : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
