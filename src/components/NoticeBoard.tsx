import React from 'react';
import { Info, AlertTriangle, Megaphone, CheckCircle } from 'lucide-react';

interface NoticeBoardProps {
  elapsedSeconds: number;
  currentCheckpointIndex: number;
  checkpointsCleared: boolean[];
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({
  elapsedSeconds,
  currentCheckpointIndex,
  checkpointsCleared,
}) => {
  // Escalating hints: 0-10s subtle, 10-20s explicit, 20-35s clerk memo, 35s+ loudspeaker override
  const getNoticeContent = () => {
    if (elapsedSeconds < 10) {
      return {
        level: 'subtle',
        icon: <Info size={14} color="#1d4ed8" />,
        badge: 'DIRECTIVE 97-A (OFFICIAL)',
        badgeColor: '#1d4ed8',
        text: 'All paperwork must proceed according to Internal Registry Nomenclature in strict lexicographical order [A ➔ B ➔ C ➔ D]. Hold file for 1.2 seconds over each counter to engage stamp.',
      };
    } else if (elapsedSeconds < 20) {
      return {
        level: 'notice',
        icon: <AlertTriangle size={14} color="#b45309" />,
        badge: 'NOTICE BOARD BULLETIN (T+10s)',
        badgeColor: '#b45309',
        text: 'Clerks process dockets strictly by internal registry code: [A_Archives] ➔ [B_Certification] ➔ [C_Compliance] ➔ [D_Dispatch]. Do not rely on display signage.',
      };
    } else if (elapsedSeconds < 35) {
      return {
        level: 'explicit',
        icon: <AlertTriangle size={14} color="#b91c1c" />,
        badge: 'CLERK INTERNAL MEMO (T+20s)',
        badgeColor: '#b91c1c',
        text: `Target in progress: Checkpoint #${currentCheckpointIndex + 1} (${['A_Archives', 'B_Certification', 'C_Compliance', 'D_Dispatch'][currentCheckpointIndex]}). Hold cursor steadily for 1.2s until the ring fills green!`,
      };
    } else {
      return {
        level: 'loudspeaker',
        icon: <Megaphone size={14} color="#7c2d12" />,
        badge: 'LOUDSPEAKER BROADCAST (T+35s)',
        badgeColor: '#7c2d12',
        text: '1) Hover Top-Left (A_Archives) 1.2s ➔ 2) Hover Top-Right (B_Certification) 1.2s ➔ 3) Hover Bottom-Left (C_Compliance) 1.2s ➔ 4) Hover Bottom-Right (D_Dispatch) 1.2s then release Drop!',
      };
    }
  };

  const notice = getNoticeContent();

  return (
    <div className="win95-inset" style={{
      margin: '6px 8px',
      padding: '8px 12px',
      backgroundColor: '#fefce8',
      border: '2px solid var(--win-dark)',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {notice.icon}
          <span style={{
            fontSize: '10px',
            fontWeight: 800,
            fontFamily: 'var(--font-retro-mono)',
            color: notice.badgeColor,
            letterSpacing: '0.5px',
          }}>
            {notice.badge}
          </span>
        </div>

        {/* Checkpoint indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {['A_Archives', 'B_Certification', 'C_Compliance', 'D_Dispatch'].map((name, idx) => {
            const isCleared = checkpointsCleared[idx];
            const isCurrent = idx === currentCheckpointIndex;
            return (
              <span
                key={name}
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-retro-mono)',
                  padding: '1px 5px',
                  backgroundColor: isCleared ? '#dcfce7' : (isCurrent ? '#fee2e2' : '#f3f4f6'),
                  color: isCleared ? '#15803d' : (isCurrent ? '#b91c1c' : '#6b7280'),
                  border: `1px solid ${isCleared ? '#22c55e' : (isCurrent ? '#ef4444' : '#d1d5db')}`,
                  fontWeight: isCurrent || isCleared ? 700 : 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                {isCleared ? '✓ ' : (isCurrent ? '▶ ' : '')}{name}
              </span>
            );
          })}
        </div>
      </div>

      <div style={{
        fontSize: '11px',
        color: '#1f2937',
        fontFamily: 'var(--font-retro-ui)',
        lineHeight: 1.4,
      }}>
        {notice.text}
      </div>
    </div>
  );
};
