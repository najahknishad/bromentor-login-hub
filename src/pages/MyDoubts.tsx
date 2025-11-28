import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Clock, CheckCircle, AlertCircle, RotateCcw, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type DoubtStatus = Database['public']['Enums']['doubt_status'];

interface Doubt {
  id: string;
  title: string;
  description: string;
  status: DoubtStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  reopened_count: number;
}

const MyDoubts = () => {
  const { loading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loadingDoubts, setLoadingDoubts] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  // Fetch doubts
  useEffect(() => {
    if (!user) return;

    const fetchDoubts = async () => {
      const { data, error } = await supabase
        .from('doubts')
        .select('id, title, description, status, created_at, updated_at, resolved_at, closed_at, reopened_count')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching doubts:', error);
        toast({
          title: "Error",
          description: "Failed to load your doubts",
          variant: "destructive"
        });
      } else {
        setDoubts(data || []);
      }
      setLoadingDoubts(false);
    };

    fetchDoubts();

    // Real-time subscription
    const channel = supabase
      .channel('my-doubts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doubts',
          filter: `student_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDoubts(prev => [payload.new as Doubt, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setDoubts(prev => prev.map(d => 
              d.id === payload.new.id ? payload.new as Doubt : d
            ));
          } else if (payload.eventType === 'DELETE') {
            setDoubts(prev => prev.filter(d => d.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Auto-close check for resolved doubts older than 48 hours
  useEffect(() => {
    const checkAutoClose = async () => {
      const now = new Date();
      const doubtsToAutoClose = doubts.filter(d => {
        if (d.status !== 'resolved' || !d.resolved_at) return false;
        const resolvedAt = new Date(d.resolved_at);
        const hoursSinceResolved = (now.getTime() - resolvedAt.getTime()) / (1000 * 60 * 60);
        return hoursSinceResolved >= 48;
      });

      for (const doubt of doubtsToAutoClose) {
        await supabase
          .from('doubts')
          .update({ 
            status: 'closed_auto' as DoubtStatus, 
            closed_at: new Date().toISOString() 
          })
          .eq('id', doubt.id);
      }
    };

    if (doubts.length > 0) {
      checkAutoClose();
    }
  }, [doubts]);

  const handleCloseDoubt = async (doubtId: string) => {
    const { error } = await supabase
      .from('doubts')
      .update({ 
        status: 'closed' as DoubtStatus, 
        closed_at: new Date().toISOString() 
      })
      .eq('id', doubtId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to close doubt",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Doubt closed successfully"
      });
    }
  };

  const handleReopenDoubt = async (doubt: Doubt) => {
    // Check if already reopened once
    if (doubt.reopened_count >= 1) {
      toast({
        title: "Cannot Reopen",
        description: "This doubt has already been reopened once",
        variant: "destructive"
      });
      return;
    }

    // Check if within 48 hours of closure
    if (doubt.closed_at) {
      const closedAt = new Date(doubt.closed_at);
      const now = new Date();
      const hoursSinceClosed = (now.getTime() - closedAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceClosed > 48) {
        toast({
          title: "Cannot Reopen",
          description: "Reopening is only allowed within 48 hours of closure",
          variant: "destructive"
        });
        return;
      }
    }

    const { error } = await supabase
      .from('doubts')
      .update({ 
        status: 'reopened' as DoubtStatus, 
        reopened_count: doubt.reopened_count + 1,
        closed_at: null,
        resolved_at: null
      })
      .eq('id', doubt.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reopen doubt",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Doubt reopened successfully"
      });
    }
  };

  const getStatusBadge = (status: DoubtStatus) => {
    const statusConfig: Record<DoubtStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      submitted: { label: 'Submitted', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
      in_progress: { label: 'In Progress', variant: 'default', icon: <AlertCircle className="h-3 w-3" /> },
      resolved: { label: 'Resolved', variant: 'outline', icon: <CheckCircle className="h-3 w-3" /> },
      closed: { label: 'Closed', variant: 'secondary', icon: <XCircle className="h-3 w-3" /> },
      closed_auto: { label: 'Closed (Auto)', variant: 'secondary', icon: <XCircle className="h-3 w-3" /> },
      reopened: { label: 'Reopened', variant: 'destructive', icon: <RotateCcw className="h-3 w-3" /> },
      escalated: { label: 'Escalated', variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> }
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const canClose = (status: DoubtStatus) => status === 'resolved';
  const canReopen = (doubt: Doubt) => 
    (doubt.status === 'closed' || doubt.status === 'closed_auto') && 
    doubt.reopened_count < 1 &&
    doubt.closed_at &&
    ((new Date().getTime() - new Date(doubt.closed_at).getTime()) / (1000 * 60 * 60)) <= 48;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button onClick={() => navigate('/submit-doubt')} className="gap-2">
            <Plus className="h-4 w-4" />
            Submit New Doubt
          </Button>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Doubts</h1>
          <p className="text-muted-foreground">Track your submitted doubts and their status</p>
        </header>

        {loadingDoubts ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : doubts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No doubts submitted yet.</p>
              <Button 
                onClick={() => navigate('/submit-doubt')} 
                className="mt-4"
              >
                Submit Your First Doubt
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {doubts.map((doubt) => (
              <Card key={doubt.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg font-semibold line-clamp-2">
                      {doubt.title}
                    </CardTitle>
                    {getStatusBadge(doubt.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {doubt.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
                    <span>Submitted: {formatDate(doubt.created_at)}</span>
                    {doubt.updated_at !== doubt.created_at && (
                      <span>Updated: {formatDate(doubt.updated_at)}</span>
                    )}
                    {doubt.resolved_at && (
                      <span>Resolved: {formatDate(doubt.resolved_at)}</span>
                    )}
                    {doubt.closed_at && (
                      <span>Closed: {formatDate(doubt.closed_at)}</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {canClose(doubt.status) && (
                      <Button 
                        size="sm" 
                        onClick={() => handleCloseDoubt(doubt.id)}
                        variant="outline"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm & Close
                      </Button>
                    )}
                    {canReopen(doubt) && (
                      <Button 
                        size="sm" 
                        onClick={() => handleReopenDoubt(doubt)}
                        variant="secondary"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reopen Doubt
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDoubts;
