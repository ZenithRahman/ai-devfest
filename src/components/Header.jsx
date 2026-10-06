import React, { useRef } from 'react';
import { FileText, UploadCloud, Save, FolderOpen, RotateCcw, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { TRANSLATIONS } from '../constants/translations';

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
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">

        {/* Brand & Title */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground shadow-sm">
            <FileText size={18} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className={`truncate text-sm font-bold tracking-tight md:text-base ${lang === 'bn' ? 'font-bn' : ''}`}>
                {t.appTitle}
              </h1>
              <span className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground sm:inline">
                AI DevFest
              </span>
            </div>
            <p className={`hidden truncate text-xs text-muted-foreground sm:block ${lang === 'bn' ? 'font-bn' : ''}`}>
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <input
            type="file"
            ref={jsonInputRef}
            accept=".json,application/json"
            className="hidden"
            onChange={handleJsonUpload}
          />
          <input
            type="file"
            ref={stateInputRef}
            accept=".json"
            className="hidden"
            onChange={handleStateUpload}
          />

          <Button
            variant="secondary"
            size="sm"
            onClick={() => jsonInputRef.current?.click()}
            title="Upload custom requirements.json"
            className={lang === 'bn' ? 'font-bn' : ''}
          >
            <UploadCloud size={14} />
            <span className="hidden md:inline">{t.loadRequirements}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onResetSample}
            title="Reset to default sample pack data"
            className={lang === 'bn' ? 'font-bn' : ''}
          >
            <RotateCcw size={13} />
            <span className="hidden lg:inline">{t.resetSample}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onSaveState}
            title="Save current progress as JSON file"
            className={`hidden sm:inline-flex ${lang === 'bn' ? 'font-bn' : ''}`}
          >
            <Save size={13} />
            <span className="hidden lg:inline">{t.saveState}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => stateInputRef.current?.click()}
            title="Reopen previously saved project file"
            className={`hidden sm:inline-flex ${lang === 'bn' ? 'font-bn' : ''}`}
          >
            <FolderOpen size={13} />
            <span className="hidden lg:inline">{t.loadState}</span>
          </Button>

          {/* Theme toggle */}
          <Button
            variant="secondary"
            size="icon"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to Vercel dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </Button>

          {/* Language Switcher (Task 4.9) */}
          <div className="ml-1 flex items-center rounded-md border border-border bg-muted p-0.5">
            <button
              onClick={() => setLang('en')}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                lang === 'en'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('bn')}
              className={`rounded px-2.5 py-1 font-bn text-xs font-semibold transition-all ${
                lang === 'bn'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              বাংলা
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
