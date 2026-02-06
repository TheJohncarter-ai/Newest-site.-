/* ============================================
   SPACE PARTICLES & CONSTELLATION SYSTEM
   Interactive animated background
   Optimized for mobile performance
   ============================================ */

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.animationId = null;
    this.isVisible = true;
    this.lastFrameTime = 0;
    this.targetFPS = 30; // Limit FPS for performance
    this.frameInterval = 1000 / this.targetFPS;

    // Detect mobile/low-power devices
    this.isMobile = window.innerWidth <= 768 ||
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    this.isLowPower = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : this.isMobile;

    // Configuration - adjusted for device capability
    this.config = this.getConfig();

    this.init();
  }

  getConfig() {
    // Reduced settings for mobile/low-power devices
    if (this.isMobile) {
      return {
        particleCount: 25,
        particleMinSize: 1,
        particleMaxSize: 2,
        lineDistance: 100,
        particleSpeed: 0.2,
        mouseInteraction: false, // Disable on mobile
        drawLines: true,
        drawGlow: false, // Disable glow on mobile for performance
        colors: {
          particle: 'rgba(99, 102, 241, 0.8)',
          line: 'rgba(99, 102, 241, 0.12)'
        }
      };
    }

    // Full settings for desktop
    return {
      particleCount: 60,
      particleMinSize: 1,
      particleMaxSize: 3,
      lineDistance: 150,
      particleSpeed: 0.3,
      mouseInteraction: true,
      drawLines: true,
      drawGlow: true,
      colors: {
        particle: 'rgba(99, 102, 241, 0.8)',
        particleGlow: 'rgba(99, 102, 241, 0.3)',
        line: 'rgba(99, 102, 241, 0.15)',
        lineHover: 'rgba(6, 182, 212, 0.3)'
      }
    };
  }

  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    // Use device pixel ratio for crisp rendering, but cap it for performance
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    this.ctx.scale(dpr, dpr);

    // Store display dimensions
    this.displayWidth = width;
    this.displayHeight = height;
  }

  createParticles() {
    this.particles = [];
    const { particleCount, particleMinSize, particleMaxSize, particleSpeed } = this.config;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.displayWidth,
        y: Math.random() * this.displayHeight,
        size: Math.random() * (particleMaxSize - particleMinSize) + particleMinSize,
        speedX: (Math.random() - 0.5) * particleSpeed,
        speedY: (Math.random() - 0.5) * particleSpeed,
        opacity: Math.random() * 0.5 + 0.3,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01
      });
    }
  }

  bindEvents() {
    // Debounced resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Recalculate mobile status on resize
        this.isMobile = window.innerWidth <= 768;
        this.config = this.getConfig();
        this.resize();
        this.createParticles();
      }, 250);
    });

    // Only add mouse events on desktop
    if (!this.isMobile) {
      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      }, { passive: true });

      window.addEventListener('mouseout', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      });
    }

    // Pause animation when tab is not visible
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (this.isVisible && !this.animationId) {
        this.animate();
      }
    });
  }

  drawParticle(particle) {
    const { drawGlow } = this.config;

    // Twinkling effect
    particle.pulse += particle.pulseSpeed;
    const twinkle = Math.sin(particle.pulse) * 0.3 + 0.7;
    const currentOpacity = particle.opacity * twinkle;

    // Glow effect (desktop only)
    if (drawGlow) {
      const gradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 3
      );
      gradient.addColorStop(0, `rgba(99, 102, 241, ${currentOpacity})`);
      gradient.addColorStop(0.5, `rgba(99, 102, 241, ${currentOpacity * 0.3})`);
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    }

    // Core particle
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
    this.ctx.fill();
  }

  drawLines() {
    const { lineDistance, mouseInteraction } = this.config;
    const particleCount = this.particles.length;

    // Use spatial partitioning for better performance on mobile
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;

        // Quick distance check before expensive sqrt
        if (Math.abs(dx) > lineDistance || Math.abs(dy) > lineDistance) continue;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < lineDistance) {
          const opacity = (1 - distance / lineDistance) * 0.3;
          let lineColor = `rgba(99, 102, 241, ${opacity})`;

          // Mouse hover effect (desktop only)
          if (mouseInteraction && this.mouse.x && this.mouse.y) {
            const midX = (this.particles[i].x + this.particles[j].x) / 2;
            const midY = (this.particles[i].y + this.particles[j].y) / 2;
            const mouseDist = Math.sqrt(
              Math.pow(midX - this.mouse.x, 2) +
              Math.pow(midY - this.mouse.y, 2)
            );

            if (mouseDist < this.mouse.radius) {
              const hoverOpacity = opacity * (1 - mouseDist / this.mouse.radius) * 2;
              lineColor = `rgba(6, 182, 212, ${Math.min(hoverOpacity, 0.5)})`;
            }
          }

          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = lineColor;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
  }

  updateParticles() {
    const { mouseInteraction } = this.config;

    this.particles.forEach(particle => {
      // Mouse interaction (desktop only)
      if (mouseInteraction && this.mouse.x && this.mouse.y) {
        const dx = particle.x - this.mouse.x;
        const dy = particle.y - this.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.mouse.radius) {
          const force = (this.mouse.radius - distance) / this.mouse.radius;
          const angle = Math.atan2(dy, dx);
          particle.x += Math.cos(angle) * force * 2;
          particle.y += Math.sin(angle) * force * 2;
        }
      }

      // Regular movement
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Wrap around edges
      if (particle.x < 0) particle.x = this.displayWidth;
      if (particle.x > this.displayWidth) particle.x = 0;
      if (particle.y < 0) particle.y = this.displayHeight;
      if (particle.y > this.displayHeight) particle.y = 0;
    });
  }

  animate(currentTime = 0) {
    if (!this.isVisible) {
      this.animationId = null;
      return;
    }

    this.animationId = requestAnimationFrame((time) => this.animate(time));

    // Frame rate limiting for performance
    const elapsed = currentTime - this.lastFrameTime;
    if (elapsed < this.frameInterval) return;
    this.lastFrameTime = currentTime - (elapsed % this.frameInterval);

    // Clear and draw
    this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);

    if (this.config.drawLines) {
      this.drawLines();
    }
    this.particles.forEach(particle => this.drawParticle(particle));
    this.updateParticles();
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

/* ============================================
   SHOOTING STARS
   Occasional shooting star animations
   Disabled on mobile for performance
   ============================================ */

class ShootingStars {
  constructor(canvasId) {
    // Skip on mobile devices
    this.isMobile = window.innerWidth <= 768 ||
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (this.isMobile) return;

    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.lastSpawn = 0;
    this.spawnInterval = 4000; // New star every 4 seconds
    this.isVisible = true;

    // Pause when tab not visible
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
    });

    this.animate();
  }

  spawnStar() {
    if (!this.isVisible) return;

    const side = Math.random() > 0.5 ? 'top' : 'right';
    let x, y, angle;

    if (side === 'top') {
      x = Math.random() * this.canvas.width;
      y = 0;
      angle = Math.PI / 4 + (Math.random() * 0.5 - 0.25);
    } else {
      x = this.canvas.width;
      y = Math.random() * this.canvas.height * 0.5;
      angle = Math.PI * 0.75 + (Math.random() * 0.5 - 0.25);
    }

    this.stars.push({
      x, y, angle,
      speed: 8 + Math.random() * 4,
      length: 80 + Math.random() * 40,
      opacity: 1,
      life: 1
    });
  }

  animate() {
    if (this.isMobile) return;

    const now = Date.now();

    // Spawn new stars occasionally
    if (now - this.lastSpawn > this.spawnInterval && this.isVisible) {
      if (Math.random() > 0.6) { // 40% chance
        this.spawnStar();
      }
      this.lastSpawn = now;
    }

    // Update and draw stars
    this.stars = this.stars.filter(star => {
      star.x += Math.cos(star.angle) * star.speed;
      star.y += Math.sin(star.angle) * star.speed;
      star.life -= 0.02;
      star.opacity = star.life;

      if (star.life > 0 && this.isVisible) {
        const gradient = this.ctx.createLinearGradient(
          star.x, star.y,
          star.x - Math.cos(star.angle) * star.length,
          star.y - Math.sin(star.angle) * star.length
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        gradient.addColorStop(0.3, `rgba(99, 102, 241, ${star.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

        this.ctx.beginPath();
        this.ctx.moveTo(star.x, star.y);
        this.ctx.lineTo(
          star.x - Math.cos(star.angle) * star.length,
          star.y - Math.sin(star.angle) * star.length
        );
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        return true;
      }
      return false;
    });

    requestAnimationFrame(() => this.animate());
  }
}

/* ============================================
   INITIALIZATION
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    console.log('Particles disabled: user prefers reduced motion');
    return;
  }

  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.id = 'particleCanvas';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  `;
  document.body.insertBefore(canvas, document.body.firstChild);

  // Initialize particle system
  const particles = new ParticleSystem('particleCanvas');
  const shootingStars = new ShootingStars('particleCanvas');
});
