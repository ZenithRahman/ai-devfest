import React, { useEffect, useState } from 'react';
import { X, ExternalLink, FileText } from 'lucide-react';

export function PDFPreviewModal({ file, onClose }) {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (!file || !file.arrayBuffer) return;
    const blob = new Blob([file.arrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!file) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ width: '90%', maxWidth: '1000px', height: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--border-color)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                {file.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {file.pageCount} pages • PDF Preview
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {blobUrl && (
              <a 
                href={blobUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <ExternalLink size={14} />
                <span>Open in New Tab</span>
              </a>
            )}
            <button 
              onClick={onClose}
              className="btn btn-secondary" 
              style={{ padding: '6px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Iframe Preview */}
        <div style={{ flex: 1, background: '#1e293b' }}>
          {blobUrl ? (
            <iframe 
              src={blobUrl} 
              title={file.name} 
              style={{ width: '100%', height: '100%', border: 'none' }} 
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Loading PDF preview...
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
