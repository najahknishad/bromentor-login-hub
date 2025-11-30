import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { BrandHeader } from '@/components/BrandHeader';

const StudentDashboard = () => {
  const { user, role, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Brand Header */}
        <div className="flex justify-between items-center mb-6">
          <BrandHeader showNavigation={false} />
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.email}</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div 
            onClick={() => navigate('/submit-doubt')}
            className="bg-card p-6 rounded-xl border border-border cursor-pointer transition-all duration-200 hover:scale-105 hover:border-primary hover:shadow-lg"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">Submit Doubt</h3>
            <p className="text-muted-foreground text-sm">Ask questions and get expert help</p>
          </div>
          <div 
            onClick={() => navigate('/my-doubts')}
            className="bg-card p-6 rounded-xl border border-border cursor-pointer transition-all duration-200 hover:scale-105 hover:border-primary hover:shadow-lg"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">My Doubts</h3>
            <p className="text-muted-foreground text-sm">Track your submitted doubts</p>
          </div>
          <div 
            onClick={() => navigate('/learning-progress')}
            className="bg-card p-6 rounded-xl border border-border cursor-pointer transition-all duration-200 hover:scale-105 hover:border-primary hover:shadow-lg"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">Learning Progress</h3>
            <p className="text-muted-foreground text-sm">View your engagement metrics</p>
          </div>
        </div>

        <div className="mt-8 bg-card p-6 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">
            Role: <span className="text-primary font-medium">{role}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
