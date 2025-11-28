import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Award, Flame, BookOpen, Trophy, Star, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserBadge {
  id: string;
  badge_id: string;
  awarded_at: string;
  badges: {
    name: string;
    description: string;
    badge_type: string;
    icon_url: string | null;
  };
}

const badgeIcons: Record<string, React.ReactNode> = {
  verified_doubt: <Award className="h-8 w-8 text-primary" />,
  learning_streak: <Flame className="h-8 w-8 text-orange-500" />,
  complex_solver: <Target className="h-8 w-8 text-purple-500" />,
  fast_resolution: <Trophy className="h-8 w-8 text-yellow-500" />,
  high_satisfaction: <Star className="h-8 w-8 text-green-500" />,
  complex_handler: <BookOpen className="h-8 w-8 text-blue-500" />,
};

const LearningProgress = () => {
  const { loading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchUserBadges = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('user_badges')
          .select(`
            id,
            badge_id,
            awarded_at,
            badges (
              name,
              description,
              badge_type,
              icon_url
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;
        setUserBadges(data as unknown as UserBadge[]);
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setLoadingBadges(false);
      }
    };

    if (user?.id) {
      fetchUserBadges();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Placeholder progress value - will be dynamic when linked
  const courseProgress = 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Learning Progress</h1>
          <p className="text-muted-foreground">Track your engagement and achievements</p>
        </header>

        <div className="space-y-6">
          {/* Course Completion Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Course Completion Progress
              </CardTitle>
              <CardDescription>Track your overall course progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">{courseProgress}%</span>
                </div>
                <Progress value={courseProgress} className="h-3" />
              </div>
              <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                Course completion progress will be available once linked with learn.brototype.com
              </p>
            </CardContent>
          </Card>

          {/* Learning Streaks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Learning Streaks
              </CardTitle>
              <CardDescription>Maintain your daily learning momentum</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center w-16 h-16 bg-orange-500/10 rounded-full">
                  <Flame className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">0 Days</p>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground italic border-l-2 border-orange-500/30 pl-3 mt-4">
                Learning streaks will be available once linked with learn.brototype.com
              </p>
            </CardContent>
          </Card>

          {/* Badges Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Earned Badges
              </CardTitle>
              <CardDescription>Achievements based on your performance and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBadges ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : userBadges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userBadges.map((userBadge) => (
                    <div
                      key={userBadge.id}
                      className="flex flex-col items-center p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-3">
                        {badgeIcons[userBadge.badges.badge_type] || <Award className="h-8 w-8 text-primary" />}
                      </div>
                      <h4 className="font-semibold text-foreground text-center">{userBadge.badges.name}</h4>
                      <p className="text-xs text-muted-foreground text-center mt-1">{userBadge.badges.description}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {new Date(userBadge.awarded_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center w-20 h-20 bg-muted rounded-full mx-auto mb-4">
                    <Trophy className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No badges earned yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Keep engaging with the platform to earn badges!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LearningProgress;
