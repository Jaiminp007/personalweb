function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("open");
  }

  function scrollToSection() {
    document.getElementById("contact").scrollIntoView({
      behavior: "smooth"
    });
  }
  
  function handleScrollAnimation() {
    const elements = document.querySelectorAll('.fade-in');
    
    elements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('appear');
      } else {
        element.classList.remove('appear');
      }
    });
  }
  
  window.addEventListener('scroll', handleScrollAnimation);
  window.addEventListener('load', handleScrollAnimation);

  // Carousel functionality
  document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.getElementById('projects-carousel');
    const projects = carousel.querySelectorAll('.details-container');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.carousel-dots');
    
    let currentIndex = 0;
    const totalProjects = projects.length;
    const projectsPerView = 3;
    let isTransitioning = false;
    
    // Create dots for each visible project set
    const totalDots = totalProjects - projectsPerView + 1;
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        if (!isTransitioning) goToSlide(i);
      });
      dotsContainer.appendChild(dot);
    }
    
    const dots = dotsContainer.querySelectorAll('.dot');
    
    function updateDots() {
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    }
    
    function goToSlide(index) {
      if (isTransitioning) return;
      isTransitioning = true;
      
      currentIndex = index;
      
      // Calculate exact width of one project including its gap
      const projectWidth = projects[0].offsetWidth;
      const gap = parseInt(window.getComputedStyle(carousel).getPropertyValue('gap'));
      const totalProjectWidth = projectWidth + gap;
      
      // Apply transform with exact positioning
      const offset = -(currentIndex * totalProjectWidth);
      carousel.style.transform = `translateX(${offset}px)`;
      
      updateDots();
      
      // Update visibility for better performance
      projects.forEach((project, i) => {
        if (i >= currentIndex && i < currentIndex + projectsPerView) {
          project.style.opacity = '1';
          project.style.visibility = 'visible';
        } else {
          project.style.opacity = '0';
          project.style.visibility = 'hidden';
        }
      });
      
      setTimeout(() => {
        isTransitioning = false;
      }, 500);
    }
    
    function nextSlide() {
      if (isTransitioning) return;
      if (currentIndex < totalProjects - projectsPerView) {
        currentIndex++;
      } else {
        currentIndex = 0;
      }
      goToSlide(currentIndex);
    }
    
    function prevSlide() {
      if (isTransitioning) return;
      if (currentIndex > 0) {
        currentIndex--;
      } else {
        currentIndex = totalProjects - projectsPerView;
      }
      goToSlide(currentIndex);
    }
    
    // Event listeners
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isTransitioning) nextSlide();
    });
    
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isTransitioning) prevSlide();
    });
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        goToSlide(currentIndex);
      }, 250);
    });
    
    // Initialize the carousel
    goToSlide(0);
  });

  // Ticker shows tech stacks with colored symbol pills; cards show symbol + language chips
  document.addEventListener('DOMContentLoaded', function() {
    // Helper: deterministic PRNG for repeatable values across reloads
    function xorshift32(seed) {
      let x = seed | 0;
      return function() {
        x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
        // Convert to [0,1)
        return ((x >>> 0) / 4294967296);
      };
    }

    function hashCode(str) {
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = (h * 16777619) >>> 0; // FNV-1a like
      }
      return h;
    }

    function makeSymbol(title) {
      const letters = title.replace(/[^A-Za-z]/g, '').toUpperCase();
      if (!letters) return 'PRJ';
      const parts = letters.split(/\s+/).filter(Boolean);
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0] + (parts[2]?.[0] || '')).slice(0,4);
      }
      return letters.slice(0,4);
    }

    // Removed sparkline/series generation; switching to language tags

    // Build ticker items and inject meta per card
    const projectCards = document.querySelectorAll('#projects-carousel .details-container');
    const tickerTrack = document.querySelector('#stock-ticker .ticker-track');
    const items = [];

    // Static ticker entries requested (navbar ticker)
    const staticTicker = [
      { sym: 'RESE', label: 'Research' , pill: 'pill-rese', chips: ['Research'] },
      { sym: 'LOGI', label: 'HTML/CSS/JS', pill: 'pill-logi', chips: ['HTML/CSS/JS'] },
      { sym: 'NNRE', label: 'n8n / Node.js', pill: 'pill-nnre', chips: ['n8n','Node.js'] },
      { sym: 'EDIT', label: 'JS', pill: 'pill-edit', chips: ['JS'] },
      { sym: 'ALGO', label: 'Python / AI', pill: 'pill-algo', chips: ['Python','AI'] },
      { sym: 'MOOD', label: 'MoodMate', pill: 'pill-mood', chips: ['Python','Flask'] },
      { sym: 'BLOC', label: 'Blockchain Viz', pill: 'pill-bloc', chips: ['JS','D3.js'] },
      { sym: 'BUDG', label: 'BudgeBuddy', pill: 'pill-budg', chips: ['React Native'] },
    ];

    // Map specific projects to pill classes for colored card meta
    function symbolPillFor(title) {
      const t = title.toLowerCase();
      if (t.includes('research')) return 'pill-rese';
      if (t.includes('login')) return 'pill-logi';
      if (t.includes('n8n')) return 'pill-nnre';
  if (t.includes('edith')) return 'pill-edit';
  if (t.includes('mood')) return 'pill-mood';
  if (t.includes('blockchain') || t.includes('visual')) return 'pill-bloc';
  if (t.includes('budg')) return 'pill-budg';
      if (t.includes('algo')) return 'pill-algo';
      return 'pill-generic';
    }

    projectCards.forEach((card) => {
      const titleEl = card.querySelector('.project-title, .project-title-small');
      const title = titleEl ? titleEl.textContent.trim() : 'Project';
      const seed = hashCode(title);
      const rand = xorshift32(seed);
      const symbol = makeSymbol(title);
      const languages = inferLanguages(title, card);

      // Inject meta row
      const meta = document.createElement('div');
      meta.className = 'stock-meta';
      const pill = symbolPillFor(title);
      meta.innerHTML = `
        <span class="symbol-pill ${pill}">${symbol}</span>
        <span class="ticker-lang">${languages.map(l => `<span class="chip">${l}</span>`).join('')}</span>
      `;
      const imgContainer = card.querySelector('.article-container');
      if (imgContainer) imgContainer.after(meta);

      // Save ticker item with languages
      items.push({ symbol, languages });
    });

    // Populate the marquee-like ticker by duplicating items to loop
    if (tickerTrack) {
      const renderStatic = () => staticTicker.map(t => `
        <span class="ticker-item">
          <span class="symbol-pill ${t.pill}">${t.sym}</span>
          <span class="ticker-lang">${t.chips.map(c => `<span class=\"chip\">${c}</span>`).join('')}</span>
        </span>
      `).join('');
      // Duplicate for seamless marquee
      tickerTrack.innerHTML = renderStatic() + renderStatic();
    }

    function inferLanguages(title, card) {
      const t = title.toLowerCase();
      const text = (title + ' ' + card.innerText).toLowerCase();
      const langs = [];
      const add = (l) => { if (!langs.includes(l)) langs.push(l); };

      // Project-specific hints
      if (t.includes('algoclash')) { add('Python'); add('AI'); }
      if (t.includes('moodmate')) { add('Python'); add('Flask'); }
      if (t.includes('blockchain')) { add('JS'); add('D3.js'); }
      if (t.includes('budgebuddy') || t.includes('budgetbuddy')) { add('React Native'); }
      if (t.includes('login')) { add('HTML/CSS/JS'); }
  if (t.includes('n8n')) { add('n8n'); add('Node.js'); }
      if (t.includes('edith')) { add('JS'); }
      if (t.includes('research')) { add('Research'); }

      // Generic keyword matches
      if (/react native|expo/.test(text)) add('React Native');
      if (/react|jsx|next\.js/.test(text)) add('React');
      if (/node|express/.test(text)) add('Node.js');
      if (/python/.test(text)) add('Python');
      if (/flask|django|fastapi/.test(text)) add('Flask');
      if (/d3|visuali[sz]ation/.test(text)) add('D3.js');
      if (/html|css|javascript/.test(text)) add('HTML/CSS/JS');

      if (!langs.length) add('JS');
      return langs.slice(0,3);
    }
  });