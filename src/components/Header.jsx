import React, { useEffect, useRef, useState } from 'react';
import { UploadCloud, Save, FolderOpen, RotateCcw, Sun, Moon, MoreHorizontal, X, FileUp } from 'lucide-react';
import { Button } from './ui/button';
import { TRANSLATIONS } from '../constants/translations';

function useDismiss(onClose) {
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [onClose]);
  return ref;
}

export function Header({
  lang,
  setLang,
  theme,
  onToggleTheme,
  onLoadRequirementsJson,
  onResetSample,
  onSaveState,
  onLoadState
}) {
  const jsonInputRef = useRef(null);
  const stateInputRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useDismiss(() => setMenuOpen(false));
  const t = TRANSLATIONS[lang];

  const handleJsonUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          onLoadRequirementsJson(parsed);
        } catch (err) {
          alert('Invalid JSON file format: ' + err.message);
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
    setMenuOpen(false);
    setMobileOpen(false);
  };

  const handleStateUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          onLoadState(parsed);
        } catch (err) {
          alert('Failed to parse project state: ' + err.message);
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
    setMenuOpen(false);
    setMobileOpen(false);
  };

  const menuItem = 'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] font-medium transition-colors hover:bg-accent hover:text-accent-foreground';

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <img src="/logo.svg" alt="TenderPack" className="h-8 w-8 shrink-0 text-foreground" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[15px] font-bold tracking-tight">{t.appTitle}</p>
            <p className={`hidden truncate text-xs text-muted-foreground sm:block ${lang === 'bn' ? 'font-bn' : ''}`}>{t.appSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <input ref={jsonInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleJsonUpload} />
          <input ref={stateInputRef} type="file" accept=".json" className="hidden" onChange={handleStateUpload} />

          {/* Desktop primary actions */}
          <div className="hidden items-center gap-1.5 md:flex">
            <Button variant="ghost" size="sm" onClick={() => jsonInputRef.current?.click()}>
              <FileUp size={14} />
              <span className={lang === 'bn' ? 'font-bn' : ''}>{t.openRequirements}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onSaveState}>
              <Save size={14} />
              <span className={lang === 'bn' ? 'font-bn' : ''}>{t.saveProgress}</span>
            </Button>
            <div className="relative" ref={menuRef}>
              <Button variant="ghost" size="icon" onClick={() => setMenuOpen((v) => !v)} aria-label={t.moreActions} title={t.moreActions}>
                <MoreHorizontal size={16} />
              </Button>
              {menuOpen && (
                <div className="absolute right-0 top-10 w-60 rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-xl">
                  <p className="px-3 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t.menuFile}</p>
                  <button className={menuItem} onClick={() => { setMenuOpen(false); jsonInputRef.current?.click(); }}>
                    <UploadCloud size={14} className="text-muted-foreground" /> {t.openRequirements}
                  </button>
                  <button className={menuItem} onClick={() => { setMenuOpen(false); onResetSample(); }}>
                    <RotateCcw size={14} className="text-muted-foreground" /> {t.loadSample}
                  </button>
                  <div className="mx-2 my-1.5 h-px bg-border" />
                  <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t.menuWorkspace}</p>
                  <button className={menuItem} onClick={() => { setMenuOpen(false); onSaveState(); }}>
                    <Save size={14} className="text-muted-foreground" /> {t.saveProgress}
                  </button>
                  <button className={menuItem} onClick={() => { setMenuOpen(false); stateInputRef.current?.click(); }}>
                    <FolderOpen size={14} className="text-muted-foreground" /> {t.reopenProgress}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu trigger */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label={t.moreActions}>
            <MoreHorizontal size={17} />
          </Button>

          <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </Button>

          <div className="flex items-center rounded-md border border-border bg-muted p-0.5">
            <button
              onClick={() => setLang('en')}
              className={`rounded px-2 py-1 text-xs font-semibold transition-all ${lang === 'en' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('bn')}
              className={`rounded px-2 py-1 font-bn text-xs font-semibold transition-all ${lang === 'bn' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              বাং
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-background p-4 pb-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">{t.moreActions}</p>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close">
                <X size={16} />
              </Button>
            </div>
            <div className="grid gap-1.5">
              <button className={`${menuItem} border border-border`} onClick={() => { setMobileOpen(false); jsonInputRef.current?.click(); }}>
                <UploadCloud size={15} /> {t.openRequirements}
              </button>
              <button className={`${menuItem} border border-border`} onClick={() => { setMobileOpen(false); onResetSample(); }}>
                <RotateCcw size={15} /> {t.loadSample}
              </button>
              <button className={`${menuItem} border border-border`} onClick={() => { setMobileOpen(false); onSaveState(); }}>
                <Save size={15} /> {t.saveProgress}
              </button>
              <button className={`${menuItem} border border-border`} onClick={() => { setMobileOpen(false); stateInputRef.current?.click(); }}>
                <FolderOpen size={15} /> {t.reopenProgress}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
