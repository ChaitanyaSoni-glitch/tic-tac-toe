/**
 * particles.js — Background particle grid + confetti burst system.
 * Two canvas layers: ambient floating particles & win celebration confetti.
 */

const Particles = (() => {
  'use strict';

  let bgCanvas, bgCtx;
  let confettiCanvas, confettiCtx;
  let particles = [];
  let confettiPieces = [];
  let animFrameId = null;
  let confettiFrameId = null;
  let isDarkTheme = true;

  const PARTICLE_COUNT = 60;
  const CONFETTI_COUNT = 120;

  function init() {
    // Background particles canvas
    bgCanvas = document.getElementById('particles-bg');
    if (!bgCanvas) return;
    bgCtx = bgCanvas.getContext('2d');
    resizeBg();

    // Confetti canvas
    confettiCanvas = document.getElementById('confetti-canvas');
    if (confettiCanvas) {
      confettiCtx = confettiCanvas.getContext('2d');
      resizeConfetti();
    }

    createParticles();
    animateBg();

    window.addEventListener('resize', () => {
      resizeBg();
      resizeConfetti();
    });
  }

  function setTheme(dark) {
    isDarkTheme = dark;
  }

  function resizeBg() {
    if (!bgCanvas) return;
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }

  function resizeConfetti() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * (bgCanvas?.width || window.innerWidth),
        y: Math.random() * (bgCanvas?.height || window.innerHeight),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }
  }

  function animateBg() {
    if (!bgCtx || !bgCanvas) return;
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    const baseColor = isDarkTheme ? '0, 240, 255' : '80, 80, 180';

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = bgCanvas.width;
      if (p.x > bgCanvas.width) p.x = 0;
      if (p.y < 0) p.y = bgCanvas.height;
      if (p.y > bgCanvas.height) p.y = 0;

      bgCtx.beginPath();
      bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      bgCtx.fillStyle = `rgba(${baseColor}, ${p.opacity})`;
      bgCtx.fill();
    }

    // Draw connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const opacity = (1 - dist / 120) * 0.15;
          bgCtx.beginPath();
          bgCtx.moveTo(particles[i].x, particles[i].y);
          bgCtx.lineTo(particles[j].x, particles[j].y);
          bgCtx.strokeStyle = `rgba(${baseColor}, ${opacity})`;
          bgCtx.lineWidth = 0.5;
          bgCtx.stroke();
        }
      }
    }

    animFrameId = requestAnimationFrame(animateBg);
  }

  // === Confetti System ===

  function launchConfetti() {
    if (!confettiCanvas || !confettiCtx) return;
    confettiPieces = [];

    const colors = ['#00f0ff', '#ff00ff', '#ffff00', '#00ff88', '#ff4444', '#4488ff', '#ff8800'];
    const cx = confettiCanvas.width / 2;
    const cy = confettiCanvas.height / 2;

    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      confettiPieces.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        width: Math.random() * 8 + 4,
        height: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        gravity: 0.12,
        opacity: 1,
        decay: Math.random() * 0.008 + 0.004,
      });
    }

    animateConfetti();
  }

  function animateConfetti() {
    if (!confettiCtx || !confettiCanvas) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    let alive = false;

    for (const p of confettiPieces) {
      if (p.opacity <= 0) continue;
      alive = true;

      p.x += p.vx;
      p.vy += p.gravity;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.opacity -= p.decay;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = Math.max(0, p.opacity);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      confettiCtx.restore();
    }

    if (alive) {
      confettiFrameId = requestAnimationFrame(animateConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  function destroy() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (confettiFrameId) cancelAnimationFrame(confettiFrameId);
  }

  return { init, launchConfetti, destroy, setTheme };
})();
