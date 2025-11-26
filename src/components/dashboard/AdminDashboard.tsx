import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, AlertTriangle, Award, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Executive Dashboard</h2>
        <p className="text-text-secondary mt-1">System overview, analytics, and staff management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Doubts</p>
              <p className="text-3xl font-bold text-foreground mt-2">147</p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Students</p>
              <p className="text-3xl font-bold text-foreground mt-2">89</p>
            </div>
            <Users className="h-8 w-8 text-accent" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">SLA Compliance</p>
              <p className="text-3xl font-bold text-foreground mt-2">94%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-secondary" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Escalations</p>
              <p className="text-3xl font-bold text-foreground mt-2">7</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Badges Awarded</p>
              <p className="text-3xl font-bold text-foreground mt-2">234</p>
            </div>
            <Award className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* SLA Performance Chart */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-bold text-foreground mb-4">SLA Performance Overview</h3>
        <div className="h-64 flex items-center justify-center bg-background rounded-lg border border-border">
          <p className="text-muted-foreground">Chart visualization will be implemented here</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Staff Workload */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-xl font-bold text-foreground mb-4">Staff Workload</h3>
          <div className="space-y-4">
            {[
              { name: "Support Agent 1", cases: 12, resolved: 8, pending: 4 },
              { name: "Support Agent 2", cases: 10, resolved: 7, pending: 3 },
              { name: "Support Agent 3", cases: 15, resolved: 10, pending: 5 },
            ].map((agent) => (
              <div key={agent.name} className="p-4 bg-background rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-foreground">{agent.name}</p>
                  <Badge variant="outline">{agent.cases} cases</Badge>
                </div>
                <div className="flex space-x-4 text-sm">
                  <span className="text-secondary">Resolved: {agent.resolved}</span>
                  <span className="text-accent">Pending: {agent.pending}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Escalations */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-xl font-bold text-foreground mb-4">Recent Escalations</h3>
          <div className="space-y-4">
            {[
              { student: "John Doe", reason: "48hr SLA exceeded", time: "2h ago" },
              { student: "Jane Smith", reason: "Complex technical issue", time: "5h ago" },
              { student: "Bob Wilson", reason: "Unresolved after 3 attempts", time: "1d ago" },
            ].map((escalation, index) => (
              <div key={index} className="p-4 bg-background rounded-lg border border-border">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-foreground">{escalation.student}</p>
                  <span className="text-xs text-muted-foreground">{escalation.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{escalation.reason}</p>
                <Button size="sm" variant="outline" className="mt-2">Assign to Senior Support</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-bold text-foreground mb-4">Student Engagement Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-background rounded-lg border border-border text-center">
            <p className="text-2xl font-bold text-foreground">72%</p>
            <p className="text-sm text-muted-foreground mt-1">Course Completion Rate</p>
          </div>
          <div className="p-4 bg-background rounded-lg border border-border text-center">
            <p className="text-2xl font-bold text-foreground">4.8/5</p>
            <p className="text-sm text-muted-foreground mt-1">Average Satisfaction</p>
          </div>
          <div className="p-4 bg-background rounded-lg border border-border text-center">
            <p className="text-2xl font-bold text-foreground">3.2h</p>
            <p className="text-sm text-muted-foreground mt-1">Avg Resolution Time</p>
          </div>
          <div className="p-4 bg-background rounded-lg border border-border text-center">
            <p className="text-2xl font-bold text-foreground">89%</p>
            <p className="text-sm text-muted-foreground mt-1">Active Learners</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
