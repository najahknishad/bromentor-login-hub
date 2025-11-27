import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '@/components/Login';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const { isAuthenticated, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && role) {
      // Redirect based on role
      switch (role) {
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        case 'support':
          navigate('/support', { replace: true });
          break;
        case 'student':
        default:
          navigate('/dashboard', { replace: true });
          break;
      }
    }
  }, [loading, isAuthenticated, role, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export default Auth;
