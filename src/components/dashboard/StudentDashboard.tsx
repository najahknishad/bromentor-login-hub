import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, BookOpen, TrendingUp, MessageSquare } from "lucide-react";

const StudentDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Welcome, Student!</h2>
          <p className="text-text-secondary mt-1">Track your learning progress and submit doubts</p>
        </div>
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          <MessageSquare className="mr-2 h-5 w-5" />
          Submit New Doubt
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Doubts</p>
              <p className="text-3xl font-bold text-foreground mt-2">3</p>
            </div>
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Learning Streak</p>
              <p className="text-3xl font-bold text-foreground mt-2">7 days</p>
            </div>
            <TrendingUp className="h-8 w-8 text-accent" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Course Progress</p>
              <p className="text-3xl font-bold text-foreground mt-2">65%</p>
            </div>
            <BookOpen className="h-8 w-8 text-secondary" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
              <p className="text-3xl font-bold text-foreground mt-2">5</p>
            </div>
            <Award className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Active Doubts List */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-bold text-foreground mb-4">Your Active Doubts</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
              <div>
                <h4 className="font-semibold text-foreground">React Hooks Doubt #{item}</h4>
                <p className="text-sm text-muted-foreground mt-1">Module: Advanced React</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary">In Progress</Badge>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </div>
          ))}
        </div>
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
