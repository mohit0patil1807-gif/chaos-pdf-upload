import React from 'react';
import { BarChart2, ShieldCheck, XCircle } from 'lucide-react';
import { SecurityReportData } from '../types/antivirus';
import { formatBytes } from '../utils/fileUtils';
import { sound } from '../utils/soundEffects';

interface SecurityReportModalProps {
  report: SecurityReportData;
  onClose: () => void;
}

export const SecurityReportModal: React.FC<SecurityReportModalProps> = ({
  report,
  onClose,
}) => {
  const isSuccess = report.outcome === 'SUCCESS';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '16px',
    }}>
      <div className="win95-outset" style={{
        maxWidth: '540px',
        width: '100%',
        boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Titlebar */}
        <div className="win95-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <BarChart2 size={13} />
            <span>Departmental Security Audit Report // Terminal #97</span>
          </div>
          <button className="win95-titlebar-btn" onClick={onClose}>×</button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Status badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: isSuccess ? '#dcfce7' : '#fee2e2',
            border: `1px solid ${isSuccess ? '#16a34a' : '#ef4444'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isSuccess ? <ShieldCheck size={18} color="#15803d" /> : <XCircle size={18} color="#b91c1c" />}
              <span style={{ fontWeight: 800, color: isSuccess ? '#15803d' : '#b91c1c', fontSize: '12px' }}>
                STATUS: {isSuccess ? 'INGESTION CLEARED' : 'PERIMETER BREACHED'}
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-retro-mono)', fontSize: '11px', color: '#4b5563' }}>
              {report.timestamp}
            </span>
          </div>

          {/* Audit Metrics Table */}
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
              <span style={{ fontWeight: 700, color: '#000080' }}>{report.fileName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4b5563' }}>File Mass:</span>
              <span>{formatBytes(report.fileSizeBytes)} ({report.fileSizeBytes.toLocaleString()} bytes)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4b5563' }}>Ants Spawned:</span>
              <span>{report.defenseStats.antsSpawned} units</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4b5563' }}>Ants Squished:</span>
              <span style={{ color: '#15803d', fontWeight: 700 }}>{report.defenseStats.antsEliminated} units</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4b5563' }}>Missed Swats:</span>
              <span>{report.defenseStats.missedClicks} clicks</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4b5563' }}>Defense Duration:</span>
              <span>{report.defenseStats.durationSeconds.toFixed(1)} seconds</span>
            </div>
            {report.defenseStats.breachTimeSeconds && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#b91c1c' }}>Breach Registered At:</span>
                <span style={{ color: '#b91c1c', fontWeight: 700 }}>{report.defenseStats.breachTimeSeconds.toFixed(1)}s mark</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4b5563' }}>Chaos Score:</span>
              <span style={{ color: '#b45309', fontWeight: 700 }}>{report.chaosScore}%</span>
            </div>
            <div style={{ borderTop: '1px dashed #d1d5db', paddingTop: '4px', marginTop: '2px' }}>
              <div style={{ color: '#4b5563', marginBottom: '2px' }}>SHA-256 Digest:</div>
              <div style={{ wordBreak: 'break-all', fontSize: '9px', color: '#111827' }}>
                {report.fileSHA256}
              </div>
            </div>
          </div>

          {/* Action button */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: '8px',
            borderTop: '1px solid var(--win-dark)',
          }}>
            <button
              type="button"
              className="win95-btn"
              onClick={() => { sound.playBlip(); onClose(); }}
              style={{ minWidth: '80px', fontWeight: 700 }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
