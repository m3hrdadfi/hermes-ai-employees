(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer:fine)').matches;

  $('#year').textContent = new Date().getFullYear();

  // Reveal content as it enters the viewport.
  const reveals = $$('[data-reveal]');
  if (reduceMotion) {
    reveals.forEach((element) => element.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
    reveals.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      revealObserver.observe(element);
    });
  }

  // Hero status cycles through real workflow states.
  const status = $('#live-status');
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

  // Page progress, section-aware navigation, and process progress share one scroll frame.
  const pageProgress = $('.page-progress i');
  const process = $('[data-process]');
  const processProgress = $('.process-progress');
  const navLinks = $$('.nav-shell nav a');
  const navSections = navLinks.map((link) => $(link.getAttribute('href'))).filter(Boolean);
  let scrollFrame = null;

  const updateScrollUI = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    pageProgress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;

    if (process && processProgress) {
      const rect = process.getBoundingClientRect();
      const start = window.innerHeight * 0.78;
      const end = window.innerHeight * 0.28;
      const value = Math.max(0, Math.min(1, (start - rect.top) / (start - end + rect.height * 0.25)));
      processProgress.style.width = `${value * 100}%`;
    }

    let current = null;
    navSections.forEach((section) => {
      if (section.getBoundingClientRect().top <= window.innerHeight * 0.34) current = section;
    });
    navLinks.forEach((link) => {
      const active = Boolean(current && link.hash === `#${current.id}`);
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    scrollFrame = null;
  };

  window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollUI);
  }, { passive: true });
  updateScrollUI();

  // Tactile pointer interactions: magnetic CTAs, tilt cards, and a responsive agent orbit.
  if (!reduceMotion && finePointer) {
    $$('.magnetic').forEach((element) => {
      element.addEventListener('mousemove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.13;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
        element.style.transform = `translate(${x}px, ${y}px)`;
      });
      element.addEventListener('mouseleave', () => { element.style.transform = ''; });
    });

    $$('.output-card').forEach((card) => {
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const rx = ((event.clientY - rect.top) / rect.height - 0.5) * -7;
        const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
        card.style.setProperty('--rx', `${rx}deg`);
        card.style.setProperty('--ry', `${ry}deg`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });

    const orbit = $('.agent-orbit');
    orbit.addEventListener('mousemove', (event) => {
      const rect = orbit.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 13;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 13;
      $('.agent-core', orbit).style.transform = `translate(${x}px, ${y}px)`;
      $$('.orbit-node', orbit).forEach((node, index) => {
        const depth = (index % 2 ? -1 : 1) * 0.55;
        node.style.marginLeft = `${x * depth}px`;
        node.style.marginTop = `${y * depth}px`;
      });
    });
    orbit.addEventListener('mouseleave', () => {
      $('.agent-core', orbit).style.transform = '';
      $$('.orbit-node', orbit).forEach((node) => { node.style.margin = ''; });
    });
  }

  // Interactive agent lab.
  let selectedRole = 'Content Operator';
  let selectedOutput = 'Carousel system';
  const selectedRoleLabel = $('[data-selected-role]');
  const selectedOutputLabel = $('[data-selected-output]');
  const runButton = $('[data-run-agent]');
  const consoleBox = $('.lab-console');
  const consoleLines = $$('.console-line');
  const consoleMeter = $('[data-console-meter]');
  const consoleResult = $('[data-console-result] strong');
  const stageCopy = [
    'Brand memory ready',
    'Public signals mapped',
    'Draft assembled',
    'Quality checks passed',
    'Review package ready'
  ];

  const bindChoices = (containerSelector, onSelect) => {
    $$(containerSelector + ' button').forEach((button) => {
      button.addEventListener('click', () => {
        $$(containerSelector + ' button').forEach((item) => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        onSelect(button.dataset.value);
      });
    });
  };

  bindChoices('[data-role-options]', (value) => {
    selectedRole = value;
    selectedRoleLabel.textContent = value;
    consoleResult.textContent = 'Role updated — ready to run';
  });
  bindChoices('[data-output-options]', (value) => {
    selectedOutput = value;
    selectedOutputLabel.textContent = value;
    consoleResult.textContent = 'Output updated — ready to run';
  });

  let simulationRunning = false;
  runButton.addEventListener('click', async () => {
    if (simulationRunning) return;
    simulationRunning = true;
    const runRole = selectedRole;
    const runOutput = selectedOutput;
    const choiceButtons = $$('.lab-control .choice');
    runButton.disabled = true;
    choiceButtons.forEach((button) => { button.disabled = true; });
    runButton.firstChild.textContent = 'Agent running ';
    consoleBox.classList.remove('complete');
    consoleMeter.style.width = '0%';
    consoleLines.forEach((line, index) => {
      line.classList.toggle('done', index === 0);
      line.classList.remove('running');
      $('em', line).textContent = index === 0 ? stageCopy[0] : 'Queued';
    });
    consoleResult.textContent = `${runRole} is starting…`;

    const delay = reduceMotion ? 60 : 430;
    for (let index = 1; index < consoleLines.length; index += 1) {
      const line = consoleLines[index];
      line.classList.add('running');
      $('em', line).textContent = index === 1 ? `Researching for ${runOutput.toLowerCase()}` : 'Processing';
      consoleMeter.style.width = `${index * 20}%`;
      await new Promise((resolve) => window.setTimeout(resolve, delay));
      line.classList.remove('running');
      line.classList.add('done');
      $('em', line).textContent = stageCopy[index];
    }

    consoleMeter.style.width = '100%';
    consoleResult.textContent = `${runOutput} ready for human review`;
    consoleBox.classList.add('complete');
    runButton.firstChild.textContent = 'Run again ';
    runButton.disabled = false;
    choiceButtons.forEach((button) => { button.disabled = false; });
    simulationRunning = false;
  });

  // Booking dialog keeps every CTA useful while preserving a no-JS fallback.
  const dialog = $('.booking-dialog');
  const bookingContinue = $('[data-booking-continue]');
  let bookingTopic = 'Content production';
  $$('[data-book-call]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (typeof dialog.showModal !== 'function') return;
      event.preventDefault();
      dialog.showModal();
    });
  });
  $('[data-close-dialog]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  $$('[data-booking-options] button').forEach((button) => {
    button.addEventListener('click', () => {
      bookingTopic = button.dataset.value;
      $$('[data-booking-options] button').forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      bookingContinue.href = `https://github.com/m3hrdadfi/hermes-ai-employees/issues/new?template=book-a-call.yml&title=${encodeURIComponent(`Build call — ${bookingTopic}`)}`;
    });
  });

  // Pointer-reactive signal field.
  const canvas = $('#signal-field');
  const context = canvas.getContext('2d');
  const pointer = { x: -1000, y: -1000 };
  let points = [];
  let frame;

  window.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { pointer.x = -1000; pointer.y = -1000; });

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
      const pointerDistance = Math.hypot(point.x - pointer.x, point.y - pointer.y);
      if (pointerDistance < 130 && pointerDistance > 1) {
        point.x += ((point.x - pointer.x) / pointerDistance) * 0.7;
        point.y += ((point.y - pointer.y) / pointerDistance) * 0.7;
      }
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
    updateScrollUI();
    if (!reduceMotion) drawField();
  }, { passive: true });
})();
