'use client'

import { SoundEngine } from '@/lib/sound'

export default function GameOver({ show, currentScore, totalScore, onRestart, onClose }) {
  if (!show) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'var(--overlay-bg)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px', animation: 'fadeInUp 0.4s ease'
    }}>
      <div style={{
        background: 'var(--bg-card-solid)',
        borderRadius: '26px', padding: '36px 30px', textAlign: 'center',
        maxWidth: '380px', width: '100%',
        border: '1px solid var(--border)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        animation: 'scaleIn 0.4s ease'
      }}>
        {/* Title */}
        <div style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: '24px', fontWeight: 800,
          marginBottom: '6px',
          background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          GAME OVER
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '24px' }}>
          {currentScore > 0 ? 'Score submitted to leaderboard!' : 'Better luck next time!'}
        </div>

        {/* Score Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '24px' }}>
          <div style={{
            flex: 1, background: 'var(--input-bg)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '20px 12px'
          }}>
            <div style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              This Game
            </div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif", fontSize: '28px', fontWeight: 800,
              color: 'var(--primary)'
            }}>
              {currentScore}
            </div>
          </div>
          <div style={{
            flex: 1, background: 'var(--input-bg)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '20px 12px'
          }}>
            <div style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Your Total
            </div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif", fontSize: '28px', fontWeight: 800,
              color: 'var(--gold)'
            }}>
              {totalScore}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { SoundEngine.play('click'); onRestart() }}
            style={{
              flex: 1, border: 'none', padding: '14px 24px', borderRadius: '13px',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: 'white',
              boxShadow: '0 4px 15px rgba(59,130,246,0.35)',
              transition: 'all 0.25s ease'
            }}
          >
            PLAY AGAIN
          </button>
          <button
            onClick={() => { SoundEngine.play('click'); onClose() }}
            style={{
              flex: 1, border: '1px solid var(--border)', padding: '14px 24px',
              borderRadius: '13px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              background: 'var(--input-bg)', color: 'var(--text)',
              transition: 'all 0.25s ease'
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}

