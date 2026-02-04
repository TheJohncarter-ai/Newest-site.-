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
