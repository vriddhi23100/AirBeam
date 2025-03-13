import { createClient } from '@supabase/supabase-js';
import { Transfer, FileWithPreview, DownloadFile } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  },
  global: {
    fetch: fetch.bind(globalThis)
  }
});

export async function uploadFiles(files: FileWithPreview[], code: string): Promise<void> {
  // Upload files in chunks to handle large files
  const chunkSize = 10 * 1024 * 1024; // 10MB chunks

  const uploadChunk = async (file: File, start: number): Promise<void> => {
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    const isLastChunk = end === file.size;

    const fileName = `${code}/${file.name}${isLastChunk ? '' : `.part${start}`}`;
    
    await supabase.storage
      .from('transfers')
      .upload(fileName, chunk, {
        cacheControl: '3600',
        upsert: isLastChunk,
      });

    if (!isLastChunk) {
      await uploadChunk(file, end);
    }
  };

  const uploadPromises = files.map(async (file) => {
    try {
      await uploadChunk(file, 0);
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      throw error;
    }
  });

  await Promise.all(uploadPromises);
}

export async function createTransfer(code: string, fileCount: number): Promise<Transfer> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  const { data, error } = await supabase
    .from('transfers')
    .insert({
      code,
      file_count: fileCount,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTransfer(code: string): Promise<Transfer> {
  const { data, error } = await supabase
    .from('transfers')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error) throw error;
  if (!data) throw new Error('Transfer not found');
  
  if (new Date(data.expires_at) < new Date()) {
    throw new Error('Transfer has expired');
  }

  return data;
}

export async function getDownloadUrls(code: string): Promise<DownloadFile[]> {
  const { data: files, error: listError } = await supabase.storage
    .from('transfers')
    .list(code);

  if (listError) throw listError;
  if (!files?.length) throw new Error('No files found');

  const downloadUrls = await Promise.all(
    files.map(async (file) => {
      const { data } = await supabase.storage
        .from('transfers')
        .createSignedUrl(`${code}/${file.name}`, 300);

      return {
        name: file.name,
        url: data?.signedUrl || '',
        size: file.metadata?.size,
      };
    })
  );

  return downloadUrls.filter(file => file.url);
}

export async function cleanupExpiredTransfers(): Promise<void> {
  const { data: expiredTransfers, error: fetchError } = await supabase
    .from('transfers')
    .select('code')
    .lt('expires_at', new Date().toISOString());

  if (fetchError) throw fetchError;
  if (!expiredTransfers?.length) return;

  // Delete files from storage
  for (const transfer of expiredTransfers) {
    await supabase.storage
      .from('transfers')
      .remove([`${transfer.code}`]);
  }

  // Delete transfer records
  const { error: deleteError } = await supabase
    .from('transfers')
    .delete()
    .lt('expires_at', new Date().toISOString());

  if (deleteError) throw deleteError;
}