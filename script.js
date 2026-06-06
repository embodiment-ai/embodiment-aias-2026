// =============================================
// AIAS+ 2026 Workshop Website — JavaScript
// =============================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Navbar scroll effect ---
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // --- Mobile nav toggle ---
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Close mobile nav when link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = navbar.offsetHeight + 10;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- Fade-in on scroll (Intersection Observer) ---
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  };

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        fadeObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Apply initial hidden state and observe
  const animatedElements = document.querySelectorAll(
    '.objective-card, .topic-item, .schedule-item, .date-card, .organizer-card, .outcome-item, .submission-type'
  );

  animatedElements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.6s ease ${i % 4 * 0.1}s, transform 0.6s ease ${i % 4 * 0.1}s`;
    fadeObserver.observe(el);
  });

  // --- Active nav link highlighting ---
  const sections = document.querySelectorAll('section[id]');
  const navLinkItems = document.querySelectorAll('.nav-links a');

  const highlightNav = () => {
    const scrollPos = window.scrollY + navbar.offsetHeight + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinkItems.forEach(link => {
          link.classList.remove('active-link');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active-link');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });

  // --- Dynamic Neuron Canvas Animation ---
  const canvas = document.getElementById('neuron-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const heroSection = document.getElementById('hero');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = heroSection.offsetHeight;

    class NeuralPathway {
      constructor(index) {
        this.index = index;
        this.reset();
        // Stagger initial progress of signals
        this.pulses = [
          { progress: Math.random(), speed: 0.0015 + Math.random() * 0.002, size: Math.random() * 2 + 1.5 },
          { progress: Math.random() - 0.5, speed: 0.0015 + Math.random() * 0.002, size: Math.random() * 2 + 1.5 }
        ];
        this.angle = Math.random() * Math.PI * 2;
        this.driftSpeed = 0.0008 + Math.random() * 0.0008;
      }

      reset() {
        // Paths go left-to-right or right-to-left
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.yStart = Math.random() * height;
        this.yEnd = Math.random() * height;
        this.cp1x = width * 0.25;
        this.cp1y = Math.random() * height;
        this.cp2x = width * 0.75;
        this.cp2y = Math.random() * height;
      }

      update() {
        this.angle += this.driftSpeed;
        
        // Dynamic path swaying
        this.currentYStart = this.yStart + Math.sin(this.angle) * 70;
        this.currentYEnd = this.yEnd + Math.cos(this.angle) * 70;
        this.currentCp1y = this.cp1y + Math.sin(this.angle * 1.3) * 100;
        this.currentCp2y = this.cp2y + Math.cos(this.angle * 1.1) * 100;

        this.pulses.forEach(pulse => {
          pulse.progress += pulse.speed;
          if (pulse.progress > 1) {
            pulse.progress = 0;
            pulse.speed = 0.0015 + Math.random() * 0.002;
          }
        });
      }

      getPointOnBezier(t) {
        // Standard Cubic Bezier formula
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        const x = uuu * (this.direction === 1 ? 0 : width) +
                  3 * uu * t * this.cp1x +
                  3 * u * tt * this.cp2x +
                  ttt * (this.direction === 1 ? width : 0);

        const y = uuu * this.currentYStart +
                  3 * uu * t * this.currentCp1y +
                  3 * u * tt * this.currentCp2y +
                  ttt * this.currentYEnd;

        return { x, y };
      }

      draw() {
        // Draw the main neural synapse pathway (thin, faint blue line)
        ctx.beginPath();
        const startX = this.direction === 1 ? 0 : width;
        const endX = this.direction === 1 ? width : 0;
        ctx.moveTo(startX, this.currentYStart);
        ctx.bezierCurveTo(this.cp1x, this.currentCp1y, this.cp2x, this.currentCp2y, endX, this.currentYEnd);
        ctx.strokeStyle = 'rgba(66, 153, 225, 0.07)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Draw the action potentials traveling along the pathway
        this.pulses.forEach(pulse => {
          if (pulse.progress < 0) return; // Wait for trigger
          
          const pos = this.getPointOnBezier(pulse.progress);

          // Draw neon blue glow tail
          const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, pulse.size * 6);
          grad.addColorStop(0, 'rgba(255, 255, 255, 1)'); // White core
          grad.addColorStop(0.2, 'rgba(144, 205, 244, 0.85)'); // Neon blue core
          grad.addColorStop(0.6, 'rgba(66, 153, 225, 0.15)'); // Blue glow halo
          grad.addColorStop(1, 'rgba(66, 153, 225, 0)');

          ctx.beginPath();
          ctx.arc(pos.x, pos.y, pulse.size * 6, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Action potential core dot
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, pulse.size * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });
      }
    }

    const pathways = [];
    const numPathways = 7;
    for (let i = 0; i < numPathways; i++) {
      pathways.push(new NeuralPathway(i));
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      pathways.forEach(path => {
        path.update();
        path.draw();
      });

      requestAnimationFrame(animate);
    }

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = heroSection.offsetHeight;
    };

    window.addEventListener('resize', resize);
    resize();
    animate();
  }
});
