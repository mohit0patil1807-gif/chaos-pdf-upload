import React, { useState } from 'react';
import { Users, Coffee, CheckCircle2, XCircle, Rocket, Sparkles } from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface CommitteeDialogProps {
  onAuthorized: () => void;
  onCancel: () => void;
}

export const CommitteeDialog: React.FC<CommitteeDialogProps> = ({
  onAuthorized,
  onCancel,
}) => {
  const [bribed, setBribed] = useState(false);

  const handleBribe = () => {
    sound.playCheckpointSuccess();
    setBribed(true);
  };

  const handleFinalAuthorize = () => {
    sound.playVictory();
    onAuthorized();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '1rem',
    }}>
      <div className="glass-panel" style={{
        maxWidth: '560px',
        width: '100%',
        border: '1px solid var(--accent-purple)',
        boxShadow: '0 0 35px rgba(168, 85, 247, 0.25)',
        overflow: 'hidden',
      }}>
        {/* Retro Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          backgroundColor: 'rgba(168, 85, 247, 0.12)',
          borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="var(--accent-purple)" />
            <span style={{
              fontWeight: 800,
              fontSize: '0.88rem',
              fontFamily: 'var(--font-heading)',
              color: '#f8fafc',
              letterSpacing: '0.03em',
            }}>
              SECTION 8: UPLOAD COMMITTEE QUORUM VERIFICATION
            </span>
          </div>
          <span style={{
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-purple)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '0.15rem 0.5rem',
            borderRadius: '4px',
          }}>
            STEP 3 OF 3
          </span>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            Ingestion of this document requires an official 3-member quorum per Municipal Ordinance 94-Omega. Two commissioners have affirmed; one seat is currently compromised.
          </p>

          {/* Committee Member Votes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#f8fafc' }}>
                  Commissioner Vance
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Bureau of Document Friction</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-green)', fontSize: '0.75rem', fontWeight: 700 }}>
                <CheckCircle2 size={16} /> APPROVED
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#f8fafc' }}>
                  Inspector Sterling
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Department of Redundant Checks</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-green)', fontSize: '0.75rem', fontWeight: 700 }}>
                <CheckCircle2 size={16} /> APPROVED
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: bribed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
              border: `1px solid ${bribed ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.3)'}`,
              transition: 'all 0.3s ease',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#f8fafc' }}>
                  Auditor Pennyworth
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {bribed ? 'Caffeinated & Delighted!' : 'Status: Unresponsive (Severe Caffeine Depletion)'}
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: bribed ? 'var(--accent-green)' : 'var(--accent-rose)',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {bribed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {bribed ? 'APPROVED ✅' : 'VOTE BLOCKED ❌'}
              </div>
            </div>
          </div>

          {/* Bribery interaction if not bribed */}
          {!bribed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px dashed #f59e0b',
              borderRadius: '8px',
            }}>
              <span style={{ fontSize: '0.76rem', color: '#fbbf24' }}>
                Auditor Pennyworth needs coffee to sign off:
              </span>
              <button
                onClick={handleBribe}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.85rem',
                  backgroundColor: '#f59e0b',
                  color: '#090d16',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)',
                }}
              >
                <Coffee size={14} />
                Bribe with Espresso ☕🍩
              </button>
            </div>
          )}

          {/* Final Action Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <button
              type="button"
              onClick={() => {
                sound.playBeep(200, 'square', 0.1);
                onCancel();
              }}
              style={{
                padding: '0.55rem 1rem',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'var(--text-muted)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!bribed}
              onClick={handleFinalAuthorize}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.4rem',
                backgroundColor: bribed ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: bribed ? '#ffffff' : '#64748b',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: bribed ? 'pointer' : 'not-allowed',
                boxShadow: bribed ? '0 0 20px rgba(168, 85, 247, 0.5)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {bribed ? <Sparkles size={16} /> : <Rocket size={16} />}
              {bribed ? 'Authorize Ingestion Pipeline' : 'Awaiting Quorum (Feed Auditor)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
