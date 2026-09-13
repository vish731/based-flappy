'use client'
import { SoundEngine } from '@/lib/sound'

export default function GameOver({ show, currentScore, totalScore, onRestart, onClose }) {
  if (!show) return null
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose() }} style={{
      position:'fixed', inset:0, zIndex:4000,
      background:'rgba(0,0,0,0.3)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'
    }}>
      <div style={{
        background:'#fff', border:'2px solid #1a1a1a',
        borderRadius:'24px', padding:'28px', width:'100%', maxWidth:'320px', textAlign:'center',
        boxShadow:'6px 6px 0px #1a1a1a', animation:'fadeInUp 0.3s ease'
      }}>
        <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'20px', fontWeight:900, color:'#0D0D0D', marginBottom:'20px', letterSpacing:'1px' }}>GAME OVER</div>

        <div style={{ display:'flex', gap:'10px', marginBottom:'20px' }}>
          <div style={{ flex:1, background:'#F5F5F0', border:'2px solid #1a1a1a', borderRadius:'14px', padding:'14px', boxShadow:'2px 2px 0px #1a1a1a' }}>
            <div style={{ fontSize:'10px', color:'#999', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'6px', fontWeight:700 }}>This Game</div>
            <div style={{ fontSize:'30px', fontWeight:900, color:'#0D0D0D' }}>{currentScore}</div>
          </div>
          <div style={{ flex:1, background:'#1DB954', border:'2px solid #1a1a1a', borderRadius:'14px', padding:'14px', boxShadow:'2px 2px 0px #1a1a1a' }}>
            <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'6px', fontWeight:700 }}>Weekly Total</div>
            <div style={{ fontSize:'30px', fontWeight:900, color:'#fff' }}>{totalScore}</div>
          </div>
        </div>

        <button onClick={() => { SoundEngine.play('click'); onRestart() }} style={{
          width:'100%', padding:'14px', borderRadius:'14px',
          border:'2px solid #1a1a1a', fontSize:'13px', fontWeight:800,
          cursor:'pointer', background:'#0D0D0D', color:'#fff',
          boxShadow:'3px 3px 0px #1DB954', textTransform:'uppercase', marginBottom:'8px'
        }}>Play Again</button>

        <button onClick={onClose} style={{
          width:'100%', padding:'11px', borderRadius:'14px',
          border:'2px solid #e5e5e0', fontSize:'12px', fontWeight:600,
          cursor:'pointer', background:'#fff', color:'#999'
        }}>Close</button>
      </div>
    </div>
  )
}
