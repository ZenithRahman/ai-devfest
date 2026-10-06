import React from 'react';
import { FileText, Building2, User, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { TRANSLATIONS } from '../constants/translations';

export function TenderBanner({ tender, lang, blockingCount, totalRequirements, okCount }) {
  const t = TRANSLATIONS[lang];

  return (
    <Card className="mb-6 p-5">
      <div className="grid grid-cols-1 items-center gap-5 sm:grid-cols-2 lg:grid-cols-5">

        {/* Tender ID & Title */}
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <FileText size={13} />
            <span>{t.tenderId}</span>
          </div>
          <div className="truncate font-mono text-base font-bold tracking-tight">
            {tender.tender_id || 'N/A'}
          </div>
          <div className="truncate text-xs text-muted-foreground" title={tender.title}>
            {tender.title}
          </div>
        </div>

        {/* Procuring Entity */}
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <Building2 size={13} />
            <span>{t.procuringEntity}</span>
          </div>
          <div className="truncate text-sm font-semibold">
            {tender.procuring_entity || 'N/A'}
          </div>
        </div>

        {/* Bidder */}
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <User size={13} />
            <span>{t.bidder}</span>
          </div>
          <div className="truncate text-sm font-semibold">
            {tender.bidder || 'N/A'}
          </div>
        </div>

        {/* Submission Deadline */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-amber-600 dark:text-amber-500">
            <Calendar size={13} />
            <span>{t.deadline}</span>
          </div>
          <div className="inline-block rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-sm font-bold text-amber-700 dark:text-amber-400">
            {tender.submission_deadline || 'N/A'}
          </div>
        </div>

        {/* Live Status Badge Summary */}
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/60 p-3">
          <div>
            <div className={`text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${lang === 'bn' ? 'font-bn' : ''}`}>
              {t.statusSummary}
            </div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">{okCount}</span>
              <span className="font-mono text-xs text-muted-foreground">/ {totalRequirements} OK</span>
            </div>
          </div>

          <div>
            {blockingCount > 0 ? (
              <Badge variant="danger" className="animate-pulse py-1 normal-case">
                <AlertCircle size={12} />
                <span className={lang === 'bn' ? 'font-bn' : ''}>{blockingCount} {t.blockingIssues}</span>
              </Badge>
            ) : (
              <Badge variant="success" className="py-1 normal-case">
                <CheckCircle2 size={12} />
                <span>Ready</span>
              </Badge>
            )}
          </div>
        </div>

      </div>
    </Card>
  );
}
