import { Clock, CheckCircle, AlertCircle, RotateCcw, XCircle, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Doubt, DoubtStatus } from './types';

interface DoubtSidebarProps {
  doubts: Doubt[];
  selectedDoubtId: string | null;
  onSelectDoubt: (doubt: Doubt) => void;
  unreadDoubts?: Set<string>;
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours < 24) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const DoubtSidebar = ({ doubts, selectedDoubtId, onSelectDoubt, unreadDoubts = new Set() }: DoubtSidebarProps) => {
  return (
    <div className="h-full flex flex-col border-r border-border bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          My Doubts
        </h2>
        <p className="text-sm text-muted-foreground">{doubts.length} doubts</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {doubts.map((doubt) => {
            const config = statusConfig[doubt.status];
            const isSelected = selectedDoubtId === doubt.id;
            const hasUnread = unreadDoubts.has(doubt.id);
            
            return (
              <button
                key={doubt.id}
                onClick={() => onSelectDoubt(doubt)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-colors",
                  "hover:bg-accent/50",
                  isSelected ? "bg-accent" : "bg-transparent",
                  hasUnread && "border-l-2 border-primary"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {hasUnread && (
                        <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                      <p className={cn(
                        "font-medium truncate text-sm",
                        hasUnread ? "text-foreground" : "text-foreground/80"
                      )}>
                        {doubt.title}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {doubt.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDate(doubt.updated_at)}
                  </span>
                </div>
                <div className="mt-2">
                  <Badge variant={config.variant} className="text-xs flex items-center gap-1 w-fit">
                    {config.icon}
                    {config.label}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
