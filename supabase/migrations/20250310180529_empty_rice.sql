/*
  # Create transfers table and storage bucket

  1. New Tables
    - `transfers`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `file_count` (integer)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Storage
    - Create `transfers` bucket for file storage
    - Enable public access for downloads
    
  3. Security
    - Enable RLS on `transfers` table
    - Add policies for inserting and selecting transfers
*/

-- Create transfers table
CREATE TABLE transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  file_count integer NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert transfers
CREATE POLICY "Anyone can insert transfers"
  ON transfers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anyone to select transfers
CREATE POLICY "Anyone can select transfers"
  ON transfers
  FOR SELECT
  TO anon
  USING (true);

-- Create storage bucket for transfers
INSERT INTO storage.buckets (id, name, public)
VALUES ('transfers', 'transfers', true);

-- Storage policies
CREATE POLICY "Anyone can upload files"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'transfers');

CREATE POLICY "Anyone can download files"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'transfers');