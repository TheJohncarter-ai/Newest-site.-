/* ============================================
   JOHN CARTER - MAIN JAVASCRIPT
   Interactive functionality and animations
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all modules
  initNavigation();
  initScrollEffects();
  initSmoothScrolling();
  initAnimations();
  initImageSlideshows();
  initScrollReveal();
  initParallaxEffects();
  initMagneticButtons();
  initContactTabs();
});

/* ============================================
   NAVIGATION MODULE
   Mobile menu toggle and active states
   ============================================ */
function initNavigation() {
  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      navMenu.classList.toggle('active');
      document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Update active nav link on scroll
  updateActiveNavLink();
  window.addEventListener('scroll', throttle(updateActiveNavLink, 100));
}

/* ============================================
   SCROLL EFFECTS MODULE
   Header styling and reveal animations
   ============================================ */
function initScrollEffects() {
  const header = document.getElementById('header');
  let lastScrollY = window.scrollY;

  function handleScroll() {
    const currentScrollY = window.scrollY;

    // Add scrolled class for header styling
    if (header) {
      if (currentScrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    lastScrollY = currentScrollY;
  }

  window.addEventListener('scroll', throttle(handleScroll, 16));
  handleScroll(); // Initial call
}

/* ============================================
   SMOOTH SCROLLING MODULE
   Smooth scroll to anchor links
   ============================================ */
function initSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');

      if (href === '#') return;

      const target = document.querySelector(href);

      if (target) {
        e.preventDefault();

        const headerHeight = document.getElementById('header')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update URL without jumping
        history.pushState(null, null, href);
      }
    });
  });
}

/* ============================================
   ANIMATIONS MODULE
   Intersection Observer for reveal animations
   ============================================ */
function initAnimations() {
  // Animate elements when they come into view
  const animatedElements = document.querySelectorAll(
    '.service-card, .highlight, .profile-card, .contact-method'
  );

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(el);
  });

  // Add CSS for animated state
  const style = document.createElement('style');
  style.textContent = `
    .animate-in {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);
}

/* ============================================
   ACTIVE NAV LINK UPDATER
   Highlights current section in navigation
   ============================================ */
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const headerHeight = document.getElementById('header')?.offsetHeight || 0;

  let currentSection = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - headerHeight - 100;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
      currentSection = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}

/* ============================================
   UTILITY FUNCTIONS
   Helper functions for performance
   ============================================ */

// Throttle function to limit execution rate
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Debounce function to delay execution
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/* ============================================
   IMAGE SLIDESHOW MODULE
   Fade in/out rotating image gallery
   ============================================ */
function initImageSlideshows() {
  const slideshows = document.querySelectorAll('.image-slideshow');

  slideshows.forEach(slideshow => {
    const images = slideshow.querySelectorAll('.slideshow-image');
    if (images.length <= 1) return; // No need for slideshow with single image

    let currentIndex = 0;
    const totalImages = images.length;
    const intervalTime = 5000; // 5 seconds between transitions

    // Start the slideshow
    function nextSlide() {
      // Fade out current image
      images[currentIndex].classList.remove('active');
      images[currentIndex].classList.add('fade-out');

      // Calculate next index
      currentIndex = (currentIndex + 1) % totalImages;

      // Fade in next image
      images[currentIndex].classList.remove('fade-out');
      images[currentIndex].classList.add('active', 'fade-in');

      // Clean up animation classes after transition
      setTimeout(() => {
        images.forEach(img => {
          img.classList.remove('fade-in', 'fade-out');
        });
      }, 1500); // Match CSS transition duration
    }

    // Auto-rotate slides
    let slideshowInterval = setInterval(nextSlide, intervalTime);

    // Pause on hover (optional - better UX)
    slideshow.addEventListener('mouseenter', () => {
      clearInterval(slideshowInterval);
    });

    slideshow.addEventListener('mouseleave', () => {
      slideshowInterval = setInterval(nextSlide, intervalTime);
    });

    // Preload images for smoother transitions
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src) {
        const preloadImg = new Image();
        preloadImg.src = src;
      }
    });
  });
}

/* ============================================
   CALENDLY INTEGRATION
   Handle Calendly widget loading
   ============================================ */
window.addEventListener('load', function() {
  // Calendly widget is loaded via script tag in HTML
  // This ensures it initializes properly after page load

  // Optional: Add loading state handling
  const calendlyWidget = document.querySelector('.calendly-inline-widget');
  if (calendlyWidget) {
    // Widget will load automatically via Calendly's script
    console.log('Calendly widget container ready');
  }
});

/* ============================================
   SERVICE CARD INTERACTIONS
   Enhanced hover and click effects
   ============================================ */
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-5px)';
  });

  card.addEventListener('mouseleave', function() {
    this.style.transform = '';
  });
});

/* ============================================
   SOCIAL LINK TRACKING (Optional)
   Track social link clicks
   ============================================ */
document.querySelectorAll('.social-link, .footer-social a').forEach(link => {
  link.addEventListener('click', function() {
    const platform = this.getAttribute('aria-label') || 'unknown';
    console.log(`Social link clicked: ${platform}`);
    // Add analytics tracking here if needed
  });
});

/* ============================================
   SCROLL REVEAL ANIMATIONS
   Reveal elements as they enter viewport
   ============================================ */
function initScrollReveal() {
  const revealElements = document.querySelectorAll(
    '.section-header, .service-card, .highlight, .profile-card, .contact-method, .about-content, .about-visual'
  );

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add staggered delay based on element position
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, index * 100);
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => {
    el.classList.add('pre-reveal');
    revealObserver.observe(el);
  });

  // Add reveal styles
  const style = document.createElement('style');
  style.textContent = `
    .pre-reveal {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                  transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .revealed {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);
}

/* ============================================
   PARALLAX EFFECTS
   Subtle parallax on scroll
   ============================================ */
function initParallaxEffects() {
  const parallaxElements = document.querySelectorAll('.hero-background, .about-image-decoration');

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;

        parallaxElements.forEach(el => {
          const speed = el.dataset.parallaxSpeed || 0.3;
          const yPos = -(scrolled * speed);
          el.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });

        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ============================================
   MAGNETIC BUTTONS
   Buttons follow cursor on hover
   ============================================ */
function initMagneticButtons() {
  const magneticElements = document.querySelectorAll('.btn-primary, .nav-cta, .logo');

  magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      el.style.transition = 'transform 0.3s ease';
    });

    el.addEventListener('mouseenter', () => {
      el.style.transition = 'transform 0.1s ease';
    });
  });
}

/* ============================================
   CONTACT TABS
   Tab switching between message form and Calendly
   ============================================ */
function initContactTabs() {
  const tabBtns = document.querySelectorAll('.contact-tab-btn');
  const tabPanels = document.querySelectorAll('.contact-tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const targetTab = this.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      this.classList.add('active');
      const panel = document.getElementById('tab-' + targetTab);
      if (panel) panel.classList.add('active');
    });
  });

  // Contact form: build mailto on submit
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const org = document.getElementById('form-org').value;
      const message = document.getElementById('form-message').value.trim();

      const subject = encodeURIComponent('Inquiry from ' + name + ' \u2014 ' + org);
      const body = encodeURIComponent(
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Organization Type: ' + org + '\n\n' +
        'Message:\n' + message
      );

      window.location.href = 'mailto:powelljohn9521@gmail.com?subject=' + subject + '&body=' + body;
    });
  }
}

/* ============================================
   LOGO COMPASS — add gap between SVG and text
   ============================================ */
(function styleLogoCompass() {
  const style = document.createElement('style');
  style.textContent = `
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo-compass {
      flex-shrink: 0;
      transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .logo:hover .logo-compass {
      transform: rotate(45deg);
    }
  `;
  document.head.appendChild(style);
})();

/* ============================================
   CURSOR GLOW EFFECT
   Custom cursor glow following mouse
   ============================================ */
(function initCursorGlow() {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  const style = document.createElement('style');
  style.textContent = `
    .cursor-glow {
      position: fixed;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s ease;
      opacity: 0;
    }
    .cursor-glow.active {
      opacity: 1;
    }
    @media (max-width: 768px) {
      .cursor-glow { display: none; }
    }
  `;
  document.head.appendChild(style);

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.classList.add('active');
  });

  document.addEventListener('mouseleave', () => {
    glow.classList.remove('active');
  });

  // Smooth follow animation
  function animateGlow() {
    glowX += (mouseX - glowX) * 0.1;
    glowY += (mouseY - glowY) * 0.1;

    glow.style.left = glowX + 'px';
    glow.style.top = glowY + 'px';

    requestAnimationFrame(animateGlow);
  }
  animateGlow();
})();

/* ============================================
   TEXT SCRAMBLE EFFECT
   Scramble text on hover for titles
   ============================================ */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise(resolve => this.resolve = resolve);
    this.queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20);
      this.queue.push({ from, to, start, end });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = '';
    let complete = 0;

    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];

      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span class="scramble-char">${char}</span>`;
      } else {
        output += from;
      }
    }

    this.el.innerHTML = output;

    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

// Apply to stat numbers on scroll
document.querySelectorAll('.stat-number').forEach(el => {
  const originalText = el.innerText;
  const scrambler = new TextScramble(el);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        scrambler.setText(originalText);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(el);
});
