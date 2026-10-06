import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, Eye, AlertTriangle, Copy, Layers } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { computeFileHash, formatBytes } from '../utils/cryptoUtils';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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

      const isPdfByName = file.name.toLowerCase().endsWith('.pdf');
      const isPdfByType = file.type === 'application/pdf';

      if (!isPdfByName && !isPdfByType) {
        rejectedFileNames.push(file.name);
        continue;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        let pageCount = 1;

        try {
          const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          pageCount = pdfDoc.getPageCount();
        } catch (pdfErr) {
          console.warn(`Could not parse page count for ${file.name}:`, pdfErr);
          pageCount = 1;
        }

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
        rejectedFileNames.push(`${file.name} (Corrupted)`);
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

  // Group files by hash to mark duplicates (Task 4.6)
  const hashCount = {};
  for (const f of uploadedFiles) {
    if (f.hash) {
      hashCount[f.hash] = (hashCount[f.hash] || 0) + 1;
    }
  }

  return (
    <Card className="flex h-full flex-col p-5">

      {/* Title */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className={`flex items-center gap-2 text-sm font-bold ${lang === 'bn' ? 'font-bn text-base' : ''}`}>
          <Layers size={16} />
          <span>{t.uploadPanel.title}</span>
        </h2>
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
          {uploadedFiles.length}
        </span>
      </div>

      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-4 cursor-pointer rounded-lg border border-dashed p-6 text-center transition-all ${
          isDragging
            ? 'border-primary bg-accent'
            : 'border-border bg-muted/40 hover:border-muted-foreground/50 hover:bg-muted/70'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
          <Upload size={18} />
        </div>
        <p className={`mb-1 text-xs font-semibold md:text-sm ${lang === 'bn' ? 'font-bn' : ''}`}>
          {isProcessing ? 'Processing files...' : t.uploadPanel.dropPrompt}
        </p>
        <p className={`text-[11px] text-muted-foreground ${lang === 'bn' ? 'font-bn' : ''}`}>
          {t.uploadPanel.subPrompt}
        </p>
      </div>

      {/* Error / Non-PDF Alert */}
      {errorMessage && (
        <div className="mb-4 flex items-start gap-2.5 rounded-md border border-red-500/30 bg-red-500/10 p-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <div className="text-xs leading-relaxed text-red-600 dark:text-red-400">
            {errorMessage}
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      <div className="max-h-[500px] flex-1 space-y-2 overflow-y-auto pr-1">
        {uploadedFiles.length === 0 ? (
          <div className={`rounded-lg border border-dashed border-border px-4 py-10 text-center text-xs text-muted-foreground ${lang === 'bn' ? 'font-bn' : ''}`}>
            {t.uploadPanel.noFiles}
          </div>
        ) : (
          uploadedFiles.map((file) => {
            const isDuplicate = hashCount[file.hash] > 1;

            return (
              <div
                key={file.id}
                className={`flex items-center justify-between gap-3 rounded-lg border p-2.5 transition-all ${
                  isDuplicate
                    ? 'border-purple-500/40 bg-purple-500/5'
                    : 'border-border bg-muted/40 hover:border-muted-foreground/40'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                    <FileText size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="max-w-[170px] truncate text-xs font-semibold" title={file.name}>
                      {file.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                      <span>{file.pageCount} pgs</span>
                      <span>•</span>
                      <span>{formatBytes(file.size)}</span>
                      {isDuplicate && (
                        <>
                          <span>•</span>
                          <Badge variant="duplicate" className="px-1.5 py-0 text-[10px]">
                            <Copy size={9} />
                            <span>DUP</span>
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPreviewFile(file)}
                    className="h-7 w-7"
                    title={t.uploadPanel.preview}
                  >
                    <Eye size={13} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFileRemoved(file.id)}
                    className="h-7 w-7 hover:text-red-500"
                    title={t.uploadPanel.remove}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </Card>
  );
}
