import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const AdminDashboard = () => {
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
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Executive Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">System Overview</h3>
            <p className="text-muted-foreground text-sm">Monitor platform health and metrics</p>
          </div>
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Staff Management</h3>
            <p className="text-muted-foreground text-sm">Assign support staff to doubts</p>
          </div>
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">SLA Compliance</h3>
            <p className="text-muted-foreground text-sm">Track resolution performance</p>
          </div>
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Escalations</h3>
            <p className="text-muted-foreground text-sm">View and manage escalated doubts</p>
          </div>
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Analytics</h3>
            <p className="text-muted-foreground text-sm">Engagement and completion reports</p>
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

export default AdminDashboard;
