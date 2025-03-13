export interface Transfer {
  id: string;
  code: string;
  file_count: number;
  expires_at: string;
  created_at: string;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

export type FileWithPreview = File & {
  preview?: string;
};

export interface UploadResponse {
  code: string;
  expires_at: string;
  file_count: number;
}

export interface DownloadFile {
  name: string;
  url: string;
  size?: number;
}