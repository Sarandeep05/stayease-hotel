import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Hotel } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../lib/api';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { Spinner } from '../components/ui';
import type { AuthResponse, Role } from '../types';

function homeFor(roles: Role[]) {
  if (roles.includes('ADMIN')) return '/dashboard/admin';
  if (roles.includes('HOTEL_MANAGER')) return '/dashboard/manager';
  return '/';
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      dispatch(setCredentials(data));
      toast.success(`Welcome back, ${data.user.fullName.split(' ')[0]}!`);
      const dest = location.state?.from?.pathname ?? homeFor(data.user.roles);
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(apiError(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const fill = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 flex flex-col items-center">
        <Hotel className="h-10 w-10 text-brand-600" />
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-500">Log in to your StayEase account</p>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-6">
        <div>
          <label className="label">Email</label>
          <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:underline">
            Forgot password?
          </Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Spinner className="h-5 w-5" /> : 'Log in'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline">
          Sign up
        </Link>
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500">
        <p className="mb-2 font-semibold text-slate-600">Demo accounts (click to fill):</p>
        <div className="flex flex-col gap-1">
          <button type="button" onClick={() => fill('customer@stayease.com', 'Customer@123')} className="text-left hover:text-brand-600">
            Customer — customer@stayease.com / Customer@123
          </button>
          <button type="button" onClick={() => fill('manager@stayease.com', 'Manager@123')} className="text-left hover:text-brand-600">
            Manager — manager@stayease.com / Manager@123
          </button>
          <button type="button" onClick={() => fill('admin@stayease.com', 'Admin@123')} className="text-left hover:text-brand-600">
            Admin — admin@stayease.com / Admin@123
          </button>
        </div>
      </div>
    </div>
  );
}
