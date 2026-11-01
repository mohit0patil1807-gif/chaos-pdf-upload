import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Monitor, 
  HelpCircle, 
  Clock, 
  AlertCircle,
  FileCheck2,
  Scale
} from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface DeskHeaderProps {
  elapsedSeconds: number;
  attempts: number;
  completedStages: number;
  totalStages: number;
  onReset: () => void;
  onOpenGuide: () => void;
  crtMode: boolean;
  onToggleCrt: () => void;
}

export const DeskHeader: React.FC<DeskHeaderProps> = ({
  elapsedSeconds,
  attempts,
  completedStages,
  totalStages,
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

  // Bureaucracy rating based on attempts & time
  const getBureaucracyLevel = () => {
    if (attempts === 0 && elapsedSeconds < 40) return 'Standard Procedure';
    if (attempts <= 2 && elapsedSeconds < 90) return 'Noticeable Red Tape';
    if (attempts <= 5) return 'Kafkaesque Friction';
    return 'Grade-A Federal Labyrinth';
  };

  return (
    <header className="win95-outset" style={{ margin: '8px 8px 0 8px', padding: '2px' }}>
      {/* Windows 95 Main Window Titlebar */}
      <div className="win95-titlebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Building2 size={14} color="#ffffff" />
          <span style={{ fontWeight: 700, letterSpacing: '0.5px' }}>
            Department of Document Affairs (1997) - Federal Intake Protocol v3.1
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
        <span style={{ cursor: 'pointer' }}><u>D</u>irectives</span>
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

      {/* Windows 95 Bureaucracy Meter & Status Ribbon */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '6px',
        padding: '6px 8px',
        backgroundColor: 'var(--win-gray)',
      }}>
        {/* Meter Cells */}
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
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Elapsed:</span>
            <span style={{
              fontFamily: 'var(--font-retro-mono)',
              fontWeight: 700,
              fontSize: '12px',
              color: '#000000',
            }}>
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          {/* Bureaucratic Attempts Counter */}
          <div className="win95-inset-gray" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
            minWidth: '120px',
          }}>
            <AlertCircle size={13} color={attempts > 0 ? '#b91c1c' : '#4b5563'} />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Attempts:</span>
            <span style={{
              fontFamily: 'var(--font-retro-mono)',
              fontWeight: 700,
              fontSize: '12px',
              color: attempts > 0 ? '#b91c1c' : '#000000',
            }}>
              {attempts}
            </span>
          </div>

          {/* Completed Forms / Stages */}
          <div className="win95-inset-gray" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
            minWidth: '135px',
          }}>
            <FileCheck2 size={13} color="#15803d" />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Progress:</span>
            <span style={{
              fontFamily: 'var(--font-retro-mono)',
              fontWeight: 700,
              fontSize: '12px',
            }}>
              {completedStages} / {totalStages} Stages
            </span>
          </div>

          {/* Bureaucracy Meter Index */}
          <div className="win95-inset-gray" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
          }}>
            <Scale size={13} color="#6b21a8" />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Red Tape Index:</span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#431407',
              backgroundColor: '#fed7aa',
              padding: '1px 5px',
              border: '1px solid #c2410c',
            }}>
              {getBureaucracyLevel()}
            </span>
          </div>
        </div>

        {/* Quick Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Guide Button */}
          <button 
            className="win95-btn"
            onClick={() => { sound.playBlip(); onOpenGuide(); }}
            title="Read Official Fast Path (<60 seconds)"
          >
            <HelpCircle size={13} />
            <span>Judge Guide</span>
          </button>

          {/* CRT Toggle */}
          <button 
            className={`win95-btn ${crtMode ? 'pressed' : ''}`}
            onClick={() => { sound.playBlip(); onToggleCrt(); }}
            title="Toggle 1997 CRT Monitor Scanlines"
          >
            <Monitor size={13} />
            <span>CRT: {crtMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Sound Toggle */}
          <button 
            className="win95-btn"
            onClick={toggleAudio}
            title={soundOn ? 'Mute 1997 PC Speaker' : 'Unmute 1997 PC Speaker'}
          >
            {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>

          {/* Reset Button */}
          <button 
            className="win95-btn"
            onClick={() => {
              sound.playBeep(220, 'square', 0.15, 0.1);
              onReset();
            }}
            style={{ fontWeight: 700 }}
            title="Reset Department of Document Affairs to Initial State"
          >
            <RotateCcw size={13} color="#b91c1c" />
            <span style={{ color: '#991b1b' }}>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
