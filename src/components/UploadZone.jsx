import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, Eye, AlertTriangle, CheckCircle, Copy, Layers } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { computeFileHash, formatBytes } from '../utils/cryptoUtils';
import { TRANSLATIONS } from '../constants/translations';

export function UploadZone({ 
  lang, 
  uploadedFiles, 
  onFilesAdded, 
  onFileRemoved, 
  onPreviewFile 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const t = TRANSLATIONS[lang];

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);
    setIsProcessing(true);

    const validNewFiles = [];
    const rejectedFileNames = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Task 4.2: "If a file is not a PDF, reject it and show a clear message."
      const isPdfByName = file.name.toLowerCase().endsWith('.pdf');
      const isPdfByType = file.type === 'application/pdf';

      if (!isPdfByName && !isPdfByType) {
        rejectedFileNames.push(file.name);
        continue;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        let pageCount = 1;
        
        // Count pages safely using pdf-lib
        try {
          const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          pageCount = pdfDoc.getPageCount();
        } catch (pdfErr) {
          console.warn(`Could not parse page count for ${file.name}:`, pdfErr);
          pageCount = 1; // Fallback
        }

        // Task 4.6: Compute SHA-256 hash for duplicate detection
        const hash = await computeFileHash(arrayBuffer);

        validNewFiles.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          pageCount,
          hash,
          arrayBuffer,
          fileObject: file
        });
      } catch (err) {
        console.error(`Failed to process file ${file.name}:`, err);
        rejectedFileNames.push(`${file.name} (Corrupted/Unreadable)`);
      }
    }

    if (rejectedFileNames.length > 0) {
      setErrorMessage(
        `${t.uploadPanel.nonPdfError} Rejected files: ${rejectedFileNames.join(', ')}`
      );
    }

    if (validNewFiles.length > 0) {
      onFilesAdded(validNewFiles);
    }

    setIsProcessing(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Group files by hash to mark duplicates (Task 4.6)
  const hashCount = {};
  for (const f of uploadedFiles) {
    if (f.hash) {
      hashCount[f.hash] = (hashCount[f.hash] || 0) + 1;
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--primary)" />
          <span>{t.uploadPanel.title}</span>
          <span style={{ 
            fontSize: '0.78rem', 
            background: 'rgba(99, 102, 241, 0.15)', 
            color: 'var(--primary)', 
            padding: '2px 8px', 
            borderRadius: '12px' 
          }}>
            {uploadedFiles.length}
          </span>
        </h2>
      </div>

      {/* Dropzone */}
      <div 
        className={`dropzone ${isDragging ? 'active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{ marginBottom: '16px' }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          multiple 
          accept=".pdf,application/pdf" 
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div style={{ 
          width: '44px', 
          height: '44px', 
          borderRadius: '50%', 
          background: 'rgba(99, 102, 241, 0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 12px auto',
          color: 'var(--primary)'
        }}>
          <Upload size={22} />
        </div>
        <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f1f5f9', margin: '0 0 4px 0' }}>
          {isProcessing ? "Processing files..." : t.uploadPanel.dropPrompt}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
          {t.uploadPanel.subPrompt}
        </p>
      </div>

      {/* Error / Rejection Message (Task 4.2) */}
      {errorMessage && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.12)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          borderRadius: 'var(--radius-md)', 
          padding: '10px 14px', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.8rem', color: '#fca5a5', lineHeight: 1.4 }}>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '520px', paddingRight: '4px' }}>
        {uploadedFiles.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '30px 16px', 
            color: 'var(--text-dim)', 
            fontSize: '0.85rem',
            border: '1px dashed rgba(255, 255, 255, 0.05)',
            borderRadius: 'var(--radius-md)'
          }}>
            {t.uploadPanel.noFiles}
          </div>
        ) : (
          uploadedFiles.map((file) => {
            const isDuplicate = hashCount[file.hash] > 1;

            return (
              <div 
                key={file.id}
                className="glass-panel-subtle"
                style={{ 
                  padding: '10px 12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: '10px',
                  border: isDuplicate ? '1px solid rgba(168, 85, 247, 0.4)' : undefined,
                  background: isDuplicate ? 'rgba(168, 85, 247, 0.05)' : undefined
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    background: 'rgba(99, 102, 241, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'var(--primary)'
                  }}>
                    <FileText size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ 
                      fontSize: '0.84rem', 
                      fontWeight: 600, 
                      color: '#f8fafc', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      maxWidth: '180px'
                    }} title={file.name}>
                      {file.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span>{file.pageCount} {t.uploadPanel.pages}</span>
                      <span>•</span>
                      <span>{formatBytes(file.size)}</span>
                      {isDuplicate && (
                        <>
                          <span>•</span>
                          <span className="badge badge-duplicate" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                            <Copy size={10} />
                            {t.uploadPanel.duplicateBadge}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Preview & Delete (Task 4.2) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  <button 
                    onClick={() => onPreviewFile(file)}
                    className="btn btn-secondary" 
                    style={{ padding: '6px', borderRadius: '6px' }}
                    title={t.uploadPanel.preview}
                  >
                    <Eye size={14} />
                  </button>
                  <button 
                    onClick={() => onFileRemoved(file.id)}
                    className="btn btn-danger-outline" 
                    style={{ padding: '6px', borderRadius: '6px' }}
                    title={t.uploadPanel.remove}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
