import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Wraps protected routes — redirects to /login if not authenticated.
 */
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
