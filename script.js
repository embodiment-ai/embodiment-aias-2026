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
    '.objective-card, .topic-item, .schedule-item, .date-card, .organizer-card, .facilitator-card, .speaker-card, .outcome-item, .submission-type'
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

  // --- AIAS+ 2026 Main Conference Speakers Rotating Carousel ---
  const aiasReelContainer = document.getElementById('aiasSpeakersReelContainer');
  const aiasSpeakersTrack = document.getElementById('aiasSpeakersTrack');
  const aiasReelPrevBtn = document.getElementById('aiasReelPrevBtn');
  const aiasReelNextBtn = document.getElementById('aiasReelNextBtn');

  if (aiasReelContainer && aiasSpeakersTrack) {
    // Clone cards once for infinite continuous scroll loop
    const originalCards = Array.from(aiasSpeakersTrack.children);
    originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      aiasSpeakersTrack.appendChild(clone);
    });

    let isPaused = false;
    let isDragging = false;
    let startX = 0;
    let scrollStart = 0;
    const scrollSpeed = 0.65; // Smooth cinematic glide speed

    function autoScrollReel() {
      if (!isPaused && !isDragging) {
        aiasReelContainer.scrollLeft += scrollSpeed;
        const halfWidth = aiasSpeakersTrack.scrollWidth / 2;
        if (aiasReelContainer.scrollLeft >= halfWidth) {
          aiasReelContainer.scrollLeft -= halfWidth;
        }
      }
      requestAnimationFrame(autoScrollReel);
    }

    requestAnimationFrame(autoScrollReel);

    // Pause on hover
    aiasReelContainer.addEventListener('mouseenter', () => { isPaused = true; });
    aiasReelContainer.addEventListener('mouseleave', () => { isPaused = false; });

    let hasMoved = false;

    // Drag-to-scroll (Mouse)
    aiasReelContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      hasMoved = false;
      isPaused = true;
      startX = e.pageX - aiasReelContainer.offsetLeft;
      scrollStart = aiasReelContainer.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        aiasReelContainer.style.cursor = 'grab';
        setTimeout(() => { isPaused = false; }, 800);
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const x = e.pageX - aiasReelContainer.offsetLeft;
      const diff = Math.abs(x - startX);
      if (diff > 4) {
        hasMoved = true;
        aiasReelContainer.style.cursor = 'grabbing';
        e.preventDefault();
        const walk = (x - startX) * 1.35;
        aiasReelContainer.scrollLeft = scrollStart - walk;
        
        const halfWidth = aiasSpeakersTrack.scrollWidth / 2;
        if (aiasReelContainer.scrollLeft >= halfWidth) {
          aiasReelContainer.scrollLeft -= halfWidth;
          scrollStart -= halfWidth;
        } else if (aiasReelContainer.scrollLeft <= 0) {
          aiasReelContainer.scrollLeft += halfWidth;
          scrollStart += halfWidth;
        }
      }
    });

    // Prevent link click only if user actually dragged the carousel
    aiasReelContainer.addEventListener('click', (e) => {
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // Touch support for mobile
    aiasReelContainer.addEventListener('touchstart', () => {
      isPaused = true;
    }, { passive: true });

    aiasReelContainer.addEventListener('touchend', () => {
      setTimeout(() => { isPaused = false; }, 1200);
    }, { passive: true });

    // Arrow controls
    const scrollStep = 280;
    if (aiasReelPrevBtn) {
      aiasReelPrevBtn.addEventListener('click', () => {
        isPaused = true;
        const halfWidth = aiasSpeakersTrack.scrollWidth / 2;
        if (aiasReelContainer.scrollLeft <= 50) {
          aiasReelContainer.scrollLeft += halfWidth;
        }
        aiasReelContainer.scrollBy({ left: -scrollStep, behavior: 'smooth' });
        setTimeout(() => { isPaused = false; }, 1500);
      });
    }

    if (aiasReelNextBtn) {
      aiasReelNextBtn.addEventListener('click', () => {
        isPaused = true;
        const halfWidth = aiasSpeakersTrack.scrollWidth / 2;
        if (aiasReelContainer.scrollLeft >= halfWidth - 50) {
          aiasReelContainer.scrollLeft -= halfWidth;
        }
        aiasReelContainer.scrollBy({ left: scrollStep, behavior: 'smooth' });
        setTimeout(() => { isPaused = false; }, 1500);
      });
    }
  }

  // --- AIAS+ Speaker Profile Modal / Drawer Controller ---
  const speakerModalBackdrop = document.getElementById("speakerModalBackdrop");
  const speakerModalCloseBtn = document.getElementById("speakerModalCloseBtn");
  const speakerModalPhoto = document.getElementById("speakerModalPhoto");
  const speakerModalName = document.getElementById("speakerModalName");
  const speakerModalAffil = document.getElementById("speakerModalAffil");
  const speakerModalBio = document.getElementById("speakerModalBio");
  const speakerModalAiasLink = document.getElementById("speakerModalAiasLink");
  const speakerModalWebLink = document.getElementById("speakerModalWebLink");

  const aiasSpeakersDatabase = {
  "terence-tao": {
    "slug": "terence-tao",
    "name": "Dr. Terence Tao",
    "badge": "UCLA / IPAM",
    "role": "Professor of Mathematics",
    "affil": "Fields Medalist \u00b7 UCLA & IPAM",
    "image": "images/aias_speakers/terence-tao.png",
    "website": "https://www.math.ucla.edu/~tao/",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Terence Tao was born in Adelaide, Australia in 1975. He has been a professor of mathematics at UCLA since 1999, having completed his PhD under Elias Stein at Princeton in 1996. Tao\u2019s areas of research include harmonic analysis, PDE, combinatorics, and number theory. He has received a number of awards, including the Salem Prize in 2000, the Fields Medal in 2006, the MacArthur Fellowship in 2007, the Crafoord prize in 2012, and the Breakthrough Prize in Mathematics in 2015. Terence Tao also holds the James and Carol Collins chair in mathematics at UCLA, and is a Fellow of the Royal Society, the Australian Academy of Sciences, the National Academy of Sciences, and the American Academy of Arts and Sciences. From 2020-2024, he served on the President\u2019s Council of Advisors on Science and Technology."
  },
  "yejin-choi": {
    "slug": "yejin-choi",
    "name": "Dr. Yejin Choi",
    "badge": "Stanford HAI",
    "role": "HAI Professor of Computer Science",
    "affil": "MacArthur Fellow \u00b7 Stanford HAI & UW",
    "image": "images/aias_speakers/yejin-choi.png",
    "website": "https://homes.cs.washington.edu/~yejin/",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Yejin Choi is the Dieter Schwarz Foundation Professor and Senior Fellow at Stanford's Computer Science and Institute for Human-Centered AI (HAI). She is a MacArthur Fellow, AI2050 Senior Fellow, and was named to Time100 Most Influential People in AI (2023, 2025). Choi has received 2 Test-of-Time Awards and 10 Best/Outstanding Paper Awards at top AI conferences. She was a main stage speaker at TED 2023 and has delivered keynotes at several AI conferences including NeurIPS, ICLR, CVPR, ACL, and AAAI. Her research focuses on democratizing generative AI through smaller yet powerful language models, scaling intelligence via smarter algorithms, pluralistic alignment, and AI for science and social good. She received her Ph.D. in Computer Science at Cornell University and BS in Computer Engineering at Seoul National University in Korea."
  },
  "jeffrey-ullman": {
    "slug": "jeffrey-ullman",
    "name": "Dr. Jeffrey Ullman",
    "badge": "Stanford",
    "role": "SW Ascherman Prof. Emeritus",
    "affil": "Turing Award Laureate \u00b7 Stanford University",
    "image": "images/aias_speakers/jeffrey-ullman.png",
    "website": "http://infolab.stanford.edu/~ullman/",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Jeff Ullman is the Stanford W. Ascherman Professor of Engineering (Emeritus) in the Department of Computer Science at Stanford University. He received the B.S. degree from Columbia University in 1963 and the PhD from Princeton in 1966. Prior to his appointment at Stanford in 1979, he was a member of the technical staff of Bell Laboratories from 1966-1969, and on the faculty of Princeton University between 1969 and 1979. From 1990-1994, he was chair of the Stanford Computer Science Department. Ullman was elected to the National Academy of Engineering in 1989, the American Academy of Arts and Sciences in 2012, the National Academy of Science in 2020, and has held Guggenheim and Einstein Fellowships. He has received the Sigmod Contributions Award (1996), the ACM Karl V. Karlstrom Outstanding Educator Award (1998), the Knuth Prize (2000), the Sigmod E. F. Codd Innovations award (2006), the IEEE von Neumann medal (2010), the NEC C&C Foundation Prize (2017), and the ACM A.M. Turing Award (2020). He is the author of 16 books, including books on database systems, data mining, compilers, automata theory, and algorithms."
  },
  "toby-walsh": {
    "slug": "toby-walsh",
    "name": "Dr. Toby Walsh",
    "badge": "UNSW Sydney",
    "role": "Scientia Professor of AI",
    "affil": "Laureate Fellow \u00b7 UNSW Sydney",
    "image": "images/aias_speakers/toby-walsh.png",
    "website": "https://www.cse.unsw.edu.au/~tw/",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Toby Walsh is Laureate Fellow and Scientia Professor of Artificial Intelligence at the Department of Computer Science and Engineering at the University of New South Wales, research group leader at Data61, adjunct professor at QUT, external Professor of the Department of Information Science at Uppsala University, an honorary fellow of the School of Informatics at Edinburgh University and an Associate Member of the Australian Human Rights Institute at UNSW. \\n\\nHe was Editor-in-Chief of the Journal of Artificial Intelligence Research, and of AI Communications. He is on the editorial board of the Journal of the ACM, Journal of Automated Reasoning and the Constraints journal. He has been elected a fellow of the Australian Academy of Science, the Association of Computing Machinery (ACM), the American Association for the Advancement of Science, the Association for the Advancement of Artificial Intelligence, and the European Coordinating Committee for AI in recognition of his reseach in artificial intelligence and service to the community. He has won the NSW Premier's Prize for Excellende in Engineering and ICT, the Humbolt Award, the Research Excellence Award of the Association for Constraint Programming and the .IJCAI Donald E. Walker Distinguished Service Award. He has been Secretary of the Associtation for Constraint Programming (ACP) and is Editor of CP News, the newsletter of the ACP. He is one of the Editors of the Handbook for Constraint Programming, and the Handbook for Satisfiability. \\n\\nHe has been Program and Conference Chair of the main conferences in Constraint Programming, Automated Reasoning and Artificial Intelligence."
  },
  "jennifer-doudna": {
    "slug": "jennifer-doudna",
    "name": "Dr. Jennifer Doudna",
    "badge": "UC Berkeley",
    "role": "Nobel Laureate in Chemistry",
    "affil": "CRISPR Pioneer \u00b7 UC Berkeley & Gladstone",
    "image": "images/aias_speakers/jennifer_doudna.jpg",
    "website": "https://vcresearch.berkeley.edu/faculty/jennifer-doudna",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Dr. Jennifer Doudna was awarded the 2020 Nobel Prize in Chemistry for pioneering CRISPR-Cas9 genome editing technology. She is the Li Ka Shing Chancellor's Chair Professor in the Departments of Chemistry and Molecular and Cell Biology at UC Berkeley, and Senior Investigator at the Gladstone Institutes and Howard Hughes Medical Institute."
  },
  "david-baker": {
    "slug": "david-baker",
    "name": "Dr. David Baker",
    "badge": "Univ. of Washington",
    "role": "Nobel Laureate in Chemistry",
    "affil": "Director, IPD \u00b7 University of Washington",
    "image": "images/aias_speakers/david_baker.jpg",
    "website": "https://www.bakerlab.org/",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Dr. David Baker received the 2024 Nobel Prize in Chemistry for computational protein design. He is the Director of the Institute for Protein Design, Henrietta and Aubrey Davis Endowed Professor in Biochemistry at the University of Washington School of Medicine, and an Investigator at the Howard Hughes Medical Institute."
  },
  "omar-yaghi": {
    "slug": "omar-yaghi",
    "name": "Dr. Omar M. Yaghi",
    "badge": "UC Berkeley",
    "role": "Chair Professor of Chemistry",
    "affil": "Reticular Chemistry Pioneer \u00b7 UC Berkeley",
    "image": "images/aias_speakers/omar_yaghi.jpg",
    "website": "https://yaghi.berkeley.edu/",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Dr. Omar M. Yaghi is the James and Neeltje Tretter Chair Professor of Chemistry at UC Berkeley and Co-Director of the Kavli Energy NanoSciences Institute. He pioneered reticular chemistry, creating new classes of porous materials including Metal-Organic Frameworks (MOFs) and Covalent Organic Frameworks (COFs) for carbon capture and clean energy."
  },
  "chris-bishop": {
    "slug": "chris-bishop",
    "name": "Dr. Christopher Bishop",
    "badge": "Microsoft Research",
    "role": "Technical Fellow & Director",
    "affil": "FRS, FRSE \u00b7 Microsoft Research AI4Science",
    "image": "images/aias_speakers/chris_bishop.jpg",
    "website": "https://www.microsoft.com/en-us/research/people/cmbishop/",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Dr. Christopher Bishop, FRS, FRSE, is Technical Fellow and Director of Microsoft Research AI4Science. He is an internationally renowned scientist in artificial intelligence and machine learning, and author of the definitive textbooks Pattern Recognition and Machine Learning and Deep Learning: Foundations and Concepts."
  },
  "le-cong": {
    "slug": "le-cong",
    "name": "Dr. Le Cong",
    "badge": "Stanford",
    "role": "Assoc. Professor of Pathology & Genetics",
    "affil": "Genomics & Agentic AI \u00b7 Stanford University",
    "image": "images/aias_speakers/le-cong.png",
    "website": "https://profiles.stanford.edu/le-cong",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Dr. Cong's research program spans from foundational genome engineering to building agentic AI and autonomous laboratories for biomedical discovery. His group develops advanced technologies for large-scale genome editing and cell therapy, while also leveraging these tools for single-cell functional screening to probe the mechanisms of innate immunity in cancer and neuro-immune diseases. To accelerate these efforts, the team pioneers the integration of AI foundation models into biology. Recent innovations include RNAGenesis foundation model for generative design of RNA, CRISPR-GPT as an AI agent system that automates complex gene-editing workflows, and LabOS, an AI-XR co-scientist platform that embeds reasoning directly into physical laboratory. Alongside upcoming initiatives like the MedOS, the group is building a vision to unify computational design with robotic execution to turn the lab into a programmable, AI-native environment. \\n\\nThe team's work led to one of the first CRISPR/Cas9 gene-editing tools for in vivo gene therapy. More recently, his group invented tools for cleavage-free large gene insertion using novel recombination proteins (SSAP editor) and developed machine-learning optimized single-cell methods (DAISY) for studying complex immune diseases. These tools are also being deployed with collaborators to study stem cell regeneration and brain aging. \\n\\nDr. Cong is a recipient of the NHGRI Genomic Innovator Award, and a Baxter Foundation Faculty Scholar. He has also been recognized among the Genetic Engineering and Biotechnology News (GEN) Top 10 Under 40, Clinical OMICs Pioneers Under 40, and is a Clarivate Web of Science Highly Cited Researcher."
  },
  "karl-deisseroth": {
    "slug": "karl-deisseroth",
    "name": "Dr. Karl Deisseroth",
    "badge": "Stanford",
    "role": "Chen Professor of Bioengineering",
    "affil": "Optogenetics Pioneer \u00b7 Stanford University",
    "image": "images/aias_speakers/karl-deisseroth.png",
    "website": "https://med.stanford.edu/deisseroth-lab.html",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Karl Deisseroth is the D.H. Chen Professor of Bioengineering and of Psychiatry and Behavioral Sciences at Stanford University, and Investigator of the Howard Hughes Medical Institute. He received his undergraduate degree from Harvard, his PhD from Stanford, and his MD from Stanford. He also completed postdoctoral training, medical internship, and adult psychiatry residency at Stanford, and he is board-certified by the American Board of Psychiatry and Neurology. He continues as a practicing psychiatrist at Stanford with specialization in affective disorders and autism-spectrum disease, employing medications along with neural stimulation."
  },
  "kyunghyun-cho": {
    "slug": "kyunghyun-cho",
    "name": "Dr. Kyunghyun Cho",
    "badge": "NYU / Courant",
    "role": "Glen de Vries Professor",
    "affil": "Center for Data Science \u00b7 NYU",
    "image": "images/aias_speakers/kyunghyun-cho.png",
    "website": "https://kyunghyuncho.me/",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Kyunghyun Cho is the Glen de Vries Professor of Health Statistics and a professor of computer science and data science at New York University. He is also a CIFAR Fellow of Learning in Machines & Brains and an Associate Member of the National Academy of Engineering of Korea. Early 2021, he co-founded Prescient Design which was acquired by Genentech late 2021. Since then, he served as an Executive Director of Frontier Research and a Senior Fellow at Genentech until January 2026. He served as a (co-)Program Chair of ICLR 2020, NeurIPS 2022 and ICML 2022 and also on the boards of ICML and ICLR. He was one of the three founding Editors-in-Chief of the Transactions on Machine Learning Research (TMLR) until 2024. He was a research scientist at Facebook AI Research from June 2017 to May 2020 and a postdoctoral fellow at University of Montreal until Summer 2015 under the supervision of Prof. Yoshua Bengio, after receiving MSc and PhD degrees from Aalto University April 2011 and April 2014, respectively, under the supervision of Prof. Juha Karhunen, Dr. Tapani Raiko and Dr. Alexander Ilin. He received the Samsung Ho-Am Prize in Engineering in 2021. He tries his best to find a balance among machine learning, natural language processing, and life, but almost always fails to do so."
  },
  "rebecca-willett": {
    "slug": "rebecca-willett",
    "name": "Dr. Rebecca Willett",
    "badge": "Univ. of Chicago",
    "role": "Faculty Director of AI",
    "affil": "Data Science Institute \u00b7 Univ. of Chicago",
    "image": "images/aias_speakers/rebecca-willett.png",
    "website": "https://voices.uchicago.edu/willett/",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Rebecca Willett is a Professor of Statistics and Computer Science at the University of Chicago and Faculty Director of AI at the Data Science Institute. Her research is focused on machine learning, signal processing, and large-scale data science. She completed her PhD in Electrical and Computer Engineering at Rice University in 2005 and was an Assistant then tenured Associate Professor of Electrical and Computer Engineering at Duke University from 2005 to 2013. She was an Associate Professor of Electrical and Computer Engineering, Harvey D. Spangler Faculty Scholar, and Fellow of the Wisconsin Institutes for Discovery at the University of Wisconsin-Madison from 2013 to 2018. Willett received the National Science Foundation CAREER Award in 2007, is a member of the DARPA Computer Science Study Group, and received an Air Force Office of Scientific Research Young Investigator Program award in 2010. Willett has also held visiting researcher or faculty positions at the University of Nice in 2015, the Institute for Pure and Applied Mathematics at UCLA in 2004, the University of Wisconsin-Madison 2003-2005, the French National Institute for Research in Computer Science and Control (INRIA) in 2003, and the Applied Science Research and Development Laboratory at GE Healthcare in 2002."
  },
  "simon-du": {
    "slug": "simon-du",
    "name": "Dr. Simon Du",
    "badge": "UW / Apodex",
    "role": "Associate Professor of CS & Eng.",
    "affil": "Chief Scientist for Reasoning Models \u00b7 UW",
    "image": "images/aias_speakers/simon-du.png",
    "website": "https://simonshaoleidu.com/",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Simon Du is an associate professor in the Paul G. Allen School of Computer Science & Engineering at University of Washington. He is also a Chief Scientist for Reasoning Models at Apodex. His research interests are broadly in machine learning such as reinforcement learning, non-convex optimization, data synthesis and selection, and test-time compute."
  },
  "heng-ji": {
    "slug": "heng-ji",
    "name": "Dr. Heng Ji",
    "badge": "UIUC",
    "role": "Professor of Computer Science",
    "affil": "Natural Language Processing \u00b7 UIUC",
    "image": "images/aias_speakers/heng-ji.png",
    "website": "https://blender.cs.illinois.edu/hengji.html",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Heng Ji is a professor at Computer Science Department, and an affiliated faculty member at Electrical and Computer Engineering Department and Coordinated Science Laboratory of University of Illinois Urbana-Champaign. She is an Amazon Scholar. She is the Founding Director of Amazon-Illinois Center on AI for Interactive Conversational Experiences (AICE). She received her B.A. and M. A. in Computational Linguistics from Tsinghua University, and her M.S. and Ph.D. in Computer Science from New York University. Her research interests focus on Natural Language Processing, especially on Multimedia Multilingual Information Extraction, Knowledge-enhanced Large Language Models and Vision-Language Models. She was selected as a \\"
  },
  "sam-rodriques": {
    "slug": "sam-rodriques",
    "name": "Dr. Sam Rodriques",
    "badge": "FutureHouse",
    "role": "Director & CEO",
    "affil": "AI for Scientific Discovery \u00b7 FutureHouse",
    "image": "images/aias_speakers/sam-rodriques.png",
    "website": "https://futurehouse.org/",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "I am an inventor and entrepreneur. In 2023, I launched FutureHouse, a new research lab in San Francisco focused on building an AI Scientist. In 2025, we spun out Edison Scientific, a for-profit company focused on commercializing our AI agents. I was named one of Time Magazine's 100 most influential people in AI in 2025. I previously ran the Applied Biotechnology Lab at the Francis Crick Institute. Before that, I did my PhD at MIT. I am also interested in metascience, i.e., how we can create new institutions and organizations to facilitate scientific research. I proposed the Focused Research Organization model, which is now being used by a number of philanthropic funders and governments to facilitate scientific moonshots."
  },
  "christina-kim": {
    "slug": "christina-kim",
    "name": "Dr. Christina Kim",
    "badge": "Princeton",
    "role": "Assistant Professor",
    "affil": "Omenn-Darling Bioengineering \u00b7 Princeton",
    "image": "images/aias_speakers/christina-kim.png",
    "website": "https://kimlab.princeton.edu/",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Tina received her AB in Molecular Biology from Princeton University in 2011, and her Ph.D. in Neuroscience from Stanford University in 2017 with Karl Deisseroth. She completed her postdoctoral training with Alice Ting at Stanford in 2021."
  },
  "kafui-dzirasa": {
    "slug": "kafui-dzirasa",
    "name": "Dr. Kafui Dzirasa",
    "badge": "Duke University",
    "role": "Presidential Distinguished Prof.",
    "affil": "Neurobiology & Bioengineering \u00b7 Duke",
    "image": "images/aias_speakers/kafui-dzirasa.png",
    "website": "https://dzirasalab.org/",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Kafui Dzirasa  is an American psychiatrist and Associate Professor at Duke University. He looks to understand the relationship between neural circuit malfunction and mental illness. He was a 2019 AAAS Leshner Fellow and was elected Fellow of the National Academy of Medicine in 2021."
  },
  "ying-diao": {
    "slug": "ying-diao",
    "name": "Dr. Ying Diao",
    "badge": "UIUC",
    "role": "Professor of Chemical Engineering",
    "affil": "Molecule Maker Lab Institute \u00b7 UIUC",
    "image": "images/aias_speakers/ying-diao.png",
    "website": "https://diaogroup.web.illinois.edu/",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Ying Diao is a Professor, University Scholar, LAS Dean\u2019s Distinguished Professorial Scholar and Dow Chemical Company Faculty Scholar in Department of Chemical and Biomolecular Engineering at University of Illinois at Urbana-Champaign. She serves as the Co-Chair of Molecular Science and Engineering in the Beckman Institute of Advanced Science and Technology, and a Thrust Lead of the Molecular Maker Lab Institute \u2013 an NSF AI Institute. She received her Ph.D. degree in Chemical Engineering from MIT in 2012. Her doctoral thesis was on understanding heterogeneous nucleation of pharmaceuticals by designing polymeric substrates. In her subsequent postdoctoral training at Stanford University, she pursued research in the thriving field of printed electronics. Diao group, started in 2015 at Illinois, focuses on understanding assembly of organic functional materials and innovating printing approaches that enable structural control down to the molecular and nanoscale. She has over 120 publications which have been cited ~ 11,000 times. Her work has been frequently featured in scientific journals and news media. She is named to the MIT Technology Review\u2019s annual list of Innovators Under 35 as a pioneer in nanotechnology and materials. She is also a recipient of NSF CAREER Award, NASA Early Career Faculty Award, 3M Non-Tenured Faculty Award, AIChE Allan P. Colburn Award, AIChE Owens Corning Early Career Award and was selected as a Sloan Research Fellow in Chemistry as one of the \u201cvery best scientific minds working today\u201d. In 2025, she received the Presidential Early Career Awards for Scientists and Engineers from President Biden."
  },
  "shannon-wiltsey-stirman": {
    "slug": "shannon-wiltsey-stirman",
    "name": "Dr. Shannon Wiltsey Stirman",
    "badge": "Stanford",
    "role": "Professor of Psychiatry",
    "affil": "Public Mental Health \u00b7 Stanford Medicine",
    "image": "images/aias_speakers/shannon-wiltsey-stirman.png",
    "website": "https://profiles.stanford.edu/shannon-wiltsey-stirman",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Shannon Wiltsey Stirman is a Professor in the Department of Psychiatry and Behavioral Sciences at Stanford and a Psychologist at the National Center for PTSD's Dissemination and Training Division. She is the co-director of the Center for Responsible and Effective AI Technology Enhancement for PTSD Treatment (CREATE). Areas of research emphasis include implementation science (particularly training, fidelity, adaptation and sustainment), evidence-based treatment for PTSD, depression, suicide prevention, and use of technology to support access to evidence-based mental health interventions. As a co-lead of the Department of Psychiatry and Behavioral Science's Mental Health Innovation and Technology Hub, she worked with a team at Stanford to develop Pause a Moment, a digital wellbeing program for healthcare workers who experience COVID-19 stressors (pam.stanford.edu). \\n\\nMost recently, she has been working on the use of Large Language Models to support evidence-based mental health interventions. She is the co-author of Getting Unstuck from PTSD: Using Cognitive Processing Therapy to Guide Your Recovery. She has served on the Board of Directors for the American Psychological Association and as the Chair of the Established Network of Expertise for the Society for Implementation Research Collaboration. She was awarded the Association of Behavior and Cognitive Therapy's Mid-Career Innovator award in 2018. Her research has been funded by the National Institute of Mental Health, VA QUERI, private foundations, and the Canadian Institute for Health Research."
  },
  "maxim-topaz": {
    "slug": "maxim-topaz",
    "name": "Dr. Maxim Topaz",
    "badge": "Columbia Univ.",
    "role": "Elizabeth Standish Gill Assoc. Prof.",
    "affil": "Health Informatics \u00b7 Columbia University",
    "image": "images/aias_speakers/maxim-topaz.png",
    "website": "https://www.nursing.columbia.edu/profile/maxim-topaz",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "Maxim Topaz's research focuses on improving human health via cutting-edge technologies. His team develops artificial intelligence solutions that help health providers to provide best care for their patients. Specifically, they developed an open source natural language processing software(link is external and opens in a new window) called NimlbeMiner(link is external and opens in a new window) that clinicians and researchers can use to mine millions of patient records. In addition, his team is developing and implementing several clinical decision support tools. For example, they are currently testing(link is external and opens in a new window) a patient prioritization tool PREVENT(link is external and opens in a new window) that assists with identifying high risk patients during hospital to homecare transitions.\u00a0In another\u00a0study(link is external and opens in a new window), they are using Artificial Intelligence to create personalized models of risk for preventable hospitalization and\u00a0emergency department visits in homecare(link is external and opens in a new window). Overall, he published more than\u00a0100 articles(link is external and opens in a new window)\u00a0on topics related to data science and informatics."
  },
  "james-zou": {
    "slug": "james-zou",
    "name": "Dr. James Zou",
    "badge": "Stanford",
    "role": "Assoc. Professor of Biomedical DS",
    "affil": "AI in Biomedicine \u00b7 Stanford University",
    "image": "images/aias_speakers/james-zou.png",
    "website": "https://www.james-zou.com/",
    "aias_link": "https://www.aiasplus.org/#speakers",
    "bio": "I am an Associate Professor of Biomedical Data Science and, by courtesy, of Computer Science and Electrical Engineering at Stanford University. I work on making AI more reliable, human-compatible and statistically rigorous, and am especially interested in applications in human disease and health. I received my Ph.D from Harvard in 2014, and was at one time a member of Microsoft Research, a Gates Scholar at Cambridge and a Simons fellow at U.C. Berkeley. I joined Stanford in 2016 and am excited to also be a Chan-Zuckerberg Investigator. We are also a part of the Stanford AI Lab. My research is supported by two Chan-Zuckerberg Biohub Investigator Awards, the Sloan Fellowship, the NSF CAREER Award, a Top Ten Clinical Achievement Award and faculty awards from Google, Adobe and Amazon."
  }
};

  function openSpeakerModal(slug) {
    const speaker = aiasSpeakersDatabase[slug];
    if (!speaker) return;

    if (speakerModalPhoto) {
      speakerModalPhoto.src = speaker.image;
      speakerModalPhoto.alt = speaker.name;
    }
    if (speakerModalName) {
      speakerModalName.textContent = speaker.name;
    }
    if (speakerModalAffil) {
      speakerModalAffil.textContent = speaker.affil;
    }
    if (speakerModalBio) {
      speakerModalBio.textContent = speaker.bio;
    }
    if (speakerModalAiasLink) {
      speakerModalAiasLink.href = speaker.aias_link || "https://www.aiasplus.org/#speakers";
    }

    if (speakerModalWebLink) {
      if (speaker.website) {
        speakerModalWebLink.href = speaker.website;
        speakerModalWebLink.style.display = "inline-flex";
      } else {
        speakerModalWebLink.style.display = "none";
      }
    }

    if (speakerModalBackdrop) {
      speakerModalBackdrop.classList.add("active");
      speakerModalBackdrop.setAttribute("aria-hidden", "false");
    }
    document.body.style.overflow = "hidden";
  }

  function closeSpeakerModal() {
    if (!speakerModalBackdrop) return;
    speakerModalBackdrop.classList.remove("active");
    speakerModalBackdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (speakerModalCloseBtn) {
    speakerModalCloseBtn.addEventListener("click", closeSpeakerModal);
  }

  if (speakerModalBackdrop) {
    speakerModalBackdrop.addEventListener("click", (e) => {
      if (e.target === speakerModalBackdrop) {
        closeSpeakerModal();
      }
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && speakerModalBackdrop && speakerModalBackdrop.classList.contains("active")) {
      closeSpeakerModal();
    }
  });

  // Delegate clicks on any speaker card / name / button with data-speaker-slug
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-speaker-slug]");
    if (trigger && !hasMoved) {
      // Do not intercept if clicking the academic website icon link specifically
      if (e.target.closest(".icon-link")) return;

      const slug = trigger.getAttribute("data-speaker-slug");
      if (slug && aiasSpeakersDatabase[slug]) {
        e.preventDefault();
        e.stopPropagation();
        openSpeakerModal(slug);
      }
    }
  });

});
