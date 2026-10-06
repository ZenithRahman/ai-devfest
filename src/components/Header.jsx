import React, { useRef } from 'react';
import { FileText, Globe, UploadCloud, Save, FolderOpen, RefreshCw } from 'lucide-react';
import { TRANSLATIONS } from '../constants/translations';

export function Header({ 
  lang, 
  setLang, 
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
    <header className="glass-panel" style={{ padding: '16px 24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <FileText size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              {t.appTitle}
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Hidden file inputs */}
          <input 
            type="file" 
            ref={jsonInputRef} 
            accept=".json,application/json" 
            style={{ display: 'none' }} 
            onChange={handleJsonUpload}
          />
          <input 
            type="file" 
            ref={stateInputRef} 
            accept=".json" 
            style={{ display: 'none' }} 
            onChange={handleStateUpload}
          />

          {/* Load requirements.json */}
          <button 
            className="btn btn-secondary" 
            onClick={() => jsonInputRef.current?.click()}
            title="Upload custom requirements.json"
          >
            <UploadCloud size={16} />
            <span>{t.loadRequirements}</span>
          </button>

          {/* Load sample tender */}
          <button 
            className="btn btn-secondary" 
            onClick={onResetSample}
            title="Reset to default sample pack data"
          >
            <RefreshCw size={15} />
            <span>{t.resetSample}</span>
          </button>

          {/* Save / Reopen project */}
          <button 
            className="btn btn-secondary" 
            onClick={onSaveState}
            title="Save current progress as JSON file"
          >
            <Save size={15} />
            <span>{t.saveState}</span>
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={() => stateInputRef.current?.click()}
            title="Reopen previously saved project file"
          >
            <FolderOpen size={15} />
            <span>{t.loadState}</span>
          </button>

          {/* Language Switcher (Task 4.9) */}
          <div style={{ 
            display: 'flex', 
            background: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: 'var(--radius-md)',
            padding: '3px',
            border: '1px solid var(--border-color)',
            marginLeft: '6px'
          }}>
            <button 
              onClick={() => setLang('en')}
              style={{
                border: 'none',
                background: lang === 'en' ? 'var(--primary)' : 'transparent',
                color: lang === 'en' ? '#fff' : 'var(--text-muted)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('bn')}
              style={{
                border: 'none',
                background: lang === 'bn' ? 'var(--primary)' : 'transparent',
                color: lang === 'bn' ? '#fff' : 'var(--text-muted)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-bn)',
                transition: 'all 0.2s'
              }}
            >
              বাংলা
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
