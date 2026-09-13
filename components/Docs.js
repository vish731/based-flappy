'use client'

export default function Docs() {
  return (
    <div style={{ maxWidth: '780px', margin: '32px auto 0', padding: '0 4px' }}>
      <div style={{ background:'#fff', border:'2px solid #1a1a1a', borderRadius:'24px', padding:'32px', boxShadow:'4px 4px 0px #1a1a1a', animation:'fadeInUp 0.5s ease' }}>
        <div style={{ fontSize:'10px', color:'#999', textTransform:'uppercase', letterSpacing:'2px', fontWeight:800, marginBottom:'28px' }}>Documentation</div>

        <div style={{ display:'flex', flexDirection:'column', gap:'28px' }}>
          {[
            { title:'What is BASED-FLAPPY?', content: <p>A competitive Web3 Flappy Bird game on the <b>Base blockchain</b>. Players compete every week for real ETH prizes. Every game you play adds to your weekly total score — consistency beats a single lucky run.</p> },
            {
              title:'Prize Distribution',
              content: (
                <div>
                  <div style={{ display:'flex', gap:'10px', marginBottom:'14px' }}>
                    {[['60%','1st Place','#1DB954'],['40%','2nd Place','#0066FF']].map(([pct,label,color],i) => (
                      <div key={i} style={{ flex:1, textAlign:'center', background:'#F5F5F0', border:'2px solid #1a1a1a', borderRadius:'12px', padding:'16px', boxShadow:'2px 2px 0px #1a1a1a' }}>
                        <div style={{ fontSize:'24px', fontWeight:900, color }}>{pct}</div>
                        <div style={{ fontSize:'11px', color:'#999', marginTop:'4px', fontWeight:600 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'#F5F5F0', border:'2px solid #e5e5e0', borderRadius:'10px', padding:'12px 16px', fontSize:'12px', color:'#555', lineHeight:1.8 }}>
                    Formula: <span style={{ color:'#1DB954', fontWeight:700 }}>Total Entries × 0.000125 ETH</span><br/>
                    Rewards transferred within 24 hours after Sunday.
                  </div>
                </div>
              )
            },
            { title:'How Scoring Works', content: <p>Your total score = <b>sum of all game scores</b> that week. 20 games × 15 avg (300) beats 5 games × 50 avg (250). Play more, rank higher.</p> },
            {
              title:'How to Enter',
              content: (
                <ol style={{ paddingLeft:'18px', color:'#555', fontSize:'13px', lineHeight:2.1 }}>
                  <li>Connect your wallet (MetaMask, Coinbase Wallet, or any EVM wallet)</li>
                  <li>Make sure you are on <b>Base Mainnet</b> (Chain ID: 8453)</li>
                  <li>Pay <b>0.000125 ETH</b> entry fee — goes to prize pool</li>
                  <li>Play all week — your total score counts</li>
                </ol>
              )
            },
            { title:'Weekly Schedule', content: <p>Contests run <b>Monday 00:00 UTC</b> to <b>Sunday 23:59 UTC</b>. Leaderboard resets every Monday.</p> },
            { title:'Network & Bridging', content: <p>Runs on <b>Base Mainnet</b> (Chain ID: 8453). Bridge ETH at <a href="https://bridge.base.org" target="_blank" rel="noreferrer" style={{ color:'#0066FF', textDecoration:'none', fontWeight:600 }}>bridge.base.org</a> or buy on Coinbase.</p> }
          ].map((section, i) => (
            <div key={i}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                <div style={{ width:'4px', height:'20px', background:'#1DB954', borderRadius:'2px', flexShrink:0 }} />
                <h4 style={{ fontSize:'15px', fontWeight:800, color:'#0D0D0D', margin:0 }}>{section.title}</h4>
              </div>
              <div style={{ fontSize:'13px', color:'#555', lineHeight:1.9, paddingLeft:'14px' }}>{section.content}</div>
            </div>
          ))}

          {/* Support */}
          <div style={{ background:'#F5F5F0', border:'2px solid #1a1a1a', borderRadius:'16px', padding:'20px', boxShadow:'2px 2px 0px #1a1a1a' }}>
            <div style={{ fontSize:'13px', fontWeight:800, color:'#0D0D0D', marginBottom:'14px' }}>Support & Community</div>
            <div style={{ display:'flex', gap:'10px', marginBottom:'14px' }}>
              <a href="https://t.me/gojo0204hm" target="_blank" rel="noreferrer" style={{ textDecoration:'none', flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'#fff', border:'2px solid #1a1a1a', borderRadius:'12px', padding:'12px', boxShadow:'2px 2px 0px #1a1a1a', cursor:'pointer' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#2AABEE"/><path d="M5 11.5l13-5-2 11-5-3-3 3 1-5 6-5.5-7 4.5-3-1z" fill="white"/></svg>
                  <span style={{ fontSize:'12px', fontWeight:700, color:'#0D0D0D' }}>Telegram</span>
                </div>
              </a>
              <a href="https://twitter.com/gojo0204hm" target="_blank" rel="noreferrer" style={{ textDecoration:'none', flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'#fff', border:'2px solid #1a1a1a', borderRadius:'12px', padding:'12px', boxShadow:'2px 2px 0px #1a1a1a', cursor:'pointer' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#000"/><path d="M17.5 7h-1.9l-3.1 3.6L9.4 7H6l4.7 6.1L6.1 18H8l3.4-3.9 3.2 3.9H18l-4.9-6.3L17.5 7z" fill="white"/></svg>
                  <span style={{ fontSize:'12px', fontWeight:700, color:'#0D0D0D' }}>Twitter / X</span>
                </div>
              </a>
            </div>
            <p style={{ fontSize:'11px', color:'#999' }}>BASED-FLAPPY is experimental. Play responsibly. Entry fees are non-refundable.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
