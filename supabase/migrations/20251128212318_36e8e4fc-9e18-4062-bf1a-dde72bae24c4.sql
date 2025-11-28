-- Add new status values to doubt_status enum
ALTER TYPE public.doubt_status ADD VALUE IF NOT EXISTS 'closed_auto';
ALTER TYPE public.doubt_status ADD VALUE IF NOT EXISTS 'reopened';

-- Enable realtime for doubts table
ALTER PUBLICATION supabase_realtime ADD TABLE public.doubts;