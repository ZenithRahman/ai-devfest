import React, { useState, useRef } from 'react';
import { X, Upload, Stamp, Check, Trash2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants/translations';

export function SealSignatureModal({
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
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', padding: '24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Stamp size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              {t.sealModal.title}
            </h2>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          {t.sealModal.description}
        </p>

        {/* Upload PNG Button / Drop */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'rgba(255, 255, 255, 0.02)',
            marginBottom: '20px'
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/png" 
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          {imagePreview ? (
            <div>
              <img 
                src={imagePreview} 
                alt="Seal Preview" 
                style={{ maxHeight: '100px', maxWidth: '180px', objectFit: 'contain', marginBottom: '8px' }} 
              />
              <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>
                PNG Stamp Loaded (Click to replace)
              </div>
            </div>
          ) : (
            <div>
              <Upload size={28} color="var(--text-muted)" style={{ margin: '0 auto 8px auto' }} />
              <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f1f5f9' }}>
                {t.sealModal.uploadPrompt}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Transparent PNG recommended
              </div>
            </div>
          )}
        </div>

        {/* Page selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            {t.sealModal.selectPages}
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { id: 'all', label: t.sealModal.allPages },
              { id: 'cover', label: t.sealModal.coverOnly },
              { id: 'last', label: t.sealModal.lastPage }
            ].map(opt => (
              <label 
                key={opt.id}
                style={{ 
                  flex: 1, 
                  padding: '10px', 
                  borderRadius: 'var(--radius-md)', 
                  border: targetPages === opt.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: targetPages === opt.id ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <input 
                  type="radio" 
                  name="targetPages" 
                  value={opt.id} 
                  checked={targetPages === opt.id}
                  onChange={(e) => setTargetPages(e.target.value)}
                  style={{ display: 'none' }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {imagePreview ? (
            <button 
              onClick={handleClear}
              className="btn btn-danger-outline"
            >
              <Trash2 size={15} />
              <span>{t.sealModal.clear}</span>
            </button>
          ) : <div />}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} className="btn btn-secondary">
              {t.sealModal.close}
            </button>
            <button onClick={handleApply} className="btn btn-primary">
              <Check size={16} />
              <span>{t.sealModal.apply}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
