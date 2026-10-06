import React from 'react';
import { Download, Sparkles, FileSpreadsheet, Stamp, AlertCircle, CheckCircle2, Loader2, BookOpen } from 'lucide-react';
import { TRANSLATIONS } from '../constants/translations';

export function PackageGeneratorBar({
  lang,
  blockingCount,
  canGenerate,
  isGenerating,
  progress,
  progressText,
  includeToc,
  setIncludeToc,
  onGeneratePackage,
  onAutoMatch,
  onExportCsv,
  onOpenSealModal
}) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="bottom-dock">
      <div style={{ 
        maxWidth: '1440px', 
        margin: '0 auto', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        
        {/* Left: Quick Actions (Auto-match, CSV export, Seal, TOC checkbox) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          <button 
            className="btn btn-secondary" 
            onClick={onAutoMatch}
            title="Auto-match uploaded files by name heuristic"
          >
            <Sparkles size={16} color="#a855f7" />
            <span>{t.matching.autoMatchBtn}</span>
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={onExportCsv}
            title="Export requirements and matching checklist as CSV"
          >
            <FileSpreadsheet size={16} color="#10b981" />
            <span>{t.packageBar.exportCsvBtn}</span>
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={onOpenSealModal}
            title="Upload and place seal / signature stamp"
          >
            <Stamp size={16} color="#f59e0b" />
            <span>{t.packageBar.sealBtn}</span>
          </button>

          {/* Index / Table of Contents toggle */}
          <label style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '0.84rem', 
            color: 'var(--text-muted)',
            cursor: 'pointer',
            userSelect: 'none',
            marginLeft: '8px'
          }}>
            <input 
              type="checkbox" 
              checked={includeToc} 
              onChange={(e) => setIncludeToc(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: 'var(--primary)', width: '15px', height: '15px' }}
            />
            <BookOpen size={15} />
            <span>{t.tocOption}</span>
          </label>

        </div>

        {/* Right: Validation indicator & Main Generate Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          
          {/* Reason why disabled (Task 4.7: "and show why") */}
          {!canGenerate ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: '#f87171', 
              fontSize: '0.82rem',
              fontWeight: 500
            }}>
              <AlertCircle size={15} />
              <span>
                {t.packageBar.blockingWarning.replace('{count}', blockingCount)}
              </span>
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: '#34d399', 
              fontSize: '0.82rem',
              fontWeight: 500
            }}>
              <CheckCircle2 size={15} />
              <span>{t.readyToGenerate}</span>
            </div>
          )}

          {/* Generate Button (Task 4.7 & 4.8) */}
          <button 
            className="btn btn-primary"
            disabled={!canGenerate || isGenerating}
            onClick={onGeneratePackage}
            style={{ 
              padding: '11px 22px', 
              fontSize: '0.94rem', 
              letterSpacing: '-0.01em',
              minWidth: '220px'
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{progressText || t.packageBar.generating}</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>{t.packageBar.generateBtn}</span>
              </>
            )}
          </button>

        </div>

      </div>

      {/* Progress Bar when generating */}
      {isGenerating && (
        <div style={{ 
          maxWidth: '1440px', 
          margin: '12px auto 0 auto', 
          background: 'rgba(255, 255, 255, 0.08)', 
          borderRadius: '4px', 
          height: '4px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${progress}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, var(--primary), var(--accent-cyan))', 
            transition: 'width 0.3s ease' 
          }} />
        </div>
      )}

    </div>
  );
}
