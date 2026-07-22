import { Star } from 'lucide-react';
import type { BookingStatus, PaymentStatus } from '../types';

export function Spinner({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={`animate-spin text-brand-600 ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="h-10 w-10" />
    </div>
  );
}

export function StarRating({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
        />
      ))}
    </span>
  );
}

const bookingColors: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
};

const paymentColors: Record<PaymentStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-blue-100 text-blue-700',
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <span className={`badge ${bookingColors[status]}`}>{status}</span>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <span className={`badge ${paymentColors[status]}`}>{status}</span>;
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 p-10 text-center">
      <p className="text-lg font-semibold text-slate-700">{title}</p>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function currency(n?: number) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}
