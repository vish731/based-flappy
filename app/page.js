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

// ── Contest Timer ────────────────────────────────────────────
function getCountdown() {
  const now = new Date()
  const day = now.getDay()
  const daysUntilSun = day === 0 ? 0 : 7 - day
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

  // Wallet state
  const [userAddress, setUserAddress] = useState(null)
  const [hasEntered, setHasEntered] = useState(false)
  const [isOnBase, setIsOnBase] = useState(false)
  const [walletStatus, setWalletStatus] = useState('')

  // Game state
  const [totalScore, setTotalScore] = useState(0)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [showGameOver, setShowGameOver] = useState(false)
  const [lastScore, setLastScore] = useState(0)
  const [prizePool, setPrizePool] = useState(0)

  // Timer
  const [countdown, setCountdown] = useState(getCountdown())

  // Sound indicator
  const [soundMsg, setSoundMsg] = useState('')
  const [soundMsgVisible, setSoundMsgVisible] = useState(false)
  const soundTimerRef = useRef(null)

  // ── Theme ──────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
    SoundEngine.play('click')
  }

  // ── Sound ──────────────────────────────────────────────────
  function toggleSound() {
    const on = SoundEngine.toggle()
    setSoundEnabled(on)
    setSoundMsg(on ? 'Sound ON' : 'Sound OFF')
    setSoundMsgVisible(true)
    clearTimeout(soundTimerRef.current)
    soundTimerRef.current = setTimeout(() => setSoundMsgVisible(false), 1500)
  }

  // ── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setCountdown(getCountdown()), 1000)
    return () => clearInterval(t)
  }, [])

  // ── Prize Pool ─────────────────────────────────────────────
  useEffect(() => {
    loadPrizePool()
  }, [])

  async function loadPrizePool() {
    try {
      const { data } = await supabase
        .from('scores').select('wallet_address')
        .eq('week_number', getWeekNumber())
      setPrizePool((data?.length || 0) * 0.00005)
    } catch (e) {}
  }

  // ── Total score from DB ────────────────────────────────────
  useEffect(() => {
    if (!userAddress) return
    loadTotalScore()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress])

  async function loadTotalScore() {
    try {
      const { data } = await supabase
        .from('scores').select('total_score')
        .eq('wallet_address', userAddress)
        .eq('week_number', getWeekNumber()).single()
      if (data) setTotalScore(data.total_score || 0)
    } catch (e) {}
  }

  // ── Game Over handler ──────────────────────────────────────
  function handleGameOver(score, total) {
    setLastScore(score)
    setTotalScore(total)
    setShowGameOver(true)
  }

  // ── Restart ────────────────────────────────────────────────
  function handleRestart() {
    setShowGameOver(false)
    // Game component handles re-init via START GAME button
  }

  // ── Tab change ─────────────────────────────────────────────
  function handleTabChange(tab) {
    setActiveTab(tab)
    if (tab === 'game' && !hasEntered) setShowOnboarding(true)
  }

  const timerBlock = (val) => (
    <span style={{
      background: 'rgba(239,68,68,0.12)', padding: '3px 7px',
      borderRadius: '6px', color: '#F87171', minWidth: '32px',
      textAlign: 'center', lineHeight: 1.4,
      fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: '12px'
    }}>{val}</span>
  )

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        userAddress={userAddress}
        theme={theme}
        toggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
      />

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '124px 20px 40px' }}>

        {/* ── GAME TAB ── */}
        {activeTab === 'game' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Badges */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* Info badge */}
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '10px 16px', fontSize: '12px',
                display: 'flex', alignItems: 'center', gap: '10px', backdropFilter: 'blur(10px)'
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: '8px', padding: '4px 10px', fontSize: '10px',
                  fontWeight: 600, color: 'var(--primary)'
                }}>🔵 Base</span>
                <span style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
                <span>Entry: 0.00005 ETH</span>
                <span style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
                <span>Prize: <span style={{ color: 'var(--gold)', fontWeight: 700, fontFamily: "'Orbitron', sans-serif", fontSize: '11px' }}>{prizePool.toFixed(5)}</span> ETH</span>
              </div>
              {/* Timer badge */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(245,158,11,0.08))',
                border: '1px solid rgba(239,68,68,0.15)', borderRadius: '12px',
                padding: '10px 16px', fontSize: '12px',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 500 }}>Ends in</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {timerBlock(countdown.days + 'd')}
                  <span style={{ color: 'rgba(239,68,68,0.4)', fontSize: '10px' }}>:</span>
                  {timerBlock(countdown.hours + 'h')}
                  <span style={{ color: 'rgba(239,68,68,0.4)', fontSize: '10px' }}>:</span>
                  {timerBlock(countdown.mins + 'm')}
                </div>
              </div>
            </div>

            {/* Game Canvas */}
            <Game
              hasEntered={hasEntered}
              userAddress={userAddress}
              theme={theme}
              onGameOver={handleGameOver}
              onShowOnboarding={() => setShowOnboarding(true)}
              totalScore={totalScore}
              setTotalScore={setTotalScore}
            />

            {/* Wallet status */}
            {walletStatus && (
              <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}
                dangerouslySetInnerHTML={{ __html: walletStatus }} />
            )}

            {/* Network warning */}
            {userAddress && !isOnBase && (
              <div style={{
                marginTop: '8px', fontSize: '11px', color: '#F59E0B',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '8px', padding: '8px 12px', textAlign: 'center'
              }}>
                ⚠️ Switch to Base network to play!
              </div>
            )}
          </div>
        )}

        {/* ── LEADERBOARD TAB ── */}
        {activeTab === 'leaderboard' && <Leaderboard />}

        {/* ── DOCS TAB ── */}
        {activeTab === 'docs' && <Docs />}
      </div>

      {/* Onboarding Overlay */}
      <Onboarding
        show={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        prizePool={prizePool}
        userAddress={userAddress}
        setUserAddress={setUserAddress}
        hasEntered={hasEntered}
        setHasEntered={setHasEntered}
        isOnBase={isOnBase}
        setIsOnBase={setIsOnBase}
        onStart={() => { setShowOnboarding(false) }}
        setWalletStatus={setWalletStatus}
      />

      {/* Game Over Modal */}
      <GameOver
        show={showGameOver}
        currentScore={lastScore}
        totalScore={totalScore}
        onRestart={handleRestart}
        onClose={() => setShowGameOver(false)}
      />

      {/* Help Button */}
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

      {/* Sound Indicator */}
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

