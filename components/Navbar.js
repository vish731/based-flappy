'use client'

import { SoundEngine } from '@/lib/sound'

export default function Navbar({ activeTab, setActiveTab, userAddress, theme, toggleTheme, soundEnabled, toggleSound }) {

  const handleTab = (tab) => {
    SoundEngine.play('click')
    setActiveTab(tab)
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(30px) saturate(150%)',
      WebkitBackdropFilter: 'blur(30px) saturate(150%)',
      borderBottom: '1px solid var(--border)',
      zIndex: 100, padding: '0 12px', height: '56px',
      transition: 'background 0.5s ease, border-color 0.5s ease',
      overflow: 'hidden'
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', height: '100%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: '8px', minWidth: 0
      }}>

        {/* Logo */}
        <div style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: '13px',
          fontWeight: 800, display: 'flex', alignItems: 'center', gap: '7px',
          flexShrink: 0
        }}>
          <div style={{
            width: '32px', height: '32px', minWidth: '32px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            borderRadius: '9px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', boxShadow: '0 0 16px var(--primary-glow)'
          }}>
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <circle cx="11" cy="12.5" r="6.5" fill="url(#lbg2)" />
              <circle cx="17" cy="10" r="3.8" fill="url(#lbg2)" />
              <path d="M5 11.5 L2 9" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M4.5 12.5 L1.5 12.5" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M5 13.5 L2 16" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="18.5" cy="9.2" r="1.8" fill="white" />
              <circle cx="19" cy="8.9" r="1.1" fill="#0F172A" />
              <circle cx="19.4" cy="8.4" r="0.45" fill="white" />
              <polygon points="20.5,10.5 23,11.2 20.5,12" fill="#F59E0B" />
              <defs>
                <linearGradient id="lbg2" x1="4" y1="5" x2="20" y2="18">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span style={{
            background: 'linear-gradient(135deg, var(--text) 0%, var(--text-muted) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            whiteSpace: 'nowrap'
          }}>BASED-FLAPPY</span>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
          {['game', 'leaderboard', 'docs'].map(tab => (
            <a
              key={tab}
              className={`nav-link ${activeTab === tab ? 'active' : ''}`}
              onClick={() => handleTab(tab)}
              style={{ textTransform: 'capitalize', cursor: 'pointer', fontSize: '12px', padding: '6px 10px' }}
            >
              {tab}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>

          {/* Sound — hide on small screens */}
          <button
            onClick={() => { toggleSound(); SoundEngine.play('click') }}
            style={{
              width: '34px', height: '34px', borderRadius: '9px',
              border: '1px solid var(--border)', background: 'var(--input-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
            }}
          >
            {soundEnabled ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: '34px', height: '34px', borderRadius: '9px',
              border: '1px solid var(--border)', background: 'var(--input-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)'
            }}
          >
            {theme === 'dark' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>

          {/* Wallet Badge */}
          <div
            onClick={() => SoundEngine.play('click')}
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))',
              padding: '7px 10px', borderRadius: '10px', fontSize: '11px',
              fontWeight: 600, cursor: 'pointer',
              border: '1px solid rgba(59,130,246,0.2)',
              display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{
              width: '6px', height: '6px', minWidth: '6px', borderRadius: '50%',
              background: userAddress ? '#3B82F6' : 'var(--text-muted)',
              animation: userAddress ? 'pulse 2s infinite' : 'none'
            }} />
            <span>
              {userAddress
                ? userAddress.slice(0, 4) + '..' + userAddress.slice(-3)
                : 'Connect'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}
