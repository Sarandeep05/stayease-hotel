import { ReactNode } from 'react';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { StatusBadge, PaymentBadge, currency } from './ui';
import type { BookingStatus, DashboardData, PaymentStatus } from '../types';

export function StatCard({
  label,
  value,
  icon,
  accent = 'text-brand-600',
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        {icon && <span className={accent}>{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export function RevenueChart({ data }: { data: DashboardData['charts'] }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="card p-5">
      <h3 className="mb-4 font-semibold text-slate-800">Revenue (last 6 months)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip formatter={(v) => currency(Number(v))} />
          <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RecentBookingsTable({ rows }: { rows: DashboardData['recent'] }) {
  if (!rows || rows.length === 0) {
    return <p className="text-sm text-slate-500">No recent activity.</p>;
  }
  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Reference</th>
            <th className="px-4 py-3">Hotel</th>
            <th className="px-4 py-3">Guest</th>
            <th className="px-4 py-3">Dates</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Payment</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={String(r.id)} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-700">{r.reference}</td>
              <td className="px-4 py-3">{r.hotelName}</td>
              <td className="px-4 py-3">{r.customerName}</td>
              <td className="px-4 py-3 text-slate-500">
                {r.checkIn ? format(new Date(String(r.checkIn)), 'MMM d') : '—'} →{' '}
                {r.checkOut ? format(new Date(String(r.checkOut)), 'MMM d') : '—'}
              </td>
              <td className="px-4 py-3">{currency(Number(r.totalPrice))}</td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status as BookingStatus} />
              </td>
              <td className="px-4 py-3">
                <PaymentBadge status={r.paymentStatus as PaymentStatus} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
