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