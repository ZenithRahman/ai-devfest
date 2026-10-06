import React, { useEffect, useState } from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { Dialog, DialogClose } from './ui/dialog';
import { TRANSLATIONS } from '../constants/translations';

export function PDFPreviewModal({ lang = 'en', file, onClose }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
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

  return (
    <Dialog open={!!file} onClose={onClose} className="flex h-[85vh] max-w-5xl flex-col overflow-hidden">
      {file && (
        <>
          <div className="flex items-center justify-between border-b border-border bg-muted/50 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">
                  {file.name}
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {t.previewModal.subtitle.replace('{count}', file.pageCount)}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {blobUrl && (
                <a
                  href={blobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs transition-colors hover:bg-accent"
                >
                  <ExternalLink size={13} />
                  <span>{t.previewModal.openNewTab}</span>
                </a>
              )}
              <DialogClose onClose={onClose} />
            </div>
          </div>

          <div className="flex-1 bg-muted">
            {blobUrl ? (
              <iframe
                src={blobUrl}
                title={file.name}
                className="h-full w-full border-none bg-white"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                {t.previewModal.loading}
              </div>
            )}
          </div>
        </>
      )}
    </Dialog>
  );
}
