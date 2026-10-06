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
  // Re-evaluates instantly whenever requirements, matches, expiryDates, or uploadedFiles change
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
    // Clear matches associated with this file
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

  // Save full project state as downloadable JSON file
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

  // Load project state from JSON file
  const handleLoadStateFromFile = (stateObj) => {
    if (stateObj.tender) setTender(stateObj.tender);
    if (stateObj.requirements) setRequirements(stateObj.requirements);
    if (stateObj.matches) setMatches(stateObj.matches);
    if (stateObj.expiryDates) setExpiryDates(stateObj.expiryDates);
    if (stateObj.lang) setLang(stateObj.lang);
  };

  // Generate & Download Package (Task 4.7 & 4.8 & Section 6)
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

      // Section 4.8: "The user downloads the package as <tender_id>_Package.pdf"
      const outputFileName = `${tender.tender_id || 'Tender'}_Package.pdf`;
      downloadPdfBlob(pdfBytes, outputFileName);

      // Trigger celebratory confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.7 }
        });
      } catch (e) {
        // Confetti non-critical
      }

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
    <div className={`app-container ${lang === 'bn' ? 'font-bn' : ''}`}>
      {/* Header with Navigation and Global Actions */}
      <Header 
        lang={lang}
        setLang={setLang}
        onLoadRequirementsJson={handleLoadRequirementsJson}
        onResetSample={handleResetSample}
        onSaveState={handleSaveStateToFile}
        onLoadState={handleLoadStateFromFile}
      />

      {/* Tender Details Banner */}
      <TenderBanner 
        tender={tender}
        lang={lang}
        blockingCount={blockingCount}
        totalRequirements={requirements.length}
        okCount={okCount}
      />

      {/* Main Grid: Checklist Table (Left) + Upload Zone (Right) */}
      <div className="grid-main">
        {/* Left: Requirements Checklist Table */}
        <section>
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

        {/* Right: File Upload Dropzone & Staged Pool */}
        <aside>
          <UploadZone 
            lang={lang}
            uploadedFiles={uploadedFiles}
            onFilesAdded={handleFilesAdded}
            onFileRemoved={handleFileRemoved}
            onPreviewFile={(file) => setPreviewFile(file)}
          />
        </aside>
      </div>

      {/* Floating Bottom Bar: Validation, Auto-match, Export & Package Generation */}
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
      {previewFile && (
        <PDFPreviewModal 
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* Seal / Signature PNG Modal */}
      {isSealModalOpen && (
        <SealSignatureModal 
          lang={lang}
          sealData={sealData}
          onSaveSeal={(data) => setSealData(data)}
          onClose={() => setIsSealModalOpen(false)}
        />
      )}

    </div>
  );
}
