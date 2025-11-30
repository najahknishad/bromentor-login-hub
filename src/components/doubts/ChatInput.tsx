import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Mic, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (text: string) => Promise<void>;
  onSendAttachment: (file: File) => Promise<void>;
  onSendVoice: (file: File) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ 
  onSendMessage, 
  onSendAttachment, 
  onSendVoice,
  disabled = false,
  placeholder = "Type a message..."
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if ((!message.trim() && !selectedFile) || sending) return;
    
    setSending(true);
    try {
      if (selectedFile) {
        const isAudio = selectedFile.type.startsWith('audio/');
        if (isAudio) {
          await onSendVoice(selectedFile);
        } else {
          await onSendAttachment(selectedFile);
        }
        setSelectedFile(null);
      }
      
      if (message.trim()) {
        await onSendMessage(message.trim());
        setMessage('');
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert('File size must be less than 20MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  return (
    <div className="border-t border-border p-4 bg-card">
      {selectedFile && (
        <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
          <span className="text-sm truncate">{selectedFile.name}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedFile(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
          />
          <input
            type="file"
            ref={voiceInputRef}
            className="hidden"
            accept="audio/*"
            onChange={handleFileSelect}
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || sending}
            className="h-10 w-10"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => voiceInputRef.current?.click()}
            disabled={disabled || sending}
            className="h-10 w-10"
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>
        
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || sending}
          className={cn(
            "min-h-[44px] max-h-[120px] resize-none flex-1",
            "rounded-2xl px-4 py-3"
          )}
          rows={1}
        />
        
        <Button
          onClick={handleSend}
          disabled={disabled || sending || (!message.trim() && !selectedFile)}
          size="icon"
          className="h-10 w-10 rounded-full"
        >
          {sending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};
