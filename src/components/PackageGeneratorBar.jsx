import React from 'react';
import { Download, Sparkles, FileSpreadsheet, Stamp, AlertCircle, CheckCircle2, Loader2, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { TRANSLATIONS } from '../constants/translations';

export function PackageGeneratorBar({
  lang,
  blockingCount,
  canGenerate,
  isGenerating,
  progress,
  progressText,
  includeToc,
  setIncludeToc,
  onGeneratePackage,
  onAutoMatch,
  onExportCsv,
  onOpenSealModal
}) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 px-4 py-3.5 shadow-[0_-10px_30px_rgba(0,0,0,0.15)] backdrop-blur-xl dark:shadow-[0_-10px_30px_rgba(0,0,0,0.8)] sm:px-6">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4">

        {/* Left Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onAutoMatch}
            title="Auto-match uploaded files by filename"
            className={lang === 'bn' ? 'font-bn' : ''}
          >
            <Sparkles size={14} className="text-purple-500" />
            <span>{t.matching.autoMatchBtn}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onExportCsv}
            title="Export checklist as CSV"
            className={lang === 'bn' ? 'font-bn' : ''}
          >
            <FileSpreadsheet size={14} className="text-emerald-500" />
            <span>{t.packageBar.exportCsvBtn}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenSealModal}
            title="Upload and place seal / stamp"
            className={lang === 'bn' ? 'font-bn' : ''}
          >
            <Stamp size={14} className="text-amber-500" />
            <span>{t.packageBar.sealBtn}</span>
          </Button>

          {/* Table of contents toggle */}
          <label className="ml-2 inline-flex cursor-pointer select-none items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={includeToc}
              onChange={(e) => setIncludeToc(e.target.checked)}
              className="h-3.5 w-3.5 cursor-pointer accent-black dark:accent-white"
            />
            <BookOpen size={13} />
            <span className={lang === 'bn' ? 'font-bn' : ''}>{t.tocOption}</span>
          </label>
        </div>

        {/* Right Action & Validation Status */}
        <div className="flex flex-wrap items-center gap-3.5">
          {!canGenerate ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-red-500">
              <AlertCircle size={14} />
              <span className={lang === 'bn' ? 'font-bn' : ''}>
                {t.packageBar.blockingWarning.replace('{count}', blockingCount)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={14} />
              <span className={lang === 'bn' ? 'font-bn' : ''}>{t.readyToGenerate}</span>
            </div>
          )}

          <Button
            variant="default"
            size="default"
            disabled={!canGenerate || isGenerating}
            onClick={onGeneratePackage}
            className={`min-w-[210px] font-bold ${lang === 'bn' ? 'font-bn' : ''}`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{progressText || t.packageBar.generating}</span>
              </>
            ) : (
              <>
                <Download size={16} strokeWidth={2.5} />
                <span>{t.packageBar.generateBtn}</span>
              </>
            )}
          </Button>
        </div>

      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="mx-auto mt-3 max-w-[1440px]">
          <Progress value={progress} />
        </div>
      )}
    </div>
  );
}
