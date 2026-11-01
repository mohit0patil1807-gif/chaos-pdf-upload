import React, { useState, useRef } from 'react';
import { 
  FolderLock, 
  Archive, 
  Paperclip, 
  Inbox, 
  ShieldAlert, 
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Radio,
  FileText,
  Clock
} from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { PrematureDropModal } from './PrematureDropModal';

interface DropTargetDefinition {
  id: string;
  title: string;
  swappedTitle: string;
  roomNumber: string;
  description: string;
  icon: React.ReactNode;
  rejectionMessage: string;
}

const ALL_TARGETS: DropTargetDefinition[] = [
  {
    id: 'attachments',
    title: 'Counter 1: ATTACHMENTS',
    swappedTitle: 'Counter 1: Supplemental Annexes Closed',
    roomNumber: 'Room 101-A',
    description: 'Supplemental annexes, picnic receipts & footnotes',
    icon: <Paperclip size={24} color="#4b5563" />,
    rejectionMessage: 'ATTACHMENTS REJECTED: Non-zero byte documents exceed weight tolerance for standard paperclips!',
  },
  {
    id: 'archive',
    title: 'Counter 2: ARCHIVE',
    swappedTitle: 'Counter 2: Relocated Window (Archive Registry)',
    roomNumber: 'Room 102-B',
    description: 'Cold storage for decommissioned 1999 documentation',
    icon: <Archive size={24} color="#4b5563" />,
    rejectionMessage: 'ARCHIVE REJECTED: Decommissioned in 1999 for Y2K maintenance. Access denied by curator!',
  },
  {
    id: 'vault',
    title: 'Counter 3: DOCUMENT VAULT',
    swappedTitle: 'Counter 3: Bio-Secure Chamber Locked',
    roomNumber: 'Room 103-C',
    description: 'Reinforced bio-secure holding chamber',
    icon: <FolderLock size={24} color="#4b5563" />,
    rejectionMessage: 'DOCUMENT VAULT REJECTED: Vault door is locked from inside to prevent ant infiltration!',
  },
  {
    id: 'destination',
    title: 'Counter 4: FINAL DESTINATION',
    swappedTitle: 'Counter 4: Official Quarantine Ingestion Desk',
    roomNumber: 'Room 104-D',
    description: 'Authorized quarantine ingestion portal (Verified target)',
    icon: <Inbox size={24} color="#000080" />,
    rejectionMessage: 'TARGET OFFLINE: Ingestion portal must be armed before payload drop!',
  },
];

interface ChaoticDropZoneProps {
  onFileAccepted: (file: File) => void;
  onInvalidFile: (fileName: string, header: string, reason: string) => void;
  onAddToast: (msg: string, type: 'info' | 'warning' | 'error' | 'success') => void;
  onIncrementChaos: (amount: number) => void;
}

export const ChaoticDropZone: React.FC<ChaoticDropZoneProps> = ({
  onFileAccepted,
  onInvalidFile,
  onAddToast,
  onIncrementChaos,
}) => {
  // Moving target state: relocates between predetermined slots (0, 1, 2)
  // After 2 dodges (dodgeCount >= 2), target locks in place and stabilizes!
  const [dodgeCount, setDodgeCount] = useState(0);
  const [targetSlot, setTargetSlot] = useState(0); // 0, 1, 2, 3
  const [isHoveredOnActive, setIsHoveredOnActive] = useState(false);

  // Swapped counters on first dragenter
  const [swappedCounters, setSwappedCounters] = useState<Record<string, boolean>>({});

  // 1.2s Dwell-to-arm state
  const hoverStartRef = useRef<number | null>(null);
  const [hoverProgress, setHoverProgress] = useState(0); // 0 to 100%
  const [isArmed, setIsArmed] = useState(false);
  const [prematureDropModal, setPrematureDropModal] = useState<{ counterLabel: string; elapsedMs: number } | null>(null);

  const activeTargetId = 'destination';
  const isStabilized = dodgeCount >= 2;

  // Handle dragenter on active moving target
  const handleActiveTargetDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isStabilized) {
      sound.playWhoosh();
      const nextDodge = dodgeCount + 1;
      setDodgeCount(nextDodge);
      const nextSlots = [2, 3, 1];
      const newSlot = nextSlots[dodgeCount % nextSlots.length];
      setTargetSlot(newSlot);

      if (nextDodge < 2) {
        onAddToast(`[WINDOW RELOCATED]: Counter 4 shifted to Slot #${newSlot + 1} to shake off ant scouts!`, 'warning');
      } else {
        sound.playStamp();
        onAddToast('✅ [COUNTER STABILIZED]: Window locked! Hold document steadily for 1.2s to arm intake!', 'success');
      }
    } else {
      setIsHoveredOnActive(true);
      if (hoverStartRef.current === null) {
        hoverStartRef.current = Date.now();
        setIsArmed(false);
      }
    }
  };

  const handleActiveTargetDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';

    if (isStabilized) {
      if (!isHoveredOnActive) {
        setIsHoveredOnActive(true);
      }
      if (hoverStartRef.current === null) {
        hoverStartRef.current = Date.now();
        setIsArmed(false);
      }

      const elapsed = Date.now() - hoverStartRef.current;
      const progress = Math.min(100, (elapsed / 1200) * 100);
      setHoverProgress(progress);

      if (elapsed >= 1200 && !isArmed) {
        setIsArmed(true);
        sound.playStamp();
        onAddToast('✅ [INTAKE ARMED]: 1.2s dwell complete! Hopper open — release PDF now!', 'success');
      }
    }
  };

  const handleActiveTargetDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHoveredOnActive(false);
    hoverStartRef.current = null;
    setHoverProgress(0);
    setIsArmed(false);
  };

  // Handle drop on active target
  const handleActiveTargetDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHoveredOnActive(false);

    const elapsed = hoverStartRef.current ? (Date.now() - hoverStartRef.current) : 0;
    hoverStartRef.current = null;
    const wasArmed = isArmed || elapsed >= 1200;
    setHoverProgress(0);
    setIsArmed(false);

    // If dropped prematurely before 1.2s:
    if (isStabilized && !wasArmed) {
      sound.playError();
      onIncrementChaos(8);
      setPrematureDropModal({
        counterLabel: 'Counter 4: FINAL DESTINATION (Room 104-D)',
        elapsedMs: elapsed,
      });
      return;
    }

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) {
      onAddToast('No document payload detected in drop event.', 'error');
      return;
    }

    const file = files[0];

    try {
      if (file.size < 5) {
        onIncrementChaos(10);
        sound.playError();
        onInvalidFile(file.name, '', 'File is under 5 bytes.');
        return;
      }

      const slice = file.slice(0, 5);
      const buffer = await slice.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const header = String.fromCharCode(...bytes);

      if (header !== '%PDF-') {
        onIncrementChaos(15);
        sound.playError();
        const printable = header.replace(/[^\x20-\x7E]/g, '?');
        onInvalidFile(file.name, printable, `Missing mandatory '%PDF-' header signature. Found: '${printable}'`);
        return;
      }

      // Valid PDF!
      sound.playStamp();
      onFileAccepted(file);
    } catch (err) {
      onInvalidFile(file.name, '', `Stream read failure: ${(err as Error).message}`);
    }
  };

  const handleDecoyDragEnter = (target: DropTargetDefinition, e: React.DragEvent) => {
    e.preventDefault();
    if (!swappedCounters[target.id]) {
      setSwappedCounters(prev => ({ ...prev, [target.id]: true }));
      sound.playBlip();
      onAddToast(`[Window Sign Swapped]: ${target.roomNumber} updated its notice board.`, 'info');
    }
  };

  const handleDecoyDrop = (target: DropTargetDefinition, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sound.playError();
    onIncrementChaos(8);
    onAddToast(target.rejectionMessage, 'warning');
  };

  // Re-order targets so active target shifts slots
  const targetsDisplay = [...ALL_TARGETS];
  if (targetSlot !== 3) {
    const destIndex = targetsDisplay.findIndex(t => t.id === 'destination');
    const [destTarget] = targetsDisplay.splice(destIndex, 1);
    targetsDisplay.splice(targetSlot, 0, destTarget);
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '1020px',
      margin: '12px auto',
      padding: '0 12px',
    }}>
      {/* Notice Board */}
      <div className="win95-inset" style={{
        padding: '10px 14px',
        backgroundColor: '#fefce8',
        border: '2px solid var(--win-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={16} color="#000080" />
          <div>
            <div style={{ fontWeight: 800, fontSize: '12px', color: '#000080', fontFamily: 'var(--font-retro-ui)' }}>
              DIRECTIVE 97-ANT // CITIZEN FILING &amp; DISCOVERY DESK
            </div>
            <div style={{ fontSize: '11px', color: '#374151', fontFamily: 'var(--font-retro-mono)' }}>
              Drag an authentic PDF from Windows Explorer into the authorized intake counter. Avoid decoys and hold steadily for 1.2s.
            </div>
          </div>
        </div>

        {/* Evasion status badge */}
        <div style={{
          padding: '3px 8px',
          backgroundColor: isStabilized ? (isArmed ? '#dcfce7' : '#fef3c7') : '#fee2e2',
          border: `1px solid ${isStabilized ? (isArmed ? '#16a34a' : '#d97706') : '#ef4444'}`,
          color: isStabilized ? (isArmed ? '#15803d' : '#92400e') : '#b91c1c',
          fontSize: '11px',
          fontWeight: 700,
          fontFamily: 'var(--font-retro-mono)',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}>
          {isStabilized ? (isArmed ? <CheckCircle2 size={13} /> : <Clock size={13} />) : <Lock size={13} />}
          <span>
            {!isStabilized 
              ? `EVASIONS DETECTED: ${dodgeCount}/2 (HOVER TO STABILIZE)` 
              : isArmed 
                ? 'INTAKE ARMED (DROP DOCUMENT NOW!)' 
                : 'STABILIZED (HOLD 1.2s TO ARM)'}
          </span>
        </div>
      </div>

      {/* 4 Windows 95 Filing Counters Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '10px',
      }}>
        {targetsDisplay.map((target) => {
          const isActive = target.id === activeTargetId;

          if (isActive) {
            return (
              <div
                key={target.id}
                onDragEnter={handleActiveTargetDragEnter}
                onDragOver={handleActiveTargetDragOver}
                onDragLeave={handleActiveTargetDragLeave}
                onDrop={handleActiveTargetDrop}
                className={`win95-outset ${isStabilized ? 'active-target-pulse' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '220px',
                  backgroundColor: isHoveredOnActive 
                    ? (isArmed ? '#dcfce7' : '#fef9c3') 
                    : (isStabilized ? '#eff6ff' : 'var(--win-gray)'),
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {/* Window Titlebar */}
                <div className="win95-titlebar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Inbox size={12} />
                    <span>{target.roomNumber} // {isArmed ? 'ARMED & READY' : (isStabilized ? 'LOCKED & AWAITING DWELL' : 'ACTIVE')}</span>
                  </div>
                  <button className="win95-titlebar-btn" disabled>_</button>
                </div>

                {/* Window Body */}
                <div style={{
                  padding: '14px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flex: 1,
                  textAlign: 'center',
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    {target.icon}
                  </div>

                  <div style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#000080',
                    fontFamily: 'var(--font-retro-ui)',
                    marginBottom: '4px',
                  }}>
                    {target.title}
                  </div>

                  <div className="win95-inset" style={{
                    padding: '6px 8px',
                    fontSize: '10px',
                    color: '#1f2937',
                    lineHeight: 1.3,
                    backgroundColor: '#ffffff',
                    width: '100%',
                    marginBottom: '8px',
                  }}>
                    {isStabilized 
                      ? (isArmed 
                          ? '✅ Intake mechanism fully armed! Release mouse now to complete PDF upload.' 
                          : 'Hold cursor steadily over this counter for 1.2s to pressurize intake mechanism.')
                      : target.description}
                  </div>

                  {/* Circular Dwell 1.2s Ring or Stamp */}
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    {isStabilized ? (
                      isHoveredOnActive ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="arming-ring-container" style={{ width: '32px', height: '32px' }}>
                            <svg className="arming-ring-svg" width="32" height="32" viewBox="0 0 32 32">
                              <circle
                                className="arming-ring-circle-bg"
                                cx="16" cy="16" r="13"
                              />
                              <circle
                                className="arming-ring-circle-fill"
                                cx="16" cy="16" r="13"
                                stroke={isArmed ? '#16a34a' : '#f59e0b'}
                                strokeDasharray={2 * Math.PI * 13}
                                strokeDashoffset={2 * Math.PI * 13 * (1 - hoverProgress / 100)}
                              />
                            </svg>
                          </div>
                          <div style={{
                            fontSize: '11px',
                            fontFamily: 'var(--font-retro-mono)',
                            fontWeight: 700,
                            color: isArmed ? '#15803d' : '#b45309'
                          }}>
                            {isArmed ? 'ARMED!' : `${Math.round(hoverProgress)}%`}
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '10px',
                          color: '#b45309',
                          fontFamily: 'var(--font-retro-mono)',
                          fontWeight: 700,
                        }}>
                          <Clock size={12} />
                          <span>Hold 1.2s to Arm</span>
                        </div>
                      )
                    ) : (
                      <div style={{
                        fontSize: '10px',
                        color: '#000080',
                        fontFamily: 'var(--font-retro-mono)',
                        fontWeight: 700,
                      }}>
                        [Hover to align slot ({dodgeCount}/2)]
                      </div>
                    )}

                    {isArmed && (
                      <div className="rubber-stamp stamp-green" style={{ fontSize: '10px', padding: '2px 6px', marginTop: '2px' }}>
                        HOPPER ARMED
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // Decoy Counter
          const isSwapped = !!swappedCounters[target.id];
          const displayTitle = isSwapped ? target.swappedTitle : target.title;

          return (
            <div
              key={target.id}
              onDragEnter={(e) => handleDecoyDragEnter(target, e)}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
              onDrop={(e) => handleDecoyDrop(target, e)}
              className="win95-outset"
              style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '220px',
                backgroundColor: 'var(--win-gray)',
                cursor: 'pointer',
              }}
            >
              <div className="win95-titlebar win95-titlebar-inactive">
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>{target.roomNumber} // {isSwapped ? 'RELOCATED' : 'CLOSED'}</span>
                </div>
                <button className="win95-titlebar-btn" disabled>_</button>
              </div>

              <div style={{
                padding: '14px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                flex: 1,
                textAlign: 'center',
              }}>
                <div style={{ marginBottom: '8px', opacity: 0.7 }}>
                  {target.icon}
                </div>

                <div style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: isSwapped ? '#991b1b' : '#374151',
                  marginBottom: '4px',
                }}>
                  {displayTitle}
                </div>

                <div className="win95-inset" style={{
                  padding: '6px 8px',
                  fontSize: '10px',
                  color: '#4b5563',
                  lineHeight: 1.3,
                  backgroundColor: '#ffffff',
                  width: '100%',
                  marginBottom: '8px',
                }}>
                  {isSwapped ? 'Notice: Counter services indefinitely suspended by decree of Ministry.' : target.description}
                </div>

                <div style={{
                  marginTop: 'auto',
                  fontSize: '9px',
                  color: '#6b7280',
                  fontFamily: 'var(--font-retro-mono)',
                }}>
                  {isSwapped ? '[WINDOW CLOSED]' : '[INACTIVE WINDOW]'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desk Instructions Footer */}
      <div className="win95-inset-gray" style={{
        padding: '6px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '6px',
        fontSize: '11px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldAlert size={14} color="#000080" />
          <span>
            <b>Clerk Protocol:</b> 1) Hover <b>Counter 4 (FINAL DESTINATION)</b> twice to lock position ➔ 2) Hold steadily for 1.2s until circular ring fills to 100% (ARMED) ➔ 3) Release drop!
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-retro-mono)', fontSize: '10px', color: '#4b5563' }}>
          Standard 97-D Dwell Requirement Active
        </div>
      </div>

      {/* Premature Drop Modal */}
      {prematureDropModal && (
        <PrematureDropModal
          counterLabel={prematureDropModal.counterLabel}
          elapsedMs={prematureDropModal.elapsedMs}
          onDismiss={() => setPrematureDropModal(null)}
        />
      )}
    </div>
  );
};
