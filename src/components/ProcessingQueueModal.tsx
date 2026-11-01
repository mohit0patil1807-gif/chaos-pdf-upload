import React, { useEffect, useState, useRef } from 'react';
import { 
  Folder, 
  FileText, 
  HardDrive, 
  AlertTriangle, 
  Clock, 
  PenTool,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { formatBytes } from '../utils/fileUtils';

interface ProcessingQueueModalProps {
  file: File;
  fileSHA256: string;
  onComplete: () => void;
  onAddAttempt: () => void;
}

export const ProcessingQueueModal: React.FC<ProcessingQueueModalProps> = ({
  file,
  fileSHA256,
  onComplete,
  onAddAttempt,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing 9-track magnetic tape drive...');
  const [isStalledAt99, setIsStalledAt99] = useState(false);
  const [signatureProgress, setSignatureProgress] = useState(0); // 0 to 100%
  const [isSigned, setIsSigned] = useState(false);
  const [decoyFeedback, setDecoyFeedback] = useState('');
  const [holdError, setHoldError] = useState('');
  const [stallSeconds, setStallSeconds] = useState(0);

  const holdStartRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<number | null>(null);

  // Finite progress animation up to 99%
  useEffect(() => {
    if (isStalledAt99 || isSigned) return;

    const stages = [
      { p: 18, text: 'Allocating magnetic tape track & sector...', delay: 400 },
      { p: 42, text: 'Validating PostScript kerning against ISO-1997...', delay: 900 },
      { p: 68, text: 'Encrypting packet with 40-bit export cipher...', delay: 1500 },
      { p: 86, text: 'Transmitting packet bursts over 28.8k baud modem...', delay: 2200 },
      { p: 99, text: '⚠️ QUEUE STALLED AT 99%: Awaiting citizen physical ink ratification...', delay: 3000 },
    ];

    const timeouts = stages.map(st => {
      return setTimeout(() => {
        setProgress(st.p);
        setStatusText(st.text);
        sound.playBlip();
        if (st.p === 99) {
          sound.playError();
          setIsStalledAt99(true);
        }
      }, st.delay);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [isStalledAt99, isSigned]);

  // Track seconds spent stalled for escalating hints
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isStalledAt99 && !isSigned) {
      interval = setInterval(() => {
        setStallSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStalledAt99, isSigned]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
    };
  }, []);

  // Handle mousedown / touchstart on "Sign Here" pad
  const startSigning = () => {
    if (isSigned) return;
    setHoldError('');
    setDecoyFeedback('');
    holdStartRef.current = Date.now();
    sound.playBeep(480, 'sine', 0.1, 0.05);

    holdIntervalRef.current = window.setInterval(() => {
      if (!holdStartRef.current) return;
      const elapsed = Date.now() - holdStartRef.current;
      const pct = Math.min(100, (elapsed / 2000) * 100);
      setSignatureProgress(pct);

      if (elapsed >= 2000) {
        // Complete signature!
        clearInterval(holdIntervalRef.current!);
        holdIntervalRef.current = null;
        holdStartRef.current = null;
        setIsSigned(true);
        sound.playVictory();
        setProgress(100);
        setStatusText('Ingestion 100% Complete! Printing official certificate...');

        setTimeout(() => {
          onComplete();
        }, 700);
      }
    }, 40);
  };

  // Handle mouseup / mouseleave / touchend before 2000ms
  const cancelSigning = () => {
    if (isSigned) return;
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }

    if (holdStartRef.current) {
      const elapsed = Date.now() - holdStartRef.current;
      holdStartRef.current = null;
      if (elapsed < 2000) {
        sound.playError();
        onAddAttempt();
        setHoldError(
          `SIGNATURE SMUDGE: Pen lifted prematurely at ${(elapsed / 1000).toFixed(1)}s. Ink ratification requires a continuous 2.0 second pressure.`
        );
      }
    }
    setSignatureProgress(0);
  };

  // Decoy action handlers
  const handleExpedite = () => {
    sound.playError();
    onAddAttempt();
    setDecoyFeedback('Expedite petition registered in triplicate. Administrative delay increased by 14 business days.');
  };

  const handleModemCalibrate = () => {
    sound.playBlip();
    setDecoyFeedback('Modem Carrier Frequency locked at 28,800 bps. Line parity normal.');
  };

  const handleCallSupervisor = () => {
    sound.playError();
    onAddAttempt();
    setDecoyFeedback('Supervisor Jenkins is in Conference Room B discussing coffee filter procurement.');
  };

  // Compute number of discrete blue chunks for Windows 95 progress bar
  const totalChunks = 25;
  const filledChunks = Math.floor((progress / 100) * totalChunks);

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
            <HardDrive size={13} />
            <span>Copying & Ingesting Docket // Terminal Queue #97042</span>
          </div>
          <button className="win95-titlebar-btn" disabled>_</button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Classic File Copy Animation: Left Folder -> Flying Paper -> Right Folder */}
          <div className="win95-inset" style={{
            height: '68px',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Left Source Folder */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Folder size={32} color="#ca8a04" fill="#fef08a" />
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-retro-mono)', marginTop: '2px' }}>
                CITIZEN_DESK
              </span>
            </div>

            {/* Flying Paper Sheet Animation */}
            {!isSigned && (
              <div 
                className="flying-sheet" 
                style={{ position: 'absolute', left: '70px', top: '20px' }}
              >
                <FileText size={24} color="#000080" />
              </div>
            )}

            {/* Right Destination Vault */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <HardDrive size={32} color="#000080" />
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-retro-mono)', marginTop: '2px' }}>
                DDA_MAINFRAME
              </span>
            </div>
          </div>

          {/* Details metadata */}
          <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div><b>Document:</b> {file.name} ({formatBytes(file.size)})</div>
            <div style={{ color: isStalledAt99 ? '#b91c1c' : '#1f2937', fontWeight: isStalledAt99 ? 700 : 400 }}>
              <b>Status:</b> {statusText}
            </div>
          </div>

          {/* Windows 95 Chunky Progress Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="win95-progress-track">
              {Array.from({ length: totalChunks }).map((_, i) => (
                <div
                  key={i}
                  className="win95-progress-chunk"
                  style={{
                    backgroundColor: i < filledChunks 
                      ? (isSigned ? '#16a34a' : 'var(--win-navy)') 
                      : 'transparent',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-retro-mono)' }}>
              <span>{Math.round(progress)}% Processed</span>
              <span>{isSigned ? '100% Ratified' : (isStalledAt99 ? 'STALLED AT 99%' : 'Buffering...')}</span>
            </div>
          </div>

          {/* Stalled at 99% Interactive Section */}
          {isStalledAt99 && !isSigned && (
            <div className="win95-inset" style={{
              padding: '12px',
              backgroundColor: '#fffbeb',
              border: '2px dashed #b45309',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PenTool size={16} color="#b45309" />
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#78350f' }}>
                  STATUTORY INK RATIFICATION MANDATORY (ISO-1997-B)
                </span>
              </div>

              <div style={{ fontSize: '11px', color: '#92400e' }}>
                Under Section 97-INK, digital bytes cannot commit to magnetic storage without a continuous manual citizen signature.
              </div>

              {/* The Genuine Hold Control */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '10px',
                backgroundColor: '#fef08a',
                border: '2px solid #ca8a04',
                boxShadow: '2px 2px 0px rgba(0,0,0,0.2)',
              }}>
                <button
                  type="button"
                  onMouseDown={startSigning}
                  onMouseUp={cancelSigning}
                  onMouseLeave={cancelSigning}
                  onTouchStart={startSigning}
                  onTouchEnd={cancelSigning}
                  className="win95-btn"
                  style={{
                    backgroundColor: '#fde047',
                    padding: '8px 24px',
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#000000',
                    border: '2px solid #854d0e',
                    cursor: 'pointer',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <PenTool size={16} />
                  <span>✍️ SIGN HERE (Press &amp; Hold for 2.0s)</span>
                </button>

                {/* Ink fill bar */}
                <div style={{ width: '100%', height: '12px', backgroundColor: '#ffffff', border: '1px solid #854d0e', overflow: 'hidden' }}>
                  <div style={{
                    width: `${signatureProgress}%`,
                    height: '100%',
                    backgroundColor: '#1d4ed8',
                    transition: 'width 0.04s linear',
                  }} />
                </div>

                <div style={{ fontSize: '10px', fontFamily: 'var(--font-retro-mono)', color: '#713f12' }}>
                  {signatureProgress > 0 
                    ? `Applying ink pressure: ${Math.round(signatureProgress)}%...` 
                    : 'Press mouse button and keep held for 2.0 seconds.'}
                </div>
              </div>

              {/* Escalating hints */}
              {stallSeconds >= 6 && (
                <div style={{
                  fontSize: '10px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  padding: '4px 6px',
                  border: '1px solid #f87171',
                }}>
                  {stallSeconds < 12 
                    ? '💡 Clerk Hint: Official documents cannot be filed without physical ink. Press and hold down the yellow "Sign Here" pad.' 
                    : '📢 Explicit Directive: Hold the "Sign Here" pad continuously for 2.0 full seconds without releasing.'}
                </div>
              )}

              {holdError && (
                <div style={{ fontSize: '10px', color: '#b91c1c', fontWeight: 700 }}>
                  ⚠️ {holdError}
                </div>
              )}

              {/* Decoy buttons */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                justifyContent: 'center',
                paddingTop: '6px',
                borderTop: '1px dotted #ca8a04',
              }}>
                <button type="button" className="win95-btn" onClick={handleExpedite}>
                  Expedite Process
                </button>
                <button type="button" className="win95-btn" onClick={handleModemCalibrate}>
                  Calibrate 28.8k Modem
                </button>
                <button type="button" className="win95-btn" onClick={handleCallSupervisor}>
                  Call Supervisor
                </button>
              </div>

              {decoyFeedback && (
                <div style={{ fontSize: '10px', color: '#4b5563', fontStyle: 'italic', textAlign: 'center' }}>
                  &quot;{decoyFeedback}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
