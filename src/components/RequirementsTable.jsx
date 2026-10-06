import React from 'react';
import { CheckCircle2, AlertCircle, Clock, XCircle, MinusCircle, X, Eye, FileWarning } from 'lucide-react';
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
  onPreviewFile
}) {
  const t = TRANSLATIONS[lang];

  const renderStatusBadge = (statusKey, description) => {
    const badge = (() => {
      switch (statusKey) {
        case STATUS.OK:
          return (
            <Badge variant="success">
              <CheckCircle2 size={11} />
              <span className={lang === 'bn' ? 'font-bn' : ''}>{t.statuses.OK}</span>
            </Badge>
          );
        case STATUS.MISSING:
          return (
            <Badge variant="danger">
              <XCircle size={11} />
              <span className={lang === 'bn' ? 'font-bn' : ''}>{t.statuses.MISSING}</span>
            </Badge>
          );
        case STATUS.EXPIRY_NEEDED:
          return (
            <Badge variant="warning">
              <Clock size={11} />
              <span className={lang === 'bn' ? 'font-bn' : ''}>{t.statuses.EXPIRY_NEEDED}</span>
            </Badge>
          );
        case STATUS.EXPIRED:
          return (
            <Badge variant="danger">
              <AlertCircle size={11} />
              <span className={lang === 'bn' ? 'font-bn' : ''}>{t.statuses.EXPIRED}</span>
            </Badge>
          );
        case STATUS.NOT_PROVIDED:
        default:
          return (
            <Badge variant="secondary">
              <MinusCircle size={11} />
              <span className={lang === 'bn' ? 'font-bn' : ''}>{t.statuses.NOT_PROVIDED}</span>
            </Badge>
          );
      }
    })();
    return (
      <span title={description || ''} className="inline-flex">
        {badge}
      </span>
    );
  };

  const fileToReqMap = {};
  const hashToReqMap = {};
  for (const [rId, fId] of Object.entries(matches)) {
    if (fId) {
      fileToReqMap[fId] = rId;
      const f = uploadedFiles.find(file => file.id === fId);
      if (f && f.hash) {
        hashToReqMap[f.hash] = rId;
      }
    }
  }

  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);

  if (sortedReqs.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 overflow-hidden p-10 text-center">
        <FileWarning size={28} className="text-muted-foreground" />
        <p className="text-sm font-medium">No requirements loaded</p>
        <p className="max-w-sm text-xs text-muted-foreground">Load a requirements.json file from the header to get started.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">{t.tableHeaders.order}</TableHead>
              <TableHead className={`min-w-[200px] ${lang === 'bn' ? 'font-bn text-xs normal-case' : ''}`}>{t.tableHeaders.docTitle}</TableHead>
              <TableHead className={`w-24 ${lang === 'bn' ? 'font-bn text-xs normal-case' : ''}`}>{t.tableHeaders.type}</TableHead>
              <TableHead className={`min-w-[240px] ${lang === 'bn' ? 'font-bn text-xs normal-case' : ''}`}>{t.tableHeaders.matchedFile}</TableHead>
              <TableHead className={`w-40 ${lang === 'bn' ? 'font-bn text-xs normal-case' : ''}`}>{t.tableHeaders.expiryDate}</TableHead>
              <TableHead className={`w-40 ${lang === 'bn' ? 'font-bn text-xs normal-case' : ''}`}>{t.tableHeaders.status}</TableHead>
              <TableHead className="w-16 text-center">{t.tableHeaders.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedReqs.map((req) => {
              const matchedFileId = matches[req.id] || '';
              const matchedFile = uploadedFiles.find(f => f.id === matchedFileId);
              const expiryValue = expiryDates[req.id] || '';
              const statusInfo = itemStatuses[req.id] || { status: STATUS.NOT_PROVIDED };

              const docTitle = lang === 'bn' ? (req.title_bn || req.title_en) : (req.title_en || req.title_bn);

              return (
                <TableRow key={req.id}>
                  <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                    {req.order}
                  </TableCell>

                  <TableCell>
                    <div className={`text-sm font-semibold ${lang === 'bn' ? 'font-bn text-base' : ''}`}>
                      {docTitle}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {req.id} {req.has_expiry ? '• Expiry Check' : ''}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className={`rounded border px-2 py-0.5 font-mono text-[11px] ${
                      req.mandatory
                        ? 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
                        : 'border-border bg-muted text-muted-foreground'
                    } ${lang === 'bn' ? 'font-bn text-xs' : ''}`}>
                      {req.mandatory ? t.types.mandatory : t.types.optional}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Select
                        value={matchedFileId}
                        onChange={(e) => onMatchChange(req.id, e.target.value)}
                        className={`h-8 text-xs ${matchedFile ? 'border-ring font-medium' : 'text-muted-foreground'}`}
                      >
                        <option value="">{t.matching.selectPlaceholder}</option>
                        {uploadedFiles.map((file) => {
                          const isMatchedToOther = fileToReqMap[file.id] && fileToReqMap[file.id] !== req.id;
                          const isDuplicateMatchedElsewhere = hashToReqMap[file.hash] && hashToReqMap[file.hash] !== req.id;
                          const isDisabled = isMatchedToOther || isDuplicateMatchedElsewhere;

                          let disabledLabel = '';
                          if (isMatchedToOther) disabledLabel = ' (Matched)';
                          else if (isDuplicateMatchedElsewhere) disabledLabel = ' (Duplicate prohibited)';

                          return (
                            <option key={file.id} value={file.id} disabled={isDisabled}>
                              {file.name} ({file.pageCount} pgs){disabledLabel}
                            </option>
                          );
                        })}
                      </Select>

                      {matchedFile && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onUnmatch(req.id)}
                          className="h-8 w-8 hover:text-red-500"
                          title={t.uploadPanel.unmatch}
                        >
                          <X size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {req.has_expiry ? (
                      matchedFile ? (
                        <Input
                          type="date"
                          value={expiryValue}
                          onChange={(e) => onExpiryChange(req.id, e.target.value)}
                          className={`h-8 font-mono text-xs ${!expiryValue ? 'border-amber-500/60' : ''}`}
                        />
                      ) : (
                        <span className="text-xs italic text-muted-foreground/70">Attach PDF</span>
                      )
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground/70">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {renderStatusBadge(statusInfo.status, statusInfo.message || t.statusDescriptions?.[statusInfo.status])}
                  </TableCell>

                  <TableCell className="text-center">
                    {matchedFile ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onPreviewFile(matchedFile)}
                        className="h-7 w-7"
                        title={t.uploadPanel.preview}
                      >
                        <Eye size={13} />
                      </Button>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
