-- Add new columns to tracker_data for re-edit, re-capture, and paid tracking
ALTER TABLE public.tracker_data 
ADD COLUMN IF NOT EXISTS re_edited_cells boolean[] NOT NULL DEFAULT ARRAY[]::boolean[],
ADD COLUMN IF NOT EXISTS edited_paid_cells boolean[] NOT NULL DEFAULT ARRAY[]::boolean[],
ADD COLUMN IF NOT EXISTS re_captured_cells boolean[] NOT NULL DEFAULT ARRAY[]::boolean[];

-- Create tracker_history table for changelog
CREATE TABLE public.tracker_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_index integer NOT NULL,
  section text NOT NULL,
  action text NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by_email text,
  changed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create cell_comments table
CREATE TABLE public.cell_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_index integer NOT NULL,
  section text NOT NULL,
  comment text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.tracker_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cell_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for tracker_history
CREATE POLICY "Anyone authenticated can view history"
ON public.tracker_history FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert history"
ON public.tracker_history FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete history"
ON public.tracker_history FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for cell_comments
CREATE POLICY "Anyone authenticated can view comments"
ON public.cell_comments FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert comments"
ON public.cell_comments FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update comments"
ON public.cell_comments FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete comments"
ON public.cell_comments FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for all relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracker_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracker_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cell_comments;

-- Update existing tracker_data rows to initialize new columns
UPDATE public.tracker_data 
SET 
  re_edited_cells = ARRAY(SELECT false FROM generate_series(1, 180)),
  edited_paid_cells = ARRAY(SELECT false FROM generate_series(1, 180)),
  re_captured_cells = ARRAY(SELECT false FROM generate_series(1, 180))
WHERE array_length(re_edited_cells, 1) IS NULL OR array_length(re_edited_cells, 1) = 0;