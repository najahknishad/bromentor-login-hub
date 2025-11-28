-- Create storage bucket for doubt attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('doubt-attachments', 'doubt-attachments', true);

-- Allow authenticated users to upload files to the bucket
CREATE POLICY "Users can upload doubt attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'doubt-attachments');

-- Allow users to view attachments for doubts they can access
CREATE POLICY "Users can view doubt attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'doubt-attachments');

-- Allow users to delete their own attachments
CREATE POLICY "Users can delete own attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'doubt-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);