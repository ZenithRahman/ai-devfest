import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

/**
 * Lightweight shadcn-style Dialog — no extra deps.
 * Handles: overlay click close, Escape close, body scroll lock.
 */
export function Dialog({ open, onClose, children, className }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full rounded-xl border border-border bg-card text-card-foreground shadow-2xl',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn('flex items-start justify-between gap-4 p-6 pb-4', className)} {...props} />;
}

export function DialogTitle({ className, ...props }) {
  return <h2 className={cn('text-base font-semibold tracking-tight', className)} {...props} />;
}

export function DialogDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground leading-relaxed', className)} {...props} />;
}

export function DialogFooter({ className, ...props }) {
  return <div className={cn('flex items-center justify-end gap-2 p-6 pt-4', className)} {...props} />;
}

export function DialogClose({ onClose, className }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClose} className={className} aria-label="Close dialog">
      <X size={16} />
    </Button>
  );
}
