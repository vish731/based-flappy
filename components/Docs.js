'use client'

export default function Docs() {
  return (
    <div style={{ maxWidth: '780px', margin: '32px auto 0', padding: '0 4px' }}>
      <div style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '24px', padding: '32px', animation: 'fadeInUp 0.5s ease'
      }}>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '28px' }}>Documentation</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {[
            {
              title: 'What is BASED-FLAPPY?',
              content: <p>A competitive Web3 Flappy Bird game on the <b style={{color:'#fff'}}>Base blockchain</b>. Players compete every week for real ETH prizes. Every game you play adds to your weekly total score — consistency beats a single lucky run.</p>
            },
            {
              title: 'Prize Distribution',
              content: (
                <div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    {[['50%','1st Place','#FF2D78'],['40%','2nd Place','rgba(255,255,255,0.7)'],['10%','3rd Place','#8B5CF6']].map(([pct,label,color],i) => (
                      <div key={i} style={{ flex:1, minWidth:'90px', textAlign:'center', background:'rgba(255,255,255,0.03)', border:`1px solid rgba(255,255,255,0.08)`, borderRadius:'12px', padding:'14px 8px' }}>
                        <div style={{ fontSize:'22px', fontWeight:800, color }}>{pct}</div>
                        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'4px' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'12px 16px', fontSize:'12px', color:'rgba(255,255,255,0.4)', lineHeight:1.8 }}>
                    Formula: <span style={{color:'#FF2D78', fontWeight:600}}>Total Entries × 0.00005 ETH</span><br/>
                    Rewards transferred within 24 hours after Sunday.
                  </div>
                </div>
              )
            },
            { title: 'How Scoring Works', content: <p>Your total score = <b style={{color:'#fff'}}>sum of all game scores</b> that week. 20 games × 15 avg (300) beats 5 games × 50 avg (250). Play more, rank higher.</p> },
            {
              title: 'How to Enter',
              content: (
                <ol style={{ paddingLeft:'18px', color:'rgba(255,255,255,0.4)', fontSize:'13px', lineHeight:2.1 }}>
                  <li>Connect your wallet (MetaMask, Coinbase Wallet, or any EVM wallet)</li>
                  <li>Make sure you are on <b style={{color:'#fff'}}>Base Mainnet</b> (Chain ID: 8453)</li>
                  <li>Pay <b style={{color:'#fff'}}>0.00005 ETH</b> entry fee — goes to prize pool</li>
                  <li>Play all week — your total score counts</li>
                </ol>
              )
            },
            { title: 'Weekly Schedule', content: <p>Contests run <b style={{color:'#fff'}}>Monday 00:00 UTC</b> to <b style={{color:'#fff'}}>Sunday 23:59 UTC</b>. Leaderboard resets every Monday.</p> },
            {
              title: 'Network & Bridging',
              content: <p>Runs on <b style={{color:'#fff'}}>Base Mainnet</b> (Chain ID: 8453). Bridge ETH at <a href="https://bridge.base.org" target="_blank" rel="noreferrer" style={{color:'#FF2D78', textDecoration:'none', fontWeight:600}}>bridge.base.org</a> or buy on Coinbase.</p>
            }
          ].map((section, i) => (
            <div key={i}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                <div style={{ width:'3px', height:'18px', background:'linear-gradient(135deg, #FF2D78, #8B5CF6)', borderRadius:'2px', flexShrink:0 }} />
                <h4 style={{ fontSize:'15px', fontWeight:700, color:'rgba(255,255,255,0.9)', margin:0 }}>{section.title}</h4>
              </div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', lineHeight:1.9, paddingLeft:'13px' }}>{section.content}</div>
            </div>
          ))}

          <div style={{ background:'rgba(255,45,120,0.04)', border:'1px solid rgba(255,45,120,0.12)', borderRadius:'16px', padding:'20px' }}>
            <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.8)', marginBottom:'12px' }}>Support & Community</div>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', marginBottom:'6px' }}>Telegram: <a href="https://t.me/gojo0204hm" target="_blank" rel="noreferrer" style={{color:'#FF2D78', textDecoration:'none', fontWeight:600}}>@gojo0204hm</a></p>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', marginBottom:'14px' }}>Twitter: <a href="https://twitter.com/gojo0204hm" target="_blank" rel="noreferrer" style={{color:'#FF2D78', textDecoration:'none', fontWeight:600}}>@gojo0204hm</a></p>
            <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)' }}>BASED-FLAPPY is experimental. Play responsibly. Entry fees are non-refundable.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
