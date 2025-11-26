import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import SupportDashboard from "@/components/dashboard/SupportDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import NotificationBell from "@/components/notifications/NotificationBell";

type UserRole = 'student' | 'support' | 'admin';

const Dashboard = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    // Fetch user role from user_roles table
    const { data: roleData, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (error || !roleData) {
      toast({
        title: "Error",
        description: "Failed to load user role",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    setUserRole(roleData.role as UserRole);
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-logo-bg flex items-center justify-center">
              <span className="text-xl font-bold text-foreground">BRO</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">BroMentor</h1>
              <p className="text-sm text-text-secondary capitalize">{userRole} Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Role-based dashboard */}
      <main className="container mx-auto px-4 py-8">
        {userRole === 'student' && <StudentDashboard />}
        {userRole === 'support' && <SupportDashboard />}
        {userRole === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;
