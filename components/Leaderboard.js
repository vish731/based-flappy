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
      const { data } = await supabase.from('scores').select('wallet_address, username, total_score').eq('week_number', getWeekNumber()).order('total_score', { ascending: false }).limit(20)
      setWeeklyPlayers(data || [])
    } catch (e) {}
  }

  async function loadAllTime() {
    try {
      const { data } = await supabase.from('scores').select('wallet_address, username, total_score, week_number').order('total_score', { ascending: false }).limit(100)
      const map = {}
      for (const row of (data || [])) {
        const key = row.wallet_address
        if (!map[key]) map[key] = { wallet_address: key, username: row.username, total_score: 0 }
        map[key].total_score += row.total_score || 0
      }
      setAllTimePlayers(Object.values(map).sort((a, b) => b.total_score - a.total_score))
    } catch (e) {}
  }

  function shortAddr(addr) { return addr ? addr.slice(0,6) + '...' + addr.slice(-4) : '???' }
  const prizes = [prizePool * 0.6, prizePool * 0.4]
  const rankColors = ['#1DB954', '#0066FF', '#FF2D78']

  function PlayerRow({ player, i, prize }) {
    const name = player.username || shortAddr(player.wallet_address)
    const isTop2 = i < 2
    return (
      <div style={{ display:'grid', gridTemplateColumns:'40px 1fr auto', alignItems:'center', padding:'14px 0', borderBottom:'2px solid #f0f0eb' }}>
        <div style={{ fontSize:'15px', fontWeight:900, color: isTop2 ? rankColors[i] : '#ccc' }}>{i + 1}</div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{
            width:'38px', height:'38px', borderRadius:'50%', flexShrink:0,
            background: isTop2 ? rankColors[i] : '#f0f0eb',
            border: '2px solid #1a1a1a',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'14px', fontWeight:800, color: isTop2 ? '#fff' : '#999',
            boxShadow: isTop2 ? '2px 2px 0px #1a1a1a' : 'none'
          }}>{name.charAt(0).toUpperCase()}</div>
          <span style={{ fontSize:'14px', fontWeight:700, color:'#0D0D0D' }}>{name}</span>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:'16px', fontWeight:900, color: isTop2 ? rankColors[i] : '#0D0D0D' }}>{player.total_score || 0}</div>
          {prize > 0 && <div style={{ fontSize:'10px', color:'#1DB954', fontWeight:700 }}>{prize.toFixed(5)} ETH</div>}
        </div>
      </div>
    )
  }

  const players = activeTab === 'weekly' ? weeklyPlayers : allTimePlayers

  return (
    <div style={{ maxWidth:'780px', margin:'32px auto 0', padding:'0 4px' }}>

      {/* Prize Pool */}
      <div style={{ background:'#1DB954', border:'2px solid #1a1a1a', borderRadius:'20px', padding:'24px', marginBottom:'20px', boxShadow:'4px 4px 0px #1a1a1a', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'2px', fontWeight:700, marginBottom:'6px' }}>This Week's Prize Pool</div>
          <div style={{ fontSize:'28px', fontWeight:900, color:'#fff' }}>{prizePool.toFixed(5)} ETH</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.7)', marginTop:'4px' }}>{Math.round(prizePool / 0.000125)} entries × 0.000125 ETH</div>
        </div>
        <div style={{ display:'flex', gap:'20px' }}>
          {[{label:'1st', amount: prizes[0], color:'#fff'},{label:'2nd', amount: prizes[1], color:'rgba(255,255,255,0.8)'}].map((item,i) => (
            <div key={i} style={{ textAlign:'center', background:'rgba(255,255,255,0.15)', borderRadius:'12px', padding:'10px 16px', border:'1px solid rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize:'14px', fontWeight:900, color:item.color }}>{item.amount.toFixed(5)}</div>
              <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.7)', marginTop:'3px', fontWeight:600 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
        {[{key:'weekly',label:'This Week'},{key:'alltime',label:'All Time'}].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding:'10px 20px', border:'2px solid #1a1a1a', borderRadius:'100px',
            fontSize:'13px', fontWeight:700, cursor:'pointer',
            background: activeTab === tab.key ? '#0D0D0D' : '#fff',
            color: activeTab === tab.key ? '#fff' : '#0D0D0D',
            boxShadow: activeTab === tab.key ? '3px 3px 0px #1DB954' : '2px 2px 0px #1a1a1a',
            transition:'all 0.15s ease'
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:'#fff', border:'2px solid #1a1a1a', borderRadius:'20px', padding:'8px 20px', boxShadow:'4px 4px 0px #1a1a1a' }}>
        <div style={{ display:'grid', gridTemplateColumns:'40px 1fr auto', padding:'12px 0 8px', borderBottom:'2px solid #f0f0eb' }}>
          {['#','Player','Score'].map((h,i) => (
            <div key={i} style={{ fontSize:'10px', color:'#999', fontWeight:800, textTransform:'uppercase', letterSpacing:'1px', textAlign: i===2 ? 'right' : 'left' }}>{h}</div>
          ))}
        </div>
        {loading ? (
          <div style={{ textAlign:'center', padding:'40px', color:'#999', fontSize:'13px' }}>Loading...</div>
        ) : players.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color:'#999', fontSize:'13px' }}>No players yet — be the first!</div>
        ) : players.map((p, i) => <PlayerRow key={i} player={p} i={i} prize={prizes[i] || 0} />)}
      </div>
    </div>
  )
}
