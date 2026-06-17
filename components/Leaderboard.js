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
    { key: 'winners', label: 'Past Winners' },
  ]

  function shortAddr(addr) {
    if (!addr) return '???'
    return addr.slice(0, 6) + '...' + addr.slice(-4)
  }

  function PlayerRow({ player, i, prize }) {
    const name = player.username || shortAddr(player.wallet_address)
    const isTop3 = i < 3
    const rankColors = ['#FFD700', '#94A3B8', '#CD7F32']

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '36px 1fr auto',
        alignItems: 'center',
        padding: '14px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        transition: 'background 0.2s ease',
        cursor: 'default'
      }}>
        <div style={{
          fontSize: '13px', fontWeight: 700,
          color: isTop3 ? rankColors[i] : 'rgba(255,255,255,0.25)',
          fontFamily: isTop3 ? "'Orbitron', sans-serif" : 'inherit'
        }}>
          {i + 1}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: isTop3
              ? ['linear-gradient(135deg,#FFD700,#FFA500)', 'linear-gradient(135deg,#C0C0C0,#808080)', 'linear-gradient(135deg,#CD7F32,#8B4513)'][i]
              : 'rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700,
            color: isTop3 ? '#000' : 'rgba(255,255,255,0.5)',
            flexShrink: 0
          }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{name}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>
              {player.games_played || 0} games
              {player.weeks_played > 1 && ` · ${player.weeks_played} weeks`}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '14px', fontWeight: 700,
            color: isTop3 ? rankColors[i] : 'rgba(255,255,255,0.6)',
            fontFamily: "'Orbitron', sans-serif"
          }}>
            {player.total_score || 0}
          </div>
          {prize > 0 && (
            <div style={{ fontSize: '10px', color: 'rgba(255,215,0,0.6)', marginTop: '2px', fontFamily: "'Orbitron', sans-serif" }}>
              {prize.toFixed(5)} ETH
            </div>
          )}
        </div>
      </div>
    )
  }

  const prizes = [prizePool * 0.5, prizePool * 0.4, prizePool * 0.1]

  return (
    <div style={{ maxWidth: '800px', margin: '32px auto 0', padding: '0 4px' }}>

      <div style={{
        background: 'rgba(255,215,0,0.03)',
        border: '1px solid rgba(255,215,0,0.1)',
        borderRadius: '16px', padding: '20px 24px',
        marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
            This Week's Prize Pool
          </div>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '28px', fontWeight: 900, color: '#FFD700' }}>
            {prizePool.toFixed(5)} ETH
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '4px' }}>
            {Math.round(prizePool / 0.00005)} entries × 0.00005 ETH
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[
            { label: '1st', amount: prizes[0], color: '#FFD700' },
            { label: '2nd', amount: prizes[1], color: '#94A3B8' },
            { label: '3rd', amount: prizes[2], color: '#CD7F32' },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '13px', fontWeight: 700, color: item.color }}>
                {item.amount.toFixed(5)}
              </div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginTop: '3px' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 20px', border: 'none', background: 'none',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            color: activeTab === tab.key ? '#fff' : 'rgba(255,255,255,0.35)',
            borderBottom: activeTab === tab.key ? '2px solid #3B82F6' : '2px solid transparent',
            marginBottom: '-1px', transition: 'all 0.2s ease'
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '36px 1fr auto',
        padding: '10px 0', marginBottom: '4px'
      }}>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>#</div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Player</div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Score</div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Loading...</div>
      ) : activeTab === 'weekly' ? (
        weeklyPlayers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>No players yet this week</div>
        ) : weeklyPlayers.map((p, i) => <PlayerRow key={i} player={p} i={i} prize={prizes[i] || 0} />)
      ) : activeTab === 'alltime' ? (
        allTimePlayers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>No data yet</div>
        ) : allTimePlayers.map((p, i) => <PlayerRow key={i} player={p} i={i} prize={0} />)
      ) : (
        winners.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>No winners yet</div>
        ) : winners.map((w, i) => (
          <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
              Week {w.week_number}
            </div>
            {[
              { addr: w.winner1_address, amount: w.winner1_amount, color: '#FFD700', rank: '1st' },
              { addr: w.winner2_address, amount: w.winner2_amount, color: '#94A3B8', rank: '2nd' },
              { addr: w.winner3_address, amount: w.winner3_amount, color: '#CD7F32', rank: '3rd' },
            ].filter(x => x.addr).map((item, j) => (
              <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', color: item.color, fontWeight: 700, width: '28px' }}>{item.rank}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{shortAddr(item.addr)}</span>
                </div>
                <span style={{ fontSize: '12px', color: item.color, fontFamily: "'Orbitron', sans-serif", fontWeight: 700 }}>
                  {item.amount?.toFixed(5)} ETH
                </span>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
