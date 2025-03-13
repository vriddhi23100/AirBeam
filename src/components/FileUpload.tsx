import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Folder } from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { uploadFiles, createTransfer } from '../lib/supabase';
import type { FileWithPreview } from '../lib/types';

export function FileUpload() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [accessCode, setAccessCode] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Process dropped items (files and folders)
    const processFiles = async (items: DataTransferItem[]) => {
      const allFiles: FileWithPreview[] = [];

      const readEntry = async (entry: FileSystemEntry) => {
        if (entry.isFile) {
          const fileEntry = entry as FileSystemFileEntry;
          return new Promise<File>((resolve) => {
            fileEntry.file((file) => resolve(file));
          });
        } else if (entry.isDirectory) {
          const dirEntry = entry as FileSystemDirectoryEntry;
          const dirReader = dirEntry.createReader();
          
          return new Promise<File[]>((resolve) => {
            const readEntries = () => {
              dirReader.readEntries(async (entries) => {
                if (entries.length === 0) {
                  resolve([]);
                } else {
                  const files = await Promise.all(entries.map(readEntry));
                  const flatFiles = files.flat();
                  readEntries(); // Continue reading if there are more entries
                  resolve(flatFiles);
                }
              });
            };
            readEntries();
          });
        }
        return [];
      };

      for (const item of items) {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          const files = await readEntry(entry);
          if (Array.isArray(files)) {
            allFiles.push(...files);
          } else {
            allFiles.push(files);
          }
        }
      }

      return allFiles;
    };

    const handleFiles = async (files: File[]) => {
      const filesWithPreview = files.map(file => 
        Object.assign(file, {
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        })
      );
      setFiles(prev => [...prev, ...filesWithPreview]);
    };

    // Check if it's a folder drop
    if (acceptedFiles[0]?.dataTransfer?.items) {
      const items = acceptedFiles[0].dataTransfer.items;
      processFiles(Array.from(items)).then(handleFiles);
    } else {
      // Regular file drop or selection
      handleFiles(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    noClick: false,
    noKeyboard: false
  });

  const removeFile = (index: number) => {
    const newFiles = [...files];
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview!);
    }
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const uploadAllFiles = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    setUploading(true);
    const code = uuidv4().substring(0, 6).toUpperCase();

    try {
      await uploadFiles(files, code);
      await createTransfer(code, files.length);
      
      setAccessCode(code);
      toast.success('Files uploaded successfully!');
      
      // Cleanup previews
      files.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
      setFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const getTotalSize = () => {
    const total = files.reduce((acc, file) => acc + file.size, 0);
    return (total / (1024 * 1024)).toFixed(2);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg mb-2">Drag & drop files or folders here, or click to select files</p>
        <p className="text-sm text-gray-500">Upload any number of files</p>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Selected Files:</h3>
            <span className="text-sm text-gray-500">
              Total Size: {getTotalSize()} MB
            </span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {file.type.includes('folder') ? (
                    <Folder className="w-5 h-5 text-gray-500" />
                  ) : (
                    <File className="w-5 h-5 text-gray-500" />
                  )}
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={uploadAllFiles}
            disabled={uploading}
            className="mt-4 w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium
              hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {uploading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                <span>Uploading...</span>
              </>
            ) : (
              'Upload Files'
            )}
          </button>
        </div>
      )}

      {accessCode && (
        <div className="mt-6 p-6 bg-green-50 rounded-lg text-center">
          <h3 className="text-lg font-semibold mb-2">Your Access Code:</h3>
          <div className="text-3xl font-mono font-bold text-green-600 mb-2">
            {accessCode}
          </div>
          <p className="text-sm text-gray-600">
            Share this code with the recipient to allow them to download the files.
            Files will be available for 24 hours.
          </p>
        </div>
      )}
    </div>
  );
}