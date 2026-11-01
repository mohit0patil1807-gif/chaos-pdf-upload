import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, RotateCcw, AlertTriangle, Eye, ShieldCheck, Flame } from 'lucide-react';
import { AttemptOutcome, DefenseStats } from '../types/antivirus';
import { ResultDisplay } from './ResultDisplay';
import { sound } from '../utils/soundEffects';

interface ScratchCardModalProps {
  outcome: AttemptOutcome;
  file: File;
  fileSHA256: string;
  stats: DefenseStats;
  onRetry: () => void;
  onUploadAnother: () => void;
  onViewReport: () => void;
  onIncrementChaos: (amount: number) => void;
}

export const ScratchCardModal: React.FC<ScratchCardModalProps> = ({
  outcome,
  file,
  fileSHA256,
  stats,
  onRetry,
  onUploadAnother,
  onViewReport,
  onIncrementChaos,
}) => {
  const [scratchPercent, setScratchPercent] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isScratchingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const samplePointsRef = useRef<Array<{ x: number; y: number }>>([]);

  // Draw or reset the metallic silver-gray scratch coating
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Reset composite operation to draw the coating
    ctx.globalCompositeOperation = 'source-over';

    // Metallic silver-gray gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#9ca3af');
    grad.addColorStop(0.3, '#d1d5db');
    grad.addColorStop(0.6, '#6b7280');
    grad.addColorStop(1, '#9ca3af');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle brushed metal texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let i = 0; i < height; i += 4) {
      ctx.fillRect(0, i, width, 1.5);
    }

    // Yellow and black warning hazard border
    const stripeWidth = 14;
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, width, stripeWidth);
    ctx.fillRect(0, height - stripeWidth, width, stripeWidth);
    ctx.fillStyle = '#1f2937';
    for (let x = -stripeWidth; x < width + stripeWidth; x += stripeWidth * 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + stripeWidth, 0);
      ctx.lineTo(x, stripeWidth);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, height - stripeWidth);
      ctx.lineTo(x + stripeWidth, height - stripeWidth);
      ctx.lineTo(x, height);
      ctx.closePath();
      ctx.fill();
    }

    // Center metallic text
    ctx.fillStyle = '#000080';
    ctx.font = 'bold 15px "MS Sans Serif", Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡ SCRATCH TO REVEAL YOUR FATE ⚡', width / 2, height / 2 - 12);

    ctx.fillStyle = '#374151';
    ctx.font = '11px "MS Sans Serif", Tahoma, sans-serif';
    ctx.fillText('Scratch away the metallic coating with mouse or finger (60% to reveal)', width / 2, height / 2 + 12);

    // Generate grid of sample points
    const points: Array<{ x: number; y: number }> = [];
    const cols = 30;
    const rows = 20;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        points.push({
          x: Math.floor((c + 0.5) * (width / cols)),
          y: Math.floor((r + 0.5) * (height / rows)),
        });
      }
    }
    samplePointsRef.current = points;

    setScratchPercent(0);
    setIsRevealed(false);
    setCanvasReady(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        initCanvas();
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [initCanvas]);

  const checkCoverage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const points = samplePointsRef.current;
    if (points.length === 0) return;

    let transparentCount = 0;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const pixel = ctx.getImageData(p.x, p.y, 1, 1).data;
      if (pixel[3] < 32) {
        transparentCount++;
      }
    }

    const pct = Math.min(100, Math.round((transparentCount / points.length) * 100));
    setScratchPercent(pct);

    if (pct >= 60 && !isRevealed) {
      setIsRevealed(true);
      if (outcome === 'SUCCESS') {
        sound.playVictory();
      } else {
        sound.playDefeat();
      }
    }
  }, [isRevealed, outcome]);

  const scratchAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();

    const radius = 24;
    if (lastPointRef.current) {
      ctx.lineWidth = radius * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPointRef.current = { x, y };
    sound.playScratch();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    isScratchingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lastPointRef.current = { x, y };
    scratchAt(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScratchingRef.current || isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    scratchAt(x, y);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScratchingRef.current) return;
    isScratchingRef.current = false;
    lastPointRef.current = null;
    checkCoverage();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    }}>
      <div className="win95-outset" style={{
        maxWidth: '600px',
        width: '100%',
        boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.6)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Titlebar */}
        <div className="win95-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <AlertTriangle size={13} />
            <span>Official Scratch-to-Reveal Outcome // Docket #97-SCRATCH</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-retro-mono)', color: '#ffffff' }}>
              {isRevealed ? 'REVEALED (100%)' : `${scratchPercent}% Scratched`}
            </span>
            <button
              type="button"
              className="win95-btn"
              onClick={initCanvas}
              title="Reset Scratch Coating"
              style={{ padding: '1px 6px', fontSize: '10px', height: '18px' }}
            >
              <RotateCcw size={10} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Card Stage */}
        <div style={{
          position: 'relative',
          minHeight: '380px',
          backgroundColor: '#f9fafb',
        }}>
          {/* UNDERLYING IMMUTABLE RESULT */}
          <ResultDisplay
            outcome={outcome}
            file={file}
            fileSHA256={fileSHA256}
            stats={stats}
            onRetry={onRetry}
            onUploadAnother={onUploadAnother}
            onViewReport={onViewReport}
          />

          {/* OVERLYING CANVAS */}
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              touchAction: 'none',
              cursor: isRevealed ? 'default' : 'crosshair',
              opacity: isRevealed ? 0 : 1,
              pointerEvents: isRevealed ? 'none' : 'auto',
              transition: 'opacity 0.4s ease',
              zIndex: 30,
            }}
          />
        </div>

        {/* Footer */}
        <div className="win95-inset-gray" style={{
          padding: '6px 12px',
          fontSize: '11px',
          color: '#1f2937',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--font-retro-mono)',
        }}>
          <span>
            {isRevealed 
              ? '✅ Card unveiled! Review your security audit.' 
              : '👆 Hold mouse button or finger to rub away silver coating (60% to reveal).'}
          </span>
          <span style={{ color: '#4b5563' }}>
            Result pre-determined by defense outcome.
          </span>
        </div>
      </div>
    </div>
  );
};
