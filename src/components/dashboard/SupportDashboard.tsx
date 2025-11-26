import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, AlertCircle, Users } from "lucide-react";

const SupportDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Support Dashboard</h2>
        <p className="text-text-secondary mt-1">Manage assigned doubts and track SLA compliance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Assigned Cases</p>
              <p className="text-3xl font-bold text-foreground mt-2">12</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending SLA</p>
              <p className="text-3xl font-bold text-foreground mt-2">5</p>
            </div>
            <Clock className="h-8 w-8 text-accent" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolved Today</p>
              <p className="text-3xl font-bold text-foreground mt-2">8</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-secondary" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Escalations</p>
              <p className="text-3xl font-bold text-foreground mt-2">2</p>
            </div>
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </Card>
      </div>

      {/* Assigned Cases Queue */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-bold text-foreground mb-4">Assigned Cases</h3>
        <div className="space-y-4">
          {[
            { id: 1, student: "John Doe", topic: "React State Management", sla: "2h 15m", priority: "high" },
            { id: 2, student: "Jane Smith", topic: "Node.js Authentication", sla: "4h 30m", priority: "medium" },
            { id: 3, student: "Bob Wilson", topic: "CSS Flexbox", sla: "6h 45m", priority: "low" },
          ].map((doubt) => (
            <div key={doubt.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-semibold text-foreground">{doubt.student}</h4>
                  <Badge variant={doubt.priority === 'high' ? 'destructive' : doubt.priority === 'medium' ? 'default' : 'secondary'}>
                    {doubt.priority.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{doubt.topic}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">SLA Deadline</p>
                  <p className="text-sm text-muted-foreground">{doubt.sla}</p>
                </div>
                <Button size="sm">Respond</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Badges Section */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-bold text-foreground mb-4">Your Performance Badges</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['Fast Resolution', 'High Satisfaction', 'Complex Handler'].map((badge) => (
            <div key={badge} className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
              <CheckCircle2 className="h-12 w-12 text-primary mb-2" />
              <p className="text-sm text-center text-foreground font-medium">{badge}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SupportDashboard;
