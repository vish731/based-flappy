'use client'
import { SoundEngine } from '@/lib/sound'

export default function Navbar({ activeTab, setActiveTab, userAddress, theme, toggleTheme, soundEnabled, toggleSound }) {
  const handleTab = (tab) => { SoundEngine.play('click'); setActiveTab(tab) }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: '#fff', borderBottom: '2px solid #1a1a1a',
      height: '64px', padding: '0 20px'
    }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: '#1DB954', border: '2px solid #1a1a1a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '2px 2px 0px #1a1a1a'
          }}>
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <circle cx="11" cy="12.5" r="6.5" fill="white" />
              <circle cx="17" cy="10" r="3.8" fill="white" />
              <circle cx="18.5" cy="9.2" r="1.8" fill="#1DB954" />
              <circle cx="19" cy="8.9" r="1" fill="white" />
              <polygon points="20.5,10.5 23,11.2 20.5,12" fill="#FF2D78" />
            </svg>
          </div>
          <span style={{
            fontFamily: "'Orbitron', sans-serif", fontSize: '14px', fontWeight: 900,
            color: '#0D0D0D', whiteSpace: 'nowrap', letterSpacing: '0.5px'
          }}>BASED-FLAPPY</span>
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {['game', 'leaderboard', 'docs'].map(tab => (
            <a key={tab} className={`nav-link ${activeTab === tab ? 'active' : ''}`}
              onClick={() => handleTab(tab)}
              style={{ textTransform: 'capitalize', cursor: 'pointer', fontSize: '13px' }}>
              {tab}
            </a>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button onClick={() => { toggleSound(); SoundEngine.play('click') }} style={{
            width: '38px', height: '38px', borderRadius: '10px',
            border: '2px solid #1a1a1a', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#555', boxShadow: '2px 2px 0px #1a1a1a'
          }}>
            {soundEnabled
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            }
          </button>

          <div onClick={() => SoundEngine.play('click')} style={{
            background: userAddress ? '#1DB954' : '#fff',
            border: '2px solid #1a1a1a',
            padding: '8px 16px', borderRadius: '100px', fontSize: '12px',
            fontWeight: 700, cursor: 'pointer',
            color: userAddress ? '#fff' : '#0D0D0D',
            display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap',
            boxShadow: '2px 2px 0px #1a1a1a'
          }}>
            {userAddress && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fff', flexShrink: 0 }} />}
            {userAddress ? userAddress.slice(0,4) + '..' + userAddress.slice(-3) : 'Connect'}
          </div>
        </div>
      </div>
    </nav>
  )
}
