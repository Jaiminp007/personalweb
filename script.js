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