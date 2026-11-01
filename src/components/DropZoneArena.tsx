import React, { useState } from 'react';
import { 
  FileText, 
  FolderLock, 
  Archive, 
  Paperclip, 
  Trash2, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Scan, 
  Stamp, 
  Lock, 
  Unlock,
  Radio,
  Sparkles
} from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { isPDFFile } from '../utils/fileUtils';

interface DropZoneArenaProps {
  checkpoint1Cleared: boolean;
  checkpoint2Cleared: boolean;
  onClearCheckpoint1: () => void;
  onClearCheckpoint2: () => void;
  onFileAccepted: (file: File) => void;
  onRejectFile: (reason: string) => void;
  onAddToast: (msg: string, type: 'info' | 'warning' | 'error' | 'success') => void;
}

export const DropZoneArena: React.FC<DropZoneArenaProps> = ({
  checkpoint1Cleared,
  checkpoint2Cleared,
  onClearCheckpoint1,
  onClearCheckpoint2,
  onFileAccepted,
  onRejectFile,
  onAddToast,
}) => {
  // Moving drop target state
  const [dodgeCount, setDodgeCount] = useState(0);
  const [targetSlot, setTargetSlot] = useState(0); // 0, 1, 2
  const [isPortalHovered, setIsPortalHovered] = useState(false);

  // Misleading zone rejection messages
  const handleMisleadingDrop = (zoneName: string, reason: string) => {
    sound.playError();
    onAddToast(`REJECTED by ${zoneName}: ${reason}`, 'warning');
  };

  // Checkpoint dragover handlers
  const handleScannerEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (!checkpoint1Cleared) {
      sound.playCheckpointSuccess();
      onClearCheckpoint1();
      onAddToast('Checkpoint 1 Cleared: PDF successfully de-ionized in Scanner Gate!', 'success');
    }
  };

  const handleNotaryEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (!checkpoint1Cleared) {
      onAddToast('Sequence Error: You must pass Checkpoint 1 (Scanner) before Notarization!', 'warning');
      sound.playBeep(260, 'sawtooth', 0.1, 0.08);
      return;
    }
    if (!checkpoint2Cleared) {
      sound.playStamp();
      onClearCheckpoint2();
      onAddToast('Checkpoint 2 Cleared: Imperial Bureaucratic Notary Seal affixed!', 'success');
    }
  };

  // Primary portal hover dodge logic
  const handlePortalDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPortalHovered(true);

    // If target has dodged less than 2 times, move to next slot!
    if (dodgeCount < 2) {
      sound.playTeleport();
      const nextCount = dodgeCount + 1;
      const nextSlot = (targetSlot + 1) % 3;
      setDodgeCount(nextCount);
      setTargetSlot(nextSlot);
      onAddToast(`Evasive Maneuver ${nextCount}/2: Target relocated to Slot #${nextSlot + 1}!`, 'info');
    }
  };

  const handlePortalDragLeave = () => {
    setIsPortalHovered(false);
  };

  const handlePortalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPortalHovered(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) {
      onAddToast('Drop failed: No file detected in transfer stream.', 'error');
      return;
    }

    const file = files[0];

    // Check if checkpoints cleared
    if (!checkpoint1Cleared || !checkpoint2Cleared) {
      sound.playError();
      onAddToast('ACCESS DENIED: Sequence incomplete! PDF must pass Checkpoints 1 & 2 first.', 'error');
      return;
    }

    // Validate PDF
    if (!isPDFFile(file)) {
      sound.playError();
      onRejectFile(`File "${file.name}" rejected. Only genuine Portable Document Format (.pdf) files are authorized.`);
      return;
    }

    // Success!
    sound.playCheckpointSuccess();
    onFileAccepted(file);
  };

  const isLockedAndReady = dodgeCount >= 2 && checkpoint1Cleared && checkpoint2Cleared;

  // Slot positions for the moving drop target
  const getSlotStyle = () => {
    switch (targetSlot) {
      case 1:
        return { order: 1, transform: 'scale(1.02)' };
      case 2:
        return { order: 6, transform: 'scale(1.02)' };
      default:
        return { order: 4, transform: 'scale(1)' };
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1.5rem 1rem',
    }}>
      {/* Visual Instruction & Sequence Tracker */}
      <div className="glass-panel" style={{
        padding: '1.25rem 1.5rem',
        borderLeft: '4px solid var(--accent-cyan)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Radio size={18} color="var(--accent-cyan)" className="pulse-target" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#f8fafc' }}>
              DIRECTIVE 104-E: SEQUENTIAL PAYLOAD CONVEYANCE
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Follow the mandatory 3-step sequence: Drag PDF across <strong>Checkpoint 1</strong>, then <strong>Checkpoint 2</strong>, then drop into the <strong>Stabilized Portal</strong>.
          </p>
        </div>

        {/* Checkpoint Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.8rem',
            borderRadius: '8px',
            backgroundColor: checkpoint1Cleared ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${checkpoint1Cleared ? 'var(--accent-green)' : 'rgba(255, 255, 255, 0.1)'}`,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
          }}>
            {checkpoint1Cleared ? <CheckCircle2 size={16} color="var(--accent-green)" /> : <AlertCircle size={16} color="var(--text-muted)" />}
            <span style={{ color: checkpoint1Cleared ? 'var(--accent-green)' : 'var(--text-muted)' }}>
              1. SCANNER: {checkpoint1Cleared ? 'PASSED' : 'PENDING'}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.8rem',
            borderRadius: '8px',
            backgroundColor: checkpoint2Cleared ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${checkpoint2Cleared ? 'var(--accent-green)' : 'rgba(255, 255, 255, 0.1)'}`,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
          }}>
            {checkpoint2Cleared ? <CheckCircle2 size={16} color="var(--accent-green)" /> : <AlertCircle size={16} color="var(--text-muted)" />}
            <span style={{ color: checkpoint2Cleared ? 'var(--accent-green)' : 'var(--text-muted)' }}>
              2. NOTARY: {checkpoint2Cleared ? 'PASSED' : 'PENDING'}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.8rem',
            borderRadius: '8px',
            backgroundColor: isLockedAndReady ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${isLockedAndReady ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
          }}>
            {isLockedAndReady ? <Unlock size={16} color="var(--accent-cyan)" /> : <Lock size={16} color="var(--text-muted)" />}
            <span style={{ color: isLockedAndReady ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
              3. PORTAL: {isLockedAndReady ? 'READY' : (dodgeCount >= 2 ? 'LOCKED' : `EVADING (${dodgeCount}/2)`)}
            </span>
          </div>
        </div>
      </div>

      {/* Security Checkpoint Gates (Intermediate Drag-Path Targets) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1rem',
      }}>
        {/* Checkpoint 1: Scanner Gate */}
        <div
          onDragOver={(e) => { e.preventDefault(); }}
          onDragEnter={handleScannerEnter}
          className={`glass-panel ${checkpoint1Cleared ? 'glass-panel-accent' : ''}`}
          style={{
            padding: '1.25rem',
            border: checkpoint1Cleared 
              ? '2px solid var(--accent-green)' 
              : '2px dashed rgba(6, 182, 212, 0.4)',
            backgroundColor: checkpoint1Cleared ? 'rgba(16, 185, 129, 0.08)' : 'rgba(6, 182, 212, 0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'crosshair',
            transition: 'all 0.3s ease',
            boxShadow: checkpoint1Cleared ? '0 0 20px rgba(16, 185, 129, 0.2)' : 'none',
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: checkpoint1Cleared ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Scan size={26} color={checkpoint1Cleared ? 'var(--accent-green)' : 'var(--accent-cyan)'} />
          </div>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 800,
              fontSize: '0.95rem',
              color: checkpoint1Cleared ? 'var(--accent-green)' : '#f8fafc',
            }}>
              CHECKPOINT 1: DE-IONIZATION GATE
              {checkpoint1Cleared && <CheckCircle2 size={16} color="var(--accent-green)" />}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {checkpoint1Cleared 
                ? 'Status: Verified. Static charge neutralized.' 
                : 'Drag your PDF over this box to neutralize document static.'}
            </p>
          </div>
        </div>

        {/* Checkpoint 2: Notary Stamp */}
        <div
          onDragOver={(e) => { e.preventDefault(); }}
          onDragEnter={handleNotaryEnter}
          className={`glass-panel ${checkpoint2Cleared ? 'glass-panel-accent' : ''}`}
          style={{
            padding: '1.25rem',
            border: checkpoint2Cleared 
              ? '2px solid var(--accent-green)' 
              : '2px dashed rgba(245, 158, 11, 0.4)',
            backgroundColor: checkpoint2Cleared ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'crosshair',
            transition: 'all 0.3s ease',
            boxShadow: checkpoint2Cleared ? '0 0 20px rgba(16, 185, 129, 0.2)' : 'none',
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: checkpoint2Cleared ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Stamp size={26} color={checkpoint2Cleared ? 'var(--accent-green)' : 'var(--accent-amber)'} />
          </div>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 800,
              fontSize: '0.95rem',
              color: checkpoint2Cleared ? 'var(--accent-green)' : '#f8fafc',
            }}>
              CHECKPOINT 2: DIGITAL NOTARY STAMP
              {checkpoint2Cleared && <CheckCircle2 size={16} color="var(--accent-green)" />}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {checkpoint2Cleared 
                ? 'Status: Notarized under decree 88-Gamma.' 
                : 'Drag your PDF over this box to affix official notary seal.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Misleading Drop Zones + Moving Valid Target */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Misleading 1: Archived Dead-Storage */}
        <div
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => {
            e.preventDefault();
            handleMisleadingDrop('Archived Dead-Storage', 'Requires Form 99-D and antique microfiche reader clearance.');
          }}
          className="glass-panel"
          style={{
            order: 2,
            padding: '1.75rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '0.75rem',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            cursor: 'not-allowed',
          }}
        >
          <Archive size={32} color="#94a3b8" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>Archived Dead-Storage</h3>
          <p style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Permanent cryogenic holding facility for obsolete blueprints.
          </p>
          <span style={{ fontSize: '0.65rem', color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
            ⚠️ ACCESS CODE REQUIRED
          </span>
        </div>

        {/* Misleading 2: Executive Attachments Silo */}
        <div
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => {
            e.preventDefault();
            handleMisleadingDrop('Executive Attachments Silo', 'Direct C-Suite memo access only. You are missing a golf handicap certificate.');
          }}
          className="glass-panel"
          style={{
            order: 3,
            padding: '1.75rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '0.75rem',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            cursor: 'not-allowed',
          }}
        >
          <Paperclip size={32} color="#94a3b8" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>Executive Attachments</h3>
          <p style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Reserved strictly for quarterly board reports & budget overrides.
          </p>
          <span style={{ fontSize: '0.65rem', color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
            ⚠️ EXECUTIVE LEVEL RESTRICTED
          </span>
        </div>

        {/* THE VALID MOVING TARGET: OmniVault™ Primary Ingestion Portal */}
        <div
          onDragOver={(e) => { e.preventDefault(); }}
          onDragEnter={handlePortalDragEnter}
          onDragLeave={handlePortalDragLeave}
          onDrop={handlePortalDrop}
          className={`glass-panel ${isLockedAndReady ? 'lock-target' : (isPortalHovered ? 'jitter-effect' : 'pulse-target')}`}
          style={{
            ...getSlotStyle(),
            gridColumn: 'span 2',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1rem',
            border: isLockedAndReady 
              ? '3px solid #10b981' 
              : '3px solid #06b6d4',
            backgroundColor: isLockedAndReady 
              ? 'rgba(16, 185, 129, 0.12)' 
              : 'rgba(6, 182, 212, 0.08)',
            position: 'relative',
            cursor: 'copy',
            transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: isLockedAndReady 
              ? '0 0 40px rgba(16, 185, 129, 0.5)' 
              : '0 0 25px rgba(6, 182, 212, 0.3)',
          }}
        >
          {/* Target Reticle Badge */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '6px',
            backgroundColor: isLockedAndReady ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: isLockedAndReady ? 'var(--accent-green)' : 'var(--accent-cyan)',
          }}>
            {isLockedAndReady ? <Sparkles size={14} /> : <Radio size={14} />}
            {isLockedAndReady ? 'STABILIZED & LOCKED' : `TARGET SLOT ${targetSlot + 1} (EVADES: ${dodgeCount}/2)`}
          </div>

          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: isLockedAndReady ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FileText size={36} color={isLockedAndReady ? 'var(--accent-green)' : 'var(--accent-cyan)'} />
          </div>

          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              fontFamily: 'var(--font-heading)',
              color: isLockedAndReady ? 'var(--accent-green)' : '#f8fafc',
              letterSpacing: '0.02em',
            }}>
              {isLockedAndReady 
                ? '🎯 PRIMARY INGESTION PORTAL (STABILIZED)' 
                : 'OmniVault™ PRIMARY INGESTION PORTAL'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0.35rem auto 0' }}>
              {isLockedAndReady 
                ? '✅ Gravitational anchor locked! Drop your genuine PDF here to start formalities!' 
                : (dodgeCount < 2 
                    ? `⚠️ Moving target: Portal will dodge ${2 - dodgeCount} more time(s) before stabilizing.` 
                    : 'Target stabilized! Complete checkpoints to unlock.')}
            </p>
          </div>

          {/* Status strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: isLockedAndReady ? 'var(--accent-green)' : '#38bdf8',
          }}>
            {isLockedAndReady ? (
              <span>READY FOR INGESTION — DROP YOUR PDF DIRECTLY HERE</span>
            ) : (
              <span>PASS CHECKPOINTS 1 & 2 FIRST, THEN DROP INTO THIS TARGET</span>
            )}
          </div>
        </div>

        {/* Misleading 3: Unverified Documents Bin */}
        <div
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => {
            e.preventDefault();
            handleMisleadingDrop('Unverified Documents Bin', 'This bin is undergoing scheduled fumigation.');
          }}
          className="glass-panel"
          style={{
            order: 5,
            padding: '1.75rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '0.75rem',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            cursor: 'not-allowed',
          }}
        >
          <FolderLock size={32} color="#94a3b8" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>Unverified Documents Bin</h3>
          <p style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Unsorted paperwork holding bin. Empty on weekends and alternate Thursdays.
          </p>
          <span style={{ fontSize: '0.65rem', color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
            ⚠️ INACTIVE CARRIER
          </span>
        </div>

        {/* Misleading 4: Temporary Staging Buffer */}
        <div
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => {
            e.preventDefault();
            handleMisleadingDrop('Temporary Staging Buffer', 'Buffer overflowing with uncompressed bureaucratic paperwork.');
          }}
          className="glass-panel"
          style={{
            order: 7,
            padding: '1.75rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '0.75rem',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            cursor: 'not-allowed',
          }}
        >
          <Layers size={32} color="#94a3b8" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>Temporary Staging Buffer</h3>
          <p style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Ephemeral RAM buffer. Will vaporize data upon power flickers.
          </p>
          <span style={{ fontSize: '0.65rem', color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
            ⚠️ UNSTABLE VOLATILE BUFFER
          </span>
        </div>

        {/* Misleading 5: Deprecated Shredder */}
        <div
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => {
            e.preventDefault();
            handleMisleadingDrop('Deprecation Shredder', 'Are you mad? Do not shred your valid submission!');
          }}
          className="glass-panel"
          style={{
            order: 8,
            padding: '1.75rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '0.75rem',
            border: '1px dashed rgba(244, 63, 94, 0.3)',
            backgroundColor: 'rgba(244, 63, 94, 0.02)',
            cursor: 'not-allowed',
          }}
        >
          <Trash2 size={32} color="#fb7185" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fb7185' }}>Deprecation Shredder</h3>
          <p style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Destructive disposal unit. 240 cross-cut diamond blades.
          </p>
          <span style={{ fontSize: '0.65rem', color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
            🛑 DESTRUCTIVE DROP
          </span>
        </div>
      </div>
    </div>
  );
};
