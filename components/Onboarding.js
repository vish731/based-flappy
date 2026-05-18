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

const CHECK_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

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

  // ── Connect Wallet ──────────────────────────────────────────
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

      // Check network
      const onBase = await checkNetwork()
      setIsOnBase(onBase)

      // Listen for changes
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

  // ── Switch to Base ──────────────────────────────────────────
  async function handleSwitchToBase() {
    await switchToBase()
    const onBase = await checkNetwork()
    setIsOnBase(onBase)
  }

  // ── Pay Entry Fee ───────────────────────────────────────────
  async function enterContest() {
    if (!userAddress) { alert('Connect wallet first!'); return }
    if (hasEntered) { alert('Already entered this week!'); return }
    if (!isOnBase) { await handleSwitchToBase(); return }

    setPayingEntry(true)
    SoundEngine.play('click')
    try {
      const p = getProvider()
      const txHash = await p.request({
        method: 'eth_sendTransaction',
        params: [{ from: userAddress, to: PRIZE_WALLET, value: ENTRY_FEE_HEX, chainId: BASE_CHAIN_ID }]
      })

      // Wait for confirmation
      await new Promise(r => setTimeout(r, 3000))
      setHasEntered(true)
      SoundEngine.play('success')

      // Record in Supabase
      try {
        await supabase.from('entries').insert({
          wallet_address: userAddress,
          tx_hash: txHash,
          week_number: getWeekNumber(),
          amount_eth: 0.00005
        })
      } catch (dbErr) { console.warn('Entry record non-critical:', dbErr) }

      setWalletStatus(`✅ Entry confirmed! TX: ${txHash.slice(0, 10)}...`)
    } catch (e) {
      setWalletStatus(e.code === 4001 ? 'Transaction cancelled.' : 'Transaction failed.')
    } finally {
      setPayingEntry(false)
    }
  }

  const canStart = userAddress && isOnBase && hasEntered
  const canPayEntry = userAddress && isOnBase && !hasEntered
  const deepLinks = getDeepLinks()

  // ── Step states ─────────────────────────────────────────────
  const step1Done = !!userAddress
  const step2Done = isOnBase
  const step3Done = hasEntered

  const stepNum = (num, done) => (
    <div style={{
      width: '26px', height: '26px', minWidth: '26px',
      background: done
        ? 'linear-gradient(135deg, #3B82F6, #2563EB)'
        : 'linear-gradient(135deg, var(--primary), var(--accent))',
      borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: '11px', fontFamily: "'Orbitron', sans-serif",
      boxShadow: done ? '0 2px 10px rgba(59,130,246,0.35)' : 'none',
      transition: 'all 0.4s ease'
    }}>
      {done ? CHECK_ICON : num}
    </div>
  )

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'var(--overlay-bg)',
        backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 5000, padding: '20px', animation: 'fadeInUp 0.5s ease'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '100%', maxWidth: '440px',
        maxHeight: 'calc(100vh - 40px)', overflowY: 'auto',
        scrollbarWidth: 'none'
      }}>
        <div style={{
          background: 'var(--bg-card-solid)', borderRadius: '24px',
          border: '1px solid var(--border)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
          animation: 'scaleIn 0.5s ease'
        }}>
          {/* Header */}
          <div style={{ padding: '28px 26px 0', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              padding: '5px 13px', borderRadius: '100px', fontSize: '10px',
              fontWeight: 700, color: '#EF4444', textTransform: 'uppercase',
              letterSpacing: '1.5px', marginBottom: '16px'
            }}>
              <span style={{ width: '5px', height: '5px', background: '#EF4444', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
              LIVE CONTEST
            </div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif", fontSize: '19px',
              fontWeight: 800, lineHeight: 1.3, marginBottom: '8px', color: 'var(--text)'
            }}>
              This is a Contest Game
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.7 }}>
              Scores only count after entering the weekly contest. Requires ETH on Base network.
            </div>
          </div>

          {/* Prize Box */}
          <div style={{
            margin: '20px 26px', background: 'var(--input-bg)',
            border: '1px solid var(--border)', borderRadius: '14px',
            padding: '16px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
              Current Prize Pool
            </div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif", fontSize: '26px',
              fontWeight: 800, color: 'var(--gold)', margin: '6px 0'
            }}>
              {prizePool.toFixed(5)} ETH
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              {[['50%', '1st'], ['40%', '2nd'], ['10%', 'Fee']].map(([val, label]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '15px', fontWeight: 700, color: 'var(--primary)' }}>{val}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div style={{ padding: '0 26px' }}>
            {[
              { num: '1', done: step1Done, title: 'Connect Wallet', desc: 'MetaMask, Coinbase Wallet, or any EVM wallet' },
              { num: '2', done: step2Done, title: 'Switch to Base Network', desc: 'Chain ID: 8453 — will auto-prompt if needed' },
              { num: '3', done: step3Done, title: 'Pay Entry Fee (0.00005 ETH)', desc: 'Real ETH transaction on Base mainnet' },
              { num: '4', done: canStart, title: 'Play & Compete', desc: 'Every game adds to your weekly total score' },
            ].map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none'
              }}>
                {stepNum(step.num, step.done)}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '2px' }}>{step.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{step.desc}</div>
                </div>
              </div>
            ))}

            {/* Warning */}
            <div style={{
              background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
              borderRadius: '11px', padding: '12px 13px', margin: '12px 0',
              display: 'flex', alignItems: 'flex-start', gap: '9px'
            }}>
              <div style={{
                width: '18px', height: '18px', minWidth: '18px',
                background: 'rgba(245,158,11,0.15)', borderRadius: '5px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '11px', color: '#F59E0B'
              }}>!</div>
              <div style={{ fontSize: '11px', color: '#FCD34D', lineHeight: 1.6 }}>
                <strong style={{ color: '#F59E0B' }}>Without entry, your score will NOT be saved.</strong> Entry fees are non-refundable.
              </div>
            </div>
          </div>

          {/* Mobile Wallet Banner */}
          {showWalletBanner && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.06))',
              border: '1px solid rgba(245,158,11,0.18)', borderRadius: '12px',
              padding: '14px', margin: '10px 26px 0', textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#F59E0B', marginBottom: '4px' }}>No Wallet Detected</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
                Open this page inside your wallet's browser. <strong style={{ color: 'var(--text)' }}>MetaMask recommended.</strong>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => window.location.href = deepLinks.open} style={{
                  flex: 1, padding: '10px', borderRadius: '9px', border: 'none',
                  fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#000'
                }}>Open in MetaMask</button>
                <button onClick={() => window.open(deepLinks.install, '_blank')} style={{
                  flex: 1, padding: '10px', borderRadius: '9px',
                  border: '1px solid var(--border)', fontSize: '11px',
                  fontWeight: 700, cursor: 'pointer',
                  background: 'var(--input-bg)', color: 'var(--text)'
                }}>Install MetaMask</button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ padding: '20px 26px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* START GAME */}
            <button
              disabled={!canStart}
              onClick={() => { SoundEngine.play('click'); onStart() }}
              style={{
                width: '100%', padding: '13px', borderRadius: '11px', border: 'none',
                fontSize: '12px', fontWeight: 700, cursor: canStart ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                color: 'white', opacity: canStart ? 1 : 0.35,
                boxShadow: canStart ? '0 4px 16px var(--primary-glow)' : 'none',
                transition: 'all 0.25s ease'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              START GAME
            </button>

            {/* PAY ENTRY */}
            {!hasEntered ? (
              <button
                disabled={!canPayEntry || payingEntry}
                onClick={enterContest}
                style={{
                  width: '100%', padding: '13px', borderRadius: '11px',
                  border: '1px solid rgba(59,130,246,0.25)', fontSize: '12px',
                  fontWeight: 700, cursor: canPayEntry ? 'pointer' : 'not-allowed',
                  background: 'rgba(59,130,246,0.1)', color: 'var(--primary)',
                  opacity: canPayEntry ? 1 : 0.35, transition: 'all 0.25s ease'
                }}
              >
                {payingEntry ? 'CONFIRMING TX...' : 'PAY ENTRY FEE (0.00005 ETH on Base)'}
              </button>
            ) : (
              <div style={{
                width: '100%', padding: '13px', borderRadius: '11px',
                border: '1px solid rgba(59,130,246,0.12)', fontSize: '12px',
                fontWeight: 700, textAlign: 'center',
                background: 'rgba(59,130,246,0.06)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}>
                {CHECK_ICON} ENTERED — READY TO PLAY
              </div>
            )}

            {/* SWITCH TO BASE (show if connected but wrong network) */}
            {userAddress && !isOnBase && (
              <button
                onClick={handleSwitchToBase}
                style={{
                  width: '100%', padding: '13px', borderRadius: '11px',
                  border: '1px solid rgba(245,158,11,0.3)', fontSize: '12px',
                  fontWeight: 700, cursor: 'pointer',
                  background: 'rgba(245,158,11,0.08)', color: '#F59E0B',
                  transition: 'all 0.25s ease'
                }}
              >
                ⚡ SWITCH TO BASE NETWORK
              </button>
            )}

            {/* CONNECT WALLET */}
            {!userAddress && (
              <button
                disabled={connecting}
                onClick={connectWallet}
                style={{
                  width: '100%', padding: '13px', borderRadius: '11px',
                  border: '1px solid var(--border)', fontSize: '12px',
                  fontWeight: 700, cursor: 'pointer',
                  background: 'var(--input-bg)', color: 'var(--text)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.25s ease'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
                </svg>
                {connecting ? 'CONNECTING...' : 'CONNECT WALLET'}
              </button>
            )}

            {/* Status */}
            <div style={{
              textAlign: 'center', fontSize: '10px', paddingTop: '2px',
              color: canStart ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: canStart ? 600 : 400
            }}>
              {canStart
                ? '✅ All set! Click START GAME.'
                : !userAddress
                  ? 'Complete steps above to start'
                  : !isOnBase
                    ? 'Switch to Base network to continue'
                    : 'Pay entry fee to unlock the game'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
