import React from 'react';
import { ShieldCheck, AlertCircle, Calendar, Building2, User, FileText, CheckCircle2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants/translations';

export function TenderBanner({ tender, lang, blockingCount, totalRequirements, okCount }) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'center' }}>
        
        {/* Tender ID & Title */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '4px' }}>
            <FileText size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {t.tenderId}
            </span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
            {tender.tender_id || 'N/A'}
          </div>
          <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {tender.title}
          </div>
        </div>

        {/* Procuring Entity */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <Building2 size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {t.procuringEntity}
            </span>
          </div>
          <div style={{ fontSize: '0.98rem', fontWeight: 600, color: '#f1f5f9' }}>
            {tender.procuring_entity || 'N/A'}
          </div>
        </div>

        {/* Bidder */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <User size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {t.bidder}
            </span>
          </div>
          <div style={{ fontSize: '0.98rem', fontWeight: 600, color: '#f1f5f9' }}>
            {tender.bidder || 'N/A'}
          </div>
        </div>

        {/* Submission Deadline */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)', marginBottom: '4px' }}>
            <Calendar size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {t.deadline}
            </span>
          </div>
          <div style={{ 
            fontSize: '1.05rem', 
            fontWeight: 800, 
            color: '#fbbf24', 
            fontFamily: 'var(--font-mono)',
            background: 'rgba(245, 158, 11, 0.1)',
            padding: '4px 10px',
            borderRadius: '6px',
            display: 'inline-block'
          }}>
            {tender.submission_deadline || 'N/A'}
          </div>
        </div>

        {/* Live Status Badge Summary */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-md)', 
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              {t.statusSummary}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>{okCount}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {totalRequirements} OK</span>
            </div>
          </div>

          <div>
            {blockingCount > 0 ? (
              <div className="badge badge-missing pulse-indicator" style={{ padding: '6px 12px' }}>
                <AlertCircle size={14} />
                <span>{blockingCount} {t.blockingIssues}</span>
              </div>
            ) : (
              <div className="badge badge-ok" style={{ padding: '6px 12px' }}>
                <CheckCircle2 size={14} />
                <span>Ready</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
