import React, { useState } from 'react';
import { FileText, ShieldAlert, Check } from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { formatBytes } from '../utils/fileUtils';

interface ClassificationModalProps {
  file: File;
  fileSHA256: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ClassificationModal: React.FC<ClassificationModalProps> = ({
  file,
  fileSHA256,
  onConfirm,
  onCancel,
}) => {
  const [classification, setClassification] = useState('form_88b');
  const [isCertified, setIsCertified] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCertified) {
      sound.playError();
      setValidationError('Mandatory Certification: You must tick the statutory declaration checkbox prior to docket stamping.');
      return;
    }
    sound.playStamp();
    onConfirm();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    }}>
      <div className="win95-outset" style={{
        maxWidth: '520px',
        width: '100%',
        boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Titlebar */}
        <div className="win95-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FileText size={13} />
            <span>Form 88-B: Document Classification Registry (Rev. 1997)</span>
          </div>
          <button className="win95-titlebar-btn" onClick={onCancel}>×</button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Header Description */}
          <div style={{ fontSize: '11px', color: '#1f2937' }}>
            Pursuant to Federal Order 97-12, all incoming Adobe PDF dockets must be classified and certified by the submitting citizen before entry into the Department queue.
          </div>

          {/* Genuine File Metadata Box */}
          <div className="win95-inset" style={{
            padding: '8px 10px',
            backgroundColor: '#f8fafc',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            fontFamily: 'var(--font-retro-mono)',
          }}>
            <div><b>Original Filename:</b> {file.name}</div>
            <div><b>Physical Mass:</b> {formatBytes(file.size)} ({file.size.toLocaleString()} bytes)</div>
            <div><b>MIME Type:</b> {file.type || 'application/pdf (Inferred via Magic Bytes)'}</div>
            <div style={{ wordBreak: 'break-all', fontSize: '9px', color: '#4b5563' }}>
              <b>SHA-256 Fingerprint:</b> {fileSHA256 || 'Computing...'}
            </div>
          </div>

          {/* Document Classification Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700 }}>
              Designated Bureaucratic Category:
            </label>
            <select
              className="win95-inset"
              value={classification}
              onChange={(e) => {
                sound.playBlip();
                setClassification(e.target.value);
              }}
              style={{
                padding: '4px 6px',
                fontSize: '11px',
                fontFamily: 'var(--font-retro-ui)',
                backgroundColor: '#ffffff',
                border: '2px solid var(--win-dark)',
              }}
            >
              <option value="form_88b">Form 88-B: Affidavit of Standard Bureaucratic Ingestion</option>
              <option value="petition_kerning">Docket 12-K: Formal Petition for Monospace Standardization</option>
              <option value="y2k_compliance">Directive 99-Y: Y2K Bug Exemption & Preparedness Affirmation</option>
            </select>
          </div>

          {/* Mandatory Certification Checkbox */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '8px',
            backgroundColor: '#fefce8',
            border: '1px solid #ca8a04',
          }}>
            <input
              type="checkbox"
              id="citizen-cert"
              checked={isCertified}
              onChange={(e) => {
                sound.playBlip();
                setIsCertified(e.target.checked);
                if (e.target.checked) setValidationError('');
              }}
              style={{ marginTop: '2px', cursor: 'pointer' }}
            />
            <label htmlFor="citizen-cert" style={{ fontSize: '11px', color: '#713f12', cursor: 'pointer', lineHeight: 1.3 }}>
              <b>Statutory Affirmation:</b> I solemnly declare under penalty of civil filing surcharges that this PDF document was generated on an IBM-compatible terminal and contains verified civilian prose.
            </label>
          </div>

          {validationError && (
            <div style={{
              fontSize: '11px',
              color: '#b91c1c',
              fontWeight: 700,
              backgroundColor: '#fee2e2',
              padding: '4px 8px',
              border: '1px solid #ef4444',
            }}>
              ⚠️ {validationError}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            paddingTop: '8px',
            borderTop: '1px solid var(--win-dark)',
          }}>
            <button
              type="button"
              className="win95-btn"
              onClick={() => {
                sound.playBlip();
                onCancel();
              }}
            >
              Cancel / Abort
            </button>
            <button
              type="submit"
              className="win95-btn"
              style={{ fontWeight: 700 }}
            >
              Submit Classification ➔
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
