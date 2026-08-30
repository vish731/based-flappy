'use client'
import { SoundEngine } from '@/lib/sound'

export default function Navbar({ activeTab, setActiveTab, userAddress, theme, toggleTheme, soundEnabled, toggleSound }) {
  const handleTab = (tab) => { SoundEngine.play('click'); setActiveTab(tab) }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border)',
      zIndex: 100, height: '60px', padding: '0 20px'
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #FF2D78, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255,45,120,0.4)'
          }}>
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <circle cx="11" cy="12.5" r="6.5" fill="rgba(255,255,255,0.9)" />
              <circle cx="17" cy="10" r="3.8" fill="rgba(255,255,255,0.9)" />
              <circle cx="18.5" cy="9.2" r="1.8" fill="#FF2D78" />
              <circle cx="19" cy="8.9" r="1" fill="white" />
              <polygon points="20.5,10.5 23,11.2 20.5,12" fill="#FFD700" />
            </svg>
          </div>
          <span style={{
            fontFamily: "'Orbitron', sans-serif", fontSize: '14px', fontWeight: 800,
            background: 'linear-gradient(90deg, #FF2D78, #8B5CF6, #3B82F6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            whiteSpace: 'nowrap', letterSpacing: '0.5px'
          }}>BASED-FLAPPY</span>
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {['game','leaderboard','docs'].map(tab => (
            <a key={tab} className={`nav-link ${activeTab === tab ? 'active' : ''}`}
              onClick={() => handleTab(tab)}
              style={{ textTransform: 'capitalize', cursor: 'pointer', fontSize: '13px' }}>
              {tab}
            </a>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button onClick={() => { toggleSound(); SoundEngine.play('click') }} style={{
            width: '36px', height: '36px', borderRadius: '10px',
            border: '1px solid var(--border)', background: 'var(--input-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text2)'
          }}>
            {soundEnabled
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            }
          </button>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,45,120,0.15), rgba(139,92,246,0.15))',
            border: '1px solid rgba(255,45,120,0.25)',
            padding: '8px 14px', borderRadius: '12px', fontSize: '12px',
            fontWeight: 700, cursor: 'pointer', color: 'var(--text)',
            display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap'
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
              background: userAddress ? '#FF2D78' : 'var(--text2)',
              boxShadow: userAddress ? '0 0 8px rgba(255,45,120,0.8)' : 'none',
              animation: userAddress ? 'pulse 2s infinite' : 'none'
            }} />
            {userAddress ? userAddress.slice(0,4) + '..' + userAddress.slice(-3) : 'Connect'}
          </div>
        </div>
      </div>
    </nav>
  )
}
