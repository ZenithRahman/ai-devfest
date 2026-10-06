import React from 'react';
import { TriangleAlert } from 'lucide-react';
import { Dialog, DialogClose } from './dialog';
import { Button } from './button';

export function NoticeDialog({ open, title, message, actionLabel = 'Got it', onClose }) {
  return (
    <Dialog open={open} onClose={onClose} className="max-w-sm p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <TriangleAlert size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {message && <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{message}</p>}
        </div>
        <DialogClose onClose={onClose} />
      </div>
      <div className="mt-5 flex justify-end">
        <Button size="sm" onClick={onClose}>
          {actionLabel}
        </Button>
      </div>
    </Dialog>
  );
}
