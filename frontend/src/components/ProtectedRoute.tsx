import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import type { Role } from '../types';

interface Props {
  children: JSX.Element;
  roles?: Role[];
}

/**
 * Guards a route: requires authentication and, optionally, one of `roles`.
 */
export default function ProtectedRoute({ children, roles }: Props) {
  const { user, accessToken } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !user.roles.some((r) => roles.includes(r))) {
    return <Navigate to="/" replace />;
  }

  return children;
}
