import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/common/Loader';
import { ROUTES, canAccess } from '../constants';

export { useOutletContext };

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
};

export const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  return isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Outlet />;
};

// Wraps a route — blocks if no permission, passes permission level via context if view-only
export const RoleRoute = ({ module }) => {
  const { user } = useAuth();
  const permission = canAccess(user?.role, module);

  if (!permission) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 space-y-3">
        <div className="text-4xl">🔒</div>
        <p className="text-gray-300 font-semibold text-lg">Access Denied</p>
        <p className="text-gray-500 text-sm">
          Your role <span className="text-orange-400 font-medium">({user?.role})</span> does not have permission to view this module.
        </p>
      </div>
    );
  }

  // Pass permission level as context so pages can conditionally hide write actions
  return <Outlet context={{ permission }} />;
};
