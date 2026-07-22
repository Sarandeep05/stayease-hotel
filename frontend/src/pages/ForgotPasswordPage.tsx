import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, apiError } from '../lib/api';
import { Spinner } from '../components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('If that email exists, a reset link was sent.');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Reset your password</h1>
      <p className="mb-6 text-sm text-slate-500">
        Enter your email and we&apos;ll send you a reset token.
      </p>

      {sent ? (
        <div className="card p-6 text-sm text-slate-600">
          <p>
            Check your email (or the backend server logs in dev mode) for a reset token, then continue on the{' '}
            <Link to="/reset-password" className="font-semibold text-brand-600 hover:underline">
              reset password
            </Link>{' '}
            page.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="card space-y-4 p-6">
          <div>
            <label className="label">Email</label>
            <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Spinner className="h-5 w-5" /> : 'Send reset link'}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-slate-600">
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
