import React, { useState } from 'react';
import { Download, Search, File as FileIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTransfer, getDownloadUrls } from '../lib/supabase';
import type { DownloadFile } from '../lib/types';

export function FileDownload() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<DownloadFile[]>([]);

  const fetchFiles = async () => {
    if (!code.trim()) {
      toast.error('Please enter an access code');
      return;
    }

    setLoading(true);

    try {
      const transfer = await getTransfer(code);
      const downloadFiles = await getDownloadUrls(transfer.code);
      setFiles(downloadFiles);
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Download Files</h2>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter access code"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={6}
          />
          <button
            onClick={fetchFiles}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 
              disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Search className="w-5 h-5 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Find Files</span>
              </>
            )}
          </button>
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Available Files:</h3>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                    {file.size && (
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    )}
                  </div>
                  <a
                    href={file.url}
                    download={file.name}
                    className="flex items-center space-x-2 text-blue-500 hover:text-blue-600"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}