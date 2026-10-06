import React from 'react';
import { CheckCircle2, AlertCircle, Clock, XCircle, MinusCircle, X, Eye } from 'lucide-react';
import { STATUS } from '../utils/statusEngine';
import { TRANSLATIONS } from '../constants/translations';

export function RequirementsTable({
  lang,
  requirements,
  matches,
  expiryDates,
  uploadedFiles,
  itemStatuses,
  onMatchChange,
  onExpiryChange,
  onUnmatch,
  onPreviewFile
}) {
  const t = TRANSLATIONS[lang];

  // Helper to render status badge with icon
  const renderStatusBadge = (statusKey) => {
    switch (statusKey) {
      case STATUS.OK:
        return (
          <span className="badge badge-ok">
            <CheckCircle2 size={13} />
            {t.statuses.OK}
          </span>
        );
      case STATUS.MISSING:
        return (
          <span className="badge badge-missing">
            <XCircle size={13} />
            {t.statuses.MISSING}
          </span>
        );
      case STATUS.EXPIRY_NEEDED:
        return (
          <span className="badge badge-expiry-needed">
            <Clock size={13} />
            {t.statuses.EXPIRY_NEEDED}
          </span>
        );
      case STATUS.EXPIRED:
        return (
          <span className="badge badge-expired">
            <AlertCircle size={13} />
            {t.statuses.EXPIRED}
          </span>
        );
      case STATUS.NOT_PROVIDED:
      default:
        return (
          <span className="badge badge-not-provided">
            <MinusCircle size={13} />
            {t.statuses.NOT_PROVIDED}
          </span>
        );
    }
  };

  // Map of fileId -> requirementId currently matched
  const fileToReqMap = {};
  const hashToReqMap = {};
  for (const [rId, fId] of Object.entries(matches)) {
    if (fId) {
      fileToReqMap[fId] = rId;
      const f = uploadedFiles.find(file => file.id === fId);
      if (f && f.hash) {
        hashToReqMap[f.hash] = rId;
      }
    }
  }

  // Sort requirements strictly by order (Task 4.1)
  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table className="req-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>{t.tableHeaders.order}</th>
              <th style={{ minWidth: '220px' }}>{t.tableHeaders.docTitle}</th>
              <th style={{ width: '110px' }}>{t.tableHeaders.type}</th>
              <th style={{ minWidth: '240px' }}>{t.tableHeaders.matchedFile}</th>
              <th style={{ width: '160px' }}>{t.tableHeaders.expiryDate}</th>
              <th style={{ width: '160px' }}>{t.tableHeaders.status}</th>
              <th style={{ width: '80px', textAlign: 'center' }}>{t.tableHeaders.actions}</th>
            </tr>
          </thead>
          <tbody>
            {sortedReqs.map((req) => {
              const matchedFileId = matches[req.id] || '';
              const matchedFile = uploadedFiles.find(f => f.id === matchedFileId);
              const expiryValue = expiryDates[req.id] || '';
              const statusInfo = itemStatuses[req.id] || { status: STATUS.NOT_PROVIDED };

              // Determine document title by active language (Task 4.9)
              const docTitle = lang === 'bn' ? (req.title_bn || req.title_en) : (req.title_en || req.title_bn);

              return (
                <tr key={req.id}>
                  {/* Order */}
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {req.order}
                  </td>

                  {/* Document Title */}
                  <td>
                    <div style={{ 
                      fontWeight: 600, 
                      color: '#f8fafc',
                      fontSize: '0.92rem',
                      fontFamily: lang === 'bn' ? 'var(--font-bn)' : 'inherit'
                    }}>
                      {docTitle}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {req.id} {req.has_expiry ? '• Requires Expiry' : ''}
                    </div>
                  </td>

                  {/* Type (Mandatory vs Optional) */}
                  <td>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      color: req.mandatory ? '#fca5a5' : '#94a3b8',
                      background: req.mandatory ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: req.mandatory ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      {req.mandatory ? t.types.mandatory : t.types.optional}
                    </span>
                  </td>

                  {/* Matched File Dropdown (Task 4.3 & 4.6) */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select 
                        className="custom-select"
                        value={matchedFileId}
                        onChange={(e) => onMatchChange(req.id, e.target.value)}
                        style={{
                          borderColor: matchedFile ? 'var(--border-active)' : undefined
                        }}
                      >
                        <option value="">{t.matching.selectPlaceholder}</option>
                        {uploadedFiles.map((file) => {
                          const isMatchedToOther = fileToReqMap[file.id] && fileToReqMap[file.id] !== req.id;
                          // Task 4.6: If this file has same content hash as another file matched to a different requirement, disable it!
                          const isDuplicateMatchedElsewhere = hashToReqMap[file.hash] && hashToReqMap[file.hash] !== req.id;
                          const isDisabled = isMatchedToOther || isDuplicateMatchedElsewhere;

                          let disabledLabel = '';
                          if (isMatchedToOther) disabledLabel = ' (Already matched)';
                          else if (isDuplicateMatchedElsewhere) disabledLabel = ' (Duplicate match prohibited)';

                          return (
                            <option 
                              key={file.id} 
                              value={file.id} 
                              disabled={isDisabled}
                            >
                              {file.name} ({file.pageCount} pgs){disabledLabel}
                            </option>
                          );
                        })}
                      </select>

                      {matchedFile && (
                        <button 
                          onClick={() => onUnmatch(req.id)}
                          className="btn btn-secondary" 
                          style={{ padding: '7px', borderRadius: '6px' }}
                          title={t.uploadPanel.unmatch}
                        >
                          <X size={14} color="#f87171" />
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Expiry Date Input (Task 4.4) */}
                  <td>
                    {req.has_expiry ? (
                      matchedFile ? (
                        <input 
                          type="date"
                          className="custom-input"
                          value={expiryValue}
                          onChange={(e) => onExpiryChange(req.id, e.target.value)}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            borderColor: !expiryValue ? 'rgba(245, 158, 11, 0.4)' : undefined
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                          Attach file first
                        </span>
                      )
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>—</span>
                    )}
                  </td>

                  {/* Status Badge (Task 4.5 & Section 5) */}
                  <td>
                    {renderStatusBadge(statusInfo.status)}
                  </td>

                  {/* Actions (Preview) */}
                  <td style={{ textAlign: 'center' }}>
                    {matchedFile ? (
                      <button 
                        onClick={() => onPreviewFile(matchedFile)}
                        className="btn btn-secondary"
                        style={{ padding: '6px', borderRadius: '6px' }}
                        title={t.uploadPanel.preview}
                      >
                        <Eye size={14} />
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>—</span>
                    )}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
