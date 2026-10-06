import React, { useState, useRef } from 'react';
import { Upload, Stamp, Check, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from './ui/dialog';
import { TRANSLATIONS } from '../constants/translations';

export function SealSignatureModal({
  open,
  lang,
  sealData,
  onSaveSeal,
  onClose
}) {
  const [imagePreview, setImagePreview] = useState(sealData.previewUrl || null);
  const [imageBytes, setImageBytes] = useState(sealData.bytes || null);
  const [targetPages, setTargetPages] = useState(sealData.targetPages || 'all');
  const fileInputRef = useRef(null);
  const t = TRANSLATIONS[lang];

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.png') && file.type !== 'image/png') {
      alert('Please upload a PNG image for seal or signature.');
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const previewUrl = URL.createObjectURL(file);

    setImageBytes(uint8);
    setImagePreview(previewUrl);
  };

  const handleApply = () => {
    onSaveSeal({
      bytes: imageBytes,
      previewUrl: imagePreview,
      targetPages
    });
    onClose();
  };

  const handleClear = () => {
    setImageBytes(null);
    setImagePreview(null);
    onSaveSeal({
      bytes: null,
      previewUrl: null,
      targetPages: 'all'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} className="max-w-lg p-6">
      <DialogHeader className="p-0 pb-2">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted">
              <Stamp size={16} />
            </div>
            <DialogTitle className={lang === 'bn' ? 'font-bn' : ''}>
              {t.sealModal.title}
            </DialogTitle>
          </div>
          <DialogClose onClose={onClose} />
        </div>
        <DialogDescription className={lang === 'bn' ? 'font-bn' : ''}>
          {t.sealModal.description}
        </DialogDescription>
      </DialogHeader>

      {/* Upload PNG */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="mb-5 cursor-pointer rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center transition-colors hover:border-muted-foreground/50 hover:bg-muted/70"
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png"
          className="hidden"
          onChange={handleImageUpload}
        />
        {imagePreview ? (
          <div>
            <img
              src={imagePreview}
              alt="Seal Preview"
              className="mx-auto mb-2 max-h-24 max-w-[160px] object-contain drop-shadow"
            />
            <div className="font-mono text-xs font-medium text-emerald-600 dark:text-emerald-400">
              PNG Stamp Ready (Click to change)
            </div>
          </div>
        ) : (
          <div>
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
              <Upload size={18} />
            </div>
            <div className={`text-xs font-semibold ${lang === 'bn' ? 'font-bn' : ''}`}>
              {t.sealModal.uploadPrompt}
            </div>
            <div className="mt-1 font-mono text-[11px] text-muted-foreground">
              Transparent PNG recommended
            </div>
          </div>
        )}
      </div>

      {/* Target Pages */}
      <div className="mb-6">
        <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground ${lang === 'bn' ? 'font-bn' : ''}`}>
          {t.sealModal.selectPages}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'all', label: t.sealModal.allPages },
            { id: 'cover', label: t.sealModal.coverOnly },
            { id: 'last', label: t.sealModal.lastPage }
          ].map(opt => (
            <label
              key={opt.id}
              className={`cursor-pointer rounded-md border px-3 py-2 text-center text-xs font-medium transition-all ${
                targetPages === opt.id
                  ? 'border-primary bg-primary font-bold text-primary-foreground'
                  : 'border-border bg-secondary text-muted-foreground hover:border-muted-foreground/50'
              } ${lang === 'bn' ? 'font-bn' : ''}`}
            >
              <input
                type="radio"
                name="targetPages"
                value={opt.id}
                checked={targetPages === opt.id}
                onChange={(e) => setTargetPages(e.target.value)}
                className="hidden"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <DialogFooter className="p-0">
        <div className="flex w-full items-center justify-between gap-2">
          {imagePreview ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClear}
              className={lang === 'bn' ? 'font-bn' : ''}
            >
              <Trash2 size={13} />
              <span>{t.sealModal.clear}</span>
            </Button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className={lang === 'bn' ? 'font-bn' : ''}
            >
              {t.sealModal.close}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleApply}
              className={lang === 'bn' ? 'font-bn' : ''}
            >
              <Check size={14} />
              <span>{t.sealModal.apply}</span>
            </Button>
          </div>
        </div>
      </DialogFooter>
    </Dialog>
  );
}
