import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hotel, Menu, X, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import type { Role } from '../types';

function dashboardPath(roles: Role[]): string {
  if (roles.includes('ADMIN')) return '/dashboard/admin';
  if (roles.includes('HOTEL_MANAGER')) return '/dashboard/manager';
  return '/dashboard/customer';
}

export default function Navbar() {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-brand-700">
          <Hotel className="h-7 w-7" />
          <span className="text-xl font-extrabold tracking-tight">StayEase</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/search" className="text-sm font-medium text-slate-600 hover:text-brand-600">
            Find Hotels
          </Link>

          {user ? (
            <>
              <Link
                to={dashboardPath(user.roles)}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-600"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              {user.roles.includes('CUSTOMER') && (
                <Link to="/bookings" className="text-sm font-medium text-slate-600 hover:text-brand-600">
                  My Bookings
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-600">
                <UserIcon className="h-4 w-4" /> {user.fullName.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="btn-secondary px-3 py-1.5">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-brand-600">
                Login
              </Link>
              <Link to="/register" className="btn-primary px-4 py-2">
                Sign up
              </Link>
            </>
          )}
        </nav>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/search" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">
              Find Hotels
            </Link>
            {user ? (
              <>
                <Link to={dashboardPath(user.roles)} onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">
                  Dashboard
                </Link>
                {user.roles.includes('CUSTOMER') && (
                  <Link to="/bookings" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">
                    My Bookings
                  </Link>
                )}
                <Link to="/profile" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">
                  Profile
                </Link>
                <button onClick={handleLogout} className="btn-secondary">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-semibold text-slate-700">
                  Login
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
