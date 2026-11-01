import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, HelpCircle, RotateCcw } from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface TaskbarProps {
  onOpenGuide: () => void;
  onReset: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({ onOpenGuide, onReset }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="win95-outset" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '30px',
      zIndex: 950,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '2px 4px',
      backgroundColor: 'var(--win-gray)',
    }}>
      {/* Start Button & Taskbar Windows */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Start Button */}
        <button
          className={`win95-btn ${startMenuOpen ? 'pressed' : ''}`}
          onClick={() => {
            sound.playBlip();
            setStartMenuOpen(!startMenuOpen);
          }}
          style={{
            fontWeight: 800,
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 6px',
            height: '24px',
          }}
        >
          {/* Windows 95 4-color mini flag */}
          <span style={{ display: 'inline-flex', gap: '1px' }}>
            <span style={{ width: '4px', height: '4px', backgroundColor: '#dc2626' }} />
            <span style={{ width: '4px', height: '4px', backgroundColor: '#16a34a' }} />
          </span>
          <span>Start</span>
        </button>

        {/* Active Application Button */}
        <div className="win95-btn pressed" style={{
          height: '24px',
          padding: '2px 8px',
          fontSize: '11px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          maxWidth: '240px',
        }}>
          <span>🏛️ Dept of Document Affairs</span>
        </div>
      </div>

      {/* Start Menu Dropdown */}
      {startMenuOpen && (
        <div
          className="win95-outset"
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '2px',
            width: '210px',
            backgroundColor: 'var(--win-gray)',
            boxShadow: '3px -3px 0px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
          }}
        >
          {/* Vertical Blue Banner */}
          <div style={{
            display: 'flex',
          }}>
            <div style={{
              width: '24px',
              background: 'linear-gradient(180deg, #000080, #1084d0)',
              color: '#ffffff',
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              padding: '8px 4px',
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '1px',
            }}>
              Windows 95
            </div>

            {/* Menu Items */}
            <div style={{ flex: 1, padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div
                style={{ padding: '4px 8px', cursor: 'pointer', fontSize: '11px' }}
                onClick={() => {
                  setStartMenuOpen(false);
                  onOpenGuide();
                }}
              >
                ❓ Speedrun Guide (&lt;60s)
              </div>
              <div
                style={{ padding: '4px 8px', cursor: 'pointer', fontSize: '11px' }}
                onClick={() => {
                  setStartMenuOpen(false);
                  onReset();
                }}
              >
                🔄 Reset Department
              </div>
              <div style={{ borderTop: '1px solid var(--win-dark)', margin: '4px 0' }} />
              <div
                style={{ padding: '4px 8px', fontSize: '11px', color: '#4b5563' }}
              >
                Shut Down Office...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Tray (Clock & Icons) */}
      <div className="win95-inset-gray" style={{
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 8px',
      }}>
        <span 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
          onClick={onOpenGuide}
          title="Judge Guide"
        >
          <HelpCircle size={13} />
        </span>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-retro-mono)', fontWeight: 600 }}>
          {currentTime || '4:20 PM'}
        </span>
      </div>
    </footer>
  );
};
