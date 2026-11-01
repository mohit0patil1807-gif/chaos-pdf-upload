import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderArchive, 
  Stamp, 
  FileCheck, 
  Inbox, 
  Clock, 
  Lock, 
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle2,
  MoveRight,
  GripHorizontal
} from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { formatBytes } from '../utils/fileUtils';

export interface CounterInfo {
  internalId: 'A_Archives' | 'B_Certification' | 'C_Compliance' | 'D_Dispatch';
  initialLabel: string;
  swappedLabel: string;
  clerkTitle: string;
  roomNumber: string;
  stampColor: string;
}

export const COUNTERS: CounterInfo[] = [
  {
    internalId: 'A_Archives',
    initialLabel: 'Counter 3: Expedited Final Ingestion Desk',
    swappedLabel: 'Counter 3: Relocated Window (Archive Registry)',
    clerkTitle: 'Archivist M. Abernathy',
    roomNumber: 'Room 101-A',
    stampColor: 'var(--stamp-blue)',
  },
  {
    internalId: 'B_Certification',
    initialLabel: 'Counter 1: General Citizen Inquiries & Lost Forms',
    swappedLabel: 'Counter 1: General Inquiries Closed — Notary Desk',
    clerkTitle: 'Notary Clerk J. Higgins',
    roomNumber: 'Room 102-B',
    stampColor: 'var(--stamp-red)',
  },
  {
    internalId: 'C_Compliance',
    initialLabel: 'Counter 4: Tax Rebates & Coffee Fund Grievances',
    swappedLabel: 'Counter 4: Compliance & Kerning Examination Desk',
    clerkTitle: 'Inspector T. Vance',
    roomNumber: 'Room 103-C',
    stampColor: 'var(--stamp-green)',
  },
  {
    internalId: 'D_Dispatch',
    initialLabel: 'Counter 2: Official Document Drop & Final Dispatch',
    swappedLabel: 'Counter 2: Final Docket Box (Requires Prior Clearance)',
    clerkTitle: 'Chief Dispatcher G. Vance',
    roomNumber: 'Room 104-D',
    stampColor: 'var(--win-navy)',
  },
];

interface FilingCountersArenaProps {
  file: File | null;
  fileSHA256: string;
  onInitialFileDrop: (file: File) => void;
  onPrematureDrop: (counterLabel: string, elapsedMs: number) => void;
  currentCheckpointIndex: number;
  checkpointsCleared: boolean[];
  onCheckpointCleared: (index: number) => void;
  onOutOfOrderDrop: (attemptedId: string, expectedId: string) => void;
  onAddToast: (msg: string, type: 'info' | 'warning' | 'error' | 'success') => void;
  onOpenPicker: () => void;
}

export const FilingCountersArena: React.FC<FilingCountersArenaProps> = ({
  file,
  fileSHA256,
  onInitialFileDrop,
  onPrematureDrop,
  currentCheckpointIndex,
  checkpointsCleared,
  onCheckpointCleared,
  onOutOfOrderDrop,
  onAddToast,
  onOpenPicker,
}) => {
  // Track which counters have swapped their label once
  const [swappedCounters, setSwappedCounters] = useState<Record<string, boolean>>({});

  // Active hover tracking for 1.2s dwell-to-arm (Phase 1 OS file drop)
  const [hoveredCounterId, setHoveredCounterId] = useState<string | null>(null);
  const [hoverProgress, setHoverProgress] = useState(0); // 0 to 100%
  const [isArmed, setIsArmed] = useState(false);
  const hoverStartRef = useRef<number | null>(null);

  // In-app document card dragging state (Phase 2)
  const [isDraggingCard, setIsDraggingCard] = useState(false);

  // Reset hover state when file changes or is cleared
  useEffect(() => {
    setHoveredCounterId(null);
    setHoverProgress(0);
    setIsArmed(false);
    hoverStartRef.current = null;
  }, [file]);

  // Handle drag enter on a counter: swaps label exactly once on first dragenter
  const handleDragEnter = (counter: CounterInfo, e: React.DragEvent) => {
    e.preventDefault();
    if (!swappedCounters[counter.internalId]) {
      setSwappedCounters(prev => ({ ...prev, [counter.internalId]: true }));
      sound.playBlip();
      onAddToast(`[Window Sign Swapped]: ${counter.roomNumber} updated its notice board.`, 'info');
    }
  };

  // Continuous dragover: handles 1.2s dwell timer
  const handleDragOver = (counter: CounterInfo, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    // If still in Phase 1 (Initial OS drop)
    if (!file) {
      if (hoveredCounterId !== counter.internalId) {
        setHoveredCounterId(counter.internalId);
        hoverStartRef.current = Date.now();
        setIsArmed(false);
      }

      if (hoverStartRef.current) {
        const elapsed = Date.now() - hoverStartRef.current;
        const progress = Math.min(100, (elapsed / 1200) * 100);
        setHoverProgress(progress);

        if (elapsed >= 1200 && !isArmed) {
          setIsArmed(true);
          sound.playCheckpointSuccess();
          onAddToast(`${counter.roomNumber} INTAKE ARMED: Hopper open! Drop PDF now.`, 'success');
        }
      }
    }
  };

  const handleDragLeave = (counter: CounterInfo, e: React.DragEvent) => {
    e.preventDefault();
    if (hoveredCounterId === counter.internalId) {
      setHoveredCounterId(null);
      setHoverProgress(0);
      setIsArmed(false);
      hoverStartRef.current = null;
    }
  };

  // Drop handler: manages both Phase 1 (OS File) and Phase 2 (In-App Document Card)
  const handleDrop = (counter: CounterInfo, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // PHASE 1: Initial OS File Drop
    if (!file) {
      const files = e.dataTransfer.files;
      if (!files || files.length === 0) {
        onAddToast('No document payload detected in drop event.', 'error');
        return;
      }

      const droppedFile = files[0];
      const elapsed = hoverStartRef.current ? Date.now() - hoverStartRef.current : 0;

      // Check if dropped prematurely before 1.2s
      if (elapsed < 1200) {
        sound.playError();
        onPrematureDrop(counter.initialLabel, elapsed);
        setHoveredCounterId(null);
        setHoverProgress(0);
        setIsArmed(false);
        hoverStartRef.current = null;
        return;
      }

      // Valid dwell >= 1.2s! Accept file
      sound.playStamp();
      onInitialFileDrop(droppedFile);
      setHoveredCounterId(null);
      setHoverProgress(0);
      setIsArmed(false);
      hoverStartRef.current = null;
      return;
    }

    // PHASE 2: In-App Document Card Dropped onto a Counter
    handleCardDropOnCounter(counter);
  };

  // Logic for stamping the in-app document card at a counter
  const handleCardDropOnCounter = (counter: CounterInfo) => {
    const expectedCounter = COUNTERS[currentCheckpointIndex];

    if (counter.internalId === expectedCounter.internalId) {
      // Correct counter in alphabetical order!
      sound.playStamp();
      onCheckpointCleared(currentCheckpointIndex);
      onAddToast(`Counter Cleared: ${counter.clerkTitle} stamped Docket #${currentCheckpointIndex + 1}! Proceed to next counter.`, 'success');
    } else {
      // Out of order drop!
      sound.playError();
      onOutOfOrderDrop(counter.internalId, expectedCounter.internalId);
    }
  };

  return (
    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* 2x2 Grid of Filing Windows */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '8px',
      }}>
        {COUNTERS.map((counter, idx) => {
          const isCleared = checkpointsCleared[idx];
          const isCurrentTarget = file ? idx === currentCheckpointIndex : true;
          const isHovered = hoveredCounterId === counter.internalId;
          const isSwapped = !!swappedCounters[counter.internalId];
          const displayLabel = isSwapped ? counter.swappedLabel : counter.initialLabel;

          return (
            <div
              key={counter.internalId}
              className={`win95-outset ${isCurrentTarget && file ? 'target-pulse' : ''}`}
              onDragEnter={(e) => handleDragEnter(counter, e)}
              onDragOver={(e) => handleDragOver(counter, e)}
              onDragLeave={(e) => handleDragLeave(counter, e)}
              onDrop={(e) => handleDrop(counter, e)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '175px',
                position: 'relative',
                backgroundColor: isCleared 
                  ? '#f0fdf4' 
                  : (isCurrentTarget && file ? '#fffbeb' : 'var(--win-gray)'),
                transition: 'background-color 0.2s ease',
              }}
            >
              {/* Counter Window Titlebar */}
              <div 
                className={`win95-titlebar ${isCurrentTarget ? '' : 'win95-titlebar-inactive'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '2px 6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {idx === 0 && <FolderArchive size={13} />}
                  {idx === 1 && <Stamp size={13} />}
                  {idx === 2 && <FileCheck size={13} />}
                  {idx === 3 && <Inbox size={13} />}
                  <span style={{ fontSize: '11px', fontWeight: 700 }}>
                    {counter.roomNumber} // {counter.clerkTitle}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isCleared ? (
                    <span style={{
                      fontSize: '9px',
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      fontWeight: 700,
                    }}>
                      STAMPED
                    </span>
                  ) : !file ? (
                    <span style={{
                      fontSize: '9px',
                      backgroundColor: isHovered && isArmed ? '#15803d' : (isHovered ? '#b45309' : '#000080'),
                      color: '#ffffff',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      fontWeight: 700,
                    }}>
                      {isHovered && isArmed ? 'ARMED' : (isHovered ? 'DWELLING...' : 'INTAKE READY')}
                    </span>
                  ) : isCurrentTarget ? (
                    <span style={{
                      fontSize: '9px',
                      backgroundColor: '#b91c1c',
                      color: '#ffffff',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      fontWeight: 700,
                    }}>
                      NEXT IN SEQUENCE
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '9px',
                      backgroundColor: '#6b7280',
                      color: '#ffffff',
                      padding: '1px 4px',
                      borderRadius: '2px',
                    }}>
                      QUEUED
                    </span>
                  )}
                </div>
              </div>

              {/* Counter Body */}
              <div style={{
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1,
                gap: '8px',
              }}>
                {/* Signage Banner */}
                <div className="win95-inset" style={{
                  padding: '8px',
                  backgroundColor: '#ffffff',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isCurrentTarget ? '#000080' : '#374151',
                    marginBottom: '4px',
                    minHeight: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {displayLabel}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: isSwapped ? '#b91c1c' : '#6b7280',
                    fontFamily: 'var(--font-retro-mono)',
                  }}>
                    {isSwapped ? '[NOTICE CHANGED UPON CITIZEN ARRIVAL]' : '[STANDARD POSTED SIGNAGE]'}
                  </div>
                </div>

                {/* Counter Baseplate and Arming / Routing Feedback */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                  paddingTop: '6px',
                  borderTop: '1px dashed var(--win-dark)',
                }}>
                  {/* Stable Internal ID indicator */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{
                      fontSize: '9px',
                      color: '#4b5563',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--font-retro-mono)',
                    }}>
                      Internal Registry:
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-retro-mono)',
                      color: '#111827',
                    }}>
                      [{counter.internalId}]
                    </span>
                  </div>

                  {/* Visual Status or 1.2s Ring */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isCleared ? (
                      <div className="rubber-stamp stamp-green" style={{ fontSize: '10px', padding: '2px 6px' }}>
                        CLEARED
                      </div>
                    ) : !file ? (
                      /* Phase 1 Dwell Ring */
                      isHovered ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div className="arming-ring-container" style={{ width: '32px', height: '32px' }}>
                            <svg className="arming-ring-svg" width="32" height="32" viewBox="0 0 32 32">
                              <circle
                                className="arming-ring-circle-bg"
                                cx="16" cy="16" r="13"
                              />
                              <circle
                                className="arming-ring-circle-fill"
                                cx="16" cy="16" r="13"
                                stroke={isArmed ? '#22c55e' : '#f59e0b'}
                                strokeDasharray={2 * Math.PI * 13}
                                strokeDashoffset={2 * Math.PI * 13 * (1 - hoverProgress / 100)}
                              />
                            </svg>
                          </div>
                          <div style={{
                            fontSize: '10px',
                            fontFamily: 'var(--font-retro-mono)',
                            fontWeight: 700,
                            color: isArmed ? '#15803d' : '#b45309'
                          }}>
                            {isArmed ? 'ARMED' : `${Math.round(hoverProgress)}%`}
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '10px',
                          color: '#b45309',
                          fontFamily: 'var(--font-retro-mono)',
                        }}>
                          <Clock size={12} />
                          <span>Dwell 1.2s</span>
                        </div>
                      )
                    ) : isCurrentTarget ? (
                      /* Phase 2 Target Button / Stamp Indicator */
                      <button
                        className="win95-btn"
                        onClick={() => handleCardDropOnCounter(counter)}
                        title="Click to stamp docket here (Speedrun / Accessibility)"
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          fontWeight: 700,
                        }}
                      >
                        Stamp Here ➔
                      </button>
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '10px',
                        color: '#6b7280',
                      }}>
                        <Lock size={11} />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PHASE 2: IN-APP CITIZEN DOCUMENT CARD */}
      {file ? (
        <div className="win95-outset" style={{
          padding: '10px 14px',
          backgroundColor: '#fef3c7',
          border: '2px solid #ca8a04',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#ffffff',
                border: '1px solid #d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '2px 2px 0px rgba(0,0,0,0.2)',
              }}>
                <FileText size={20} color="#b45309" />
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#78350f' }}>
                  OFFICIAL IN-APP DOCKET FORM 77-A: {file.name}
                </div>
                <div style={{ fontSize: '10px', color: '#92400e', fontFamily: 'var(--font-retro-mono)' }}>
                  Physical Mass: {formatBytes(file.size)} | SHA-256: {fileSHA256 ? fileSHA256.substring(0, 16) + '...' : 'Computing...'}
                </div>
              </div>
            </div>

            {/* Draggable Badge / Action */}
            <div
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', 'DDA_FORM_77A');
                e.dataTransfer.dropEffect = 'copy';
                setIsDraggingCard(true);
                sound.playBlip();
              }}
              onDragEnd={() => setIsDraggingCard(false)}
              className="win95-outset"
              style={{
                cursor: 'grab',
                padding: '6px 12px',
                backgroundColor: isDraggingCard ? '#fde047' : '#ffffff',
                border: '2px solid #b45309',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '3px 3px 0px rgba(0,0,0,0.3)',
              }}
            >
              <GripHorizontal size={16} color="#b45309" />
              <span style={{ fontWeight: 800, fontSize: '11px', color: '#92400e' }}>
                {isDraggingCard ? 'DRAGGING DOSSIER...' : 'DRAG THIS CARD TO NEXT COUNTER'}
              </span>
            </div>
          </div>

          {/* Sequential Stamp Progress Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            padding: '6px 10px',
            border: '1px solid #d97706',
            fontSize: '11px',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontWeight: 700, color: '#000080' }}>
              Required Clearances ({checkpointsCleared.filter(Boolean).length}/4):
            </span>

            {COUNTERS.map((c, idx) => {
              const cleared = checkpointsCleared[idx];
              const isCurrent = idx === currentCheckpointIndex;
              return (
                <div
                  key={c.internalId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    backgroundColor: cleared ? '#dcfce7' : (isCurrent ? '#fee2e2' : '#f3f4f6'),
                    border: `1px solid ${cleared ? '#16a34a' : (isCurrent ? '#dc2626' : '#d1d5db')}`,
                    color: cleared ? '#15803d' : (isCurrent ? '#b91c1c' : '#6b7280'),
                    fontWeight: isCurrent || cleared ? 700 : 500,
                  }}
                >
                  {cleared ? '✓' : `${idx + 1}.`} [{c.internalId}]
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* PHASE 1: INTAKE GUIDANCE & WCAG FILE-PICKER FALLBACK */
        <div className="win95-inset-gray" style={{
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '11px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Upload size={14} color="#000080" />
            <span>
              <b>Intake Protocol:</b> Drag any random PDF from Windows File Explorer onto a counter. Hold steadily for 1.2s to arm intake.
            </span>
          </div>

          <button
            className="win95-btn"
            onClick={onOpenPicker}
            style={{ fontSize: '11px', gap: '4px' }}
          >
            <FolderArchive size={13} />
            <span>📁 Manual File Slip (File Explorer Picker)</span>
          </button>
        </div>
      )}
    </div>
  );
};
