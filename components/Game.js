'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { SoundEngine } from '@/lib/sound'
import { supabase, getWeekNumber } from '@/lib/supabase'

// ── Game Config ──────────────────────────────────────────────
const CONFIG = {
  gravity: 0.17,
  jumpForce: -5.2,
  pipeSpeed: 3,
  pipeGap: 160,
  pipeWidth: 60,
  pipeSpawnRate: 85,
  birdSize: 14,
}

const BC = {
  body: ['#60A5FA', '#3B82F6', '#2563EB'],
  wing: '#1D4ED8',
  glow: '#3B82F6',
  outline: '#1E3A8A',
}

function lerp(a, b, t) { return a + (b - a) * t }
function rnd(a, b) { return Math.random() * (b - a) + a }

// ── Particle Class ───────────────────────────────────────────
class Particle {
  constructor(x, y, color, type = 'trail') {
    this.x = x; this.y = y; this.color = color; this.type = type; this.life = 1
    if (type === 'trail') {
      this.size = rnd(2, 5); this.decay = rnd(0.02, 0.05)
      this.vx = rnd(-1, -0.5); this.vy = rnd(-0.5, 0.5)
    } else if (type === 'explosion') {
      this.size = rnd(3, 8); this.decay = rnd(0.02, 0.04)
      const angle = rnd(0, Math.PI * 2), speed = rnd(2, 8)
      this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed
    } else {
      this.size = rnd(4, 8); this.decay = rnd(0.015, 0.03)
      this.vx = rnd(-2, 2); this.vy = rnd(-3, -1)
    }
  }
  update() {
    this.life -= this.decay; this.x += this.vx; this.y += this.vy; this.size *= 0.98
    if (this.type === 'explosion') { this.vx *= 0.95; this.vy *= 0.95 }
    return this.life > 0
  }
  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.life
    ctx.fillStyle = this.color
    ctx.shadowColor = this.color
    ctx.shadowBlur = this.size * 2
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

// ── ScorePopup Class ─────────────────────────────────────────
class ScorePopup {
  constructor(x, y, text) {
    this.x = x; this.y = y; this.text = text; this.life = 1; this.vy = -2
  }
  update() { this.life -= 0.02; this.y += this.vy; this.vy *= 0.95; return this.life > 0 }
  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.life
    ctx.fillStyle = '#FFD700'
    ctx.font = 'bold 24px Orbitron, sans-serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#FFD700'
    ctx.shadowBlur = 10
    ctx.fillText(this.text, this.x, this.y)
    ctx.restore()
  }
}

// ── Rounded Rect Helper ──────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ── Theme Colors ─────────────────────────────────────────────
function getThemeColors(isDark) {
  return {
    sky1: isDark ? '#060A13' : '#1E3A5F',
    sky2: isDark ? '#0A1628' : '#2563EB',
    sky3: isDark ? '#0F1D32' : '#60A5FA',
    sky4: isDark ? '#162033' : '#93C5FD',
    starAlpha: isDark ? 0.6 : 0,
    cloudAlpha: isDark ? 0.03 : 0.15,
    buildingColor: isDark ? '#1A2332' : '#334155',
    windowOn: isDark ? 'rgba(251,191,36,0.6)' : 'rgba(251,191,36,0.8)',
    windowOff: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.3)',
    grassTop: isDark ? '#1E3A2F' : '#166534',
    grassBot: isDark ? '#0F261D' : '#14532D',
    grassDash: isDark ? '#2D5A47' : '#22C55E',
    moonColor: isDark ? '#E2E8F0' : '#FDE68A',
    moonShadow: isDark ? '#060A13' : '#2563EB',
  }
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export default function Game({
  hasEntered, userAddress, theme,
  onGameOver, onShowOnboarding,
  totalScore, setTotalScore
}) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    bird: { x: 80, y: 300, velocity: 0, rotation: 0 },
    pipes: [],
    particles: [],
    scorePopups: [],
    frameCount: 0,
    wingAngle: 0,
    cloudOffset: 0,
    buildingOffset: 0,
    starOffset: 0,
    screenShake: { x: 0, y: 0, intensity: 0 },
    flashAlpha: 0,
    currentScore: 0,
    gameRunning: false,
    gameStarted: false,
    isDead: false,
    animFrameId: null,
  })
  const totalScoreRef = useRef(totalScore)
  const themeRef = useRef(theme)

  useEffect(() => { totalScoreRef.current = totalScore }, [totalScore])
  useEffect(() => { themeRef.current = theme }, [theme])

  // ── Jump ─────────────────────────────────────────────────
  const jump = useCallback(() => {
    const s = stateRef.current
    if (!s.gameRunning || !hasEntered) return
    s.bird.velocity = CONFIG.jumpForce
    SoundEngine.play('flap')
    for (let i = 0; i < 5; i++)
      s.particles.push(new Particle(s.bird.x - 10, s.bird.y + 5, '#60A5FA', 'trail'))
  }, [hasEntered])

  // ── Input handlers ───────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code !== 'Space') return
      e.preventDefault()
      const s = stateRef.current
      if (!hasEntered) { onShowOnboarding(); return }
      if (s.gameRunning && !s.gameStarted) { s.gameStarted = true; jump() }
      else jump()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [hasEntered, jump, onShowOnboarding])

  // ── Init game ────────────────────────────────────────────
  function initGame() {
    const s = stateRef.current
    s.bird = { x: 80, y: 300, velocity: 0, rotation: 0 }
    s.pipes = []; s.particles = []; s.scorePopups = []
    s.frameCount = 0; s.wingAngle = 0
    s.screenShake = { x: 0, y: 0, intensity: 0 }
    s.flashAlpha = 0; s.currentScore = 0
    s.gameRunning = true; s.gameStarted = false; s.isDead = false
  }

  // ── Submit score ─────────────────────────────────────────
  async function submitScore(score) {
    if (!userAddress || !hasEntered || score === 0) return
    try {
      const wk = getWeekNumber()
      const un = userAddress.slice(0, 8)
      const { data: ex } = await supabase
        .from('scores').select('total_score, games_played')
        .eq('wallet_address', userAddress).eq('week_number', wk).single()
      let newTotal = score
      if (ex) {
        newTotal = ex.total_score + score
        await supabase.from('scores').update({
          total_score: newTotal,
          games_played: (ex.games_played || 0) + 1,
          username: un,
          score: Math.max(ex.total_score, score)
        }).eq('wallet_address', userAddress).eq('week_number', wk)
      } else {
        await supabase.from('scores').insert({
          wallet_address: userAddress, username: un,
          total_score: score, games_played: 1, score, week_number: wk
        })
      }
      setTotalScore(newTotal)
      totalScoreRef.current = newTotal
    } catch (e) { console.warn('Score submit error:', e) }
  }

  // ── Trigger death ────────────────────────────────────────
  function triggerDeath() {
    const s = stateRef.current
    s.gameRunning = false; s.isDead = true
    s.screenShake.intensity = 15; s.flashAlpha = 0.5
    SoundEngine.play('death')
    const colors = ['#FF6B6B', '#FF8E53', '#FFD700', '#3B82F6', '#60A5FA']
    for (let i = 0; i < 30; i++)
      s.particles.push(new Particle(s.bird.x, s.bird.y, colors[~~(Math.random() * 5)], 'explosion'))
    setTimeout(async () => {
      await submitScore(s.currentScore)
      onGameOver(s.currentScore, totalScoreRef.current)
    }, 800)
  }

  // ── Draw Background ──────────────────────────────────────
  function drawBackground(ctx, s, W, H) {
    const c = getThemeColors(themeRef.current === 'dark')
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, c.sky1); g.addColorStop(0.4, c.sky2)
    g.addColorStop(0.7, c.sky3); g.addColorStop(1, c.sky4)
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

    // Stars (dark only)
    if (c.starAlpha > 0) {
      s.starOffset = (s.starOffset + 0.1) % 100
      for (let i = 0; i < 50; i++) {
        const sx = (i * 73 + s.starOffset) % W
        const sy = (i * 47) % (H * 0.5)
        ctx.globalAlpha = (Math.sin(i * 2 + s.frameCount * 0.03) + 1) * 0.3 * 0.5 + 0.1
        ctx.fillStyle = '#FFF'
        ctx.beginPath(); ctx.arc(sx, sy, (Math.sin(i + s.frameCount * 0.02) + 1) * 0.8 + 0.5, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    // Moon
    ctx.save()
    ctx.fillStyle = c.moonColor; ctx.shadowColor = c.moonColor; ctx.shadowBlur = 40
    ctx.beginPath(); ctx.arc(320, 80, 25, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = c.moonShadow; ctx.shadowBlur = 0
    ctx.beginPath(); ctx.arc(332, 75, 22, 0, Math.PI * 2); ctx.fill()
    ctx.restore()

    // Clouds
    s.cloudOffset = (s.cloudOffset + 0.3) % (W + 200)
    for (let i = 0; i < 4; i++) {
      const cx = (s.cloudOffset + i * 150) % (W + 100) - 50
      const cy = 60 + i * 40
      ctx.fillStyle = `rgba(255,255,255,${c.cloudAlpha + i * 0.01})`
      ctx.beginPath()
      ctx.arc(cx, cy, 28, 0, Math.PI * 2)
      ctx.arc(cx + 32, cy - 5, 30, 0, Math.PI * 2)
      ctx.arc(cx - 22, cy - 3, 25, 0, Math.PI * 2)
      ctx.fill()
    }

    // Buildings
    s.buildingOffset = (s.buildingOffset + 0.5) % 300
    for (let i = 0; i < 12; i++) {
      const bx = (i * 45 - s.buildingOffset) % (W + 150) - 50
      const bh = 45 + Math.sin(i * 1.5) * 25
      ctx.fillStyle = c.buildingColor
      ctx.fillRect(bx, H - 75 - bh, 32, bh)
      for (let w = 0; w < 3; w++) {
        for (let h = 0; h < Math.floor(bh / 18); h++) {
          ctx.fillStyle = Math.sin(i * 3 + w * 5 + h * 7 + s.frameCount * 0.005) > 0.3
            ? c.windowOn : c.windowOff
          ctx.fillRect(bx + 5 + w * 10, H - 75 - bh + 8 + h * 18, 6, 8)
        }
      }
    }

    // Grass
    const gg = ctx.createLinearGradient(0, H - 60, 0, H)
    gg.addColorStop(0, c.grassTop); gg.addColorStop(1, c.grassBot)
    ctx.fillStyle = gg; ctx.fillRect(0, H - 60, W, 60)
    ctx.fillStyle = c.grassDash
    for (let i = 0; i < 20; i++) ctx.fillRect(i * 30, H - 60, 15, 4)
  }

  // ── Draw Bird ────────────────────────────────────────────
  function drawBird(ctx, s) {
    ctx.save()
    ctx.translate(s.bird.x, s.bird.y)
    s.bird.rotation = lerp(s.bird.rotation, Math.min(Math.max(s.bird.velocity * 3, -30), 70), 0.15)
    ctx.rotate(s.bird.rotation * Math.PI / 180)
    ctx.shadowColor = BC.glow; ctx.shadowBlur = 25
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, CONFIG.birdSize)
    g.addColorStop(0, BC.body[0]); g.addColorStop(0.5, BC.body[1]); g.addColorStop(1, BC.body[2])
    ctx.fillStyle = g
    ctx.beginPath(); ctx.ellipse(0, 0, CONFIG.birdSize, CONFIG.birdSize - 2, 0, 0, Math.PI * 2); ctx.fill()
    ctx.shadowBlur = 0; ctx.strokeStyle = BC.outline; ctx.lineWidth = 1
    ctx.beginPath(); ctx.ellipse(0, 0, CONFIG.birdSize, CONFIG.birdSize - 2, 0, 0, Math.PI * 2); ctx.stroke()
    ctx.fillStyle = BC.wing
    const w = Math.sin(s.wingAngle) * 12
    ctx.beginPath(); ctx.moveTo(-5, 0); ctx.quadraticCurveTo(-12 - w, -10, -18, w * 0.5); ctx.quadraticCurveTo(-10, 5, -5, 3); ctx.fill()
    ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(6, -4, 5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#0F172A'; ctx.beginPath(); ctx.arc(7.5, -4.5, 2.5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(8.5, -5.5, 1, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#F59E0B'
    ctx.beginPath(); ctx.moveTo(CONFIG.birdSize - 2, -2); ctx.lineTo(CONFIG.birdSize + 8, 1); ctx.lineTo(CONFIG.birdSize - 2, 4); ctx.closePath(); ctx.fill()
    ctx.restore()
  }

  // ── Draw Pipes ───────────────────────────────────────────
  function drawPipes(ctx, s, H) {
    for (const p of s.pipes) {
      const pg = ctx.createLinearGradient(p.x, 0, p.x + CONFIG.pipeWidth, 0)
      pg.addColorStop(0, '#1E40AF'); pg.addColorStop(0.3, '#3B82F6')
      pg.addColorStop(0.7, '#2563EB'); pg.addColorStop(1, '#1E3A8A')
      ctx.fillStyle = pg
      ctx.fillRect(p.x, 0, CONFIG.pipeWidth, p.topHeight)
      ctx.fillRect(p.x, p.bottomY, CONFIG.pipeWidth, H - p.bottomY)
      const cg = ctx.createLinearGradient(p.x - 6, 0, p.x + CONFIG.pipeWidth + 6, 0)
      cg.addColorStop(0, '#1E3A8A'); cg.addColorStop(0.3, '#60A5FA')
      cg.addColorStop(0.7, '#3B82F6'); cg.addColorStop(1, '#1E3A8A')
      ctx.fillStyle = cg
      roundRect(ctx, p.x - 6, p.topHeight - 30, CONFIG.pipeWidth + 12, 30, 6); ctx.fill()
      roundRect(ctx, p.x - 6, p.bottomY, CONFIG.pipeWidth + 12, 30, 6); ctx.fill()
    }
  }

  // ── Draw Score ───────────────────────────────────────────
  function drawScore(ctx, s, W) {
    ctx.save()
    ctx.fillStyle = themeRef.current === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'
    roundRect(ctx, W / 2 - 40, 20, 80, 55, 16); ctx.fill()
    ctx.font = 'bold 36px Orbitron, sans-serif'; ctx.textAlign = 'center'
    ctx.fillStyle = '#FFF'; ctx.shadowColor = '#3B82F6'; ctx.shadowBlur = 10
    ctx.fillText(s.currentScore, W / 2, 60); ctx.shadowBlur = 0
    ctx.font = '600 11px Inter, sans-serif'
    ctx.fillStyle = themeRef.current === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
    ctx.fillText('TOTAL: ' + totalScoreRef.current, W / 2, 72)
    ctx.restore()
  }

  // ── Draw Idle Screen ─────────────────────────────────────
  function drawIdleScreen(ctx, W, H, frame) {
    ctx.save()
    ctx.fillStyle = themeRef.current === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)'
    ctx.fillRect(0, 0, W, H)
    ctx.font = 'bold 28px Orbitron, sans-serif'; ctx.textAlign = 'center'
    ctx.fillStyle = '#FFF'; ctx.shadowColor = '#3B82F6'; ctx.shadowBlur = 20
    ctx.fillText('BASED-FLAPPY', W / 2, H / 2 - 50); ctx.shadowBlur = 0
    ctx.font = '500 13px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fillText('Enter contest to play', W / 2, H / 2 - 15)
    ctx.font = '600 12px Inter, sans-serif'; ctx.fillStyle = 'rgba(59,130,246,0.9)'
    ctx.globalAlpha = (Math.sin(frame * 0.05) + 1) * 0.3 + 0.5
    ctx.fillText('↓ START GAME below ↓', W / 2, H / 2 + 20)
    ctx.globalAlpha = 1; ctx.restore()
  }

  // ── Draw Start Screen ────────────────────────────────────
  function drawStartScreen(ctx, W, H, frame) {
    ctx.save()
    ctx.fillStyle = themeRef.current === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)
    ctx.font = 'bold 32px Orbitron, sans-serif'; ctx.textAlign = 'center'
    ctx.fillStyle = '#FFF'; ctx.shadowColor = '#3B82F6'; ctx.shadowBlur = 20
    ctx.fillText('BASED-FLAPPY', W / 2, H / 2 - 40); ctx.shadowBlur = 0
    ctx.font = '500 16px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.globalAlpha = (Math.sin(frame * 0.05) + 1) * 0.3 + 0.4
    ctx.fillText('TAP OR PRESS SPACE', W / 2, H / 2 + 20)
    ctx.globalAlpha = 1; ctx.restore()
  }

  // ── Main Game Loop ───────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const s = stateRef.current

    function loop() {
      // Update particles & popups
      s.particles = s.particles.filter(p => p.update())
      s.scorePopups = s.scorePopups.filter(p => p.update())

      // Screen shake
      if (s.screenShake.intensity > 0) {
        s.screenShake.x = (Math.random() - 0.5) * s.screenShake.intensity
        s.screenShake.y = (Math.random() - 0.5) * s.screenShake.intensity
        s.screenShake.intensity *= 0.9
        if (s.screenShake.intensity < 0.5) s.screenShake = { x: 0, y: 0, intensity: 0 }
      }

      // Idle / death float
      if (!s.gameRunning) {
        s.frameCount++
        if (!s.isDead) {
          s.bird.y = 300 + Math.sin(s.frameCount * 0.05) * 15
          s.bird.rotation = 0; s.wingAngle += 0.08
        }
      } else {
        s.wingAngle += 0.2
        if (!s.gameStarted) {
          s.bird.y = 300 + Math.sin(s.frameCount * 0.05) * 15
          s.bird.rotation = 0; s.frameCount++
        } else {
          // Physics
          s.bird.velocity += CONFIG.gravity
          s.bird.y += s.bird.velocity
          if (s.frameCount % 3 === 0)
            s.particles.push(new Particle(s.bird.x - 12, s.bird.y + rnd(-3, 3), `rgba(96,165,250,${rnd(0.3, 0.6)})`, 'trail'))
          // Ceiling / floor
          if (s.bird.y - CONFIG.birdSize < 0) { s.bird.y = CONFIG.birdSize; triggerDeath(); } else
          if (s.bird.y + CONFIG.birdSize > H - 60) { s.bird.y = H - 60 - CONFIG.birdSize; triggerDeath(); } else {
            s.frameCount++
            // Spawn pipe
            if (s.frameCount > CONFIG.pipeSpawnRate) {
              const t = 80, b = H - CONFIG.pipeGap - 140
              const h = Math.random() * (b - t) + t
              s.pipes.push({ x: W, topHeight: h, bottomY: h + CONFIG.pipeGap, passed: false })
              s.frameCount = 0
            }
            // Move pipes
            for (let i = s.pipes.length - 1; i >= 0; i--) {
              s.pipes[i].x -= CONFIG.pipeSpeed
              // Score
              if (!s.pipes[i].passed && s.pipes[i].x + CONFIG.pipeWidth < s.bird.x) {
                s.pipes[i].passed = true; s.currentScore++
                SoundEngine.play('score')
                s.scorePopups.push(new ScorePopup(s.bird.x, s.bird.y - 30, '+1'))
                for (let j = 0; j < 8; j++) s.particles.push(new Particle(s.bird.x, s.bird.y, '#FFD700', 'score'))
              }
              // Collision
              if (
                s.bird.x + CONFIG.birdSize - 4 > s.pipes[i].x &&
                s.bird.x - CONFIG.birdSize + 4 < s.pipes[i].x + CONFIG.pipeWidth &&
                (s.bird.y - CONFIG.birdSize + 4 < s.pipes[i].topHeight || s.bird.y + CONFIG.birdSize - 4 > s.pipes[i].bottomY)
              ) { triggerDeath() }
              // Remove off-screen
              if (s.pipes[i].x + CONFIG.pipeWidth < -10) s.pipes.splice(i, 1)
            }
          }
        }
      }

      // ── DRAW ────────────────────────────────────────────
      ctx.save()
      ctx.translate(s.screenShake.x, s.screenShake.y)
      drawBackground(ctx, s, W, H)

      if (s.gameRunning || s.isDead || s.particles.length > 0) {
        drawPipes(ctx, s, H)
        s.particles.forEach(p => p.draw(ctx))
        s.scorePopups.forEach(p => p.draw(ctx))
      }
      if (!s.isDead) drawBird(ctx, s)
      if (s.gameRunning && s.gameStarted) drawScore(ctx, s, W)
      else if (s.gameRunning && !s.gameStarted) drawStartScreen(ctx, W, H, s.frameCount)
      else if (!s.gameRunning && !s.isDead && !hasEntered) drawIdleScreen(ctx, W, H, s.frameCount)

      // Flash
      if (s.flashAlpha > 0) {
        ctx.fillStyle = `rgba(255,255,255,${s.flashAlpha})`
        ctx.fillRect(0, 0, W, H)
        s.flashAlpha *= 0.9
        if (s.flashAlpha < 0.01) s.flashAlpha = 0
      }
      ctx.restore()
      s.animFrameId = requestAnimationFrame(loop)
    }

    s.animFrameId = requestAnimationFrame(loop)
    return () => { if (s.animFrameId) cancelAnimationFrame(s.animFrameId) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEntered])

  // ── Canvas click/touch ───────────────────────────────────
  function handleCanvasInteract() {
    const s = stateRef.current
    if (!hasEntered) { onShowOnboarding(); return }
    if (s.gameRunning && !s.gameStarted) { s.gameStarted = true; jump() }
    else jump()
  }

  // ── Exposed start/restart (called from parent) ────────────
  useEffect(() => {
    if (hasEntered) { initGame() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Game canvas wrapper */}
      <div
        id="gameWrapper"
        style={{
          background: 'var(--bg-card)', borderRadius: '24px', padding: '12px',
          marginBottom: '18px', border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)', maxWidth: '100%'
        }}
      >
        <canvas
          ref={canvasRef}
          width={400} height={600}
          onClick={handleCanvasInteract}
          onTouchStart={(e) => { e.preventDefault(); handleCanvasInteract() }}
          style={{ cursor: 'pointer', touchAction: 'none' }}
        />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '424px' }}>
        <button
          onClick={() => {
            SoundEngine.play('click')
            if (!hasEntered) { onShowOnboarding(); return }
            initGame()
          }}
          style={{
            flex: 1, border: 'none', padding: '14px 24px', borderRadius: '13px',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: 'white',
            boxShadow: '0 4px 15px rgba(59,130,246,0.35)', transition: 'all 0.25s ease'
          }}
        >
          START GAME
        </button>
        <button
          onClick={() => { SoundEngine.play('click'); onShowOnboarding() }}
          style={{
            flex: 1, border: '1px solid var(--border)', padding: '14px 24px',
            borderRadius: '13px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            background: hasEntered ? 'rgba(59,130,246,0.12)' : 'var(--input-bg)',
            color: hasEntered ? 'var(--primary)' : 'var(--text)',
            borderColor: hasEntered ? 'rgba(59,130,246,0.25)' : 'var(--border)',
            transition: 'all 0.25s ease'
          }}
        >
          {hasEntered ? '✓ ENTERED' : 'PAY & ENTER'}
        </button>
      </div>
    </div>
  )
}

