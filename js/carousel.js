let currentSlide = 0;
let carouselTimer = null;
const SLIDE_COUNT = 3;
const SLIDE_INTERVAL = 6000;

function initCarousel() {
  goToSlide(0);
  startCarouselTimer();

  document.getElementById('carousel-prev').addEventListener('click', () => {
    goToSlide((currentSlide - 1 + SLIDE_COUNT) % SLIDE_COUNT);
    resetCarouselTimer();
  });

  document.getElementById('carousel-next').addEventListener('click', () => {
    goToSlide((currentSlide + 1) % SLIDE_COUNT);
    resetCarouselTimer();
  });

  document.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(Number(dot.dataset.idx));
      resetCarouselTimer();
    });
  });
}

function goToSlide(idx) {
  currentSlide = idx;
  const track = document.getElementById('carousel-track');
  track.style.transform = `translateX(-${idx * 100}%)`;
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
  });
}

function startCarouselTimer() {
  carouselTimer = setInterval(() => {
    goToSlide((currentSlide + 1) % SLIDE_COUNT);
  }, SLIDE_INTERVAL);
}

function resetCarouselTimer() {
  clearInterval(carouselTimer);
  startCarouselTimer();
}
