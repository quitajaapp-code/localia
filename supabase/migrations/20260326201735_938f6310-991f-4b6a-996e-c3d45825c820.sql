-- Create storage bucket for materials
INSERT INTO storage.buckets (id, name, public) VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for materials bucket
CREATE POLICY "Authenticated users can upload materials"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'materials');

CREATE POLICY "Anyone can view materials"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'materials');

CREATE POLICY "Users can update own materials"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'materials')
WITH CHECK (bucket_id = 'materials');

CREATE POLICY "Users can delete own materials"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'materials');