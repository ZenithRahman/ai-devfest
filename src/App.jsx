import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { TenderBanner } from './components/TenderBanner';
import { RequirementsTable } from './components/RequirementsTable';
import { UploadZone } from './components/UploadZone';
import { PackageGeneratorBar } from './components/PackageGeneratorBar';
import { PDFPreviewModal } from './components/PDFPreviewModal';
import { SealSignatureModal } from './components/SealSignatureModal';

import { DEFAULT_TENDER_DATA } from './constants/defaultTender';
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

  // Theme: toggle `dark` class + persist
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('tender_builder_theme', theme);
    } catch {}
  }, [theme]);

  // Auto-load state from localStorage on first mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tender_builder_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tender) setTender(parsed.tender);
        if (parsed.requirements) setRequirements(parsed.requirements);
        if (parsed.matches) setMatches(parsed.matches);
        if (parsed.expiryDates) setExpiryDates(parsed.expiryDates);
        if (parsed.lang) setLang(parsed.lang);
      }
    } catch (e) {
      console.warn('LocalStorage restore error:', e);
    }
  }, []);

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

  const { itemStatuses, blockingCount, canGenerate } = statusAnalysis;

  // Calculate OK count for dashboard
  const okCount = useMemo(() => {
    return Object.values(itemStatuses).filter(s => s.status === STATUS.OK).length;
  }, [itemStatuses]);

  // Handle uploading custom requirements.json (Task 4.1)
  const handleLoadRequirementsJson = (data) => {
    if (!data.tender || !Array.isArray(data.requirements)) {
      alert('Invalid requirements.json format. Must include "tender" and "requirements" fields.');
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

  // Auto-Match Bonus Feature
  const handleAutoMatch = () => {
    const { newMatches, matchedCount } = suggestMatches(requirements, uploadedFiles, matches);
    setMatches(newMatches);
    if (matchedCount > 0) {
      alert(TRANSLATIONS[lang].matching.autoMatchSuccess.replace('{count}', matchedCount));
    } else {
      alert('No new automatic matches found based on file names.');
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

  // Load project state from JSON
  const handleLoadStateFromFile = (stateObj) => {
    if (stateObj.tender) setTender(stateObj.tender);
    if (stateObj.requirements) setRequirements(stateObj.requirements);
    if (stateObj.matches) setMatches(stateObj.matches);
    if (stateObj.expiryDates) setExpiryDates(stateObj.expiryDates);
    if (stateObj.lang) setLang(stateObj.lang);
  };

  // Generate & Download Package (Task 4.7 & 4.8)
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

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 }
        });
      } catch (e) {}

    } catch (err) {
      console.error('Package generation failed:', err);
      alert('Error generating tender package: ' + err.message);
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setProgressText('');
    }
  };

  return (
    <div className={`min-h-screen bg-background text-foreground pb-32 ${lang === 'bn' ? 'font-bn' : ''}`}>
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
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-6">
        {/* Tender Banner */}
        <TenderBanner
          tender={tender}
          lang={lang}
          blockingCount={blockingCount}
          totalRequirements={requirements.length}
          okCount={okCount}
        />

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
          {/* Left: Requirements Checklist Table */}
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
            />
          </section>

          {/* Right: Upload Zone & Staged Files */}
          <aside className="lg:sticky lg:top-20">
            <UploadZone
              lang={lang}
              uploadedFiles={uploadedFiles}
              onFilesAdded={handleFilesAdded}
              onFileRemoved={handleFileRemoved}
              onPreviewFile={(file) => setPreviewFile(file)}
            />
          </aside>
        </div>
      </main>

      {/* Floating Bottom Action Dock */}
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
        onAutoMatch={handleAutoMatch}
        onExportCsv={handleExportCsv}
        onOpenSealModal={() => setIsSealModalOpen(true)}
      />

      {/* PDF In-App Preview Modal */}
      <PDFPreviewModal
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
      />
    </div>
  );
}
