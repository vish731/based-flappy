'use client'
import { useEffect, useState } from 'react'
import { supabase, getWeekNumber } from '@/lib/supabase'

export default function Leaderboard() {
  const [weeklyPlayers, setWeeklyPlayers] = useState([])
  const [allTimePlayers, setAllTimePlayers] = useState([])
  const [prizePool, setPrizePool] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('weekly')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    await Promise.all([loadWeekly(), loadAllTime(), loadPrizePool()])
    setLoading(false)
  }

  async function loadPrizePool() {
    try {
      const { data } = await supabase.from('entries').select('wallet_address').eq('week_number', getWeekNumber())
      setPrizePool((data?.length || 0) * 0.000125)
    } catch (e) {}
  }

  async function loadWeekly() {
    try {
      const { data } = await supabase.from('scores').select('wallet_address, username, total_score, games_played').eq('week_number', getWeekNumber()).order('total_score', { ascending: false }).limit(20)
      setWeeklyPlayers(data || [])
    } catch (e) {}
  }

  async function loadAllTime() {
    try {
      const { data } = await supabase.from('scores').select('wallet_address, username, total_score, games_played, week_number').order('total_score', { ascending: false }).limit(100)
      const map = {}
      for (const row of (data || [])) {
        const key = row.wallet_address
        if (!map[key]) map[key] = { wallet_address: key, username: row.username, total_score: 0, games_played: 0, weeks_played: 0 }
        map[key].total_score += row.total_score || 0
        map[key].games_played += row.games_played || 0
        map[key].weeks_played += 1
      }
      setAllTimePlayers(Object.values(map).sort((a, b) => b.total_score - a.total_score))
    } catch (e) {}
  }

  function shortAddr(addr) { return addr ? addr.slice(0,6) + '...' + addr.slice(-4) : '???' }

  const prizes = [prizePool * 0.6, prizePool * 0.4, prizePool * 0]
  const rankColors = ['#FF2D78', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.2)']

  function PlayerRow({ player, i, prize }) {
    const name = player.username || shortAddr(player.wallet_address)
    const isTop3 = i < 3
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr auto', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: isTop3 ? rankColors[i] : 'rgba(255,255,255,0.2)', fontFamily: "'Space Grotesk', sans-serif" }}>{i + 1}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
            background: isTop3 ? `rgba(${i===0?'255,45,120':i===1?'255,255,255':'139,92,246'},0.1)` : 'rgba(255,255,255,0.05)',
            border: isTop3 ? `1px solid rgba(${i===0?'255,45,120':i===1?'255,255,255':'139,92,246'},0.3)` : '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, color: isTop3 ? rankColors[i] : 'rgba(255,255,255,0.3)'
          }}>{name.charAt(0).toUpperCase()}</div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{name}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: isTop3 ? rankColors[i] : 'rgba(255,255,255,0.6)' }}>{player.total_score || 0}</div>
          {prize > 0 && <div style={{ fontSize: '10px', color: '#FF2D78', opacity: 0.7 }}>{prize.toFixed(5)} ETH</div>}
        </div>
      </div>
    )
  }

  const players = activeTab === 'weekly' ? weeklyPlayers : allTimePlayers

  return (
    <div style={{ maxWidth: '780px', margin: '32px auto 0', padding: '0 4px' }}>

      {/* Prize Pool Banner */}
      <div style={{
        background: 'rgba(255,45,120,0.04)', border: '1px solid rgba(255,45,120,0.15)',
        borderRadius: '20px', padding: '24px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at 0% 50%, rgba(255,45,120,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '8px' }}>This Week's Prize Pool</div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#FF2D78', textShadow: '0 0 30px rgba(255,45,120,0.4)' }}>{prizePool.toFixed(5)} ETH</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{Math.round(prizePool / 0.000125)} entries × 0.000125 ETH</div>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[{ label: '1st', amount: prizes[0], color: '#FF2D78' }, { label: '2nd', amount: prizes[1], color: 'rgba(255,255,255,0.7)' }].map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: item.color }}>{item.amount.toFixed(5)}</div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '3px' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', borderBottom: '1px solid var(--border)' }}>
        {[{ key: 'weekly', label: 'This Week' }, { key: 'alltime', label: 'All Time' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 18px', border: 'none', background: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            color: activeTab === tab.key ? '#FF2D78' : 'rgba(255,255,255,0.35)',
            borderBottom: activeTab === tab.key ? '2px solid #FF2D78' : '2px solid transparent',
            marginBottom: '-1px', transition: 'all 0.2s ease'
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Table Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr auto', padding: '10px 0 8px' }}>
        {['#', 'Player', 'Score'].map((h, i) => (
          <div key={i} style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', textAlign: i === 2 ? 'right' : 'left' }}>{h}</div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</div>
      ) : players.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '13px' }}>No players yet — be the first!</div>
      ) : players.map((p, i) => <PlayerRow key={i} player={p} i={i} prize={prizes[i] || 0} />)}
    </div>
  )
}
