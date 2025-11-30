import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { DoubtSidebar } from '@/components/doubts/DoubtSidebar';
import { DoubtChat } from '@/components/doubts/DoubtChat';
import type { Doubt, DoubtStatus } from '@/components/doubts/types';
import { BrandHeader } from '@/components/BrandHeader';

const MyDoubts = () => {
  const { loading, isAuthenticated, user, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loadingDoubts, setLoadingDoubts] = useState(true);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [unreadDoubts, setUnreadDoubts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  // Fetch doubts based on role
  useEffect(() => {
    if (!user) return;

    const fetchDoubts = async () => {
      let query = supabase
        .from('doubts')
        .select('id, title, description, status, created_at, updated_at, resolved_at, closed_at, reopened_count, student_id, assigned_support_id')
        .order('updated_at', { ascending: false });

      // Students see their own doubts, staff see assigned doubts
      if (role === 'student') {
        query = query.eq('student_id', user.id);
      } else if (role === 'support') {
        query = query.eq('assigned_support_id', user.id);
      }
      // Admin sees all doubts (no filter)

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching doubts:', error);
        toast({
          title: "Error",
          description: "Failed to load doubts",
          variant: "destructive"
        });
      } else {
        setDoubts(data as Doubt[] || []);
      }
      setLoadingDoubts(false);
    };

    fetchDoubts();

    // Real-time subscription for doubts
    const channel = supabase
      .channel('my-doubts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doubts'
        },
        (payload) => {
          const newDoubt = payload.new as Doubt;
          const oldDoubt = payload.old as { id: string };
          
          // Filter based on role
          const isRelevant = role === 'admin' || 
            (role === 'student' && newDoubt?.student_id === user.id) ||
            (role === 'support' && newDoubt?.assigned_support_id === user.id);

          if (payload.eventType === 'INSERT' && isRelevant) {
            setDoubts(prev => [newDoubt, ...prev]);
          } else if (payload.eventType === 'UPDATE' && isRelevant) {
            setDoubts(prev => prev.map(d => 
              d.id === newDoubt.id ? newDoubt : d
            ));
            // Update selected doubt if it's the one being updated
            if (selectedDoubt?.id === newDoubt.id) {
              setSelectedDoubt(newDoubt);
            }
            // Mark as unread if status changed
            if (selectedDoubt?.id !== newDoubt.id) {
              setUnreadDoubts(prev => new Set(prev).add(newDoubt.id));
            }
          } else if (payload.eventType === 'DELETE') {
            setDoubts(prev => prev.filter(d => d.id !== oldDoubt.id));
            if (selectedDoubt?.id === oldDoubt.id) {
              setSelectedDoubt(null);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to notifications for unread indicators
    const notifChannel = supabase
      .channel('doubt-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const notif = payload.new as { doubt_id: string | null };
          if (notif.doubt_id && notif.doubt_id !== selectedDoubt?.id) {
            setUnreadDoubts(prev => new Set(prev).add(notif.doubt_id!));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(notifChannel);
    };
  }, [user, role, toast, selectedDoubt?.id]);

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

  const handleSelectDoubt = (doubt: Doubt) => {
    setSelectedDoubt(doubt);
    // Remove from unread
    setUnreadDoubts(prev => {
      const next = new Set(prev);
      next.delete(doubt.id);
      return next;
    });
  };

  const handleDoubtUpdate = (updatedDoubt: Doubt) => {
    setDoubts(prev => prev.map(d => d.id === updatedDoubt.id ? updatedDoubt : d));
    setSelectedDoubt(updatedDoubt);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top navigation with branding */}
      <div className="border-b border-border p-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <BrandHeader />
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        {role === 'student' && (
          <Button onClick={() => navigate('/submit-doubt')} className="gap-2">
            <Plus className="h-4 w-4" />
            Submit New Doubt
          </Button>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {loadingDoubts ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : doubts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="max-w-md w-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg text-center">
                  {role === 'student' 
                    ? "No doubts submitted yet." 
                    : "No doubts assigned to you yet."}
                </p>
                {role === 'student' && (
                  <Button 
                    onClick={() => navigate('/submit-doubt')} 
                    className="mt-4"
                  >
                    Submit Your First Doubt
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Sidebar with doubts list */}
            <div className="w-80 flex-shrink-0 h-full">
              <DoubtSidebar
                doubts={doubts}
                selectedDoubtId={selectedDoubt?.id || null}
                onSelectDoubt={handleSelectDoubt}
                unreadDoubts={unreadDoubts}
              />
            </div>

            {/* Chat area */}
            <div className="flex-1 h-full">
              {selectedDoubt ? (
                <DoubtChat
                  doubt={selectedDoubt}
                  userId={user!.id}
                  userRole={role || 'student'}
                  onDoubtUpdate={handleDoubtUpdate}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <p className="text-lg">Select a doubt to view the discussion</p>
                    <p className="text-sm mt-1">Choose from the list on the left</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyDoubts;
