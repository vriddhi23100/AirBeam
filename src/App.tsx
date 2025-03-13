import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { FileDownload } from './components/FileDownload';
import { Upload, Download } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

function App() {
  const [mode, setMode] = useState<'upload' | 'download'>('upload');

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Secure File Transfer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share files securely with a unique access code. No registration required.
            Files are automatically deleted after 24 hours.
          </p>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setMode('upload')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors
              ${mode === 'upload'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            <Upload className="w-5 h-5" />
            <span>Upload Files</span>
          </button>
          <button
            onClick={() => setMode('download')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors
              ${mode === 'download'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            <Download className="w-5 h-5" />
            <span>Download Files</span>
          </button>
        </div>

        {mode === 'upload' ? <FileUpload /> : <FileDownload />}

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Files are automatically deleted after 24 hours for security.</p>
          <p>Maximum file size: 100MB per file</p>
        </footer>
      </div>
    </div>
  );
}

export default App;