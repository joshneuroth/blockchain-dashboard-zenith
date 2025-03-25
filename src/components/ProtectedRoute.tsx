
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
};

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("ProtectedRoute render state:", {
      pathname: location.pathname,
      isLoading,
      userExists: !!user, 
      userId: user?.id,
      isAdmin,
      requiredRole
    });
  }, [isLoading, user, isAdmin, location.pathname, requiredRole]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading authentication status...</p>
      </div>
    );
  }

  if (!user) {
    console.log("ProtectedRoute: No user found, redirecting to /admin");
    return <Navigate to="/admin" replace />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    console.log("ProtectedRoute: User is not admin, redirecting to /admin");
    return <Navigate to="/admin" replace />;
  }

  console.log("ProtectedRoute: Access granted");
  return <>{children}</>;
};

export default ProtectedRoute;
