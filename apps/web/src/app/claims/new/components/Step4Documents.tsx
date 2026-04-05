'use client';

import { useState, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Step4Props {
  claimId: string | null;
  createDraftClaim: () => Promise<string>;
  onNext: () => void;
  onBack: () => void;
}

interface UploadedFile {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
}

export function Step4Documents({ claimId, createDraftClaim, onNext, onBack }: Step4Props) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const id = await createDraftClaim();
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/claims/${id}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const doc = await res.json();
        setFiles((prev) => [...prev, doc]);
      }
    } finally {
      setIsUploading(false);
    }
  }, [createDraftClaim]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(uploadFile);
  }, [uploadFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach(uploadFile);
  }, [uploadFile]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Step 4: Supporting Documents</h3>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <p className="text-gray-600 mb-2">
          {isUploading ? 'Uploading...' : 'Drag and drop files here, or click to browse'}
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors"
        >
          Browse Files
        </label>
        <p className="text-xs text-gray-400 mt-2">Max 10MB per file. Supports images, PDFs, and common document formats.</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
          {files.map((f) => (
            <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">{f.fileName}</span>
              <span className="text-xs text-gray-400">{f.fileType}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button type="button" onClick={onNext} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Next: Review
        </button>
        <span className="text-xs text-gray-400">Documents are optional. You can skip this step.</span>
      </div>
    </div>
  );
}
