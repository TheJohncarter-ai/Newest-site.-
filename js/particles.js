/* ============================================
   SPACE PARTICLES & CONSTELLATION SYSTEM
   Interactive animated background
   ============================================ */

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.animationId = null;

    // Configuration
    this.config = {
      particleCount: 80,
      particleMinSize: 1,
      particleMaxSize: 3,
      lineDistance: 150,
      particleSpeed: 0.3,
      mouseInteraction: true,
      colors: {
        particle: 'rgba(99, 102, 241, 0.8)',
        particleGlow: 'rgba(99, 102, 241, 0.3)',
        line: 'rgba(99, 102, 241, 0.15)',
        lineHover: 'rgba(6, 182, 212, 0.3)'
      }
    };

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    const { particleCount, particleMinSize, particleMaxSize, particleSpeed } = this.config;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * (particleMaxSize - particleMinSize) + particleMinSize,
        speedX: (Math.random() - 0.5) * particleSpeed,
        speedY: (Math.random() - 0.5) * particleSpeed,
        opacity: Math.random() * 0.5 + 0.3,
        pulse: Math.random() * Math.PI * 2, // For twinkling effect
        pulseSpeed: Math.random() * 0.02 + 0.01
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  drawParticle(particle) {
    const { colors } = this.config;

    // Twinkling effect
    particle.pulse += particle.pulseSpeed;
    const twinkle = Math.sin(particle.pulse) * 0.3 + 0.7;
    const currentOpacity = particle.opacity * twinkle;

    // Glow effect
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

    // Core particle
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
    this.ctx.fill();
  }

  drawLines() {
    const { lineDistance, colors, mouseInteraction } = this.config;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < lineDistance) {
          const opacity = (1 - distance / lineDistance) * 0.3;

          // Check if near mouse for highlight effect
          let lineColor = `rgba(99, 102, 241, ${opacity})`;

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
      // Mouse interaction - particles move away from cursor
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
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawLines();
    this.particles.forEach(particle => this.drawParticle(particle));
    this.updateParticles();

    this.animationId = requestAnimationFrame(() => this.animate());
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
   ============================================ */

class ShootingStars {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.lastSpawn = 0;
    this.spawnInterval = 3000; // New star every 3 seconds

    this.animate();
  }

  spawnStar() {
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
    const now = Date.now();

    // Spawn new stars occasionally
    if (now - this.lastSpawn > this.spawnInterval) {
      if (Math.random() > 0.5) { // 50% chance
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

      if (star.life > 0) {
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
