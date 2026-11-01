import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle, 
  FileText, 
  Download, 
  RotateCcw, 
  Hash, 
  Calendar, 
  HardDrive,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { formatBytes, calculateSHA256 } from '../utils/fileUtils';

interface SuccessCertificateProps {
  file: File;
  onReset: () => void;
}

export const SuccessCertificate: React.FC<SuccessCertificateProps> = ({
  file,
  onReset,
}) => {
  const [sha256, setSha256] = useState<string>('Computing cryptographic fingerprint...');

  useEffect(() => {
    // Fire celebratory confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#10b981', '#f59e0b', '#a855f7'],
    });

    // Compute real cryptographic hash
    calculateSHA256(file).then(hash => {
      setSha256(hash);
    });
  }, [file]);

  const downloadReceipt = () => {
    sound.playStamp();
    const textContent = `=====================================================
OMNIVAULT™ 9000 // OFFICIAL INGESTION CERTIFICATE
COMPLIANCE STANDARD: ISO-CHAOS-9001:2026
=====================================================

FILE DETAILS:
- Filename:      ${file.name}
- File Size:     ${file.size} bytes (${formatBytes(file.size)})
- MIME Type:     ${file.type || 'application/pdf (inferred)'}
- Last Modified: ${new Date(file.lastModified).toISOString()}
- SHA-256 Hash:  ${sha256}

CHAOS PROTOCOL AUDIT:
- Checkpoint 1 (De-ionization Gate): PASSED
- Checkpoint 2 (Bureaucratic Notary): AFFIXED
- Moving Drop Target Maneuvers:       COMPLETED (STABILIZED)
- Form 104-B Classification:         FILED & CERTIFIED
- Quantum Decoherence Advisory:       ACKNOWLEDGED
- Upload Committee Quorum:           UNANIMOUS (Auditor Bribed)
- 99% Stalling Mechanical Override:  DISCHARGED

STATUS: OFFICIALLY ARCHIVED INTO PERMANENT CHAOS VAULT
=====================================================`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OMNIVAULT_RECEIPT_${file.name.replace(/\.[^/.]+$/, "")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      maxWidth: '750px',
      margin: '2rem auto',
      padding: '0 1rem',
    }}>
      <div className="glass-panel" style={{
        padding: '2.5rem 2rem',
        border: '2px solid var(--accent-green)',
        boxShadow: '0 0 50px rgba(16, 185, 129, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top Decorative Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '0.75rem',
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)',
          }}>
            <Award size={40} color="var(--accent-green)" />
          </div>

          <div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-green)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              ★ MISSION ACCOMPLISHED ★
            </span>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              fontFamily: 'var(--font-heading)',
              color: '#f8fafc',
              marginTop: '0.25rem',
            }}>
              OFFICIAL CERTIFICATE OF INGESTION
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Your PDF has conquered the bureaucratic gauntlet and is permanently archived!
            </p>
          </div>
        </div>

        {/* Real File Data Card */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '12px',
          padding: '1.25rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '0.75rem',
          }}>
            <FileText size={20} color="var(--accent-cyan)" />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                {file.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                Certified Genuine Portable Document Format (.pdf)
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
              <HardDrive size={15} color="var(--accent-amber)" />
              <span>SIZE: <strong>{formatBytes(file.size)} ({file.size} bytes)</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
              <Calendar size={15} color="var(--accent-cyan)" />
              <span>MODIFIED: <strong>{new Date(file.lastModified).toLocaleDateString()}</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
              <ShieldCheck size={15} color="var(--accent-green)" />
              <span>STATUS: <strong style={{ color: 'var(--accent-green)' }}>ARCHIVED</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
              <Zap size={15} color="var(--accent-purple)" />
              <span>CLEARANCE: <strong>LEVEL 9 UNRESTRICTED</strong></span>
            </div>
          </div>

          {/* Cryptographic SHA-256 Hash */}
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            padding: '0.65rem 0.85rem',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <Hash size={14} color="var(--accent-green)" />
            <div style={{ overflow: 'hidden' }}>
              <span style={{ color: 'var(--text-muted)' }}>SHA-256: </span>
              <span style={{ color: 'var(--accent-green)', wordBreak: 'break-all' }}>{sha256}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
        }}>
          <button
            onClick={downloadReceipt}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--accent-green)',
              color: '#090d16',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 800,
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Download size={16} />
            Download Official Receipt (.txt)
          </button>

          <button
            onClick={() => {
              sound.playBeep(300, 'sine', 0.1);
              onReset();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            <RotateCcw size={16} />
            Ingest Another PDF
          </button>
        </div>
      </div>
    </div>
  );
};
