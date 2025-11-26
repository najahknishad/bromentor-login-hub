import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, BookOpen, TrendingUp, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SubmitDoubtDialog from "@/components/doubt/SubmitDoubtDialog";

interface Doubt {
  id: string;
  title: string;
  status: string;
  created_at: string;
  topics: { name: string; modules: { name: string } };
}

const StudentDashboard = () => {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [stats, setStats] = useState({
    activeDoubts: 0,
    streak: 0,
    progress: 0,
    badges: 0,
  });

  useEffect(() => {
    loadStudentData();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('doubts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doubts'
        },
        () => loadStudentData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStudentData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load doubts
    const { data: doubtsData } = await supabase
      .from("doubts")
      .select(`
        id,
        title,
        status,
        created_at,
        topics (
          name,
          modules (
            name
          )
        )
      `)
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (doubtsData) {
      setDoubts(doubtsData as any);
      setStats(prev => ({
        ...prev,
        activeDoubts: doubtsData.filter(d => 
          ['submitted', 'in_progress'].includes(d.status)
        ).length
      }));
    }

    // Load badges count
    const { data: badgesData } = await supabase
      .from("user_badges")
      .select("id")
      .eq("user_id", user.id);

    if (badgesData) {
      setStats(prev => ({ ...prev, badges: badgesData.length }));
    }

    // Load engagement for streak
    const { data: engagementData } = await supabase
      .from("engagement_tracking")
      .select("streak_days")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    if (engagementData) {
      setStats(prev => ({ ...prev, streak: engagementData.streak_days }));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      submitted: "secondary",
      in_progress: "default",
      resolved: "default",
      closed: "secondary",
    };
    return variants[status] || "default";
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Welcome, Student!</h2>
          <p className="text-text-secondary mt-1">Track your learning progress and submit doubts</p>
        </div>
        <SubmitDoubtDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Doubts</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.activeDoubts}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Learning Streak</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.streak} days</p>
            </div>
            <TrendingUp className="h-8 w-8 text-accent" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Course Progress</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.progress}%</p>
            </div>
            <BookOpen className="h-8 w-8 text-secondary" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.badges}</p>
            </div>
            <Award className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Active Doubts List */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-bold text-foreground mb-4">Your Active Doubts</h3>
        {doubts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No doubts submitted yet. Click "Submit New Doubt" to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {doubts.map((doubt) => (
              <div key={doubt.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                <div>
                  <h4 className="font-semibold text-foreground">{doubt.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Module: {doubt.topics?.modules?.name || 'N/A'} • Topic: {doubt.topics?.name || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={getStatusBadge(doubt.status)}>
                    {formatStatus(doubt.status)}
                  </Badge>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Badges Section */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-bold text-foreground mb-4">Your Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['Verified Doubt', 'Learning Streak', 'Quick Learner', 'Problem Solver', 'Active Participant'].map((badge) => (
            <div key={badge} className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
              <Award className="h-12 w-12 text-primary mb-2" />
              <p className="text-sm text-center text-foreground font-medium">{badge}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default StudentDashboard;
