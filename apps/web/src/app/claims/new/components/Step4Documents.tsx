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
    <div className="space-y-6 brutal-animate-in">
      <h3 className="brutal-heading text-xl flex items-center gap-3">
        <span className="w-8 h-8 bg-brutal-lavender border-2 border-brutal-black flex items-center justify-center text-sm">4</span>
        DOCUMENTS
      </h3>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`
          border-[3px] border-dashed p-10 text-center transition-all
          ${dragOver
            ? 'border-brutal-blue bg-blue-50 shadow-brutal-sm -translate-x-[1px] -translate-y-[1px]'
            : 'border-brutal-black/30 hover:border-brutal-black'
          }
        `}
      >
        <div className="font-display text-4xl text-brutal-black/15 mb-3">&uarr;</div>
        <p className="font-mono text-sm text-brutal-black/70 mb-4">
          {isUploading ? '/// Uploading...' : 'Drag and drop files here'}
        </p>
        <input type="file" multiple onChange={handleFileInput} className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className="brutal-btn brutal-btn-secondary cursor-pointer inline-flex">
          Browse Files
        </label>
        <p className="font-mono text-[10px] text-brutal-black/40 mt-4 uppercase tracking-wider">
          Max 10MB per file &middot; Images, PDFs, Documents
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-brutal-black/70">
            Uploaded ({files.length})
          </h4>
          {files.map((f) => (
            <div key={f.id} className="flex items-center justify-between p-3 bg-brutal-mint/30 border-2 border-brutal-black">
              <span className="font-mono text-sm font-bold">{f.fileName}</span>
              <span className="brutal-tag bg-white text-[10px]">{f.fileType}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="brutal-btn brutal-btn-secondary">
          &larr; Back
        </button>
        <button type="button" onClick={onNext} className="brutal-btn brutal-btn-primary">
          Next: Review &rarr;
        </button>
        <span className="font-mono text-[10px] text-brutal-black/40 uppercase">Optional step</span>
      </div>
    </div>
  );
}
