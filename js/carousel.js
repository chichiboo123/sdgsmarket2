let currentSlide = 0;
let carouselTimer = null;
let carouselPaused = false;
const SLIDE_COUNT = 3;
const SLIDE_INTERVAL = 6000;

function initCarousel() {
  goToSlide(0);
  startCarouselTimer();

  const carousel = document.getElementById('carousel');
  if (!carousel) return;

  document.getElementById('carousel-prev')?.addEventListener('click', (e) => {
    e.stopPropagation();
    goToSlide((currentSlide - 1 + SLIDE_COUNT) % SLIDE_COUNT);
    resetCarouselTimer();
  });

  document.getElementById('carousel-next')?.addEventListener('click', (e) => {
    e.stopPropagation();
    goToSlide((currentSlide + 1) % SLIDE_COUNT);
    resetCarouselTimer();
  });

  document.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(Number(dot.dataset.idx));
      resetCarouselTimer();
    });
  });

  // Pause on hover/focus
  carousel.addEventListener('mouseenter', () => { carouselPaused = true; });
  carousel.addEventListener('mouseleave', () => { carouselPaused = false; });
  carousel.addEventListener('focusin', () => { carouselPaused = true; });
  carousel.addEventListener('focusout', () => { carouselPaused = false; });

  // Pause when tab is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(carouselTimer);
      carouselTimer = null;
    } else if (!carouselTimer) {
      startCarouselTimer();
    }
  });

  // Keyboard navigation
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToSlide((currentSlide - 1 + SLIDE_COUNT) % SLIDE_COUNT);
      resetCarouselTimer();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToSlide((currentSlide + 1) % SLIDE_COUNT);
      resetCarouselTimer();
    } else if (e.key === 'Enter' || e.key === ' ') {
      const slide = e.target.closest('.slide');
      if (slide && slide.dataset.action) {
        e.preventDefault();
        slide.click();
      }
    }
  });

  // Swipe support
  let touchStartX = 0;
  let touchStartY = 0;
  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  carousel.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goToSlide((currentSlide + 1) % SLIDE_COUNT);
      else goToSlide((currentSlide - 1 + SLIDE_COUNT) % SLIDE_COUNT);
      resetCarouselTimer();
    }
  }, { passive: true });
}

function goToSlide(idx) {
  currentSlide = idx;
  const track = document.getElementById('carousel-track');
  if (track) track.style.transform = `translateX(-${idx * 100}%)`;
  document.querySelectorAll('.dot').forEach((dot, i) => {
    const active = i === idx;
    dot.classList.toggle('active', active);
    dot.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('#carousel-track .slide').forEach((slide, i) => {
    slide.setAttribute('aria-hidden', String(i !== idx));
    if (i !== idx) slide.setAttribute('tabindex', '-1');
    else slide.setAttribute('tabindex', '0');
  });
}

function startCarouselTimer() {
  carouselTimer = setInterval(() => {
    if (carouselPaused) return;
    goToSlide((currentSlide + 1) % SLIDE_COUNT);
  }, SLIDE_INTERVAL);
}

function resetCarouselTimer() {
  clearInterval(carouselTimer);
  startCarouselTimer();
}
