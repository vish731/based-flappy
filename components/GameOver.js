'use client'
import { SoundEngine } from '@/lib/sound'

export default function GameOver({ show, currentScore, totalScore, onRestart, onClose }) {
  if (!show) return null

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose() }} style={{
      position: 'fixed', inset: 0, zIndex: 4000,
      background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: '#0a0a12', border: '1px solid rgba(255,45,120,0.2)',
        borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '340px', textAlign: 'center',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.8)',
        animation: 'fadeInUp 0.3s ease'
      }}>
        {/* Top bar */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #FF2D78, #8B5CF6, #3B82F6)', borderRadius: '2px', marginBottom: '28px', margin: '-32px -32px 28px' }} />

        <div style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: '22px', fontWeight: 900,
          background: 'linear-gradient(90deg, #FF2D78, #8B5CF6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '24px', letterSpacing: '1px'
        }}>GAME OVER</div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', padding: '16px'
          }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: 600 }}>This Game</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'rgba(255,255,255,0.9)' }}>{currentScore}</div>
          </div>
          <div style={{
            flex: 1, background: 'rgba(255,45,120,0.06)', border: '1px solid rgba(255,45,120,0.15)',
            borderRadius: '14px', padding: '16px'
          }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: 600 }}>Weekly Total</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#FF2D78' }}>{totalScore}</div>
          </div>
        </div>

        <button onClick={() => { SoundEngine.play('click'); onRestart() }} style={{
          width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
          fontSize: '13px', fontWeight: 800, cursor: 'pointer', letterSpacing: '1px',
          background: 'linear-gradient(135deg, #FF2D78, #8B5CF6)',
          color: 'white', boxShadow: '0 8px 30px rgba(255,45,120,0.4)',
          textTransform: 'uppercase', transition: 'all 0.2s ease'
        }}>Play Again</button>

        <button onClick={onClose} style={{
          marginTop: '10px', width: '100%', padding: '12px', borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', fontWeight: 600,
          cursor: 'pointer', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)'
        }}>Close</button>
      </div>
    </div>
  )
}
