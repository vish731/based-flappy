'use client'

export default function Docs() {
  return (
    <div style={{
      maxWidth: '800px', margin: '40px auto 0',
      background: 'var(--bg-card)', backdropFilter: 'blur(20px)',
      borderRadius: '20px', padding: '32px',
      border: '1px solid var(--border)',
      animation: 'fadeInUp 0.6s ease'
    }}>
      <h3 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '28px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
        Documentation
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        <Section title="What is BASED-FLAPPY?">
          A competitive Web3 Flappy Bird game running on the <B>Base blockchain</B> (Coinbase L2). Players compete every week for real ETH prizes. Every game you play accumulates to your total weekly score — consistency beats a single lucky run.
        </Section>

        <Section title="Prize Distribution">
          The prize pool grows with every entry. Each week, the top 3 players win:
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
            {[
              { rank: '1st', pct: '50%', color: '#FFD700', bg: 'rgba(255,215,0,0.06)', border: 'rgba(255,215,0,0.15)' },
              { rank: '2nd', pct: '40%', color: '#C0C0C0', bg: 'rgba(192,192,192,0.06)', border: 'rgba(192,192,192,0.15)' },
              { rank: '3rd', pct: '10%', color: '#CD7F32', bg: 'rgba(205,127,50,0.06)', border: 'rgba(205,127,50,0.15)' },
            ].map(item => (
              <div key={item.rank} style={{
                flex: 1, minWidth: '100px', textAlign: 'center',
                background: item.bg, border: '1px solid ' + item.border,
                borderRadius: '12px', padding: '14px 10px'
              }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '20px', fontWeight: 800, color: item.color }}>{item.pct}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{item.rank} Place</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '16px', background: 'var(--input-bg)',
            border: '1px solid var(--border)', borderRadius: '10px',
            padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7
          }}>
            Prize pool formula: <span style={{ color: 'var(--text)', fontWeight: 600, fontFamily: 'monospace' }}>Total Entries × 0.00005 ETH</span>
            <br />
            Rewards are transferred automatically within 24 hours after the contest ends.
          </div>
        </Section>

        <Section title="How Scoring Works">
          Your total score for the week is the <B>sum of all individual game scores</B>. Playing 20 games with an average of 15 points (total 300) beats 5 games with an average of 50 (total 250). Play more, rank higher.
        </Section>

        <Section title="How to Enter">
          <ol style={{ paddingLeft: '16px', color: 'var(--text-muted)', fontSize: '13px', lineHeight: 2 }}>
            <li>Connect your wallet (MetaMask, Coinbase Wallet, or any EVM wallet)</li>
            <li>Make sure you are on <B>Base Mainnet</B> (Chain ID: 8453)</li>
            <li>Pay the entry fee of <B>0.00005 ETH</B> — this goes directly to the prize pool</li>
            <li>Play as many games as you want all week</li>
          </ol>
        </Section>

        <Section title="Gameplay">
          Tap the screen or press <B>SPACE</B> to flap upward. Navigate through the pipe gaps — each pipe passed earns 1 point. Hitting a pipe, the ceiling, or the ground ends the game instantly. Pipe speed and gap size remain constant throughout — pure skill, no random difficulty spikes.
        </Section>

        <Section title="Weekly Schedule">
          Contests run <B>Monday 00:00 UTC</B> to <B>Sunday 23:59 UTC</B>. Entries close at Sunday 23:59 UTC — no late entries accepted. The leaderboard resets every Monday. Previous winners remain visible in the Leaderboard tab.
        </Section>

        <Section title="Network & Bridging">
          This game runs on <B>Base Mainnet</B> (Chain ID: 8453). You need ETH on Base — bridge from Ethereum at{' '}
          <a href="https://bridge.base.org" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>bridge.base.org</a>
          {' '}or buy ETH directly on Base via Coinbase.
        </Section>

        <div style={{
          background: 'var(--input-bg)', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '20px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>Support & Community</div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Telegram: <a href="https://t.me/gojo0204hm" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>@gojo0204hm</a>
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Twitter: <a href="https://twitter.com/gojo0204hm" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>@gojo0204hm</a>
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.6 }}>
            BASED-FLAPPY is an experimental Web3 game. Play responsibly. Entry fees are non-refundable.
          </p>
        </div>

      </div>
    </div>
  )
}

function B({ children }) {
  return <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{children}</strong>
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ width: '3px', height: '18px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '2px', flexShrink: 0 }} />
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{title}</h4>
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.85, paddingLeft: '13px' }}>
        {children}
      </div>
    </div>
  )
}
