import React, { useMemo } from 'react';
import { Building2, User, CalendarDays, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { TRANSLATIONS } from '../constants/translations';

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d - now) / 86400000);
}

export function TenderBanner({ tender, lang, blockingCount, totalRequirements, okCount }) {
  const t = TRANSLATIONS[lang];
  const pct = totalRequirements > 0 ? Math.round((okCount / totalRequirements) * 100) : 0;

  const deadline = useMemo(() => {
    const n = daysUntil(tender.submission_deadline);
    if (n === null) return { label: tender.submission_deadline || '—', tone: 'text-muted-foreground' };
    if (n < 0) return { label: t.overdue, tone: 'text-red-600 dark:text-red-400' };
    if (n === 0) return { label: t.dueToday, tone: 'text-amber-600 dark:text-amber-400' };
    return { label: t.daysLeft.replace('{count}', n), tone: 'text-muted-foreground' };
  }, [t, tender.submission_deadline]);

  return (
    <Card className="mb-5 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <div className="min-w-0">
          <p className="truncate font-mono text-[13px] font-semibold tracking-tight">{tender.tender_id || '—'}</p>
          <p className="truncate text-[13px] text-muted-foreground" title={tender.title}>{tender.title || ''}</p>
        </div>
        {blockingCount > 0 ? (
          <Badge variant="danger"><AlertTriangle size={12} />{blockingCount} {t.blockingIssues}</Badge>
        ) : (
          <Badge variant="success"><CheckCircle2 size={12} />{t.readyToGenerate}</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 py-4 lg:grid-cols-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Building2 size={13} />{t.procuringEntity}</p>
          <p className="mt-1 truncate text-[13px] font-semibold">{tender.procuring_entity || '—'}</p>
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><User size={13} />{t.bidder}</p>
          <p className="mt-1 truncate text-[13px] font-semibold">{tender.bidder || '—'}</p>
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays size={13} />{t.deadline}</p>
          <p className="mt-1 font-mono text-[13px] font-semibold">{tender.submission_deadline || '—'}</p>
          <p className={`text-xs ${deadline.tone}`}>{deadline.label}</p>
        </div>
        <div className="col-span-2 min-w-0 lg:col-span-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xs text-muted-foreground">{t.statusSummary}</p>
            <p className="font-mono text-xs text-muted-foreground tabular-nums">{okCount}/{totalRequirements}</p>
          </div>
          <Progress value={pct} className="mt-2 h-1.5" />
          <p className="mt-1.5 text-xs text-muted-foreground">{t.ofTotal.replace('{total}', totalRequirements)}</p>
        </div>
      </div>
    </Card>
  );
}
