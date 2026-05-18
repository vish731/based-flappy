'use client'

export default function Docs() {
  return (
    <div style={{
      maxWidth: '800px', margin: '40px auto 0',
      background: 'var(--bg-card)', backdropFilter: 'blur(20px)',
      borderRadius: '20px', padding: '24px',
      border: '1px solid var(--border)',
      animation: 'fadeInUp 0.6s ease'
    }}>
      <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>📄 DOCUMENTATION</h3>

      <div style={{ lineHeight: 1.9, color: 'var(--text-muted)', fontSize: '13px' }}>
        <Section title="Game Overview">
          BASED-FLAPPY is a competitive Web3 Flappy Bird built on the <strong style={{ color: 'var(--text)' }}>Base blockchain</strong> (Coinbase's L2).
          Players compete in weekly contests for real ETH prizes. Every game you play adds to your cumulative total score — consistency beats a single lucky run.
        </Section>

        <Section title="How It Works">
          Contests run Monday 00:00 UTC to Sunday 23:59 UTC. Entry fee is <strong style={{ color: 'var(--text)' }}>0.00005 ETH</strong> sent on Base network.
          Your total score is the sum of all game scores that week. Top scorer wins <span style={{ color: 'var(--gold)', fontWeight: 600 }}>50%</span> of the
          prize pool, 2nd place gets <span style={{ color: 'var(--gold)', fontWeight: 600 }}>40%</span>, and 10% goes to platform fees.
          Rewards are transferred automatically within 24 hours after the contest ends.
        </Section>

        <Section title="Network Requirements">
          This game runs on <strong style={{ color: 'var(--text)' }}>Base Mainnet</strong> (Chain ID: 8453).
          You need ETH on Base — bridge from Ethereum at{' '}
          <a href="https://bridge.base.org" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>bridge.base.org</a>
          {' '}or buy directly on Coinbase.
        </Section>

        <Section title="Gameplay">
          Tap the screen or press <strong style={{ color: 'var(--text)' }}>SPACE</strong> to flap upward.
          Navigate through pipe gaps — each pipe passed earns 1 point.
          Hitting a pipe, the ceiling, or the ground ends the game immediately.
          Pipe speed and gap size stay constant — pure skill, no random difficulty spikes.
        </Section>

        <Section title="Weekly Schedule">
          Resets every Monday 00:00 UTC. Entries close Sunday 23:59 UTC — no late entries accepted.
          Previous winners stay visible in the Leaderboard tab for full transparency.
        </Section>

        <div style={{
          background: 'var(--input-bg)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '20px', marginTop: '24px'
        }}>
          <SectionTitle title="Support & Community" />
          <p style={{ marginBottom: '6px' }}>
            Telegram: <a href="https://t.me/gojo0204hm" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>@gojo0204hm</a>
          </p>
          <p style={{ marginBottom: '14px' }}>
            Twitter: <a href="https://twitter.com/gojo0204hm" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>@gojo0204hm</a>
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            BASED-FLAPPY is an experimental Web3 game. Play responsibly. Entry fees are non-refundable.
          </p>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '24px 0 10px', color: 'var(--text)', fontWeight: 700, fontSize: '16px' }}>
      <div style={{ width: '3px', height: '18px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '2px', flexShrink: 0 }} />
      {title}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <>
      <SectionTitle title={title} />
      <p style={{ marginBottom: '12px' }}>{children}</p>
    </>
  )
}

