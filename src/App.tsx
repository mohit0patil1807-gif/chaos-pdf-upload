import React, { useState, useEffect, useRef } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { ChaoticDropZone } from './components/ChaoticDropZone';
import { ConfirmationDialogs } from './components/ConfirmationDialogs';
import { AntDefenseArena } from './components/AntDefenseArena';
import { ScratchCardModal } from './components/ScratchCardModal';
import { SecurityReportModal } from './components/SecurityReportModal';
import { InvalidFileDialog } from './components/InvalidFileDialog';
import { SpeedrunGuideModal } from './components/SpeedrunGuideModal';
import { ToastContainer, ToastItem } from './components/ToastContainer';
import { Taskbar } from './components/Taskbar';
import { AppState, AttemptOutcome, DefenseStats, SecurityReportData } from './types/antivirus';
import { calculateSHA256 } from './utils/fileUtils';
import { sound } from './utils/soundEffects';

export const App: React.FC = () => {
  // Explicit Finite State Machine
  const [appState, setAppState] = useState<AppState>('IDLE');

  // Attempt outcome is stored immutably once defense ends
  const [attemptOutcome, setAttemptOutcome] = useState<AttemptOutcome>(null);

  // File and Cryptographic details
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [fileSHA256, setFileSHA256] = useState<string>('');

  // Defense game statistics
  const [defenseStats, setDefenseStats] = useState<DefenseStats>({
    durationSeconds: 20.0,
    antsSpawned: 0,
    antsEliminated: 0,
    missedClicks: 0,
    attemptsCount: 1,
  });

  // Overall session metrics
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalAntsSquished, setTotalAntsSquished] = useState(0);
  const [chaosScore, setChaosScore] = useState(0);

  // Modals & Overlays
  const [invalidFileInfo, setInvalidFileInfo] = useState<{
    fileName: string;
    headerSnippet: string;
    errorReason: string;
  } | null>(null);
  const [speedrunGuideOpen, setSpeedrunGuideOpen] = useState(false);
  const [securityReportData, setSecurityReportData] = useState<SecurityReportData | null>(null);
  const [crtMode, setCrtMode] = useState(false);

  // Toast notifications (strictly capped at 5)
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Prevent default window drag/drop behavior to avoid browser opening PDF
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  // Elapsed session timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // CRT mode class
  useEffect(() => {
    if (crtMode) {
      document.body.classList.add('crt-mode');
    } else {
      document.body.classList.remove('crt-mode');
    }
  }, [crtMode]);

  // Add toast helper
  const addToast = (message: string, type: 'info' | 'warning' | 'error' | 'success') => {
    const newToast: ToastItem = {
      id: `${Date.now()}-${Math.random()}`,
      message,
      type,
      timestamp: Date.now(),
    };
    setToasts(prev => [...prev.slice(-4), newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const incrementChaos = (amount: number) => {
    setChaosScore(prev => Math.min(100, prev + amount));
  };

  // Handler: Real file accepted by active target
  const handleFileAccepted = async (file: File) => {
    setDroppedFile(file);
    if (!timerRunning) setTimerRunning(true);
    setTotalAttempts(prev => prev + 1);

    // Compute real SHA-256 in background
    const hash = await calculateSHA256(file);
    setFileSHA256(hash);

    setAppState('CONFIRMATION');
    addToast(`PDF Received: "${file.name}" accepted by ingestion portal. Beginning bio-clearance.`, 'success');
  };

  // Handler: Non-PDF rejected
  const handleInvalidFile = (fileName: string, headerSnippet: string, errorReason: string) => {
    setInvalidFileInfo({ fileName, headerSnippet, errorReason });
  };

  // Handler: Start ant defense after confirmation
  const handleProceedToDefense = () => {
    setAppState('ANT_DEFENSE');
    addToast('PERIMETER DEFENSE ACTIVE: Protect the window for 20 seconds!', 'warning');
  };

  // Handler: Ant breach failure
  const handleDefenseBreach = (stats: DefenseStats) => {
    setAppState('BREACH_FAILURE');
    setAttemptOutcome('FAILED');
    setDefenseStats(stats);
    setTotalAntsSquished(prev => prev + stats.antsEliminated);

    // Transition to scratch-card stage after brief failure reaction
    setTimeout(() => {
      setAppState('SCRATCH_RESULT');
    }, 400);
  };

  // Handler: 20-second survival success
  const handleDefenseSuccess = (stats: DefenseStats) => {
    setAppState('PROCESSING_SUCCESS');
    setAttemptOutcome('SUCCESS');
    setDefenseStats(stats);
    setTotalAntsSquished(prev => prev + stats.antsEliminated);

    // Transition to scratch-card stage
    setTimeout(() => {
      setAppState('SCRATCH_RESULT');
    }, 600);
  };

  // Handler: Retry upload with the SAME selected PDF
  const handleRetry = () => {
    sound.playBlip();
    setTotalAttempts(prev => prev + 1);
    incrementChaos(5);
    setAttemptOutcome(null);
    setAppState('ANT_DEFENSE');
    addToast('RETRY INITIALIZED: Defend the upload window against a fresh ant wave!', 'info');
  };

  // Handler: Upload another PDF (resets to IDLE)
  const handleUploadAnother = () => {
    sound.playBlip();
    setDroppedFile(null);
    setFileSHA256('');
    setAttemptOutcome(null);
    setAppState('IDLE');
    addToast('Ready for new PDF ingestion.', 'info');
  };

  // Handler: Open Security Report
  const handleOpenReport = () => {
    if (!droppedFile) return;
    setSecurityReportData({
      fileName: droppedFile.name,
      fileSizeBytes: droppedFile.size,
      fileSHA256: fileSHA256,
      outcome: attemptOutcome,
      defenseStats: defenseStats,
      chaosScore: chaosScore,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  // Full reset back to initial state
  const handleFullReset = () => {
    setAppState('IDLE');
    setAttemptOutcome(null);
    setDroppedFile(null);
    setFileSHA256('');
    setElapsedSeconds(0);
    setTimerRunning(false);
    setTotalAttempts(0);
    setTotalAntsSquished(0);
    setChaosScore(0);
    setInvalidFileInfo(null);
    setSecurityReportData(null);
    addToast('ANTivirus system reset to initial state.', 'info');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      paddingBottom: '24px',
    }}>
      {/* Brand Header & Live Chaos Meter */}
      <HeaderBar
        elapsedSeconds={elapsedSeconds}
        attempts={totalAttempts}
        totalAntsSquished={totalAntsSquished}
        chaosScore={chaosScore}
        onReset={handleFullReset}
        onOpenGuide={() => setSpeedrunGuideOpen(true)}
        crtMode={crtMode}
        onToggleCrt={() => setCrtMode(!crtMode)}
      />

      {/* Main Experience Router */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* STAGE 1: Chaotic Drag-and-Drop */}
        {appState === 'IDLE' && (
          <ChaoticDropZone
            onFileAccepted={handleFileAccepted}
            onInvalidFile={handleInvalidFile}
            onAddToast={addToast}
            onIncrementChaos={incrementChaos}
          />
        )}

        {/* STAGE 2: Bio-Security Confirmation Dialogs */}
        {appState === 'CONFIRMATION' && droppedFile && (
          <ConfirmationDialogs
            file={droppedFile}
            fileSHA256={fileSHA256}
            onProceedToDefense={handleProceedToDefense}
            onCancel={handleFullReset}
          />
        )}

        {/* STAGE 3: 20-Second Ant Defense Arena */}
        {(appState === 'ANT_DEFENSE' || appState === 'BREACH_FAILURE' || appState === 'PROCESSING_SUCCESS') && droppedFile && (
          <AntDefenseArena
            file={droppedFile}
            onSuccess={handleDefenseSuccess}
            onBreach={handleDefenseBreach}
            onIncrementChaos={incrementChaos}
            onAddToast={addToast}
          />
        )}

        {/* STAGE 4: Scratch-to-Reveal Card (Hides actual outcome until scratched!) */}
        {appState === 'SCRATCH_RESULT' && droppedFile && (
          <ScratchCardModal
            outcome={attemptOutcome}
            file={droppedFile}
            fileSHA256={fileSHA256}
            stats={defenseStats}
            onRetry={handleRetry}
            onUploadAnother={handleUploadAnother}
            onViewReport={handleOpenReport}
            onIncrementChaos={incrementChaos}
          />
        )}
      </main>

      {/* Security Report Modal */}
      {securityReportData && (
        <SecurityReportModal
          report={securityReportData}
          onClose={() => setSecurityReportData(null)}
        />
      )}

      {/* Invalid Non-PDF Rejection Dialog */}
      {invalidFileInfo && (
        <InvalidFileDialog
          fileName={invalidFileInfo.fileName}
          headerSnippet={invalidFileInfo.headerSnippet}
          errorReason={invalidFileInfo.errorReason}
          onDismiss={() => setInvalidFileInfo(null)}
        />
      )}

      {/* Speedrun Guide Modal (<60s Creator Route) */}
      {speedrunGuideOpen && (
        <SpeedrunGuideModal onClose={() => setSpeedrunGuideOpen(false)} />
      )}

      {/* Non-blocking Toast Stack (Capped at 5) */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Windows 95 Desktop Taskbar & Tray */}
      <Taskbar
        onOpenGuide={() => setSpeedrunGuideOpen(true)}
        onReset={handleFullReset}
      />
    </div>
  );
};
