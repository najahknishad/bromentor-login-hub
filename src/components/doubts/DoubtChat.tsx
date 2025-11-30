import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessageComponent, DateSeparator } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { CheckCircle, RotateCcw, Clock, AlertCircle, XCircle } from 'lucide-react';
import type { Doubt, ChatMessage, DoubtStatus } from './types';

interface DoubtChatProps {
  doubt: Doubt;
  userId: string;
  userRole: 'student' | 'support' | 'admin';
  onDoubtUpdate: (doubt: Doubt) => void;
}

const statusConfig: Record<DoubtStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  submitted: { label: 'Submitted', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  in_progress: { label: 'In Progress', variant: 'default', icon: <AlertCircle className="h-3 w-3" /> },
  resolved: { label: 'Resolved', variant: 'outline', icon: <CheckCircle className="h-3 w-3" /> },
  closed: { label: 'Closed', variant: 'secondary', icon: <XCircle className="h-3 w-3" /> },
  closed_auto: { label: 'Auto-Closed', variant: 'secondary', icon: <XCircle className="h-3 w-3" /> },
  reopened: { label: 'Reopened', variant: 'destructive', icon: <RotateCcw className="h-3 w-3" /> },
  escalated: { label: 'Escalated', variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> }
};

export const DoubtChat = ({ doubt, userId, userRole, onDoubtUpdate }: DoubtChatProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isStudent = userRole === 'student';
  const isStaff = userRole === 'support' || userRole === 'admin';

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('doubt_responses')
        .select('*')
        .eq('doubt_id', doubt.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        // Enrich messages with sender info
        const enrichedMessages = await Promise.all(
          (data || []).map(async (msg) => {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', msg.responder_id)
              .single();
            
            return {
              ...msg,
              sender_role: roleData?.role as 'student' | 'support' | 'admin' | undefined
            };
          })
        );
        setMessages(enrichedMessages);
      }
      setLoading(false);
    };

    fetchMessages();

    // Real-time subscription for new messages
    const channel = supabase
      .channel(`doubt-chat-${doubt.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'doubt_responses',
          filter: `doubt_id=eq.${doubt.id}`
        },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', newMsg.responder_id)
            .single();
          
          setMessages(prev => [...prev, {
            ...newMsg,
            sender_role: roleData?.role as 'student' | 'support' | 'admin' | undefined
          }]);

          // Show notification if message is from other party
          if (newMsg.responder_id !== userId) {
            toast({
              title: "New message",
              description: `You have a new message in "${doubt.title}"`
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [doubt.id, userId, toast, doubt.title]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    const { error } = await supabase
      .from('doubt_responses')
      .insert({
        doubt_id: doubt.id,
        responder_id: userId,
        response_text: text,
        response_type: 'text'
      });

    if (error) {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
      return;
    }

    // Create notification for the other party
    const recipientId = isStudent ? doubt.assigned_support_id : doubt.student_id;
    if (recipientId) {
      await supabase.from('notifications').insert({
        user_id: recipientId,
        doubt_id: doubt.id,
        type: 'message',
        title: 'New Message',
        message: `New message in doubt: ${doubt.title}`
      });
    }

    // If staff sends first message, update status to in_progress
    if (isStaff && doubt.status === 'submitted') {
      await updateStatus('in_progress');
    }
  };

  const uploadAndSendFile = async (file: File, type: 'attachment' | 'voice') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${doubt.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('doubt-attachments')
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Error", description: "Failed to upload file", variant: "destructive" });
      return;
    }

    const { data: urlData } = supabase.storage
      .from('doubt-attachments')
      .getPublicUrl(fileName);

    const { error } = await supabase
      .from('doubt_responses')
      .insert({
        doubt_id: doubt.id,
        responder_id: userId,
        response_text: urlData.publicUrl,
        response_type: type
      });

    if (error) {
      toast({ title: "Error", description: "Failed to send file", variant: "destructive" });
    }
  };

  const updateStatus = async (newStatus: DoubtStatus) => {
    const updates: Record<string, any> = { status: newStatus };
    
    if (newStatus === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    } else if (newStatus === 'closed' || newStatus === 'closed_auto') {
      updates.closed_at = new Date().toISOString();
    } else if (newStatus === 'reopened') {
      updates.reopened_count = doubt.reopened_count + 1;
      updates.closed_at = null;
      updates.resolved_at = null;
    }

    const { data, error } = await supabase
      .from('doubts')
      .update(updates)
      .eq('id', doubt.id)
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
      return;
    }

    onDoubtUpdate(data as Doubt);

    // Create notification
    const recipientId = isStudent ? doubt.assigned_support_id : doubt.student_id;
    if (recipientId) {
      await supabase.from('notifications').insert({
        user_id: recipientId,
        doubt_id: doubt.id,
        type: 'status_change',
        title: 'Status Updated',
        message: `Doubt "${doubt.title}" status changed to ${newStatus.replace('_', ' ')}`
      });
    }

    toast({ title: "Success", description: `Status updated to ${newStatus.replace('_', ' ')}` });
  };

  const handleCloseDoubt = () => updateStatus('closed');
  
  const handleReopenDoubt = () => {
    if (doubt.reopened_count >= 1) {
      toast({ title: "Cannot Reopen", description: "This doubt has already been reopened once", variant: "destructive" });
      return;
    }
    if (doubt.closed_at) {
      const hoursSinceClosed = (new Date().getTime() - new Date(doubt.closed_at).getTime()) / (1000 * 60 * 60);
      if (hoursSinceClosed > 48) {
        toast({ title: "Cannot Reopen", description: "Reopening is only allowed within 48 hours of closure", variant: "destructive" });
        return;
      }
    }
    updateStatus('reopened');
  };

  const handleMarkResolved = () => updateStatus('resolved');
  const handleStartProgress = () => updateStatus('in_progress');

  const canClose = isStudent && doubt.status === 'resolved';
  const canReopen = isStudent && 
    (doubt.status === 'closed' || doubt.status === 'closed_auto') && 
    doubt.reopened_count < 1 &&
    doubt.closed_at &&
    ((new Date().getTime() - new Date(doubt.closed_at).getTime()) / (1000 * 60 * 60)) <= 48;
  const canMarkResolved = isStaff && (doubt.status === 'in_progress' || doubt.status === 'reopened');
  const canStartProgress = isStaff && (doubt.status === 'submitted' || doubt.status === 'reopened');
  const isChatDisabled = doubt.status === 'closed' || doubt.status === 'closed_auto';

  // Group messages by date
  const groupedMessages: { date: string; messages: ChatMessage[] }[] = [];
  messages.forEach((msg) => {
    const date = new Date(msg.created_at).toDateString();
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === date) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date, messages: [msg] });
    }
  });

  const config = statusConfig[doubt.status];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">{doubt.title}</h2>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{doubt.description}</p>
          </div>
          <Badge variant={config.variant} className="flex items-center gap-1 flex-shrink-0">
            {config.icon}
            {config.label}
          </Badge>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {canStartProgress && (
            <Button size="sm" onClick={handleStartProgress}>
              <AlertCircle className="h-4 w-4 mr-1" />
              Start Working
            </Button>
          )}
          {canMarkResolved && (
            <Button size="sm" onClick={handleMarkResolved}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Resolved
            </Button>
          )}
          {canClose && (
            <Button size="sm" variant="outline" onClick={handleCloseDoubt}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Confirm & Close
            </Button>
          )}
          {canReopen && (
            <Button size="sm" variant="secondary" onClick={handleReopenDoubt}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reopen
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation below</p>
          </div>
        ) : (
          groupedMessages.map((group, i) => (
            <div key={i}>
              <DateSeparator date={group.date} />
              {group.messages.map((msg) => (
                <ChatMessageComponent
                  key={msg.id}
                  message={msg}
                  isOwnMessage={msg.responder_id === userId}
                />
              ))}
            </div>
          ))
        )}
      </ScrollArea>

      {/* Input */}
      {isChatDisabled ? (
        <div className="border-t border-border p-4 bg-muted text-center text-muted-foreground">
          This doubt is closed. {canReopen && "You can reopen it to continue the conversation."}
        </div>
      ) : (
        <ChatInput
          onSendMessage={sendMessage}
          onSendAttachment={(file) => uploadAndSendFile(file, 'attachment')}
          onSendVoice={(file) => uploadAndSendFile(file, 'voice')}
          placeholder={isStudent ? "Ask a question..." : "Reply to student..."}
        />
      )}
    </div>
  );
};
