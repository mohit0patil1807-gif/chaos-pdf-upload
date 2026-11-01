// ANTivirus — Chaos by Design TypeScript definitions

export type AppState =
  | 'IDLE'
  | 'FILE_SELECTED'
  | 'CONFIRMATION'
  | 'ANT_DEFENSE'
  | 'BREACH_FAILURE'
  | 'PROCESSING_SUCCESS'
  | 'SCRATCH_RESULT'
  | 'COMPLETED';

export type AttemptOutcome = 'SUCCESS' | 'FAILED' | null;

export interface AntEntity {
  id: string;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  speed: number;
  angle: number;
  baseAngle: number;
  wobbleSpeed: number;
  wobblePhase: number;
  wave: 1 | 2 | 3;
  state: 'crawling' | 'squished' | 'breached';
  squishTime?: number;
  scale: number;
}

export interface DefenseStats {
  durationSeconds: number;
  antsSpawned: number;
  antsEliminated: number;
  breachAntId?: string;
  breachTimeSeconds?: number;
  missedClicks: number;
  attemptsCount: number;
}

export interface SecurityReportData {
  fileName: string;
  fileSizeBytes: number;
  fileSHA256: string;
  outcome: AttemptOutcome;
  defenseStats: DefenseStats;
  chaosScore: number;
  timestamp: string;
}
