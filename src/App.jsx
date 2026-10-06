import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Header } from './components/Header';
import { TenderBanner } from './components/TenderBanner';
import { RequirementsTable } from './components/RequirementsTable';
import { UploadZone } from './components/UploadZone';
import { PackageGeneratorBar } from './components/PackageGeneratorBar';
import { PDFPreviewModal } from './components/PDFPreviewModal';
import { SealSignatureModal } from './components/SealSignatureModal';

import { DEFAULT_TENDER_DATA } from './constants/defaultTender';
import { NoticeDialog } from './components/ui/notice-dialog';
import { TRANSLATIONS } from './constants/translations';
import { evaluateAllStatuses, STATUS } from './utils/statusEngine';
import { generateTenderPackage, downloadPdfBlob } from './utils/pdfGenerator';
import { suggestMatches } from './utils/autoMatcher';
import { exportChecklistToCsv } from './utils/exportUtils';

export default function App() {
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('tender_builder_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });
  const [tender, setTender] = useState(DEFAULT_TENDER_DATA.tender);
  const [requirements, setRequirements] = useState(DEFAULT_TENDER_DATA.requirements);
  
  // Staged files & matching state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [matches, setMatches] = useState({});
  const [expiryDates, setExpiryDates] = useState({});
  
  // Package generator & UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [includeToc, setIncludeToc] = useState(true);
  
  // Modals & Seals
  const [previewFile, setPreviewFile] = useState(null);
  const [isSealModalOpen, setIsSealModalOpen] = useState(false);
  const [sealData, setSealData] = useState({ bytes: null, previewUrl: null, targetPages: 'all' });
  const [notice, setNotice] = useState({ open: false, title: '', message: '' });

  const showNotice = (title, message = '') => setNotice({ open: true, title, message });

  // Theme: toggle `dark` class + persist
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('tender_builder_theme', theme);
    } catch {}
  }, [theme]);

  // Auto-load state from localStorage on first mount if available.
  // Note: uploaded files can't persist (ArrayBuffers), so any restored
  // matches would be phantom — drop them and keep tender/requirements.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tender_builder_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tender) setTender(parsed.tender);
        if (parsed.requirements) setRequirements(parsed.requirements);
        if (parsed.expiryDates) setExpiryDates(parsed.expiryDates);
        if (parsed.lang) setLang(parsed.lang);
        setMatches({});
      }
    } catch (e) {
      console.warn('LocalStorage restore error:', e);
    }
  }, []);

  // Safety net: prune matches that reference files which no longer exist.
  useEffect(() => {
    setMatches((prev) => {
      const ids = new Set(uploadedFiles.map((f) => f.id));
      const next = { ...prev };
      let changed = false;
      for (const [reqId, fileId] of Object.entries(next)) {
        if (!ids.has(fileId)) {
          delete next[reqId];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [uploadedFiles]);

  // Save lightweight state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tender_builder_state', JSON.stringify({
        tender,
        requirements,
        matches,
        expiryDates,
        lang
      }));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [tender, requirements, matches, expiryDates, lang]);

  // Section 4.5 & 5: Reactive Status Evaluation
  const statusAnalysis = useMemo(() => {
    return evaluateAllStatuses(
      requirements, 
      matches, 
      expiryDates, 
      tender.submission_deadline, 
      uploadedFiles
    );
  }, [requirements, matches, expiryDates, tender.submission_deadline, uploadedFiles]);

  const { itemStatuses, blockingCount, canGenerate, duplicateMatchViolations } = statusAnalysis;

  // Calculate OK count for dashboard
  const okCount = useMemo(() => {
    return Object.values(itemStatuses).filter(s => s.status === STATUS.OK).length;
  }, [itemStatuses]);

  // Handle uploading custom requirements.json
  const handleLoadRequirementsJson = (data) => {
    if (!data.tender || !Array.isArray(data.requirements)) {
      showNotice(TRANSLATIONS[lang].notice.invalidFileTitle, TRANSLATIONS[lang].notice.invalidFileBody);
      return;
    }
    setTender(data.tender);
    setRequirements(data.requirements);
    setMatches({});
    setExpiryDates({});
  };

  // Reset to default sample tender
  const handleResetSample = () => {
    setTender(DEFAULT_TENDER_DATA.tender);
    setRequirements(DEFAULT_TENDER_DATA.requirements);
    setMatches({});
    setExpiryDates({});
  };

  // Files added handler
  const handleFilesAdded = (newFiles) => {
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  // File removed handler
  const handleFileRemoved = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setMatches(prev => {
      const next = { ...prev };
      for (const [reqId, matchedId] of Object.entries(next)) {
        if (matchedId === fileId) {
          delete next[reqId];
        }
      }
      return next;
    });
  };

  // Match change handler (Task 4.3 & 4.6)
  const handleMatchChange = (reqId, fileId) => {
    setMatches(prev => {
      const next = { ...prev };
      if (!fileId) {
        delete next[reqId];
      } else {
        next[reqId] = fileId;
      }
      return next;
    });
  };

  const handleUnmatch = (reqId) => {
    setMatches(prev => {
      const next = { ...prev };
      delete next[reqId];
      return next;
    });
  };

  // Expiry date change handler (Task 4.4)
  const handleExpiryChange = (reqId, dateStr) => {
    setExpiryDates(prev => ({
      ...prev,
      [reqId]: dateStr
    }));
  };

  // Auto-match from file names
  const handleAutoMatch = () => {
    const { newMatches, matchedCount } = suggestMatches(requirements, uploadedFiles, matches);
    setMatches(newMatches);
    if (matchedCount > 0) {
      showNotice(
        TRANSLATIONS[lang].matching.autoMatchTitle,
        TRANSLATIONS[lang].matching.autoMatchSuccess.replace('{count}', matchedCount)
      );
    } else {
      showNotice(TRANSLATIONS[lang].matching.autoMatchTitle, TRANSLATIONS[lang].matching.autoMatchEmpty);
    }
  };

  // Export CSV Bonus Feature
  const handleExportCsv = () => {
    exportChecklistToCsv(
      requirements, 
      matches, 
      expiryDates, 
      uploadedFiles, 
      itemStatuses, 
      tender.tender_id
    );
  };

  // Save project state to JSON
  const handleSaveStateToFile = () => {
    const exportState = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tender,
      requirements,
      matches,
      expiryDates,
      lang
    };
    const blob = new Blob([JSON.stringify(exportState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tender.tender_id || 'tender'}_project_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  // Load project state from JSON (matches are re-validated by the
  // prune effect since file binaries aren't part of the saved file)
  const handleLoadStateFromFile = (stateObj) => {
    if (stateObj.tender) setTender(stateObj.tender);
    if (stateObj.requirements) setRequirements(stateObj.requirements);
    if (stateObj.matches) setMatches(stateObj.matches);
    if (stateObj.expiryDates) setExpiryDates(stateObj.expiryDates);
    if (stateObj.lang) setLang(stateObj.lang);
  };

  // Generate & download the final package
  const handleGeneratePackage = async () => {
    if (!canGenerate || isGenerating) return;

    try {
      setIsGenerating(true);
      setProgress(5);
      setProgressText(TRANSLATIONS[lang].packageBar.generating);

      const pdfBytes = await generateTenderPackage(
        tender,
        requirements,
        matches,
        uploadedFiles,
        {
          includeIndexPage: includeToc,
          sealImageBytes: sealData.bytes,
          sealPages: sealData.targetPages
        },
        (pct, text) => {
          setProgress(pct);
          setProgressText(text);
        }
      );

      const outputFileName = `${tender.tender_id || 'Tender'}_Package.pdf`;
      downloadPdfBlob(pdfBytes, outputFileName);

    } catch (err) {
      console.error('Package generation failed:', err);
      showNotice(
        TRANSLATIONS[lang].notice.generateErrorTitle,
        TRANSLATIONS[lang].notice.generateErrorBody.replace('{error}', err.message)
      );
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setProgressText('');
    }
  };

  return (
    <div className={`min-h-screen bg-background text-foreground ${lang === 'bn' ? 'font-bn' : ''}`}>
      {/* Header */}
      <Header
        lang={lang}
        setLang={setLang}
        theme={theme}
        onToggleTheme={() => setTheme((p) => (p === 'dark' ? 'light' : 'dark'))}
        onLoadRequirementsJson={handleLoadRequirementsJson}
        onResetSample={handleResetSample}
        onSaveState={handleSaveStateToFile}
        onLoadState={handleLoadStateFromFile}
        onNotice={showNotice}
      />

      <main className="mx-auto max-w-[1280px] px-4 pt-5 sm:px-6">
        <TenderBanner
          tender={tender}
          lang={lang}
          blockingCount={blockingCount}
          totalRequirements={requirements.length}
          okCount={okCount}
        />

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="min-w-0">
            <RequirementsTable
              lang={lang}
              requirements={requirements}
              matches={matches}
              expiryDates={expiryDates}
              uploadedFiles={uploadedFiles}
              itemStatuses={itemStatuses}
              onMatchChange={handleMatchChange}
              onExpiryChange={handleExpiryChange}
              onUnmatch={handleUnmatch}
              onPreviewFile={(file) => setPreviewFile(file)}
              onAutoMatch={handleAutoMatch}
            />
          </section>

          <aside className="lg:sticky lg:top-[68px]">
            <UploadZone
              lang={lang}
              uploadedFiles={uploadedFiles}
              onFilesAdded={handleFilesAdded}
              onFileRemoved={handleFileRemoved}
              onPreviewFile={(file) => setPreviewFile(file)}
            />
          </aside>
        </div>

        <footer className="flex items-center justify-center gap-1.5 px-4 pb-36 pt-8 text-center text-xs text-muted-foreground lg:pb-32">
          <ShieldCheck size={13} />
          <span className={lang === 'bn' ? 'font-bn' : ''}>
            TenderPack · {TRANSLATIONS[lang].footerNote}
          </span>
        </footer>
      </main>

      <PackageGeneratorBar
        lang={lang}
        blockingCount={blockingCount}
        canGenerate={canGenerate}
        isGenerating={isGenerating}
        progress={progress}
        progressText={progressText}
        includeToc={includeToc}
        setIncludeToc={setIncludeToc}
        onGeneratePackage={handleGeneratePackage}
        onExportCsv={handleExportCsv}
        onOpenSealModal={() => setIsSealModalOpen(true)}
        hasDuplicateViolation={(duplicateMatchViolations?.length || 0) > 0}
      />

      {/* PDF In-App Preview Modal */}
      <PDFPreviewModal
        lang={lang}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />

      {/* Seal / Signature PNG Modal */}
      <SealSignatureModal
        open={isSealModalOpen}
        lang={lang}
        sealData={sealData}
        onSaveSeal={(data) => setSealData(data)}
        onClose={() => setIsSealModalOpen(false)}
        onNotice={showNotice}
      />

      <NoticeDialog
        open={notice.open}
        title={notice.title}
        message={notice.message}
        actionLabel={TRANSLATIONS[lang].notice.ok}
        onClose={() => setNotice((n) => ({ ...n, open: false }))}
      />
    </div>
  );
}
