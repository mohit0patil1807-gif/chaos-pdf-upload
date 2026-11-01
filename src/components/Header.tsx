import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Tv, 
  Zap, 
  Timer,
  FileCheck
} from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface HeaderProps {
  onReset: () => void;
  crtMode: boolean;
  onToggleCrt: () => void;
  onOpenSpeedrunGuide: () => void;
  isCompleted: boolean;
  fileLoaded: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  crtMode,
  onToggleCrt,
  onOpenSpeedrunGuide,
  isCompleted,
  fileLoaded,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Timer starts when file is dragged or reset, stops on completion
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerRunning && !isCompleted) {
      interval = setInterval(() => {
        setElapsedMs(prev => prev + 100);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [timerRunning, isCompleted]);

  useEffect(() => {
    if (fileLoaded && !timerRunning && !isCompleted) {
      setTimerRunning(true);
    }
  }, [fileLoaded, timerRunning, isCompleted]);

  useEffect(() => {
    if (isCompleted) {
      setTimerRunning(false);
    }
  }, [isCompleted]);

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundEnabled(sound.enabled);
    if (sound.enabled) {
      sound.playBlip();
    }
  };

  const handleManualReset = () => {
    sound.playBeep(220, 'square', 0.15, 0.1);
    setElapsedMs(0);
    setTimerRunning(false);
    onReset();
  };

  const formatTimer = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
  };

  return (
    <header style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      padding: '0.85rem 1.5rem',
      backgroundColor: 'rgba(11, 15, 23, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Brand Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
        }}>
          <ShieldAlert size={20} color="#fff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              fontWeight: 800, 
              fontSize: '1.15rem', 
              letterSpacing: '-0.02em', 
              fontFamily: 'var(--font-heading)',
              color: '#f8fafc' 
            }}>
              OmniVault™ <span style={{ color: 'var(--accent-cyan)' }}>9000</span>
            </span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--accent-amber)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              fontFamily: 'var(--font-mono)'
            }}>
              ISO-CHAOS-9001
            </span>
          </div>
          <p style={{ 
            fontSize: '0.72rem', 
            color: 'var(--text-muted)', 
            fontFamily: 'var(--font-mono)',
            margin: 0
          }}>
            FEDERAL DOCUMENT DISGORGEMENT & INGESTION PROTOCOL
          </p>
        </div>
      </div>

      {/* Stopwatch & Speedrun HUD */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.35rem 0.85rem',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
      }}>
        <Timer size={16} color={timerRunning ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Mission Elapsed Time
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: isCompleted ? 'var(--accent-green)' : (timerRunning ? '#38bdf8' : '#e2e8f0'),
          }}>
            {formatTimer(elapsedMs)}
          </span>
        </div>
        {isCompleted && (
          <span style={{
            fontSize: '0.65rem',
            color: 'var(--accent-green)',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            padding: '0.15rem 0.4rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            fontWeight: 700
          }}>
            <FileCheck size={12} /> VERIFIED
          </span>
        )}
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Speedrun Manual / Cheat Sheet */}
        <button
          onClick={() => {
            sound.playBlip();
            onOpenSpeedrunGuide();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#fbbf24',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 700,
          }}
          title="Open Judge Speedrun Guide (Solvable under 60 seconds)"
        >
          <Zap size={14} />
          <span>Judge Guide (&lt;60s)</span>
        </button>

        {/* CRT Scanline Toggle */}
        <button
          onClick={() => {
            sound.playBlip();
            onToggleCrt();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.45rem',
            backgroundColor: crtMode ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: crtMode ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
            color: crtMode ? 'var(--accent-cyan)' : 'var(--text-muted)',
            borderRadius: '8px',
          }}
          title={crtMode ? "Disable CRT Scanlines" : "Enable CRT Scanlines"}
        >
          <Tv size={16} />
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={toggleSound}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.45rem',
            backgroundColor: soundEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: soundEnabled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
            color: soundEnabled ? 'var(--accent-green)' : 'var(--text-muted)',
            borderRadius: '8px',
          }}
          title={soundEnabled ? "Mute Procedural Synthesizer" : "Unmute Procedural Synthesizer"}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Reset Button */}
        <button
          onClick={handleManualReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.85rem',
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            color: '#fb7185',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 700,
          }}
          title="Reset entire workflow back to initial state"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
};
