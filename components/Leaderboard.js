'use client'

import { useEffect, useState } from 'react'
import { supabase, getWeekNumber } from '@/lib/supabase'

export default function Leaderboard() {
  const [players, setPlayers] = useState([])
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const [prizePool, setPrizePool] = useState(0)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    await Promise.all([loadLeaderboard(), loadWinners(), loadPrizePool()])
  }

  async function loadPrizePool() {
    try {
      const { data } = await supabase
        .from('entries')
        .select('wallet_address')
        .eq('week_number', getWeekNumber())
      setPrizePool((data?.length || 0) * 0.00005)
    } catch (e) {}
  }

  async function loadLeaderboard() {
    try {
      const { data } = await supabase
        .from('scores')
        .select('wallet_address, username, total_score, games_played')
        .eq('week_number', getWeekNumber())
        .order('total_score', { ascending: false })
        .limit(20)
      setPlayers(data || [])
    } catch (e) {
      console.warn('Leaderboard load error:', e)
    } finally {
      setLoading(false)
    }
  }

  async function loadWinners() {
    try {
      const { data } = await supabase
        .from('contests')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5)
      setWinners(data || [])
    } catch (e) {}
  }

  const rankColors = ['var(--gold)', 'var(--silver)', 'var(--bronze)']
  const rankLabels = ['1st', '2nd', '3rd']
  const avatarGradients = [
    'linear-gradient(135deg, #FFD700, #FFA500)',
    'linear-gradient(135deg, #C0C0C0, #808080)',
    'linear-gradient(135deg, #CD7F32, #8B4513)',
  ]

  const cardStyle = {
    background: 'var(--bg-card)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px', padding: '24px',
    border: '1px solid var(--border)',
    transition: 'all 0.5s ease',
    animation: 'fadeInUp 0.6s ease'
  }

  return (
    <div style={{ marginTop: '40px' }}>

      {/* Prize Pool Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,215,0,0.06), rgba(255,215,0,0.02))',
        border: '1px solid rgba(255,215,0,0.15)',
        borderRadius: '16px', padding: '20px', textAlign: 'center', marginBottom: '20px'
      }}>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
          This Week's Prize Pool
        </div>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '32px', fontWeight: 900, color: '#FFD700' }}>
          {prizePool.toFixed(5)} ETH
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>
          {Math.round(prizePool / 0.00005)} entries × 0.00005 ETH
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { pct: '50%', label: '1st Place', color: '#FFD700', amount: (prizePool * 0.5).toFixed(5) },
            { pct: '40%', label: '2nd Place', color: '#94A3B8', amount: (prizePool * 0.4).toFixed(5) },
            { pct: '10%', label: '3rd Place', color: '#CD7F32', amount: (prizePool * 0.1).toFixed(5) },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '14px', fontWeight: 700, color: item.color }}>{item.amount} ETH</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>

        {/* Top Scorers */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>
            Top Scorers — This Week
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading...</div>
          ) : players.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
              <p>No players yet — be the first!</p>
            </div>
          ) : (
            <div style={{ maxHeight: '460px', overflowY: 'auto' }}>
              {players.map((player, i) => {
                const name = player.username || player.wallet_address?.slice(0, 8) || '???'
                const avatarBg = avatarGradients[i] || 'linear-gradient(135deg, var(--primary), var(--accent))'
                const avatarColor = i < 3 ? '#000' : '#fff'
                return (
                  <div key={i} className="leaderboard-item">
                    <div style={{
                      width: '40px', fontWeight: 800, fontSize: '12px',
                      fontFamily: "'Orbitron', sans-serif",
                      color: rankColors[i] || 'var(--text-muted)'
                    }}>
                      {rankLabels[i] || `${i + 1}th`}
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '9px',
                        background: avatarBg, color: avatarColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '12px'
                      }}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '12px' }}>{name}</div>
                        <span style={{
                          fontSize: '10px', color: 'var(--text-muted)',
                          background: 'var(--input-bg)', padding: '2px 6px', borderRadius: '5px'
                        }}>
                          {player.games_played || 0} games
                        </span>
                      </div>
                    </div>
                    <div className="leaderboard-score">{player.total_score || 0}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Previous Winners */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>
            Previous Winners
          </h3>
          {winners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
              <p>No winners yet</p>
            </div>
          ) : (
            winners.map((w, i) => (
              <div key={i} style={{
                padding: '13px', background: 'var(--input-bg)',
                border: '1px solid var(--border)', borderRadius: '13px', marginBottom: '10px'
              }}>
                <div style={{ fontWeight: 700, marginBottom: '6px' }}>Week {w.week_number}</div>
                <div style={{ color: 'var(--gold)', fontFamily: "'Orbitron', sans-serif", fontSize: '12px' }}>
                  1st: {w.winner1_address?.slice(0, 8)}... — {w.winner1_amount?.toFixed(5)} ETH
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
