'use client'

export default function Docs() {
  const ACCENT = '#3B82F6'

  return (
    <div style={{
      maxWidth: '780px', margin: '32px auto 0',
      background: '#0B0E0C',
      border: '1px solid rgba(59,130,246,0.12)',
      borderRadius: '20px', padding: '32px',
      animation: 'fadeInUp 0.6s ease'
    }}>
      <h3 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '28px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '2px' }}>
        Documentation
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        <Section title="What is BASED-FLAPPY?" accent={ACCENT}>
          A competitive Web3 Flappy Bird game running on the <B>Base blockchain</B> (Coinbase L2). Players compete every week for real ETH prizes. Every game you play accumulates to your total weekly score — consistency beats a single lucky run.
        </Section>

        <Section title="Prize Distribution" accent={ACCENT}>
          The prize pool grows with every entry. Each week, the top 3 players win:
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
            {[
              { rank: '1st', pct: '50%' },
              { rank: '2nd', pct: '40%' },
              { rank: '3rd', pct: '10%' },
            ].map(item => (
              <div key={item.rank} style={{
                flex: 1, minWidth: '100px', textAlign: 'center',
                background: 'rgba(59,130,246,0.04)',
                border: '1px solid rgba(59,130,246,0.15)',
                borderRadius: '12px', padding: '16px 10px'
              }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: ACCENT }}>{item.pct}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{item.rank} Place</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '16px', background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px',
            padding: '12px 16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.8
          }}>
            Prize pool formula: <span style={{ color: ACCENT, fontWeight: 600, fontFamily: 'monospace' }}>Total Entries × 0.00005 ETH</span>
            <br />
            Rewards are transferred automatically within 24 hours after the contest ends.
          </div>
        </Section>

        <Section title="How Scoring Works" accent={ACCENT}>
          Your total score for the week is the <B>sum of all individual game scores</B>. Playing 20 games with an average of 15 points (total 300) beats 5 games with an average of 50 (total 250). Play more, rank higher.
        </Section>

        <Section title="How to Enter" accent={ACCENT}>
          <ol style={{ paddingLeft: '18px', color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 2.1 }}>
            <li>Connect your wallet (MetaMask, Coinbase Wallet, or any EVM wallet)</li>
            <li>Make sure you are on <B>Base Mainnet</B> (Chain ID: 8453)</li>
            <li>Pay the entry fee of <B>0.00005 ETH</B> — this goes directly to the prize pool</li>
            <li>Play as many games as you want all week</li>
          </ol>
        </Section>

        <Section title="Gameplay" accent={ACCENT}>
          Tap the screen or press <B>SPACE</B> to flap upward. Navigate through the pipe gaps — each pipe passed earns 1 point. Hitting a pipe, the ceiling, or the ground ends the game instantly. Pipe speed and gap size remain constant throughout — pure skill, no random difficulty spikes.
        </Section>

        <Section title="Weekly Schedule" accent={ACCENT}>
          Contests run <B>Monday 00:00 UTC</B> to <B>Sunday 23:59 UTC</B>. Entries close at Sunday 23:59 UTC — no late entries accepted. The leaderboard resets every Monday. Previous winners remain visible in the Leaderboard tab.
        </Section>

        <Section title="Network & Bridging" accent={ACCENT}>
          This game runs on <B>Base Mainnet</B> (Chain ID: 8453). You need ETH on Base — bridge from Ethereum at{' '}
          <a href="https://bridge.base.org" target="_blank" rel="noreferrer" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}>bridge.base.org</a>
          {' '}or buy ETH directly on Base via Coinbase.
        </Section>

        <div style={{
          background: 'rgba(59,130,246,0.03)', border: '1px solid rgba(59,130,246,0.12)',
          borderRadius: '14px', padding: '20px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: '12px' }}>Support & Community</div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>
            Telegram: <a href="https://t.me/gojo0204hm" target="_blank" rel="noreferrer" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}>@gojo0204hm</a>
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '14px' }}>
            Twitter: <a href="https://twitter.com/gojo0204hm" target="_blank" rel="noreferrer" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}>@gojo0204hm</a>
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
            BASED-FLAPPY is an experimental Web3 game. Play responsibly. Entry fees are non-refundable.
          </p>
        </div>

      </div>
    </div>
  )
}

function B({ children }) {
  return <strong style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{children}</strong>
}

function Section({ title, children, accent }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ width: '3px', height: '18px', background: accent, borderRadius: '2px', flexShrink: 0, boxShadow: `0 0 8px ${accent}55` }} />
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', margin: 0 }}>{title}</h4>
      </div>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.9, paddingLeft: '13px' }}>
        {children}
      </div>
    </div>
  )
}
