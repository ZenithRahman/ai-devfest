import React from 'react';
import { Download, FileSpreadsheet, Stamp, AlertCircle, CheckCircle2, Loader2, ListPlus } from 'lucide-react';
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
  onExportCsv,
  onOpenSealModal,
  hasDuplicateViolation = false
}) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl">
      {isGenerating && <Progress value={progress} className="h-0.5 rounded-none" />}
      <div className="mx-auto grid max-w-[1280px] gap-3 px-4 py-3 sm:px-6 lg:flex lg:items-center lg:justify-between">
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={onExportCsv} title="CSV">
            <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-500" />
            <span className={lang === 'bn' ? 'font-bn' : ''}>{t.packageBar.exportCsvBtn}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onOpenSealModal}>
            <Stamp size={14} className="text-muted-foreground" />
            <span className={lang === 'bn' ? 'font-bn' : ''}>{t.packageBar.sealBtn}</span>
          </Button>
          <button
            onClick={() => setIncludeToc(!includeToc)}
            className="ml-1 inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            aria-pressed={includeToc}
          >
            <ListPlus size={14} />
            <span className={lang === 'bn' ? 'font-bn' : ''}>{t.tocOption}</span>
            <span className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${includeToc ? 'bg-foreground' : 'bg-muted-foreground/30'}`}>
              <span className={`inline-block h-3 w-3 rounded-full bg-background shadow transition-transform ${includeToc ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end">
          {canGenerate ? (
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-500">
              <CheckCircle2 size={13} />{t.readyToGenerate}
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <AlertCircle size={13} />{t.packageBar.blockingWarning.replace('{count}', blockingCount)}
              </p>
              {hasDuplicateViolation && (
                <p className="text-[11px] text-purple-600 dark:text-purple-400">
                  {t.matching.duplicateBlockDetail}
                </p>
              )}
            </div>
          )}
          <Button
            size="default"
            disabled={!canGenerate || isGenerating}
            onClick={onGeneratePackage}
            className="h-10 w-full px-5 font-semibold sm:w-auto"
          >
            {isGenerating ? (
              <><Loader2 size={15} className="animate-spin" />{progressText || t.packageBar.generating}</>
            ) : (
              <><Download size={15} strokeWidth={2.25} />{t.packageBar.generateBtn}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
