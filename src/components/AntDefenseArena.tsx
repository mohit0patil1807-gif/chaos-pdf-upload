import React, { useEffect, useRef, useState } from 'react';
import { 
  ShieldAlert, 
  Bug, 
  Clock, 
  Flame, 
  AlertOctagon, 
  CheckCircle2, 
  FileText,
  Radio,
  Zap
} from 'lucide-react';
import { AntEntity, DefenseStats } from '../types/antivirus';
import { sound } from '../utils/soundEffects';
import { formatBytes } from '../utils/fileUtils';

interface AntDefenseArenaProps {
  file: File;
  onSuccess: (stats: DefenseStats) => void;
  onBreach: (stats: DefenseStats) => void;
  onIncrementChaos: (amount: number) => void;
  onAddToast: (msg: string, type: 'info' | 'warning' | 'error' | 'success') => void;
}

export const AntDefenseArena: React.FC<AntDefenseArenaProps> = ({
  file,
  onSuccess,
  onBreach,
  onIncrementChaos,
  onAddToast,
}) => {
  // 20-second countdown
  const [timeLeft, setTimeLeft] = useState(20.0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [antsActiveCount, setAntsActiveCount] = useState(0);
  const [antsEliminatedCount, setAntsEliminatedCount] = useState(0);
  const [currentWave, setCurrentWave] = useState<1 | 2 | 3>(1);
  const [securityStatus, setSecurityStatus] = useState('PERIMETER SECURED // WAVE 1 SCOUTS');
  const [breachOccurred, setBreachOccurred] = useState(false);

  // References for game loop
  const arenaRef = useRef<HTMLDivElement>(null);
  const centerBoxRef = useRef<HTMLDivElement>(null);
  const antsRef = useRef<AntEntity[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const nextSpawnTimeRef = useRef<number>(0);
  const isFinishedRef = useRef<boolean>(false);
  const statsRef = useRef<DefenseStats>({
    durationSeconds: 20.0,
    antsSpawned: 0,
    antsEliminated: 0,
    missedClicks: 0,
    attemptsCount: 1,
  });

  // Ant SVG Renderer
  const renderAntSVG = (ant: AntEntity) => {
    const isSquished = ant.state === 'squished';
    return (
      <g
        key={ant.id}
        transform={`translate(${ant.x}, ${ant.y}) rotate(${(ant.angle * 180) / Math.PI + 90}) scale(${ant.scale})`}
        className={isSquished ? 'ant-squished' : ''}
        style={{ cursor: 'crosshair' }}
      >
        {/* Generous 32px invisible hit area */}
        <circle cx="0" cy="0" r="32" fill="transparent" />

        {/* Warning aura circle for easy spotting */}
        {!isSquished && (
          <circle cx="0" cy="0" r="18" fill="rgba(239, 68, 68, 0.12)" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="1" strokeDasharray="3,3" />
        )}

        {isSquished ? (
          // Splat particle
          <g>
            <circle cx="0" cy="0" r="14" fill="#dc2626" opacity="0.85" />
            <circle cx="-5" cy="-6" r="5" fill="#991b1b" />
            <circle cx="7" cy="4" r="6" fill="#f59e0b" />
            <line x1="-8" y1="-8" x2="8" y2="8" stroke="#450a0a" strokeWidth="2" />
          </g>
        ) : (
          // Anatomical Ant Body
          <g fill="#1f2937" stroke="#000000" strokeWidth="1">
            {/* 6 Legs */}
            <line x1="-4" y1="-5" x2="-16" y2="-11" stroke="#1e293b" strokeWidth="1.8" />
            <line x1="4" y1="-5" x2="16" y2="-11" stroke="#1e293b" strokeWidth="1.8" />
            <line x1="-4" y1="0" x2="-18" y2="0" stroke="#1e293b" strokeWidth="1.8" />
            <line x1="4" y1="0" x2="18" y2="0" stroke="#1e293b" strokeWidth="1.8" />
            <line x1="-4" y1="5" x2="-16" y2="11" stroke="#1e293b" strokeWidth="1.8" />
            <line x1="4" y1="5" x2="16" y2="11" stroke="#1e293b" strokeWidth="1.8" />

            {/* Antennae */}
            <path d="M-3 -9 Q-8 -18 -12 -16" stroke="#0f172a" strokeWidth="1.4" fill="none" />
            <path d="M3 -9 Q8 -18 12 -16" stroke="#0f172a" strokeWidth="1.4" fill="none" />

            {/* Abdomen (Rear) */}
            <ellipse cx="0" cy="8" rx="6.5" ry="9" fill="#020617" />
            {/* Thorax (Middle) */}
            <ellipse cx="0" cy="-1" rx="4" ry="5" fill="#1e293b" />
            {/* Head (Front) */}
            <circle cx="0" cy="-8" r="4.5" fill="#0f172a" />
            {/* Red glowing ant eyes */}
            <circle cx="-2" cy="-9.5" r="1.1" fill="#ef4444" />
            <circle cx="2" cy="-9.5" r="1.1" fill="#ef4444" />
          </g>
        )}
      </g>
    );
  };

  // Main 20s game loop
  useEffect(() => {
    isFinishedRef.current = false;
    startTimeRef.current = performance.now();
    lastTimeRef.current = performance.now();
    nextSpawnTimeRef.current = performance.now() + 800; // First ant in 800ms
    sound.playAntAlarm();
    onAddToast('ANT ALERT: Bio-hazard insects detected approaching perimeter!', 'warning');

    const toastTimeouts = [
      setTimeout(() => {
        if (!isFinishedRef.current) {
          onAddToast('Colony Notice: Security has detected suspicious legs near perimeter.', 'info');
        }
      }, 4500),
      setTimeout(() => {
        if (!isFinishedRef.current) {
          onAddToast('Alert: One ant has requested administrator privileges!', 'warning');
        }
      }, 8500),
      setTimeout(() => {
        if (!isFinishedRef.current) {
          onAddToast('Directive: Document integrity is currently being questioned.', 'warning');
        }
      }, 13000),
      setTimeout(() => {
        if (!isFinishedRef.current) {
          onAddToast('OSHA Notice: An ant union has filed a complaint regarding swatting.', 'info');
        }
      }, 16500),
    ];

    const loop = (now: number) => {
      if (isFinishedRef.current) return;

      const dt = Math.min(0.1, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      const totalElapsed = (now - startTimeRef.current) / 1000;
      const remaining = Math.max(0, 20.0 - totalElapsed);
      setTimeLeft(remaining);

      // Misleading progress bar: reaches ~100%, but occasionally hesitates or rolls back slightly
      const baseProgress = (totalElapsed / 20.0) * 100;
      let chaoticProgress = baseProgress;
      if (totalElapsed > 7 && totalElapsed < 9) chaoticProgress = baseProgress - 3.0;
      if (totalElapsed > 13 && totalElapsed < 15) chaoticProgress = baseProgress - 3.8;
      setDisplayProgress(Math.min(100, Math.max(0, chaoticProgress)));

      // Wave escalation tuned for compact, fair arena defense
      let currentWaveNum: 1 | 2 | 3 = 1;
      let spawnInterval = 1750; // ms between spawns
      let antSpeed = 30; // px/sec (calibrated for compact arena so player has plenty of reaction runway)

      if (totalElapsed > 14) {
        currentWaveNum = 3;
        spawnInterval = 1200;
        antSpeed = 48; // px/sec
        setSecurityStatus('🚨 WAVE 3 // FINAL INSECT ASSAULT (HOLD THE LINE!)');
      } else if (totalElapsed > 7) {
        currentWaveNum = 2;
        spawnInterval = 1450;
        antSpeed = 38; // px/sec
        setSecurityStatus('⚠️ WAVE 2 // WORKER ANTS ADVANCING');
      } else {
        currentWaveNum = 1;
        setSecurityStatus('🛡️ WAVE 1 // SCOUT PATROL REPELLED');
      }
      setCurrentWave(currentWaveNum);

      // Arena & central box boundaries
      const arena = arenaRef.current;
      const centerBox = centerBoxRef.current;

      if (arena && centerBox) {
        const arenaRect = arena.getBoundingClientRect();
        const centerRect = centerBox.getBoundingClientRect();

        const centerX = centerRect.left - arenaRect.left + centerRect.width / 2;
        const centerY = centerRect.top - arenaRect.top + centerRect.height / 2;

        // Collision boundary around the center box
        const boundHalfW = centerRect.width / 2 - 4;
        const boundHalfH = centerRect.height / 2 - 4;

        // Spawn new ants if scheduled
        if (now >= nextSpawnTimeRef.current && remaining > 1.8) {
          nextSpawnTimeRef.current = now + spawnInterval;
          statsRef.current.antsSpawned += 1;

          // Pick random perimeter edge (0: Top, 1: Right, 2: Bottom, 3: Left)
          const edge = Math.floor(Math.random() * 4);
          let spawnX = 0;
          let spawnY = 0;

          if (edge === 0) {
            spawnX = Math.random() * arenaRect.width;
            spawnY = -18;
          } else if (edge === 1) {
            spawnX = arenaRect.width + 18;
            spawnY = Math.random() * arenaRect.height;
          } else if (edge === 2) {
            spawnX = Math.random() * arenaRect.width;
            spawnY = arenaRect.height + 18;
          } else {
            spawnX = -18;
            spawnY = Math.random() * arenaRect.height;
          }

          // Target is center box
          const targetX = centerX + (Math.random() * 24 - 12);
          const targetY = centerY + (Math.random() * 24 - 12);
          const dx = targetX - spawnX;
          const dy = targetY - spawnY;
          const baseAngle = Math.atan2(dy, dx);

          const newAnt: AntEntity = {
            id: `ant-${Date.now()}-${Math.random()}`,
            x: spawnX,
            y: spawnY,
            startX: spawnX,
            startY: spawnY,
            targetX,
            targetY,
            speed: antSpeed + (Math.random() * 6 - 3),
            baseAngle,
            angle: baseAngle,
            wobbleSpeed: 2.5 + Math.random() * 2,
            wobblePhase: Math.random() * Math.PI * 2,
            wave: currentWaveNum,
            state: 'crawling',
            scale: 1.05 + Math.random() * 0.15,
          };

          antsRef.current.push(newAnt);
        }

        // Update positions of active crawling ants
        const livingAnts = antsRef.current.filter(a => a.state === 'crawling');
        setAntsActiveCount(livingAnts.length);

        for (const ant of antsRef.current) {
          if (ant.state !== 'crawling') continue;

          // Gentle wobble trajectory
          ant.wobblePhase += ant.wobbleSpeed * dt;
          ant.angle = ant.baseAngle + Math.sin(ant.wobblePhase) * 0.18;

          ant.x += Math.cos(ant.angle) * ant.speed * dt;
          ant.y += Math.sin(ant.angle) * ant.speed * dt;

          // Collision check against central protected window
          const distFromBoxCenterX = Math.abs(ant.x - centerX);
          const distFromBoxCenterY = Math.abs(ant.y - centerY);

          if (distFromBoxCenterX <= boundHalfW && distFromBoxCenterY <= boundHalfH) {
            // BREACH DETECTED!
            isFinishedRef.current = true;
            ant.state = 'breached';
            setBreachOccurred(true);
            sound.playDefeat();
            onIncrementChaos(25);

            statsRef.current.breachAntId = ant.id;
            statsRef.current.breachTimeSeconds = parseFloat(totalElapsed.toFixed(1));
            statsRef.current.durationSeconds = parseFloat(totalElapsed.toFixed(1));

            onAddToast(`❌ PERIMETER BREACH! An ant entered the intake box at ${totalElapsed.toFixed(1)}s!`, 'error');

            setTimeout(() => {
              onBreach({ ...statsRef.current });
            }, 600);
            return;
          }
        }

        // Clean up squished ants after animation
        antsRef.current = antsRef.current.filter(
          a => a.state === 'crawling' || (a.squishTime && now - a.squishTime < 450)
        );
      }

      // Check if 20 seconds completed with NO breach!
      if (remaining <= 0) {
        isFinishedRef.current = true;
        sound.playVictory();
        statsRef.current.durationSeconds = 20.0;
        setDisplayProgress(100);
        setSecurityStatus('🎉 PERIMETER DEFENDED! 100% SUCCESSFUL INGESTION!');
        onAddToast('✅ SUCCESS: 20-second defense complete! Upload payload secured.', 'success');

        setTimeout(() => {
          onSuccess({ ...statsRef.current });
        }, 800);
        return;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      isFinishedRef.current = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      toastTimeouts.forEach(clearTimeout);
    };
  }, []);

  // Handle clicking on the arena to swat ants (Generous 40px hit area!)
  const handleArenaClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isFinishedRef.current) return;

    const svgRect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - svgRect.left;
    const clickY = e.clientY - svgRect.top;

    // Generous 40px hit area makes clicking effortless and forgiving!
    const hitRadius = 40;
    let hitFound = false;

    for (const ant of antsRef.current) {
      if (ant.state !== 'crawling') continue;

      const dist = Math.hypot(ant.x - clickX, ant.y - clickY);
      if (dist <= hitRadius) {
        ant.state = 'squished';
        ant.squishTime = performance.now();
        hitFound = true;
        sound.playAntSquish();
        statsRef.current.antsEliminated += 1;
        setAntsEliminatedCount(statsRef.current.antsEliminated);
        break;
      }
    }

    if (!hitFound) {
      statsRef.current.missedClicks += 1;
      onIncrementChaos(1);
    }
  };

  // Compute chunky progress blocks for Windows 95 progress bar
  const totalChunks = 24;
  const filledChunks = Math.floor((displayProgress / 100) * totalChunks);

  return (
    <div
      ref={arenaRef}
      className={`win95-outset ${breachOccurred ? 'breach-alarm' : ''}`}
      style={{
        position: 'relative',
        maxWidth: '620px',
        width: 'calc(100% - 24px)',
        margin: '10px auto',
        minHeight: '360px',
        height: '390px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e5e7eb',
        /* Subtly textured filing desk floor */
        backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.12) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      {/* Perimeter Warning Ring Border */}
      <div style={{
        position: 'absolute',
        top: '8px', left: '8px', right: '8px', bottom: '8px',
        border: '2px dashed rgba(220, 38, 38, 0.45)',
        borderRadius: '6px',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '4px 10px',
        color: '#dc2626',
        fontFamily: 'var(--font-retro-mono)',
        fontSize: '9px',
        fontWeight: 700,
      }}>
        <span>⚠️ DEFENSE ZONE</span>
        <span>CLICK ANTS TO SWAT</span>
        <span>20.0s SURVIVAL</span>
      </div>

      {/* Interactive SVG Layer for Ants (Full Arena Size) */}
      <svg
        onClick={handleArenaClick}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 25,
          cursor: 'crosshair',
        }}
      >
        {antsRef.current.map(ant => renderAntSVG(ant))}
      </svg>

      {/* Central Protected Windows 95 Intake Box */}
      <div
        ref={centerBoxRef}
        className="win95-outset"
        style={{
          position: 'relative',
          zIndex: 15,
          width: '320px',
          maxWidth: '85%',
          boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.5)',
          pointerEvents: 'none', // Allows clicks to pass through to the SVG ant layer!
        }}
      >
        {/* Titlebar */}
        <div className={`win95-titlebar ${breachOccurred ? 'win95-titlebar-inactive' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={12} color="#ffffff" />
            <span style={{ fontSize: '11px' }}>SECURE INGESTION — ROOM 104-D</span>
          </div>
          <span style={{
            fontSize: '9px',
            backgroundColor: currentWave === 3 ? '#b91c1c' : '#000080',
            color: '#ffffff',
            padding: '1px 5px',
            borderRadius: '2px',
            fontWeight: 700,
          }}>
            WAVE {currentWave}/3
          </span>
        </div>

        {/* Content Body */}
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '10px', color: '#1f2937' }}>
            Document under attack! Swat incoming ants before they touch this box.
          </div>

          {/* Genuine File Information */}
          <div className="win95-inset" style={{
            padding: '4px 8px',
            backgroundColor: '#ffffff',
            fontSize: '10px',
            fontFamily: 'var(--font-retro-mono)',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontWeight: 700, color: '#000080', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '190px' }}>
              📄 {file.name}
            </span>
            <span style={{ color: '#4b5563' }}>
              {formatBytes(file.size)}
            </span>
          </div>

          {/* True 20-Second Countdown HUD */}
          <div className="win95-inset-gray" style={{
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="#000080" />
              <span style={{ fontSize: '11px', fontWeight: 700 }}>DEFENSE TIMER:</span>
            </div>
            <span style={{
              fontFamily: 'var(--font-retro-mono)',
              fontSize: '16px',
              fontWeight: 900,
              color: timeLeft <= 5 ? '#b91c1c' : '#000080',
            }}>
              {timeLeft.toFixed(1)}s
            </span>
          </div>

          {/* Chunky Windows 95 Progress Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div className="win95-progress-track">
              {Array.from({ length: totalChunks }).map((_, i) => (
                <div
                  key={i}
                  className="win95-progress-chunk"
                  style={{
                    backgroundColor: i < filledChunks 
                      ? (breachOccurred ? '#dc2626' : 'var(--win-navy)') 
                      : 'transparent',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-retro-mono)', color: '#4b5563' }}>
              <span>Progress: {Math.round(displayProgress)}%</span>
              <span>True Remaining: {timeLeft.toFixed(1)}s</span>
            </div>
          </div>

          {/* Counters Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div className="win95-inset" style={{ padding: '6px 8px', textAlign: 'center', backgroundColor: '#ffffff' }}>
              <div style={{ fontSize: '9px', color: '#6b7280' }}>ACTIVE ANTS</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: antsActiveCount > 0 ? '#b91c1c' : '#15803d', fontFamily: 'var(--font-retro-mono)' }}>
                {antsActiveCount}
              </div>
            </div>

            <div className="win95-inset" style={{ padding: '6px 8px', textAlign: 'center', backgroundColor: '#ffffff' }}>
              <div style={{ fontSize: '9px', color: '#6b7280' }}>ANTS SQUISHED</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#15803d', fontFamily: 'var(--font-retro-mono)' }}>
                {antsEliminatedCount}
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="win95-inset-gray" style={{
            fontSize: '10px',
            fontFamily: 'var(--font-retro-mono)',
            color: breachOccurred ? '#b91c1c' : '#000080',
            fontWeight: 700,
            textAlign: 'center',
            padding: '3px',
          }}>
            {securityStatus}
          </div>
        </div>
      </div>
    </div>
  );
};
