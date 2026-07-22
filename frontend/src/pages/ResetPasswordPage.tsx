import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, apiError } from '../lib/api';
import { Spinner } from '../components/ui';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(params.get('token') ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      toast.success('Password reset. Please log in.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Set a new password</h1>
      <p className="mb-6 text-sm text-slate-500">Paste the reset token you received.</p>

      <form onSubmit={submit} className="card space-y-4 p-6">
        <div>
          <label className="label">Reset token</label>
          <input required className="input" value={token} onChange={(e) => setToken(e.target.value)} />
        </div>
        <div>
          <label className="label">New password</label>
          <input type="password" required minLength={6} className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Spinner className="h-5 w-5" /> : 'Reset password'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
