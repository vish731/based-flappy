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
      try { await supabase.from('entries').insert({ wallet_address: userAddress, tx_hash: txHash, week_number: getWeekNumber(), amount_eth: 0.000125 }) } catch (e) {}
      setWalletStatus('Entry confirmed!')
    } catch (e) {
      setWalletStatus(e.code === 4001 ? 'Cancelled.' : 'Failed.')
    } finally { setPayingEntry(false) }
  }

  async function handleSwitchToBase() {
    await switchToBase()
    const onBase = await checkNetwork(); setIsOnBase(onBase)
  }

  const canStart = userAddress && isOnBase && hasEntered
  const canPayEntry = userAddress && isOnBase && !hasEntered
  const totalEntries = prizePool > 0 ? Math.round(prizePool / 0.000125) : 0

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose() }} style={{
      position: 'fixed', inset: 0, zIndex: 5000,
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto', scrollbarWidth: 'none' }}>
        <div style={{
          background: '#fff', borderRadius: '24px',
          border: '2px solid #1a1a1a',
          boxShadow: '6px 6px 0px #1a1a1a',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ background: '#1DB954', padding: '24px', textAlign: 'center', borderBottom: '2px solid #1a1a1a' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(0,0,0,0.15)', padding: '5px 14px', borderRadius: '100px', marginBottom: '14px' }}>
              <span style={{ width: '6px', height: '6px', background: '#FF2D78', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '2px' }}>Live Contest</span>
            </div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: '4px', letterSpacing: '1px' }}>BASED-FLAPPY</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Rank higher. Win more.</div>
          </div>

          {/* Prize Pool */}
          <div style={{ padding: '20px', borderBottom: '2px solid #f0f0eb' }}>
            <div style={{ background: '#F5F5F0', border: '2px solid #1a1a1a', borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '3px 3px 0px #1a1a1a' }}>
              <div style={{ fontSize: '9px', color: '#999', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '8px' }}>Weekly Prize Pool</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#1DB954', marginBottom: '4px' }}>{prizePool.toFixed(5)} ETH</div>
              <div style={{ fontSize: '11px', color: '#999', marginBottom: '12px' }}>{totalEntries} entries × 0.000125 ETH</div>
              <div style={{ display: 'flex', borderTop: '2px solid #e5e5e0', paddingTop: '12px' }}>
                {[['60%','1st','#1DB954'],['40%','2nd','#0066FF']].map(([pct,label,color],i) => (
                  <div key={i} style={{ flex:1, textAlign:'center', borderRight: i===0 ? '2px solid #e5e5e0' : 'none' }}>
                    <div style={{ fontSize:'18px', fontWeight:900, color }}>{pct}</div>
                    <div style={{ fontSize:'10px', color:'#999', marginTop:'2px', fontWeight:600 }}>{label} Place</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Steps */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '9px', color: '#999', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '12px' }}>Entry Steps</div>
            {[
              { num: '1', label: 'Connect your wallet', done: !!userAddress },
              { num: '2', label: 'Pay 0.000125 ETH entry fee', done: hasEntered },
            ].map((step, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom: i<1 ? '2px solid #f0f0eb' : 'none' }}>
                <div style={{
                  width:'28px', height:'28px', borderRadius:'8px', flexShrink:0,
                  background: step.done ? '#1DB954' : '#fff',
                  border: '2px solid #1a1a1a',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow: '2px 2px 0px #1a1a1a'
                }}>
                  {step.done
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    : <span style={{ fontSize:'11px', color:'#999', fontWeight:700 }}>{step.num}</span>
                  }
                </div>
                <span style={{ fontSize:'13px', fontWeight:600, color: step.done ? '#1a1a1a' : '#999' }}>{step.label}</span>
                {step.done && <div style={{ marginLeft:'auto', fontSize:'9px', color:'#1DB954', fontWeight:700, background:'#e8f9ef', padding:'2px 8px', borderRadius:'100px', border:'1px solid #1DB954' }}>DONE</div>}
              </div>
            ))}
          </div>

          {/* Note */}
          <div style={{ padding: '0 20px 16px' }}>
            <div style={{ background:'#F5F5F0', border:'2px solid #e5e5e0', borderRadius:'10px', padding:'10px 14px', fontSize:'11px', color:'#999', textAlign:'center' }}>
              0.000125 ETH on Base mainnet · Non-refundable
            </div>
          </div>

          {/* Buttons */}
          <div style={{ padding: '0 20px 20px', display:'flex', flexDirection:'column', gap:'8px' }}>
            <button disabled={!canStart} onClick={() => { SoundEngine.play('click'); onStart() }} style={{
              width:'100%', padding:'14px', borderRadius:'14px',
              border: '2px solid #1a1a1a', fontSize:'13px', fontWeight:800,
              cursor: canStart ? 'pointer' : 'not-allowed',
              background: canStart ? '#1DB954' : '#f0f0eb',
              color: canStart ? '#fff' : '#ccc',
              boxShadow: canStart ? '3px 3px 0px #1a1a1a' : 'none',
              letterSpacing:'0.5px', textTransform:'uppercase'
            }}>Start Game</button>

            {!hasEntered ? (
              <button disabled={!canPayEntry || payingEntry} onClick={enterContest} style={{
                width:'100%', padding:'14px', borderRadius:'14px',
                border:'2px solid #1a1a1a', fontSize:'13px', fontWeight:700,
                cursor: canPayEntry ? 'pointer' : 'not-allowed',
                background: canPayEntry ? '#0066FF' : '#f0f0eb',
                color: canPayEntry ? '#fff' : '#ccc',
                boxShadow: canPayEntry ? '3px 3px 0px #1a1a1a' : 'none'
              }}>{payingEntry ? 'Processing...' : 'Pay & Enter — 0.000125 ETH'}</button>
            ) : (
              <div style={{ width:'100%', padding:'14px', borderRadius:'14px', border:'2px solid #1DB954', background:'#e8f9ef', color:'#1DB954', fontSize:'13px', fontWeight:700, textAlign:'center' }}>
                Entered — Ready to play!
              </div>
            )}

            {userAddress && !isOnBase && (
              <button onClick={handleSwitchToBase} style={{ width:'100%', padding:'12px', borderRadius:'14px', border:'2px solid #1a1a1a', fontSize:'12px', fontWeight:600, cursor:'pointer', background:'#fff', boxShadow:'2px 2px 0px #1a1a1a' }}>
                Switch to Base Network
              </button>
            )}

            {!userAddress && (
              <button disabled={connecting} onClick={connectWallet} style={{ width:'100%', padding:'12px', borderRadius:'14px', border:'2px solid #1a1a1a', fontSize:'12px', fontWeight:600, cursor:'pointer', background:'#fff', boxShadow:'2px 2px 0px #1a1a1a' }}>
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}

            <div style={{ textAlign:'center', fontSize:'11px', color: canStart ? '#1DB954' : '#999', fontWeight:600 }}>
              {canStart ? 'All set — start playing!' : !userAddress ? 'Connect wallet to begin' : !isOnBase ? 'Switch to Base network' : 'Pay entry fee to unlock'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
