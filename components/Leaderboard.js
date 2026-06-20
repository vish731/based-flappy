'use client'

import { useEffect, useState } from 'react'
import { supabase, getWeekNumber } from '@/lib/supabase'

export default function Leaderboard() {
  const [weeklyPlayers, setWeeklyPlayers] = useState([])
  const [allTimePlayers, setAllTimePlayers] = useState([])
  const [winners, setWinners] = useState([])
  const [prizePool, setPrizePool] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('weekly')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    await Promise.all([loadWeekly(), loadAllTime(), loadWinners(), loadPrizePool()])
    setLoading(false)
  }

  async function loadPrizePool() {
    try {
      const { data } = await supabase.from('entries').select('wallet_address').eq('week_number', getWeekNumber())
      setPrizePool((data?.length || 0) * 0.00005)
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

  async function loadWinners() {
    try {
      const { data } = await supabase.from('contests').select('*').eq('status', 'completed').order('week_number', { ascending: false }).limit(10)
      setWinners(data || [])
    } catch (e) {}
  }

  const tabs = [
    { key: 'weekly', label: 'This Week' },
    { key: 'alltime', label: 'All Time' },
  ]

  function shortAddr(addr) {
    if (!addr) return '???'
    return addr.slice(0, 6) + '...' + addr.slice(-4)
  }

  const ACCENT = '#3B82F6'

  function PlayerRow({ player, i, prize }) {
    const name = player.username || shortAddr(player.wallet_address)
    const isTop3 = i < 3

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '32px 1fr auto',
        alignItems: 'center',
        padding: '14px 0',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Rank */}
        <div style={{
          fontSize: '13px', fontWeight: 700,
          color: isTop3 ? ACCENT : 'var(--text-muted)',
        }}>
          {i + 1}
        </div>

        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: isTop3 ? 'rgba(59,130,246,0.12)' : 'var(--input-bg)',
            border: isTop3 ? '1px solid rgba(59,130,246,0.3)' : '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700,
            color: isTop3 ? ACCENT : 'var(--text-muted)',
            flexShrink: 0
          }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{name}</div>
          </div>
        </div>

        {/* Score + Prize */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '14px', fontWeight: 700,
            color: isTop3 ? ACCENT : 'var(--text)',
          }}>
            {player.total_score || 0}
          </div>
          {prize > 0 && (
            <div style={{ fontSize: '10px', color: ACCENT, opacity: 0.7, marginTop: '2px' }}>
              {prize.toFixed(5)} ETH
            </div>
          )}
        </div>
      </div>
    )
  }

  const prizes = [prizePool * 0.5, prizePool * 0.4, prizePool * 0.1]

  return (
    <div style={{ maxWidth: '780px', margin: '32px auto 0', padding: '0 4px' }}>

      {/* Prize Pool */}
      <div style={{
        background: 'var(--bg-card-solid)',
        border: '1px solid var(--border)',
        borderRadius: '14px', padding: '20px 24px',
        marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px', boxShadow: 'var(--shadow)'
      }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px', fontWeight: 600 }}>
            This Week's Prize Pool
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: ACCENT }}>
            {prizePool.toFixed(5)} ETH
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {Math.round(prizePool / 0.00005)} entries × 0.00005 ETH
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[
            { label: '1st', amount: prizes[0] },
            { label: '2nd', amount: prizes[1] },
            { label: '3rd', amount: prizes[2] },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                {item.amount.toFixed(5)}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '3px' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', borderBottom: '1px solid var(--border)' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 18px', border: 'none', background: 'none',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            color: activeTab === tab.key ? ACCENT : 'var(--text-muted)',
            borderBottom: activeTab === tab.key ? `2px solid ${ACCENT}` : '2px solid transparent',
            marginBottom: '-1px', transition: 'all 0.2s ease'
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '32px 1fr auto',
        padding: '12px 0 8px'
      }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>#</div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Player</div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Score</div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</div>
      ) : activeTab === 'weekly' ? (
        weeklyPlayers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '13px' }}>No players yet this week</div>
        ) : weeklyPlayers.map((p, i) => <PlayerRow key={i} player={p} i={i} prize={prizes[i] || 0} />)
      ) : (
        allTimePlayers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '13px' }}>No data yet</div>
        ) : allTimePlayers.map((p, i) => <PlayerRow key={i} player={p} i={i} prize={0} />)
      )}
    </div>
  )
}
