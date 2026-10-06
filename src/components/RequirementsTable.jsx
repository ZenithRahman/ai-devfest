import React from 'react';
import { CheckCircle2, AlertCircle, Clock, XCircle, MinusCircle, X, Eye, FileCheck2, Sparkles } from 'lucide-react';
import { STATUS } from '../utils/statusEngine';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input, Select } from './ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { TRANSLATIONS } from '../constants/translations';

export function RequirementsTable({
  lang,
  requirements,
  matches,
  expiryDates,
  uploadedFiles,
  itemStatuses,
  onMatchChange,
  onExpiryChange,
  onUnmatch,
  onPreviewFile,
  onAutoMatch
}) {
  const t = TRANSLATIONS[lang];

  const badgeFor = (statusKey, description) => {
    const inner = (() => {
      switch (statusKey) {
        case STATUS.OK:
          return <Badge variant="success"><CheckCircle2 size={11} />{t.statuses.OK}</Badge>;
        case STATUS.MISSING:
          return <Badge variant="danger"><XCircle size={11} />{t.statuses.MISSING}</Badge>;
        case STATUS.EXPIRY_NEEDED:
          return <Badge variant="warning"><Clock size={11} />{t.statuses.EXPIRY_NEEDED}</Badge>;
        case STATUS.EXPIRED:
          return <Badge variant="danger"><AlertCircle size={11} />{t.statuses.EXPIRED}</Badge>;
        default:
          return <Badge variant="secondary"><MinusCircle size={11} />{t.statuses.NOT_PROVIDED}</Badge>;
      }
    })();
    return <span title={description || ''} className={`inline-flex ${lang === 'bn' ? 'font-bn' : ''}`}>{inner}</span>;
  };

  const fileToReqMap = {};
  const hashToReqMap = {};
  for (const [rId, fId] of Object.entries(matches)) {
    if (fId) {
      fileToReqMap[fId] = rId;
      const f = uploadedFiles.find((file) => file.id === fId);
      if (f?.hash) hashToReqMap[f.hash] = rId;
    }
  }

  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);
  const readyCount = sortedReqs.filter((r) => itemStatuses[r.id]?.status === STATUS.OK).length;

  const fileOptions = (reqId) =>
    uploadedFiles.map((file) => {
      const taken = fileToReqMap[file.id] && fileToReqMap[file.id] !== reqId;
      const dupTaken = hashToReqMap[file.hash] && hashToReqMap[file.hash] !== reqId;
      const disabled = taken || dupTaken;
      const suffix = taken ? ' · in use' : dupTaken ? ' · duplicate' : '';
      return (
        <option key={file.id} value={file.id} disabled={disabled}>
          {file.name} ({file.pageCount}p){suffix}
        </option>
      );
    });

  if (sortedReqs.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 p-10 text-center">
        <FileCheck2 size={26} className="text-muted-foreground" />
        <p className="text-sm font-semibold">No checklist loaded</p>
        <p className="max-w-sm text-[13px] text-muted-foreground">Open a tender file from the header to start verifying documents.</p>
      </Card>
    );
  }

  const rowEditor = (req) => {
    const matchedFileId = matches[req.id] || '';
    const matchedFile = uploadedFiles.find((f) => f.id === matchedFileId);
    const expiryValue = expiryDates[req.id] || '';
    return (
      <div className="grid gap-2.5">
        <div className="flex items-center gap-1.5">
          <Select
            value={matchedFileId}
            onChange={(e) => onMatchChange(req.id, e.target.value)}
            className={`h-9 text-[13px] ${matchedFile ? 'font-medium' : 'text-muted-foreground'}`}
            aria-label={t.tableHeaders.matchedFile}
          >
            <option value="">{t.matching.selectPlaceholder}</option>
            {fileOptions(req.id)}
          </Select>
          {matchedFile && (
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => onUnmatch(req.id)} title={t.uploadPanel.unmatch}>
              <X size={14} />
            </Button>
          )}
        </div>
        {req.has_expiry && (
          <div className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-xs text-muted-foreground">{t.tableHeaders.expiryDate}</span>
            {matchedFile ? (
              <Input
                type="date"
                value={expiryValue}
                onChange={(e) => onExpiryChange(req.id, e.target.value)}
                className={`h-9 text-[13px] ${!expiryValue ? 'border-amber-500/60' : ''}`}
              />
            ) : (
              <span className="text-xs text-muted-foreground/70">Attach a file first</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div>
          <h2 className={`text-sm font-semibold tracking-tight ${lang === 'bn' ? 'font-bn' : ''}`}>{t.checklistTitle}</h2>
          <p className="text-xs text-muted-foreground tabular-nums">
            {t.checklistSubtitle.replace('{ready}', readyCount).replace('{total}', sortedReqs.length)}
          </p>
        </div>
        {onAutoMatch && uploadedFiles.length > 0 && (
          <Button variant="secondary" size="sm" onClick={onAutoMatch}>
            <Sparkles size={13} className="text-purple-500" />{t.autoMatchBtn}
          </Button>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">#</TableHead>
              <TableHead>Document</TableHead>
              <TableHead className="w-28">File</TableHead>
              <TableHead className="w-36">Expiry</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-14 text-center">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedReqs.map((req) => {
              const matchedFileId = matches[req.id] || '';
              const matchedFile = uploadedFiles.find((f) => f.id === matchedFileId);
              const statusInfo = itemStatuses[req.id] || { status: STATUS.NOT_PROVIDED };
              const title = lang === 'bn' ? req.title_bn || req.title_en : req.title_en || req.title_bn;
              return (
                <TableRow key={req.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground tabular-nums">{String(req.order).padStart(2, '0')}</TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${req.mandatory ? 'bg-foreground' : 'bg-muted-foreground/40'}`} title={req.mandatory ? t.types.mandatory : t.types.optional} />
                      <div className="min-w-0">
                        <p className={`text-[13px] font-semibold leading-snug ${lang === 'bn' ? 'font-bn' : ''}`}>{title}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{req.id}{req.has_expiry ? ' · dated' : ''}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-[180px] items-center gap-1">
                      <Select value={matchedFileId} onChange={(e) => onMatchChange(req.id, e.target.value)} className="h-8 text-xs">
                        <option value="">{t.matching.selectPlaceholder}</option>
                        {fileOptions(req.id)}
                      </Select>
                      {matchedFile && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onUnmatch(req.id)} title={t.uploadPanel.unmatch}>
                          <X size={13} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {req.has_expiry ? (
                      matchedFile ? (
                        <Input type="date" value={expiryDates[req.id] || ''} onChange={(e) => onExpiryChange(req.id, e.target.value)} className="h-8 font-mono text-xs" />
                      ) : (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground/60">—</span>
                    )}
                  </TableCell>
                  <TableCell>{badgeFor(statusInfo.status, statusInfo.message)}</TableCell>
                  <TableCell className="text-center">
                    {matchedFile ? (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPreviewFile(matchedFile)} title={t.uploadPanel.preview}>
                        <Eye size={14} />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 p-3 md:hidden">
        {sortedReqs.map((req) => {
          const matchedFileId = matches[req.id] || '';
          const matchedFile = uploadedFiles.find((f) => f.id === matchedFileId);
          const statusInfo = itemStatuses[req.id] || { status: STATUS.NOT_PROVIDED };
          const title = lang === 'bn' ? req.title_bn || req.title_en : req.title_en || req.title_bn;
          return (
            <div key={req.id} className="rounded-lg border border-border bg-background p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">{String(req.order).padStart(2, '0')}</span>
                  <div className="min-w-0">
                    <p className={`text-[13px] font-semibold leading-snug ${lang === 'bn' ? 'font-bn' : ''}`}>{title}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{req.id} · {req.mandatory ? t.types.mandatory : t.types.optional}</p>
                  </div>
                </div>
                {badgeFor(statusInfo.status, statusInfo.message)}
              </div>
              <div className="mt-3">{rowEditor(req)}</div>
              {matchedFile && (
                <Button variant="secondary" size="sm" className="mt-2.5 w-full" onClick={() => onPreviewFile(matchedFile)}>
                  <Eye size={13} />{t.uploadPanel.preview} · {matchedFile.pageCount}p
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
