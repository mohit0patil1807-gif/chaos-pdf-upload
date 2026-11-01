import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  XCircle, 
  RotateCcw, 
  FileText, 
  Bug, 
  Clock, 
  FileCheck2, 
  AlertTriangle,
  FilePlus,
  BarChart2
} from 'lucide-react';
import { AttemptOutcome, DefenseStats } from '../types/antivirus';
import { formatBytes } from '../utils/fileUtils';

interface ResultDisplayProps {
  outcome: AttemptOutcome;
  file: File;
  fileSHA256: string;
  stats: DefenseStats;
  onRetry: () => void;
  onUploadAnother: () => void;
  onViewReport: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  outcome,
  file,
  fileSHA256,
  stats,
  onRetry,
  onUploadAnother,
  onViewReport,
}) => {
  const isSuccess = outcome === 'SUCCESS';

  useEffect(() => {
    if (isSuccess) {
      try {
        confetti({
          particleCount: 75,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#000080', '#1084d0', '#b91c1c', '#ca8a04', '#15803d'],
        });
      } catch {}
    }
  }, [isSuccess]);

  return (
    <div style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      backgroundColor: '#f9fafb',
      color: '#111827',
    }}>
      {/* Outcome Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        backgroundColor: isSuccess ? '#f0fdf4' : '#fef2f2',
        border: `2px solid ${isSuccess ? '#16a34a' : '#dc2626'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            backgroundColor: isSuccess ? '#16a34a' : '#dc2626',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '1px 1px 0px #000',
            flexShrink: 0,
          }}>
            {isSuccess ? <ShieldCheck size={24} color="#fff" /> : <XCircle size={24} color="#fff" />}
          </div>

          <div>
            <div style={{
              fontSize: '15px',
              fontWeight: 900,
              fontFamily: 'var(--font-retro-ui)',
              letterSpacing: '0.4px',
              color: isSuccess ? '#15803d' : '#b91c1c',
            }}>
              {isSuccess ? 'DOCUMENT SURVIVED CHAOS!' : 'THE ANTS HAVE WON.'}
            </div>
            <div style={{ fontSize: '11px', color: '#4b5563', fontFamily: 'var(--font-retro-mono)' }}>
              {isSuccess 
                ? 'Department Quarantine Ratified: 20.0s defended with zero breaches.' 
                : `Perimeter Breached at ${stats.breachTimeSeconds || stats.durationSeconds}s mark.`}
            </div>
          </div>
        </div>

        {/* Rubber Stamp */}
        <div className={`rubber-stamp ${isSuccess ? 'stamp-green' : 'stamp-red'}`} style={{ fontSize: '11px', padding: '3px 8px' }}>
          {isSuccess ? 'INGESTION RATIFIED' : 'COLONY BREACH'}
        </div>
      </div>

      {/* File & Defense Details */}
      <div className="win95-inset" style={{
        padding: '10px 12px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontSize: '11px',
        fontFamily: 'var(--font-retro-mono)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#4b5563' }}>Document Name:</span>
          <span style={{ fontWeight: 700, color: '#000080' }}>{file.name}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#4b5563' }}>Physical Mass:</span>
          <span>{formatBytes(file.size)} ({file.size.toLocaleString()} bytes)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#4b5563' }}>Defense Duration:</span>
          <span style={{ color: isSuccess ? '#15803d' : '#b91c1c', fontWeight: 700 }}>
            {stats.durationSeconds.toFixed(1)}s / 20.0s {isSuccess ? '(COUNTDOWN SURVIVED)' : '(BREACH)'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#4b5563' }}>Ants Squished:</span>
          <span style={{ fontWeight: 700, color: '#15803d' }}>{stats.antsEliminated} eliminated</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#4b5563' }}>Boundary Breaches:</span>
          <span style={{ fontWeight: 700, color: isSuccess ? '#15803d' : '#b91c1c' }}>
            {isSuccess ? '0 (PERIMETER SECURE)' : '1 (INSPECTION FAILED)'}
          </span>
        </div>
      </div>

      {/* Narrative */}
      <div style={{
        padding: '8px 12px',
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        fontSize: '11px',
        color: '#1f2937',
        lineHeight: 1.35,
      }}>
        {isSuccess ? (
          <div>
            🎉 <b>Ingestion Passed:</b> Your PDF completed local browser processing without byte corruption. No ants reached the protected quarantine buffer.
          </div>
        ) : (
          <div>
            🐜 <b>Colony Takeover:</b> An ant carrying excessive ambition entered the quarantine intake. Document checksums were carried away into the digital anthill.
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent: 'space-between',
        paddingTop: '8px',
        borderTop: '1px solid var(--win-dark)',
      }}>
        <button
          type="button"
          className="win95-btn"
          onClick={onViewReport}
        >
          <BarChart2 size={13} color="#000080" />
          <span>View Security Report</span>
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {!isSuccess ? (
            <button
              type="button"
              className="win95-btn"
              onClick={onRetry}
              style={{ fontWeight: 700, color: '#b91c1c' }}
            >
              <RotateCcw size={13} />
              <span>Retry Upload (Same PDF)</span>
            </button>
          ) : (
            <button
              type="button"
              className="win95-btn"
              onClick={onUploadAnother}
              style={{ fontWeight: 700, color: '#000080' }}
            >
              <FilePlus size={13} />
              <span>Upload Another PDF</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
