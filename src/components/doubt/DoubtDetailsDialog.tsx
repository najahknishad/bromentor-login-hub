import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, User, MessageSquare } from "lucide-react";

interface DoubtDetailsDialogProps {
  doubtId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: 'student' | 'support' | 'admin';
}

interface Doubt {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  sla_deadline: string;
  topics: { name: string; modules: { name: string; courses: { name: string } } };
  profiles: { full_name: string; email: string };
}

interface Response {
  id: string;
  response_text: string;
  created_at: string;
  profiles: { full_name: string };
}

const DoubtDetailsDialog = ({ doubtId, open, onOpenChange, userRole }: DoubtDetailsDialogProps) => {
  const [doubt, setDoubt] = useState<Doubt | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [newResponse, setNewResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && doubtId) {
      loadDoubtDetails();
    }
  }, [open, doubtId]);

  const loadDoubtDetails = async () => {
    const { data: doubtData } = await supabase
      .from("doubts")
      .select(`
        *,
        topics (
          name,
          modules (
            name,
            courses (
              name
            )
          )
        ),
        profiles:student_id (
          full_name,
          email
        )
      `)
      .eq("id", doubtId)
      .single();

    if (doubtData) {
      setDoubt(doubtData as any);
    }

    const { data: responsesData } = await supabase
      .from("doubt_responses")
      .select(`
        *,
        profiles:responder_id (
          full_name
        )
      `)
      .eq("doubt_id", doubtId)
      .order("created_at", { ascending: true });

    if (responsesData) {
      setResponses(responsesData as any);
    }
  };

  const handleSubmitResponse = async () => {
    if (!newResponse.trim()) return;

    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("doubt_responses").insert({
      doubt_id: doubtId,
      responder_id: user.id,
      response_text: newResponse,
      response_type: "text",
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit response",
        variant: "destructive",
      });
    } else {
      // Update doubt status to in_progress if it was submitted
      if (doubt?.status === "submitted") {
        await supabase
          .from("doubts")
          .update({ status: "in_progress" })
          .eq("id", doubtId);
      }

      // Create notification for student
      await supabase.from("notifications").insert({
        user_id: doubt?.profiles ? (doubt as any).student_id : "",
        title: "New Response to Your Doubt",
        message: `A support member responded to: ${doubt?.title}`,
        type: "doubt_response",
        doubt_id: doubtId,
      });

      toast({
        title: "Response Submitted",
        description: "Your response has been sent",
      });

      setNewResponse("");
      loadDoubtDetails();
    }

    setIsLoading(false);
  };

  const handleMarkResolved = async () => {
    const { error } = await supabase
      .from("doubts")
      .update({ 
        status: "resolved",
        resolved_at: new Date().toISOString()
      })
      .eq("id", doubtId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to mark as resolved",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Doubt Resolved",
        description: "This doubt has been marked as resolved",
      });
      loadDoubtDetails();
    }
  };

  if (!doubt) return null;

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{doubt.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Doubt Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge>{formatStatus(doubt.status)}</Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                SLA: {formatDate(doubt.sla_deadline)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Student:</span>
                <p className="font-medium">{doubt.profiles?.full_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Course:</span>
                <p className="font-medium">{doubt.topics?.modules?.courses?.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Module:</span>
                <p className="font-medium">{doubt.topics?.modules?.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Topic:</span>
                <p className="font-medium">{doubt.topics?.name}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{doubt.description}</p>
          </div>

          {/* Responses */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Responses ({responses.length})
            </h3>
            <div className="space-y-3">
              {responses.map((response) => (
                <div key={response.id} className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-1" />
                      <span className="font-medium">{response.profiles?.full_name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(response.created_at)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{response.response_text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Add Response (Support/Admin only) */}
          {(userRole === 'support' || userRole === 'admin') && doubt.status !== 'closed' && (
            <div className="space-y-3">
              <h3 className="font-semibold">Add Response</h3>
              <Textarea
                placeholder="Type your response here..."
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                rows={4}
              />
              <div className="flex space-x-3">
                <Button onClick={handleSubmitResponse} disabled={isLoading || !newResponse.trim()}>
                  {isLoading ? "Sending..." : "Send Response"}
                </Button>
                {doubt.status !== 'resolved' && (
                  <Button variant="outline" onClick={handleMarkResolved}>
                    Mark as Resolved
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DoubtDetailsDialog;
