(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  $('#year').textContent = new Date().getFullYear();

  const main = $('#main');
  $('.skip-link').addEventListener('click', (event) => {
    event.preventDefault();
    main.focus({ preventScroll: true });
    main.scrollIntoView({ behavior: 'auto', block: 'start' });
  });

  const restoreHashPosition = () => {
    if (!window.location.hash) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = document.getElementById(id);
    if (!target) return;
    window.requestAnimationFrame(() => target.scrollIntoView({ behavior: 'auto', block: 'start' }));
  };

  window.addEventListener('load', restoreHashPosition, { once: true });
  window.addEventListener('hashchange', restoreHashPosition);
  if (document.fonts?.ready) document.fonts.ready.then(restoreHashPosition);

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
    }, { threshold: 0.14, rootMargin: '0px 0px -3% 0px' });

    reveals.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
      revealObserver.observe(element);
    });
  }

  const navLinks = $$('.nav-shell nav a');
  const navSections = navLinks
    .map((link) => $(link.getAttribute('href')))
    .filter(Boolean);

  const setActiveNavigation = (section) => {
    navLinks.forEach((link) => {
      const active = Boolean(section && link.hash === `#${section.id}`);
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveNavigation(visible.target);
  }, { rootMargin: '-24% 0px -64% 0px', threshold: [0, .1, .25, .5] });

  navSections.forEach((section) => sectionObserver.observe(section));

  const status = $('#live-status');
  const messages = [
    'Mapping competitor signals',
    'Drafting content angles',
    'Packaging creator briefs',
    'Qualifying lead opportunities',
    'Updating operating memory'
  ];
  let statusIndex = 0;
  if (!reduceMotion) {
    window.setInterval(() => {
      status.animate(
        [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' }
      );
      statusIndex = (statusIndex + 1) % messages.length;
      window.setTimeout(() => { status.textContent = messages[statusIndex]; }, 250);
    }, 3200);
  }

  if (!reduceMotion && finePointer) {
    $$('.magnetic').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * .12;
        const y = (event.clientY - rect.top - rect.height / 2) * .15;
        element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      element.addEventListener('pointerleave', () => { element.style.transform = ''; });
    });

    const heroArt = $('.hero-art-frame');
    const heroImage = $('.hero-art img');
    heroArt.addEventListener('pointermove', (event) => {
      const rect = heroArt.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 18;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 18;
      heroImage.style.transform = `translate(calc(-50% + ${x}px), calc(-49% + ${y}px))`;
    });
    heroArt.addEventListener('pointerleave', () => { heroImage.style.transform = ''; });
  }

  let selectedRole = 'Content Operator';
  let selectedOutput = 'Carousel system';
  const selectedRoleLabel = $('[data-selected-role]');
  const selectedOutputLabel = $('[data-selected-output]');
  const runButton = $('[data-run-agent]');
  const runtime = $('.lab-runtime');
  const consoleLines = $$('.console-line');
  const consoleResult = $('[data-console-result] strong');
  const stageCopy = [
    'Brand context ready',
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
    consoleResult.textContent = 'Role updated. Ready to run.';
  });

  bindChoices('[data-output-options]', (value) => {
    selectedOutput = value;
    selectedOutputLabel.textContent = value;
    consoleResult.textContent = 'Output updated. Ready to run.';
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
    runtime.classList.remove('complete');

    consoleLines.forEach((line, index) => {
      line.classList.toggle('done', index === 0);
      line.classList.remove('running');
      $('em', line).textContent = index === 0 ? stageCopy[0] : 'Queued';
    });
    consoleResult.textContent = `${runRole} is starting.`;

    const delay = reduceMotion ? 50 : 440;
    for (let index = 1; index < consoleLines.length; index += 1) {
      const line = consoleLines[index];
      line.classList.add('running');
      $('em', line).textContent = index === 1 ? `Researching for ${runOutput.toLowerCase()}` : 'Processing';
      await new Promise((resolve) => window.setTimeout(resolve, delay));
      line.classList.remove('running');
      line.classList.add('done');
      $('em', line).textContent = stageCopy[index];
    }

    consoleResult.textContent = `${runOutput} ready for human review.`;
    runtime.classList.add('complete');
    runButton.firstChild.textContent = 'Run again ';
    runButton.disabled = false;
    choiceButtons.forEach((button) => { button.disabled = false; });
    simulationRunning = false;
  });

  const dialog = $('.booking-dialog');
  const bookingContinue = $('[data-booking-continue]');
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
      const bookingTopic = button.dataset.value;
      $$('[data-booking-options] button').forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      bookingContinue.href = `https://github.com/m3hrdadfi/hermes-ai-employees/issues/new?template=book-a-call.yml&title=${encodeURIComponent(`Build call - ${bookingTopic}`)}`;
    });
  });

  const canvas = $('#signal-field');
  const context = canvas.getContext('2d');
  const pointer = { x: -1000, y: -1000 };
  let points = [];
  let frame;

  window.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }, { passive: true });
  document.addEventListener('pointerleave', () => {
    pointer.x = -1000;
    pointer.y = -1000;
  });

  const sizeCanvas = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(40, Math.max(18, Math.floor(window.innerWidth / 38)));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - .5) * .14,
      vy: (Math.random() - .5) * .14,
      radius: Math.random() * .9 + .3
    }));
  };

  const drawField = () => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    points.forEach((point, index) => {
      const pointerDistance = Math.hypot(point.x - pointer.x, point.y - pointer.y);
      if (pointerDistance < 125 && pointerDistance > 1) {
        point.x += ((point.x - pointer.x) / pointerDistance) * .58;
        point.y += ((point.y - pointer.y) / pointerDistance) * .58;
      }

      point.x += point.vx;
      point.y += point.vy;
      if (point.x < -20 || point.x > window.innerWidth + 20) point.vx *= -1;
      if (point.y < -20 || point.y > window.innerHeight + 20) point.vy *= -1;

      context.beginPath();
      context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      context.fillStyle = 'rgba(198, 213, 202, .52)';
      context.fill();

      for (let next = index + 1; next < points.length; next += 1) {
        const other = points[next];
        const distance = Math.hypot(point.x - other.x, point.y - other.y);
        if (distance < 150) {
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(other.x, other.y);
          context.strokeStyle = `rgba(198, 213, 202, ${(1 - distance / 150) * .13})`;
          context.lineWidth = .6;
          context.stroke();
        }
      }
    });
    frame = window.requestAnimationFrame(drawField);
  };

  sizeCanvas();
  if (!reduceMotion) drawField();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.cancelAnimationFrame(frame);
      frame = null;
      return;
    }
    if (!reduceMotion && !frame) drawField();
  });
  window.addEventListener('resize', () => {
    window.cancelAnimationFrame(frame);
    sizeCanvas();
    if (!reduceMotion) drawField();
  }, { passive: true });
})();
