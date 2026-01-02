-- Add export_count column to tracker_data
ALTER TABLE public.tracker_data ADD COLUMN IF NOT EXISTS export_count integer NOT NULL DEFAULT 0;

-- Add last_seen_comment_id column to track which comments user has seen
CREATE TABLE IF NOT EXISTS public.user_comment_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  last_seen_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_comment_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own notification settings
CREATE POLICY "Users can view own notifications" 
ON public.user_comment_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" 
ON public.user_comment_notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
ON public.user_comment_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);