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
    let height = canvas.height = window.innerHeight;

    const numNeurons = Math.min(45, Math.floor((width * height) / 20000));
    const neurons = [];
    const connections = [];
    const activeSignals = [];
    const maxConnectionDist = 180;

    class Neuron {
      constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = (Math.random() - 0.5) * 0.15;
        this.radius = Math.random() * 2 + 2.5; // Soma size
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.005 + Math.random() * 0.01;
        this.active = false;
        this.activeTimer = 0;
        this.connectedTargets = []; // Array of { neuron, connection }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulse += this.pulseSpeed;

        // Keep inside bounds
        if (this.x < 20 || this.x > width - 20) this.vx *= -1;
        if (this.y < 20 || this.y > height - 20) this.vy *= -1;

        if (this.active) {
          this.activeTimer--;
          if (this.activeTimer <= 0) {
            this.active = false;
          }
        }
      }

      draw() {
        ctx.beginPath();
        // Pulsing glow of soma
        const baseGlow = 0.35 + Math.sin(this.pulse) * 0.35;
        const opacity = this.active ? 1.0 : baseGlow;
        const glowRadius = this.active ? 12 : 5;

        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.active ? 'rgba(144, 205, 244, 1)' : `rgba(66, 153, 225, ${opacity * 0.7})`;
        
        ctx.shadowBlur = glowRadius;
        ctx.shadowColor = this.active ? 'rgba(144, 205, 244, 1)' : 'rgba(66, 153, 225, 0.5)';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      fire() {
        this.active = true;
        this.activeTimer = 18;
      }
    }

    class Connection {
      constructor(neuronA, neuronB) {
        this.from = neuronA;
        this.to = neuronB;
        this.wavyPoints = [];
        this.recalculatePath();
      }

      recalculatePath() {
        // Pre-calculate a wavy path between A and B
        this.wavyPoints = [];
        const x1 = this.from.x;
        const y1 = this.from.y;
        const x2 = this.to.x;
        const y2 = this.to.y;

        const dist = Math.hypot(x2 - x1, y2 - y1);
        const steps = 4;
        const dx = (x2 - x1) / steps;
        const dy = (y2 - y1) / steps;
        
        const nx = -dy / dist;
        const ny = dx / dist;

        for (let i = 0; i <= steps; i++) {
          if (i === 0) {
            this.wavyPoints.push({ x: x1, y: y1 });
          } else if (i === steps) {
            this.wavyPoints.push({ x: x2, y: y2 });
          } else {
            // Add perpendicular offset for an organic wavy nerve axon look
            const offset = (Math.sin((i / steps) * Math.PI) * (15 + Math.random() * 10)) * (Math.random() > 0.5 ? 1 : -1);
            this.wavyPoints.push({
              x: x1 + dx * i + nx * offset,
              y: y1 + dy * i + ny * offset
            });
          }
        }
      }

      draw() {
        // Draw wavy axon connection (clearly visible blue filament)
        const isFiring = (this.activeSignalsCount || 0) > 0;
        ctx.beginPath();
        ctx.moveTo(this.from.x, this.from.y);
        for (let i = 1; i < this.wavyPoints.length; i++) {
          ctx.lineTo(this.wavyPoints[i].x, this.wavyPoints[i].y);
        }
        // Firing pathways light up bright neon, resting filaments are clear blue lines
        ctx.strokeStyle = isFiring ? 'rgba(144, 205, 244, 0.65)' : 'rgba(66, 153, 225, 0.32)';
        ctx.lineWidth = isFiring ? 1.6 : 1.0;
        ctx.stroke();
      }

      getPointAlongPath(progress) {
        // Interpolate along the pre-calculated wavy segments
        const numSegs = this.wavyPoints.length - 1;
        const targetSeg = progress * numSegs;
        const segIndex = Math.floor(targetSeg);
        const segProgress = targetSeg - segIndex;

        const p0 = this.wavyPoints[segIndex];
        const p1 = this.wavyPoints[Math.min(segIndex + 1, this.wavyPoints.length - 1)];

        return {
          x: p0.x + (p1.x - p0.x) * segProgress,
          y: p0.y + (p1.y - p0.y) * segProgress
        };
      }
    }

    class ActiveSignal {
      constructor(connection, speed = 0.015) {
        this.connection = connection;
        this.progress = 0;
        this.speed = speed;
        // Increment active signals on this connection to trigger glowing line
        this.connection.activeSignalsCount = (this.connection.activeSignalsCount || 0) + 1;
      }

      update() {
        this.progress += this.speed;
        if (this.progress >= 1) {
          this.progress = 1;
          this.connection.to.fire();
          this.connection.activeSignalsCount = Math.max(0, this.connection.activeSignalsCount - 1);
          
          // Neural Cascade: trigger signals to other neighbors of the reached node
          if (Math.random() < 0.6) { // 60% propagation chance
            const availableConnections = this.connection.to.connectedTargets.filter(
              target => target.neuron.id !== this.connection.from.id
            );
            if (availableConnections.length > 0) {
              const nextConn = availableConnections[Math.floor(Math.random() * availableConnections.length)].connection;
              // Prevent triggering duplicate signals along the exact same path
              if (!activeSignals.some(s => s.connection === nextConn)) {
                activeSignals.push(new ActiveSignal(nextConn, this.speed));
              }
            }
          }
          return false; // Done
        }
        return true; // Keep running
      }

      draw() {
        const pos = this.connection.getPointAlongPath(this.progress);

        // Radial glowing gradient for the action potential dot
        const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 8);
        grad.addColorStop(0, '#ffffff'); // White core
        grad.addColorStop(0.3, 'rgba(144, 205, 244, 0.9)'); // Neon blue glow
        grad.addColorStop(0.7, 'rgba(66, 153, 225, 0.2)');
        grad.addColorStop(1, 'rgba(66, 153, 225, 0)');

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    // Spawn Neurons
    for (let i = 0; i < numNeurons; i++) {
      neurons.push(new Neuron(i, Math.random() * width, Math.random() * height));
    }

    // Connect Neurons (make a spatial network)
    for (let i = 0; i < neurons.length; i++) {
      // Find nearby neurons
      const candidates = [];
      for (let j = 0; j < neurons.length; j++) {
        if (i !== j) {
          const dist = Math.hypot(neurons[i].x - neurons[j].x, neurons[i].y - neurons[j].y);
          if (dist < maxConnectionDist) {
            candidates.push({ neuron: neurons[j], dist });
          }
        }
      }
      
      // Sort candidates by distance and connect to closest 2-3 neighbors
      candidates.sort((a, b) => a.dist - b.dist);
      const connectionsToMake = Math.min(3, candidates.length);
      
      for (let c = 0; c < connectionsToMake; c++) {
        const target = candidates[c].neuron;
        
        // Check if connection already exists in either direction
        let existing = connections.find(
          conn => (conn.from.id === neurons[i].id && conn.to.id === target.id) ||
                  (conn.from.id === target.id && conn.to.id === neurons[i].id)
        );

        if (!existing) {
          const newConn = new Connection(neurons[i], target);
          connections.push(newConn);
          
          neurons[i].connectedTargets.push({ neuron: target, connection: newConn });
          // Make connection bi-directional for propagation options
          const returnConn = new Connection(target, neurons[i]);
          target.connectedTargets.push({ neuron: neurons[i], connection: returnConn });
        }
      }
    }

    // Main Loop
    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Re-calculate paths periodically to account for drifting somas
      connections.forEach(conn => {
        conn.recalculatePath();
        conn.draw(); // Draw lines
      });

      // Spawn random impulses occasionally to keep it active
      if (activeSignals.length < 8 && Math.random() < 0.04) {
        const startNeuron = neurons[Math.floor(Math.random() * neurons.length)];
        if (startNeuron.connectedTargets.length > 0) {
          const next = startNeuron.connectedTargets[Math.floor(Math.random() * startNeuron.connectedTargets.length)];
          activeSignals.push(new ActiveSignal(next.connection));
          startNeuron.fire();
        }
      }

      // Update and draw active signals
      for (let i = activeSignals.length - 1; i >= 0; i--) {
        const active = activeSignals[i].update();
        if (!active) {
          activeSignals.splice(i, 1);
        } else {
          activeSignals[i].draw();
        }
      }

      // Draw Somas
      neurons.forEach(n => {
        n.update();
        n.draw();
      });

      requestAnimationFrame(animate);
    }

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();
    animate();
  }
});
