'use client'

import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import Game from '@/components/Game'
import Onboarding from '@/components/Onboarding'
import GameOver from '@/components/GameOver'
import Leaderboard from '@/components/Leaderboard'
import Docs from '@/components/Docs'
import { supabase, getWeekNumber } from '@/lib/supabase'
import { SoundEngine } from '@/lib/sound'

function getCountdown() {
  const now = new Date()
  const day = now.getDay()
  const daysUntilSun = day === 0 ? 0 : 
  const end = new Date(now)
  end.setDate(now.getDate() + daysUntilSun)
  end.setHours(23, 59, 59, 999)
  let diff = end - now
  if (diff < 1000) { end.setDate(end.getDate() + 7); diff = end - now }
  return {
    days: Math.floor(diff / 86400000),
    hours: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
    mins: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
  }
}

export default function Home() {
  const [theme, setTheme] = useState('dark')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState('game')

  const [userAddress, setUserAddress] = useState(null)
  const [hasEntered, setHasEntered] = useState(false)
  const [isOnBase, setIsOnBase] = useState(false)
  const [walletStatus, setWalletStatus] = useState('')

  const [totalScore, setTotalScore] = useState(0)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [showGameOver, setShowGameOver] = useState(false)
  const [lastScore, setLastScore] = useState(0)
  const [prizePool, setPrizePool] = useState(0)
  const [countdown, setCountdown] = useState(getCountdown())
  const [freePlay, setFreePlay] = useState(false)

  const [soundMsg, setSoundMsg] = useState('')
  const [soundMsgVisible, setSoundMsgVisible] = useState(false)
  const soundTimerRef = useRef(null)
  const gameRef = useRef(null)

  // Theme — always light
  useEffect(() => {
    setTheme('light')
    document.documentElement.setAttribute('data-theme', 'light')
    localStorage.setItem('theme', 'light')
  }, [])

  function toggleTheme() {
    SoundEngine.play('click')
  }

  function toggleSound() {
    const on = SoundEngine.toggle()
    setSoundEnabled(on)
    setSoundMsg(on ? 'Sound ON' : 'Sound OFF')
    setSoundMsgVisible(true)
    clearTimeout(soundTimerRef.current)
    soundTimerRef.current = setTimeout(() => setSoundMsgVisible(false), 1500)
  }

  // Timer
  useEffect(() => {
    const t = setInterval(() => setCountdown(getCountdown()), 1000)
    return () => clearInterval(t)
  }, [])

  // Prize pool — count from entries table
  useEffect(() => {
    loadPrizePool()
  }, [])

  async function loadPrizePool() {
    try {
      const wk = getWeekNumber()
      const { data, error } = await supabase
        .from('entries')
        .select('wallet_address')
        .eq('week_number', wk)
      if (!error && data) {
        setPrizePool(data.length * 0.000125)
      }
    } catch (e) {}
  }

  const [username, setUsername] = useState('')
  const [usernameInput, setUsernameInput] = useState('')
  const [savingUsername, setSavingUsername] = useState(false)

  // Check entry status from Supabase when wallet connects
  useEffect(() => {
    if (!userAddress) return
    checkEntryStatus()
    loadTotalScore()
    loadUsername()
  }, [userAddress])

  async function loadUsername() {
    try {
      const { data } = await supabase
        .from('scores')
        .select('username')
        .eq('wallet_address', userAddress)
        .not('username', 'is', null)
        .limit(1)
        .single()
      if (data?.username) {
        setUsername(data.username)
        setUsernameInput(data.username)
      }
    } catch (e) {}
  }

  async function saveUsername() {
    if (!usernameInput.trim() || !userAddress) return
    setSavingUsername(true)
    try {
      await supabase
        .from('scores')
        .update({ username: usernameInput.trim() })
        .eq('wallet_address', userAddress)
      setUsername(usernameInput.trim())
    } catch (e) {}
    setSavingUsername(false)
  }

  async function checkEntryStatus() {
    try {
      const wk = getWeekNumber()
      const { data } = await supabase
        .from('entries')
        .select('wallet_address')
        .eq('wallet_address', userAddress)
        .eq('week_number', wk)
        .single()
      if (data) {
        setHasEntered(true)
      }
    } catch (e) {
      // No entry found — keep hasEntered false
    }
  }

  async function loadTotalScore() {
    try {
      const { data } = await supabase
        .from('scores')
        .select('total_score')
        .eq('wallet_address', userAddress)
        .eq('week_number', getWeekNumber())
        .single()
      if (data) setTotalScore(data.total_score || 0)
    } catch (e) {}
  }

  function handleGameOver(score, total) {
    setLastScore(score)
    setTotalScore(total)
    setShowGameOver(true)
    // Refresh prize pool after game
    loadPrizePool()
  }

  function handleRestart() {
    setShowGameOver(false)
    gameRef.current?.restart()
  }

  function handleTabChange(tab) {
    setActiveTab(tab)
    if (tab === 'game' && !hasEntered) setShowOnboarding(true)
    if (tab === 'leaderboard') loadPrizePool()
  }

  // After entry confirmed — refresh prize pool
  useEffect(() => {
    if (hasEntered) loadPrizePool()
  }, [hasEntered])

  const timerBlock = (val) => (
    <span style={{
      background: '#FF2D78', padding: '4px 10px',
      borderRadius: '8px', color: '#fff', minWidth: '36px',
      textAlign: 'center', lineHeight: 1.4,
      fontWeight: 800, fontSize: '13px', border: '2px solid #1a1a1a',
      boxShadow: '2px 2px 0px #1a1a1a'
    }}>{val}</span>
  )

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        userAddress={userAddress}
        theme={theme}
        toggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
      />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 16px 40px' }}>

        {activeTab === 'game' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Info Bar */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{
                background: '#fff', border: '2px solid #1a1a1a',
                borderRadius: '100px', padding: '10px 20px', fontSize: '13px',
                display: 'flex', alignItems: 'center', gap: '12px',
                boxShadow: '3px 3px 0px #1a1a1a'
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: '#e8f4ff', border: '1px solid #0066FF',
                  borderRadius: '100px', padding: '4px 10px', fontSize: '11px',
                  fontWeight: 700, color: '#0066FF'
                }}>⬤ Base</span>
                <span style={{ width: '1px', height: '16px', background: '#e5e5e0' }} />
                <span style={{ color: '#555', fontSize: '12px' }}>Entry: <span style={{ color: '#0D0D0D', fontWeight: 700 }}>0.000125 ETH</span></span>
                <span style={{ width: '1px', height: '16px', background: '#e5e5e0' }} />
                <span style={{ color: '#555', fontSize: '12px' }}>Prize: <span style={{ color: '#1DB954', fontWeight: 800 }}>{prizePool.toFixed(5)}</span> ETH</span>
              </div>
              <div style={{
                background: '#fff', border: '2px solid #1a1a1a',
                borderRadius: '100px', padding: '10px 20px', fontSize: '12px',
                display: 'flex', alignItems: 'center', gap: '10px',
                boxShadow: '3px 3px 0px #1a1a1a'
              }}>
                <span style={{ color: '#555', fontSize: '11px', fontWeight: 600 }}>Ends in</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {timerBlock(countdown.days + 'd')}
                  <span style={{ color: '#ccc', fontSize: '12px', fontWeight: 700 }}>:</span>
                  {timerBlock(countdown.hours + 'h')}
                  <span style={{ color: '#ccc', fontSize: '12px', fontWeight: 700 }}>:</span>
                  {timerBlock(countdown.mins + 'm')}
                </div>
              </div>
            </div>

            {/* Mode Selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', width: '100%', maxWidth: '460px' }}>
              <button
                onClick={() => { setFreePlay(false); setShowOnboarding(true) }}
                style={{
                  flex: 1, padding: '12px', borderRadius: '100px',
                  border: '2px solid #1a1a1a', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  background: !freePlay ? '#0D0D0D' : '#fff',
                  color: !freePlay ? '#fff' : '#555',
                  boxShadow: !freePlay ? '3px 3px 0px #1DB954' : '2px 2px 0px #1a1a1a',
                  transition: 'all 0.15s ease'
                }}
              >
                Contest Mode
              </button>
              <button
                onClick={() => { setFreePlay(true); setShowOnboarding(false) }}
                style={{
                  flex: 1, padding: '12px', borderRadius: '100px',
                  border: '2px solid #1a1a1a', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  background: freePlay ? '#1DB954' : '#fff',
                  color: freePlay ? '#fff' : '#555',
                  boxShadow: freePlay ? '3px 3px 0px #1a1a1a' : '2px 2px 0px #1a1a1a',
                  transition: 'all 0.15s ease'
                }}
              >
                Normal Mode
              </button>
            </div>

            <Game
              ref={gameRef}
              hasEntered={hasEntered}
              freePlay={freePlay}
              userAddress={userAddress}
              theme={theme}
              onGameOver={handleGameOver}
              onShowOnboarding={() => setShowOnboarding(true)}
              totalScore={totalScore}
              setTotalScore={setTotalScore}
            />

            {walletStatus && (
              <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}
                dangerouslySetInnerHTML={{ __html: walletStatus }} />
            )}

            {/* Username setter */}
            {userAddress && (
              <div style={{
                marginTop: '14px', width: '100%', maxWidth: '460px',
                background: '#fff', border: '2px solid #1a1a1a',
                borderRadius: '14px', padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: '10px',
                boxShadow: '3px 3px 0px #1a1a1a'
              }}>
                <div style={{ fontSize: '11px', color: '#999', whiteSpace: 'nowrap', fontWeight: 700 }}>
                  {username ? 'Name:' : 'Set name:'}
                </div>
                <input
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value.slice(0, 20))}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveUsername() }}
                  placeholder="Your display name..."
                  maxLength={20}
                  style={{
                    flex: 1, background: '#F5F5F0',
                    border: '2px solid #e5e5e0',
                    borderRadius: '8px', padding: '7px 12px',
                    fontSize: '12px', color: '#0D0D0D', outline: 'none',
                    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600
                  }}
                />
                <button
                  onClick={saveUsername}
                  disabled={savingUsername || !usernameInput.trim()}
                  style={{
                    padding: '7px 14px', borderRadius: '8px',
                    border: '2px solid #1a1a1a', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                    background: '#1DB954', color: '#fff',
                    boxShadow: '2px 2px 0px #1a1a1a',
                    opacity: !usernameInput.trim() ? 0.4 : 1
                  }}
                >
                  {savingUsername ? '...' : 'Save'}
                </button>
              </div>
            )}

            {userAddress && !isOnBase && (
              <div style={{
                marginTop: '8px', fontSize: '11px', color: '#F59E0B',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '8px', padding: '8px 12px', textAlign: 'center'
              }}>
                Switch to Base network to play!
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && <Leaderboard />}
        {activeTab === 'docs' && <Docs />}
      </div>

      <Onboarding
        show={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        prizePool={prizePool}
        userAddress={userAddress}
        setUserAddress={setUserAddress}
        hasEntered={hasEntered}
        setHasEntered={(val) => {
          setHasEntered(val)
          if (val) loadPrizePool() // refresh prize pool on entry
        }}
        isOnBase={isOnBase}
        setIsOnBase={setIsOnBase}
        onStart={() => setShowOnboarding(false)}
        setWalletStatus={setWalletStatus}
      />

      <GameOver
        show={showGameOver}
        currentScore={lastScore}
        totalScore={totalScore}
        onRestart={handleRestart}
        onClose={() => setShowGameOver(false)}
      />

      <button
        onClick={() => { SoundEngine.play('click'); setShowOnboarding(true) }}
        style={{
          position: 'fixed', bottom: '20px', right: '20px',
          width: '46px', height: '46px', borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 99, border: 'none', color: 'white',
          fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: '15px',
          boxShadow: '0 4px 18px var(--primary-glow)'
        }}
      >?</button>

      <div style={{
        position: 'fixed', bottom: '76px', right: '20px',
        background: 'var(--bg-card-solid)', border: '1px solid var(--border)',
        borderRadius: '9px', padding: '7px 12px', fontSize: '10px',
        fontWeight: 600, color: 'var(--text-muted)', zIndex: 99,
        opacity: soundMsgVisible ? 1 : 0,
        transform: soundMsgVisible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'all 0.3s ease', pointerEvents: 'none'
      }}>
        {soundMsg}
      </div>
    </div>
  )
}
