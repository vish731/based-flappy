'use client'
import { useState } from 'react'
import { SoundEngine } from '@/lib/sound'
import {
  getProvider, hasProvider, isMobileDevice,
  detectWalletName, getDeepLinks,
  checkNetwork, switchToBase,
  PRIZE_WALLET, ENTRY_FEE_HEX, BASE_CHAIN_ID, BUILDER_SUFFIX
} from '@/lib/wallet'
import { supabase, getWeekNumber } from '@/lib/supabase'

export default function Onboarding({ show, onClose, prizePool, userAddress, setUserAddress, hasEntered, setHasEntered, isOnBase, setIsOnBase, onStart, setWalletStatus }) {
  const [connecting, setConnecting] = useState(false)
  const [payingEntry, setPayingEntry] = useState(false)
  const [showWalletBanner, setShowWalletBanner] = useState(false)

  if (!show) return null

  async function connectWallet() {
    if (!hasProvider()) {
      if (isMobileDevice()) { setShowWalletBanner(true); return }
      window.open('https://metamask.io/download/', '_blank'); return
    }
    setConnecting(true); SoundEngine.play('click')
    try {
      const p = getProvider()
      const accounts = await p.request({ method: 'eth_requestAccounts' })
      if (!accounts?.length) throw new Error('No accounts')
      setUserAddress(accounts[0]); SoundEngine.play('success')
      setWalletStatus('Connected via ' + detectWalletName())
      const onBase = await checkNetwork(); setIsOnBase(onBase)
      p.on('accountsChanged', (accs) => { setUserAddress(accs[0] || null); if (!accs[0]) { setHasEntered(false); setIsOnBase(false) } })
      p.on('chainChanged', async () => { const onB = await checkNetwork(); setIsOnBase(onB) })
    } catch (e) {
      setWalletStatus(e.code === 4001 ? 'Rejected.' : 'Failed.')
    } finally { setConnecting(false) }
  }

  async function handleSwitchToBase() {
    const { switchToBase: sb } = await import('@/lib/wallet')
    await sb(); const onBase = await checkNetwork(); setIsOnBase(onBase)
  }

  async function enterContest() {
    if (!userAddress || hasEntered || !isOnBase) return
    setPayingEntry(true); SoundEngine.play('click')
    try {
      const p = getProvider()
      const txHash = await p.request({
        method: 'eth_sendTransaction',
        params: [{ from: userAddress, to: PRIZE_WALLET, value: ENTRY_FEE_HEX, data: BUILDER_SUFFIX, chainId: BASE_CHAIN_ID }]
      })
      await new Promise(r => setTimeout(r, 3000))
      setHasEntered(true); SoundEngine.play('success')
      try {
        await supabase.from('entries').insert({ wallet_address: userAddress, tx_hash: txHash, week_number: getWeekNumber(), amount_eth: 0.00005 })
      } catch (e) {}
      setWalletStatus('Entry confirmed!')
    } catch (e) {
      setWalletStatus(e.code === 4001 ? 'Cancelled.' : 'Failed.')
    } finally { setPayingEntry(false) }
  }

  const canStart = userAddress && isOnBase && hasEntered
  const canPayEntry = userAddress && isOnBase && !hasEntered
  const totalEntries = prizePool > 0 ? Math.round(prizePool / 0.00005) : 0

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose() }} style={{
      position: 'fixed', inset: 0, zIndex: 5000,
      background: 'rgba(5,5,8,0.85)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto', scrollbarWidth: 'none' }}>
        <div style={{
          background: '#0a0a12',
          border: '1px solid rgba(255,45,120,0.2)',
          borderRadius: '24px', overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 40px 80px rgba(0,0,0,0.8)'
        }}>
          {/* Top gradient bar */}
          <div style={{ height: '2px', background: 'linear-gradient(90deg, #FF2D78, #8B5CF6, #3B82F6)' }} />

          {/* Header */}
          <div style={{ padding: '28px 24px 0', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.2)',
              padding: '5px 14px', borderRadius: '100px', marginBottom: '20px'
            }}>
              <span style={{ width: '6px', height: '6px', background: '#FF2D78', borderRadius: '50%', boxShadow: '0 0 8px #FF2D78', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '2px' }}>Live Contest</span>
            </div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif", fontSize: '22px', fontWeight: 900,
              background: 'linear-gradient(90deg, #FF2D78, #8B5CF6, #3B82F6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: '6px', letterSpacing: '1px'
            }}>BASED-FLAPPY</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.3px' }}>Rank higher. Win more.</div>
          </div>

          {/* Prize Pool */}
          <div style={{ padding: '20px 24px 0' }}>
            <div style={{
              background: 'rgba(255,45,120,0.04)', border: '1px solid rgba(255,45,120,0.12)',
              borderRadius: '16px', padding: '18px', textAlign: 'center', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(255,45,120,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '8px' }}>Weekly Prize Pool</div>
              <div style={{ fontSize: '30px', fontWeight: 900, color: '#FF2D78', textShadow: '0 0 30px rgba(255,45,120,0.5)', marginBottom: '6px' }}>
                {prizePool.toFixed(5)} ETH
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '4px 12px', marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{totalEntries} entries × 0.00005 ETH</span>
              </div>
              <div style={{ display: 'flex', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {[['50%','1st','#FF2D78'],['40%','2nd','rgba(255,255,255,0.8)'],['10%','3rd','#8B5CF6']].map(([pct,label,color],i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i<2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ fontSize: '17px', fontWeight: 800, color }}>{pct}</div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>{label} Place</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Steps */}
          <div style={{ padding: '18px 24px 0' }}>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '12px' }}>Entry Steps</div>
            {[
              { num: '1', label: 'Connect your wallet', done: !!userAddress },
              { num: '2', label: 'Pay 0.00005 ETH entry fee', done: hasEntered },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                  background: step.done ? 'rgba(255,45,120,0.15)' : 'rgba(255,255,255,0.04)',
                  border: step.done ? '1px solid rgba(255,45,120,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: step.done ? '0 0 12px rgba(255,45,120,0.2)' : 'none'
                }}>
                  {step.done
                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FF2D78" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    : <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>{step.num}</span>
                  }
                </div>
                <span style={{ fontSize: '12px', fontWeight: 500, color: step.done ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}>{step.label}</span>
                {step.done && <div style={{ marginLeft: 'auto', fontSize: '9px', color: '#FF2D78', fontWeight: 700, background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', padding: '2px 8px', borderRadius: '100px' }}>DONE</div>}
              </div>
            ))}
          </div>

          {/* Note */}
          <div style={{ padding: '12px 24px 0' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px 14px', fontSize: '10px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.7, textAlign: 'center' }}>
              Entry fee is <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>0.00005 ETH</span> on Base mainnet · Non-refundable
            </div>
          </div>

          {/* Buttons */}
          <div style={{ padding: '14px 24px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* START GAME */}
            <button disabled={!canStart} onClick={() => { SoundEngine.play('click'); onStart() }} style={{
              width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
              fontSize: '13px', fontWeight: 800, letterSpacing: '1px', cursor: canStart ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: canStart ? 'linear-gradient(135deg, #FF2D78, #8B5CF6)' : 'rgba(255,255,255,0.04)',
              color: canStart ? '#fff' : 'rgba(255,255,255,0.15)',
              boxShadow: canStart ? '0 8px 30px rgba(255,45,120,0.4)' : 'none',
              transition: 'all 0.2s ease', textTransform: 'uppercase'
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Start Game
            </button>

            {/* PAY & ENTER */}
            {!hasEntered ? (
              <button disabled={!canPayEntry || payingEntry} onClick={enterContest} style={{
                width: '100%', padding: '14px', borderRadius: '14px',
                border: canPayEntry ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.05)',
                fontSize: '13px', fontWeight: 700, cursor: canPayEntry ? 'pointer' : 'not-allowed',
                background: canPayEntry ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                color: canPayEntry ? '#60A5FA' : 'rgba(255,255,255,0.15)',
                transition: 'all 0.2s ease'
              }}>
                {payingEntry ? 'Processing...' : 'Pay & Enter — 0.00005 ETH'}
              </button>
            ) : (
              <div style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,45,120,0.2)', background: 'rgba(255,45,120,0.06)', color: '#FF2D78', fontSize: '13px', fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                Entered — Ready to play
              </div>
            )}

            {userAddress && !isOnBase && (
              <button onClick={() => { const {switchToBase: sb} = require('@/lib/wallet'); sb().then(() => checkNetwork().then(setIsOnBase)) }} style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid rgba(59,130,246,0.15)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: 'rgba(59,130,246,0.06)', color: 'rgba(96,165,250,0.7)' }}>
                Switch to Base Network
              </button>
            )}

            {!userAddress && (
              <button disabled={connecting} onClick={connectWallet} style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)' }}>
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}

            <div style={{ textAlign: 'center', fontSize: '10px', color: canStart ? '#FF2D78' : 'rgba(255,255,255,0.2)', fontWeight: 500 }}>
              {canStart ? 'All set. Start playing!' : !userAddress ? 'Connect wallet to begin' : !isOnBase ? 'Switch to Base network' : 'Pay entry fee to unlock'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
