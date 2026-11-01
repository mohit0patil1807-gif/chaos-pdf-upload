import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  RotateCcw, 
  Copy, 
  Check, 
  ShieldCheck, 
  FileText, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { formatBytes } from '../utils/fileUtils';

interface SuccessCertificateModalProps {
  file: File;
  fileSHA256: string;
  elapsedSeconds: number;
  attempts: number;
  onReset: () => void;
}

export const SuccessCertificateModal: React.FC<SuccessCertificateModalProps> = ({
  file,
  fileSHA256,
  elapsedSeconds,
  attempts,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const filingReference = `DDA-1997-${Math.abs(file.size * 31 + elapsedSeconds * 17).toString(16).toUpperCase().padStart(8, '0')}`;

  // Launch celebratory 1997 confetti and audio fanfare on mount
  useEffect(() => {
    sound.playVictory();

    // Trigger confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#000080', '#1084d0', '#b91c1c', '#ca8a04', '#15803d'],
      });
    } catch {}
  }, []);

  const handleCopyReceipt = () => {
    sound.playBlip();
    const text = `=== DEPARTMENT OF DOCUMENT AFFAIRS (1997) INGESTION RECEIPT ===
Filing Reference: ${filingReference}
Document Name: ${file.name}
Physical Mass: ${formatBytes(file.size)} (${file.size} bytes)
SHA-256 Fingerprint: ${fileSHA256}
Time Elapsed: ${elapsedSeconds} seconds
Bureaucratic Attempts: ${attempts}
Status: INGESTION RATIFIED & ARCHIVED`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    }}>
      <div className="win95-outset" style={{
        maxWidth: '580px',
        width: '100%',
        boxShadow: '6px 6px 0px rgba(0, 0, 0, 0.6)',
      }}>
        {/* Titlebar */}
        <div className="win95-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Award size={14} />
            <span>Official Ingestion Receipt &amp; Archival Certificate (1997)</span>
          </div>
          <button className="win95-titlebar-btn" onClick={onReset}>×</button>
        </div>

        {/* Certificate Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#fafafa' }}>
          {/* Certificate Header Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px double #000080',
            paddingBottom: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                backgroundColor: '#000080',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '2px 2px 0px rgba(0,0,0,0.3)',
              }}>
                <ShieldCheck size={26} color="#ffffff" />
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-retro-ui)',
                  letterSpacing: '0.5px',
                  color: '#000080',
                }}>
                  DEPARTMENT OF DOCUMENT AFFAIRS
                </div>
                <div style={{ fontSize: '10px', color: '#4b5563', fontFamily: 'var(--font-retro-mono)' }}>
                  FEDERAL ARCHIVAL SYSTEM // CERTIFICATE OF RATIFICATION
                </div>
              </div>
            </div>

            {/* Official Red Rubber Stamp */}
            <div className="rubber-stamp stamp-red" style={{ fontSize: '12px', padding: '6px 12px' }}>
              APPROVED &amp; FILED<br />
              <span style={{ fontSize: '9px' }}>OCT 1997 // REG-104</span>
            </div>
          </div>

          {/* Genuine Verified File Metadata */}
          <div className="win95-inset" style={{
            padding: '12px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '11px',
            fontFamily: 'var(--font-retro-mono)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><b>Docket Reference:</b></span>
              <span style={{ fontWeight: 700, color: '#000080' }}>{filingReference}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><b>Document Name:</b></span>
              <span style={{ fontWeight: 700 }}>{file.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><b>Physical Mass:</b></span>
              <span>{formatBytes(file.size)} ({file.size.toLocaleString()} bytes)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><b>MIME Identity:</b></span>
              <span>{file.type || 'application/pdf (Magic Bytes Verified)'}</span>
            </div>
            <div style={{ borderTop: '1px dashed #d1d5db', paddingTop: '4px', marginTop: '2px' }}>
              <div style={{ fontSize: '10px', color: '#4b5563' }}>SHA-256 Fingerprint:</div>
              <div style={{
                fontSize: '9px',
                wordBreak: 'break-all',
                color: '#111827',
                backgroundColor: '#f3f4f6',
                padding: '3px 6px',
                border: '1px solid #e5e7eb',
                marginTop: '2px',
              }}>
                {fileSHA256}
              </div>
            </div>
          </div>

          {/* Bureaucratic Endurance Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
          }}>
            <div className="win95-inset" style={{ padding: '8px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <Clock size={16} color="#000080" style={{ margin: '0 auto 2px' }} />
              <div style={{ fontSize: '9px', color: '#6b7280' }}>TIME ELAPSED</div>
              <div style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-retro-mono)' }}>
                {formatTime(elapsedSeconds)}
              </div>
            </div>

            <div className="win95-inset" style={{ padding: '8px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <AlertCircle size={16} color="#b91c1c" style={{ margin: '0 auto 2px' }} />
              <div style={{ fontSize: '9px', color: '#6b7280' }}>ATTEMPTS</div>
              <div style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-retro-mono)' }}>
                {attempts}
              </div>
            </div>

            <div className="win95-inset" style={{ padding: '8px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <CheckCircle2 size={16} color="#15803d" style={{ margin: '0 auto 2px' }} />
              <div style={{ fontSize: '9px', color: '#6b7280' }}>CLEARANCES</div>
              <div style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-retro-mono)' }}>
                4/4 Passed
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '10px',
            borderTop: '1px solid var(--win-dark)',
          }}>
            <button
              type="button"
              className="win95-btn"
              onClick={handleCopyReceipt}
              title="Copy official certificate to clipboard"
            >
              {copied ? <Check size={13} color="#15803d" /> : <Copy size={13} />}
              <span>{copied ? 'Copied Receipt!' : 'Copy Certificate Token'}</span>
            </button>

            <button
              type="button"
              className="win95-btn"
              onClick={onReset}
              style={{ fontWeight: 700, minWidth: '130px' }}
            >
              <RotateCcw size={13} color="#b91c1c" />
              <span>File Another (Reset)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
