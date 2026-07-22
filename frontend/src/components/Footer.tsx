import { Hotel } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-brand-700">
            <Hotel className="h-6 w-6" />
            <span className="text-lg font-bold">StayEase</span>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} StayEase. A Booking.com-inspired demo platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
