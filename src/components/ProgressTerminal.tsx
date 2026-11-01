import React, { useEffect, useState } from 'react';
import { 
  Cpu, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Terminal, 
  Disc,
  ArrowRight
} from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { formatBytes } from '../utils/fileUtils';

interface ProgressTerminalProps {
  file: File;
  onComplete: () => void;
}

export const ProgressTerminal: React.FC<ProgressTerminalProps> = ({
  file,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing quantum ingestion manifold...');
  const [isStalledAt99, setIsStalledAt99] = useState(false);
  const [isReleasingFinalByte, setIsReleasingFinalByte] = useState(false);

  // Stepped progress up to 99%
  useEffect(() => {
    if (isStalledAt99 || isReleasingFinalByte) return;

    const stages = [
      { p: 14, text: 'De-compressing bureaucratic margins and whitespace...', delay: 400 },
      { p: 32, text: 'Validating kerning compliance against ISO-CHAOS-9001...', delay: 900 },
      { p: 58, text: 'Consulting celestial planetary alignments for upload timing...', delay: 1500 },
      { p: 79, text: 'Neutralizing unapproved Comic Sans occurrences...', delay: 2200 },
      { p: 91, text: 'Buffering payload into cryogenic storage array...', delay: 2800 },
      { p: 99, text: '⚠️ PIPELINE BUFFER STALLED: Awaiting manual Final Byte release...', delay: 3500 },
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
  }, [isStalledAt99, isReleasingFinalByte]);

  // Handle final byte manual release
  const handleReleaseFinalByte = () => {
    sound.playSteamHiss();
    setIsReleasingFinalByte(true);
    setIsStalledAt99(false);
    setStatusText('Releasing cryogenic valve: Ingesting final 8 bits of payload...');

    setTimeout(() => {
      setProgress(99.6);
      sound.playBeep(600, 'sine', 0.1);
    }, 400);

    setTimeout(() => {
      setProgress(100);
      setStatusText('Ingestion 100% Complete! Generating official certificate...');
      sound.playVictory();
      setTimeout(onComplete, 800);
    }, 900);
  };

  return (
    <div style={{
      maxWidth: '750px',
      margin: '2rem auto',
      padding: '0 1rem',
    }}>
      <div className="glass-panel" style={{
        padding: '2rem',
        border: isStalledAt99 ? '2px solid #f59e0b' : '1px solid var(--accent-cyan)',
        boxShadow: isStalledAt99 
          ? '0 0 40px rgba(245, 158, 11, 0.3)' 
          : '0 0 30px rgba(6, 182, 212, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        {/* Console Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Terminal size={20} color="var(--accent-cyan)" />
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: '#f8fafc',
            }}>
              DOCUMENT INGESTION STREAM
            </h3>
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--accent-cyan)',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
          }}>
            ACTIVE INGESTION
          </span>
        </div>

        {/* File Ingestion Details */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.85rem 1rem',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>FILE: </span>
            <strong style={{ color: '#f8fafc' }}>{file.name}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>SIZE: </span>
            <strong style={{ color: 'var(--accent-cyan)' }}>{formatBytes(file.size)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>MIME: </span>
            <strong style={{ color: '#cbd5e1' }}>{file.type || 'application/pdf (inferred)'}</strong>
          </div>
        </div>

        {/* The Progress Bar Display */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
          }}>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: isStalledAt99 ? '#fbbf24' : '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              {isStalledAt99 ? <AlertTriangle size={15} color="#f59e0b" /> : <Disc size={15} className="radar-sweep" color="var(--accent-cyan)" />}
              {statusText}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.25rem',
              fontWeight: 900,
              color: isStalledAt99 ? '#fbbf24' : (progress === 100 ? 'var(--accent-green)' : 'var(--accent-cyan)'),
            }}>
              {progress.toFixed(1)}%
            </span>
          </div>

          {/* Bar track */}
          <div style={{
            height: '14px',
            borderRadius: '7px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: isStalledAt99 
                ? '#f59e0b' 
                : (progress === 100 ? 'var(--accent-green)' : 'var(--accent-cyan)'),
              boxShadow: isStalledAt99 
                ? '0 0 15px #f59e0b' 
                : '0 0 15px var(--accent-cyan)',
              transition: 'width 0.4s ease-out',
            }} />
          </div>
        </div>

        {/* 99% Stalling Intervention Control */}
        {isStalledAt99 && (
          <div className="hazard-stripe" style={{
            padding: '1.25rem',
            borderRadius: '10px',
            border: '2px solid #f59e0b',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1rem',
            animation: 'pulseGlow 1.5s infinite',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#fbbf24',
              fontWeight: 800,
              fontSize: '0.95rem',
            }}>
              <AlertTriangle size={20} className="jitter-effect" />
              BUFFER STALLED AT 99.0%: MANUAL FINAL BYTE DISCHARGE REQUIRED
            </div>
            <p style={{ fontSize: '0.8rem', color: '#f1f5f9', maxWidth: '520px' }}>
              The ingestion queue cannot synthesize the 8th bit without manual thermodynamic clearance. Trigger the mechanical valve below to complete the final byte!
            </p>

            <button
              onClick={handleReleaseFinalByte}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem 1.75rem',
                backgroundColor: '#f59e0b',
                color: '#090d16',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 0 25px rgba(245, 158, 11, 0.6)',
                letterSpacing: '0.04em',
                transition: 'all 0.2s transform',
              }}
              className="jitter-effect"
            >
              <Flame size={18} />
              <span>⚡ MANUAL FINAL BYTE RELEASE VALVE</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Final byte releasing feedback */}
        {isReleasingFinalByte && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: 'var(--accent-green)',
            fontSize: '0.85rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
          }}>
            <CheckCircle2 size={18} />
            Valve open. Pressure equalized. Ingesting final bytes...
          </div>
        )}
      </div>
    </div>
  );
};
