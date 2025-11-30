import { cn } from '@/lib/utils';
import { FileIcon, Mic } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from './types';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage: boolean;
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const ChatMessageComponent = ({ message, isOwnMessage }: ChatMessageProps) => {
  const isVoice = message.response_type === 'voice';
  const isAttachment = message.response_type === 'attachment';
  
  const renderContent = () => {
    if (isVoice && message.response_text) {
      return (
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4" />
          <audio controls className="h-8 max-w-[200px]">
            <source src={message.response_text} />
          </audio>
        </div>
      );
    }
    
    if (isAttachment && message.response_text) {
      const isImage = message.response_text.match(/\.(jpg|jpeg|png|gif|webp)$/i);
      if (isImage) {
        return (
          <img 
            src={message.response_text} 
            alt="Attachment" 
            className="max-w-[200px] rounded-lg cursor-pointer hover:opacity-90"
            onClick={() => window.open(message.response_text!, '_blank')}
          />
        );
      }
      return (
        <a 
          href={message.response_text} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <FileIcon className="h-4 w-4" />
          View Attachment
        </a>
      );
    }
    
    return <p className="text-sm whitespace-pre-wrap">{message.response_text}</p>;
  };

  return (
    <div className={cn(
      "flex flex-col mb-3",
      isOwnMessage ? "items-end" : "items-start"
    )}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium text-muted-foreground">
          {message.sender_name || (isOwnMessage ? 'You' : 'Staff')}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatTime(message.created_at)}
        </span>
      </div>
      <div className={cn(
        "max-w-[70%] rounded-2xl px-4 py-2",
        isOwnMessage 
          ? "bg-primary text-primary-foreground rounded-br-md" 
          : "bg-muted text-foreground rounded-bl-md"
      )}>
        {renderContent()}
      </div>
    </div>
  );
};

export const DateSeparator = ({ date }: { date: string }) => (
  <div className="flex items-center justify-center my-4">
    <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border border-border">
      {formatDate(date)}
    </span>
  </div>
);
