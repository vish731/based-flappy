'use client'

import { useState } from 'react'
import { SoundEngine } from '@/lib/sound'
import {
  getProvider, hasProvider, isMobileDevice,
  detectWalletName, getDeepLinks,
  checkNetwork, switchToBase,
  PRIZE_WALLET, ENTRY_FEE_HEX, BASE_CHAIN_ID
} from '@/lib/wallet'
import { supabase, getWeekNumber } from '@/lib/supabase'

export default function Onboarding({
  show, onClose, prizePool,
  userAddress, setUserAddress,
  hasEntered, setHasEntered,
  isOnBase, setIsOnBase,
  onStart, setWalletStatus
}) {
  const [connecting, setConnecting] = useState(false)
  const [payingEntry, setPayingEntry] = useState(false)
  const [showWalletBanner, setShowWalletBanner] = useState(false)

  if (!show) return null

  async function connectWallet() {
    if (!hasProvider()) {
      if (isMobileDevice()) { setShowWalletBanner(true); return }
      window.open('https://metamask.io/download/', '_blank')
      return
    }
    setConnecting(true)
    SoundEngine.play('click')
    try {
      const p = getProvider()
      const accounts = await p.request({ method: 'eth_requestAccounts' })
      if (!accounts?.length) throw new Error('No accounts')
      setUserAddress(accounts[0])
      SoundEngine.play('success')
      setWalletStatus('Connected via ' + detectWalletName())
      const onBase = await checkNetwork()
      setIsOnBase(onBase)
      p.on('accountsChanged', (accs) => {
        setUserAddress(accs[0] || null)
        if (!accs[0]) { setHasEntered(false); setIsOnBase(false) }
      })
      p.on('chainChanged', async () => {
        const onB = await checkNetwork()
        setIsOnBase(onB)
      })
    } catch (e) {
      setWalletStatus(e.code === 4001 ? 'Connection rejected.' : 'Connection failed.')
    } finally {
      setConnecting(false)
    }
  }

  async function handleSwitchToBase() {
    await switchToBase()
    const onBase = await checkNetwork()
    setIsOnBase(onBase)
  }

  async function enterContest() {
    if (!userAddress) { alert('Connect wallet first!'); return }
    if (hasEntered) { alert('Already entered this week!'); return }
    if (!isOnBase) { await handleSwitchToBase(); return }

    setPayingEntry(true)
    SoundEngine.play('click')
    try {
      const p = getProvider()

      // Simple direct ETH transfer — 0.00005 ETH to prize wallet
      const txHash = await p.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAddress,
          to: PRIZE_WALLET,
          value: ENTRY_FEE_HEX,  // 0x2d79883d2000 = 0.00005 ETH
          chainId: BASE_CHAIN_ID
        }]
      })

      await new Promise(r => setTimeout(r, 3000))
      setHasEntered(true)
      SoundEngine.play('success')

      try {
        await supabase.from('entries').insert({
          wallet_address: userAddress,
          tx_hash: txHash,
          week_number: getWeekNumber(),
          amount_eth: 0.00005
        })
      } catch (dbErr) { console.warn('DB record non-critical:', dbErr) }

      setWalletStatus('Entry confirmed! You are in this week\'s contest.')

    } catch (e) {
      if (e.code === 4001) {
        setWalletStatus('Transaction cancelled.')
      } else {
        setWalletStatus('Transaction failed. Try again.')
      }
    } finally {
      setPayingEntry(false)
    }
  }

  const canStart = userAddress && isOnBase && hasEntered
  const canPayEntry = userAddress && isOnBase && !hasEntered
  const deepLinks = getDeepLinks()
  const step1Done = !!userAddress
  const step2Done = hasEntered
  const totalEntries = prizePool > 0 ? Math.round(prizePool / 0.00005) : 0

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 5000, padding: '16px'
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', scrollbarWidth: 'none' }}>
        <div style={{
          background: 'linear-gradient(160deg, #0B0E0C 0%, #0A0D0B 50%, #080A08 100%)',
          borderRadius: '22px',
          border: '1px solid rgba(59,130,246,0.1)',
          boxShadow: '0 50px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
          overflow: 'hidden', position: 'relative'
        }}>

          {/* Glow orbs */}
          <div style={{
            position: 'absolute', top: '-60px', left: '-60px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '160px', height: '160px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Top line */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.5), rgba(59,130,246,0.5), transparent)' }} />

          {/* Header */}
          <div style={{ padding: '24px 24px 0', textAlign: 'center', position: 'relative' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.15)',
              padding: '5px 14px', borderRadius: '100px', marginBottom: '18px'
            }}>
              <span style={{
                width: '5px', height: '5px', background: '#EF4444',
                borderRadius: '50%', display: 'inline-block',
                boxShadow: '0 0 8px rgba(239,68,68,0.8)',
                animation: 'pulse 1.5s infinite'
              }} />
              <span style={{ fontSize: '8px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Live Contest
              </span>
            </div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif", fontSize: '22px', fontWeight: 900,
              background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '1px', marginBottom: '7px'
            }}>
              BASED-FLAPPY
            </div>
            <div style={{
              fontSize: '11px', letterSpacing: '0.5px',
              background: 'linear-gradient(90deg, #3B82F6, #3B82F6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontWeight: 600
            }}>
              Rank higher. Win more.
            </div>
          </div>

          {/* Prize Pool */}
          <div style={{ padding: '18px 22px 0' }}>
            <div style={{
              background: 'rgba(59,130,246,0.03)',
              border: '1px solid rgba(59,130,246,0.1)',
              borderRadius: '16px', padding: '18px', textAlign: 'center',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.05) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '10px' }}>
                Weekly Prize Pool
              </div>
              <div style={{
                fontFamily: "'Orbitron', sans-serif", fontSize: '28px', fontWeight: 900,
                color: '#3B82F6', textShadow: '0 0 40px rgba(59,130,246,0.4)', marginBottom: '6px'
              }}>
                {prizePool.toFixed(5)} ETH
              </div>

              {/* Formula */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px', padding: '5px 12px', marginBottom: '14px'
              }}>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{totalEntries} entries</span>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.15)' }}>×</span>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>0.00005 ETH</span>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.15)' }}>=</span>
                <span style={{ fontSize: '9px', color: '#3B82F6', fontWeight: 700, fontFamily: 'monospace' }}>{prizePool.toFixed(5)} ETH</span>
              </div>

              <div style={{ display: 'flex', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {[
                  { pct: '50%', label: '1st Place', color: '#3B82F6', glow: 'rgba(59,130,246,0.3)' },
                  { pct: '40%', label: '2nd Place', color: '#FFFFFF', glow: 'rgba(255,255,255,0.2)' },
                  { pct: '10%', label: '3rd Place', color: '#EF4444', glow: 'rgba(239,68,68,0.2)' },
                ].map((item, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '16px', fontWeight: 800, color: item.color, textShadow: '0 0 20px ' + item.glow }}>{item.pct}</div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginTop: '3px', fontWeight: 500 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Steps */}
          <div style={{ padding: '18px 22px 0' }}>
            <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '14px' }}>
              Entry Steps
            </div>
            {[
              { num: '1', label: 'Connect your wallet', done: step1Done },
              { num: '2', label: 'Pay 0.00005 ETH entry fee', done: step2Done },
            ].map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '10px 0',
                borderBottom: i < 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
              }}>
                <div style={{
                  width: '28px', height: '28px', minWidth: '28px', borderRadius: '8px',
                  background: step.done ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.1))' : 'rgba(255,255,255,0.03)',
                  border: step.done ? '1px solid rgba(59,130,246,0.35)' : '1px solid rgba(255,255,255,0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: step.done ? '0 0 12px rgba(59,130,246,0.15)' : 'none'
                }}>
                  {step.done ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>{step.num}</span>
                  )}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 500, color: step.done ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.38)' }}>
                  {step.label}
                </span>
                {step.done && (
                  <div style={{
                    marginLeft: 'auto', fontSize: '8px', color: '#3B82F6', fontWeight: 700,
                    background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
                    padding: '2px 8px', borderRadius: '100px'
                  }}>DONE</div>
                )}
              </div>
            ))}
          </div>

          {/* Note */}
          <div style={{ padding: '12px 22px 0' }}>
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '10px', padding: '10px 14px',
              fontSize: '10px', color: 'rgba(255,255,255,0.25)',
              lineHeight: 1.7, textAlign: 'center'
            }}>
              Entry fee is <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>0.00005 ETH</span> on Base mainnet.
              Non-refundable. Score only counts after entry.
            </div>
          </div>

          {/* Mobile Banner */}
          {showWalletBanner && (
            <div style={{ padding: '10px 22px 0' }}>
              <div style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#F59E0B', marginBottom: '3px' }}>No wallet detected</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>Open this page inside your wallet browser</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => window.location.href = deepLinks.open} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', fontSize: '10px', fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#000' }}>Open in MetaMask</button>
                  <button onClick={() => window.open(deepLinks.install, '_blank')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)', fontSize: '10px', fontWeight: 700, cursor: 'pointer', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)' }}>Install MetaMask</button>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ padding: '14px 22px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

            {/* START GAME */}
            <button
              disabled={!canStart}
              onClick={() => { SoundEngine.play('click'); onStart() }}
              style={{
                width: '100%', padding: '14px', borderRadius: '13px', border: 'none',
                fontSize: '12px', fontWeight: 700, letterSpacing: '1px',
                cursor: canStart ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
                background: canStart ? 'linear-gradient(135deg, #3B82F6 0%, #3B82F6 100%)' : 'rgba(255,255,255,0.03)',
                color: canStart ? '#fff' : 'rgba(255,255,255,0.12)',
                boxShadow: canStart ? '0 6px 30px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.15)' : 'none',
                transition: 'all 0.25s ease'
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              START GAME
            </button>

            {/* PAY & ENTER */}
            {!hasEntered ? (
              <button
                disabled={!canPayEntry || payingEntry}
                onClick={enterContest}
                style={{
                  width: '100%', padding: '14px', borderRadius: '13px',
                  border: canPayEntry ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(255,255,255,0.04)',
                  fontSize: '12px', fontWeight: 600,
                  cursor: canPayEntry ? 'pointer' : 'not-allowed',
                  background: canPayEntry ? 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.08))' : 'rgba(255,255,255,0.02)',
                  color: canPayEntry ? '#60A5FA' : 'rgba(255,255,255,0.12)',
                  transition: 'all 0.25s ease'
                }}
              >
                {payingEntry ? 'Processing entry...' : 'Pay & Enter — 0.00005 ETH'}
              </button>
            ) : (
              <div style={{
                width: '100%', padding: '14px', borderRadius: '13px',
                border: '1px solid rgba(59,130,246,0.18)',
                fontSize: '12px', fontWeight: 600, textAlign: 'center',
                background: 'rgba(59,130,246,0.05)', color: '#60A5FA',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Entered — Ready to play
              </div>
            )}

            {/* SWITCH TO BASE */}
            {userAddress && !isOnBase && (
              <button onClick={handleSwitchToBase} style={{
                width: '100%', padding: '12px', borderRadius: '13px',
                border: '1px solid rgba(59,130,246,0.12)', fontSize: '11px', fontWeight: 600,
                cursor: 'pointer', background: 'rgba(59,130,246,0.05)', color: 'rgba(96,165,250,0.6)'
              }}>
                Switch to Base Network
              </button>
            )}

            {/* CONNECT WALLET */}
            {!userAddress && (
              <button disabled={connecting} onClick={connectWallet} style={{
                width: '100%', padding: '12px', borderRadius: '13px',
                border: '1px solid rgba(255,255,255,0.06)', fontSize: '11px', fontWeight: 600,
                cursor: 'pointer', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)'
              }}>
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}

            <div style={{
              textAlign: 'center', fontSize: '10px', paddingTop: '2px',
              color: canStart ? '#60A5FA' : 'rgba(255,255,255,0.18)', fontWeight: 500
            }}>
              {canStart ? 'All set. You are ready to play.'
                : !userAddress ? 'Connect your wallet to get started'
                : !isOnBase ? 'Switch to Base network to continue'
                : 'Pay entry fee to unlock the game'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
