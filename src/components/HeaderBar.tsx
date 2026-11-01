import React, { useState } from 'react';
import { 
  Building2, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Monitor, 
  HelpCircle, 
  Clock, 
  Bug,
  Scale,
  Flame,
  ShieldAlert
} from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface HeaderBarProps {
  elapsedSeconds: number;
  attempts: number;
  totalAntsSquished: number;
  chaosScore: number;
  onReset: () => void;
  onOpenGuide: () => void;
  crtMode: boolean;
  onToggleCrt: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  elapsedSeconds,
  attempts,
  totalAntsSquished,
  chaosScore,
  onReset,
  onOpenGuide,
  crtMode,
  onToggleCrt,
}) => {
  const [soundOn, setSoundOn] = useState(sound.enabled);

  const toggleAudio = () => {
    sound.enabled = !sound.enabled;
    setSoundOn(sound.enabled);
    if (sound.enabled) {
      sound.playBlip();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getChaosLevel = () => {
    if (chaosScore < 20) return { label: 'LOW (STABLE)', color: '#15803d', bg: '#dcfce7' };
    if (chaosScore < 50) return { label: 'MODERATE (ACTIVE)', color: '#b45309', bg: '#fef3c7' };
    if (chaosScore < 85) return { label: 'ELEVATED (SWARM)', color: '#c2410c', bg: '#ffedd5' };
    return { label: 'CRITICAL (BIO-CRISIS)', color: '#b91c1c', bg: '#fee2e2' };
  };

  const chaosInfo = getChaosLevel();

  return (
    <header className="win95-outset" style={{ margin: '8px 10px 0', padding: '2px' }}>
      {/* Windows 95 Main Window Titlebar */}
      <div className="win95-titlebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Building2 size={14} color="#ffffff" />
          <span style={{ fontWeight: 700, letterSpacing: '0.4px' }}>
            Department of Document Affairs (1997) // ANTivirus Bio-Hazard Ingestion Terminal v4.2
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button className="win95-titlebar-btn" title="Minimize">_</button>
          <button className="win95-titlebar-btn" title="Maximize">□</button>
          <button className="win95-titlebar-btn" title="Close" onClick={onReset}>×</button>
        </div>
      </div>

      {/* Windows 95 Classic Menu Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '3px 8px',
        backgroundColor: 'var(--win-gray)',
        borderBottom: '1px solid var(--win-dark)',
        fontSize: '11px',
      }}>
        <span style={{ cursor: 'pointer' }}><u>F</u>ile</span>
        <span style={{ cursor: 'pointer' }}><u>E</u>dit</span>
        <span style={{ cursor: 'pointer' }}><u>D</u>efense Directives</span>
        <span 
          style={{ cursor: 'pointer', fontWeight: 700, color: '#000080' }}
          onClick={() => { sound.playBlip(); onOpenGuide(); }}
        >
          <u>S</u>peedrun Guide (&lt;60s)
        </span>
        <span 
          style={{ cursor: 'pointer' }}
          onClick={() => { sound.playBlip(); onOpenGuide(); }}
        >
          <u>H</u>elp (F1)
        </span>
      </div>

      {/* Windows 95 Bureaucracy & Insect Defense Status Ribbon */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '6px',
        padding: '6px 8px',
        backgroundColor: 'var(--win-gray)',
      }}>
        {/* Status Cells */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          {/* Elapsed Timer */}
          <div className="win95-inset-gray" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
            minWidth: '120px',
          }}>
            <Clock size={13} color="#000080" />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Time:</span>
            <span style={{
              fontFamily: 'var(--font-retro-mono)',
              fontWeight: 700,
              fontSize: '12px',
              color: '#000000',
            }}>
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          {/* Attempts Counter */}
          <div className="win95-inset-gray" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
            minWidth: '110px',
          }}>
            <ShieldAlert size={13} color={attempts > 0 ? '#b91c1c' : '#4b5563'} />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Attempts:</span>
            <span style={{
              fontFamily: 'var(--font-retro-mono)',
              fontWeight: 700,
              fontSize: '12px',
              color: attempts > 0 ? '#b91c1c' : '#000000',
            }}>
              #{attempts}
            </span>
          </div>

          {/* Ants Squished Counter */}
          <div className="win95-inset-gray" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
            minWidth: '135px',
          }}>
            <Bug size={13} color="#15803d" />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Ants Squished:</span>
            <span style={{
              fontFamily: 'var(--font-retro-mono)',
              fontWeight: 700,
              fontSize: '12px',
              color: '#15803d',
            }}>
              {totalAntsSquished}
            </span>
          </div>

          {/* Bureaucracy & Chaos Meter */}
          <div className="win95-inset-gray" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
          }}>
            <Scale size={13} color="#6b21a8" />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Chaos Meter:</span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: chaosInfo.color,
              backgroundColor: chaosInfo.bg,
              padding: '1px 6px',
              border: `1px solid ${chaosInfo.color}`,
              fontFamily: 'var(--font-retro-mono)',
            }}>
              {chaosScore}% [{chaosInfo.label}]
            </span>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Guide Button */}
          <button 
            type="button"
            className="win95-btn"
            onClick={() => { sound.playBlip(); onOpenGuide(); }}
            title="Open Judge Speedrun Guide (<60s)"
          >
            <HelpCircle size={13} color="#000080" />
            <span>Judge Guide (&lt;60s)</span>
          </button>

          {/* CRT Toggle */}
          <button 
            type="button"
            className={`win95-btn ${crtMode ? 'pressed' : ''}`}
            onClick={() => { sound.playBlip(); onToggleCrt(); }}
            title="Toggle CRT Monitor Scanlines"
          >
            <Monitor size={13} />
            <span>CRT: {crtMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Sound Toggle */}
          <button 
            type="button"
            className="win95-btn"
            onClick={toggleAudio}
            title={soundOn ? 'Mute 1997 PC Speaker' : 'Unmute 1997 PC Speaker'}
          >
            {soundOn ? <Volume2 size={13} color="#15803d" /> : <VolumeX size={13} color="#b91c1c" />}
          </button>

          {/* Reset Button */}
          <button 
            type="button"
            className="win95-btn"
            onClick={() => {
              sound.playBeep(220, 'square', 0.15, 0.1);
              onReset();
            }}
            style={{ fontWeight: 700 }}
            title="Reset Department & Bio-Defense to Initial State"
          >
            <RotateCcw size={13} color="#b91c1c" />
            <span style={{ color: '#991b1b' }}>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
