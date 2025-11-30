import type { Database } from '@/integrations/supabase/types';

export type DoubtStatus = Database['public']['Enums']['doubt_status'];

export interface Doubt {
  id: string;
  title: string;
  description: string;
  status: DoubtStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  reopened_count: number;
  student_id: string;
  assigned_support_id: string | null;
}

export interface ChatMessage {
  id: string;
  doubt_id: string;
  responder_id: string;
  response_text: string | null;
  response_type: string | null;
  created_at: string;
  sender_role?: 'student' | 'support' | 'admin';
  sender_name?: string;
}

export interface Attachment {
  id: string;
  doubt_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  uploaded_by: string;
  created_at: string;
}
