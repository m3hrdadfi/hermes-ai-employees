(() => {
  'use strict';

  document.getElementById('year').textContent = new Date().getFullYear();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = [...document.querySelectorAll('[data-reveal]')];

  if (reduceMotion) {
    reveals.forEach((element) => element.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
    reveals.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      revealObserver.observe(element);
    });
  }

  const status = document.getElementById('live-status');
  const messages = [
    'Mapping competitor signals',
    'Drafting three content angles',
    'Packaging creator briefs',
    'Qualifying lead opportunities',
    'Updating operating memory'
  ];
  let statusIndex = 0;
  if (!reduceMotion) {
    window.setInterval(() => {
      status.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }], { duration: 520 });
      statusIndex = (statusIndex + 1) % messages.length;
      window.setTimeout(() => { status.textContent = messages[statusIndex]; }, 250);
    }, 2900);
  }

  const process = document.querySelector('[data-process]');
  const progress = document.querySelector('.process-progress');
  const updateProgress = () => {
    if (!process || !progress) return;
    const rect = process.getBoundingClientRect();
    const start = window.innerHeight * 0.78;
    const end = window.innerHeight * 0.28;
    const value = Math.max(0, Math.min(1, (start - rect.top) / (start - end + rect.height * 0.25)));
    progress.style.width = `${value * 100}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.magnetic').forEach((element) => {
      element.addEventListener('mousemove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.13;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
        element.style.transform = `translate(${x}px, ${y}px)`;
      });
      element.addEventListener('mouseleave', () => { element.style.transform = ''; });
    });
  }

  const canvas = document.getElementById('signal-field');
  const context = canvas.getContext('2d');
  let points = [];
  let frame;

  const sizeCanvas = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(42, Math.max(18, Math.floor(window.innerWidth / 34)));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.2 + 0.35
    }));
  };

  const drawField = () => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    points.forEach((point, index) => {
      point.x += point.vx;
      point.y += point.vy;
      if (point.x < -20 || point.x > window.innerWidth + 20) point.vx *= -1;
      if (point.y < -20 || point.y > window.innerHeight + 20) point.vy *= -1;

      context.beginPath();
      context.arc(point.x, point.y, point.r, 0, Math.PI * 2);
      context.fillStyle = 'rgba(16,16,15,.55)';
      context.fill();

      for (let next = index + 1; next < points.length; next += 1) {
        const other = points[next];
        const distance = Math.hypot(point.x - other.x, point.y - other.y);
        if (distance < 145) {
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(other.x, other.y);
          context.strokeStyle = `rgba(16,16,15,${(1 - distance / 145) * 0.14})`;
          context.lineWidth = 0.6;
          context.stroke();
        }
      }
    });
    frame = window.requestAnimationFrame(drawField);
  };

  sizeCanvas();
  if (!reduceMotion) drawField();
  window.addEventListener('resize', () => {
    window.cancelAnimationFrame(frame);
    sizeCanvas();
    if (!reduceMotion) drawField();
  }, { passive: true });
})();
