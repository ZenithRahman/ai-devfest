import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, Eye, AlertTriangle, Copy } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { computeFileHash, formatBytes } from '../utils/cryptoUtils';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TRANSLATIONS } from '../constants/translations';

const MAX_FILES = 30;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024;

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
    const skippedByLimit = [];

    const existingTotal = uploadedFiles.reduce((sum, f) => sum + (f.size || 0), 0);
    let runningTotal = existingTotal;
    let runningCount = uploadedFiles.length;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      const isPdfByName = file.name.toLowerCase().endsWith('.pdf');
      const isPdfByType = file.type === 'application/pdf';

      if (!isPdfByName && !isPdfByType) {
        rejectedFileNames.push(file.name);
        continue;
      }

      if (runningCount + 1 > MAX_FILES || runningTotal + file.size > MAX_TOTAL_BYTES) {
        skippedByLimit.push(file.name);
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
        runningCount += 1;
        runningTotal += file.size;
      } catch (err) {
        console.error(`Failed to process file ${file.name}:`, err);
        rejectedFileNames.push(`${file.name} (Corrupted)`);
      }
    }

    const messages = [];
    if (rejectedFileNames.length > 0) {
      messages.push(`${t.uploadPanel.nonPdfError} Rejected files: ${rejectedFileNames.join(', ')}`);
    }
    if (skippedByLimit.length > 0) {
      messages.push(t.uploadPanel.limitError.replace('{names}', skippedByLimit.join(', ')));
    }
    if (messages.length > 0) {
      setErrorMessage(messages.join(' '));
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
    <Card className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className={`text-sm font-semibold tracking-tight ${lang === 'bn' ? 'font-bn' : ''}`}>
          {t.uploadPanel.title}
        </h2>
        <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground tabular-nums">
          {uploadedFiles.length}
        </span>
      </div>

      <div className="p-4">
      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDragEnd={() => setIsDragging(false)}
        className={`rounded-lg border border-dashed p-5 text-center transition-colors ${
          isDragging ? 'border-foreground bg-accent' : 'border-border bg-muted/40'
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
        <div className="mx-auto mb-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
          <Upload size={16} />
        </div>
        <p className={`text-[13px] font-semibold ${lang === 'bn' ? 'font-bn' : ''}`}>
          {isProcessing ? t.uploadPanel.processing : t.uploadPanel.dropPrompt}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{t.uploadPanel.subPrompt}</p>
        <Button size="sm" variant="secondary" className="mt-3" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
          {t.uploadPanel.browseBtn}
        </Button>
      </div>

      {/* Error / Non-PDF Alert */}
      {errorMessage && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-red-500/25 bg-red-500/[0.07] p-3">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-xs leading-relaxed text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        </div>
      )}
      </div>

      {/* Uploaded Files List */}
      <div className="max-h-[420px] flex-1 space-y-1.5 overflow-y-auto px-4 pb-4">
        {uploadedFiles.length === 0 ? (
          <p className={`rounded-lg bg-muted/50 px-4 py-6 text-center text-xs leading-relaxed text-muted-foreground ${lang === 'bn' ? 'font-bn' : ''}`}>
            {t.uploadPanel.noFiles}
          </p>
        ) : (
          uploadedFiles.map((file) => {
            const isDuplicate = hashCount[file.hash] > 1;

            return (
              <div
                key={file.id}
                className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 ${
                  isDuplicate ? 'border-purple-500/40 bg-purple-500/[0.06]' : 'border-border'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <FileText size={14} className="text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium" title={file.name}>
                      {file.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground tabular-nums">
                      <span>{file.pageCount}p · {formatBytes(file.size)}</span>
                      {isDuplicate && (
                        <Badge variant="duplicate" className="px-1.5 py-0 text-[10px] normal-case">
                          <Copy size={9} />{t.uploadPanel.duplicateBadge}
                        </Badge>
                      )}
                    </p>
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
