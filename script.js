/* ══════════════════════════════════
   1. CUSTOM CURSOR
══════════════════════════════════ */
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left = mx + 'px';
  dot.style.top = my + 'px';
});

function animateRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('a,button,.project-card,.skill-item').forEach(el => {
  el.addEventListener('mouseenter', () => {
    ring.style.transform = 'translate(-50%,-50%) scale(1.4)';
    ring.style.opacity = '.2';
    dot.style.opacity = '.5';
  });
  el.addEventListener('mouseleave', () => {
    ring.style.transform = 'translate(-50%,-50%) scale(1)';
    ring.style.opacity = '.4';
    dot.style.opacity = '1';
  });
});

/* ══════════════════════════════════
   2. SCROLL PROGRESS BAR
══════════════════════════════════ */
const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  progressBar.style.width = pct + '%';
});

/* ══════════════════════════════════
   3. PARTICLE CANVAS
══════════════════════════════════ */
(function () {
  const canvas = document.getElementById('canvas-bg');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); init(); });

  // Fewer, more subtle particles for the light editorial background
  const COUNT = Math.min(45, Math.floor(window.innerWidth / 28));

  function Particle() {
    this.reset = function () {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - .5) * .3;
      this.vy = (Math.random() - .5) * .3;
      this.r = Math.random() * 1.2 + .3;
      this.a = Math.random() * .25 + .05; // low alpha — ink-blue on off-white
    };
    this.reset();
  }

  function init() {
    particles = [];
    for (let i = 0; i < COUNT; i++) particles.push(new Particle());
  }
  init();

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(27,79,114,${p.a})`; // ink-blue accent
      ctx.fill();
    });

    // Connect nearby particles with fine lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(27,79,114,${.05 * (1 - dist / 110)})`;
          ctx.lineWidth = .6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════
   4. TYPEWRITER EFFECT
══════════════════════════════════ */
(function () {
  const el = document.getElementById('typewriter-text');
  const phrases = [
    'robust web apps.',
    'clean, scalable code.',
    'cloud-powered solutions.',
    'tools developers love.',
  ];
  let pi = 0, ci = 0, deleting = false;
  const SPEED = 80, DELETE = 45, PAUSE = 1800;

  function type() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; setTimeout(type, PAUSE); return; }
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(type, deleting ? DELETE : SPEED);
  }
  setTimeout(type, 1200);
})();

/* ══════════════════════════════════
   5. INTERSECTION OBSERVER — REVEAL
══════════════════════════════════ */
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      // Animate skill bars when they enter view
      const fill = e.target.querySelector('.skill-bar-fill');
      if (fill) {
        const w = fill.getAttribute('data-width');
        setTimeout(() => fill.style.width = w + '%', 200);
      }
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObs.observe(el));

/* ══════════════════════════════════
   6. COUNTER ANIMATION
══════════════════════════════════ */
const counters = document.querySelectorAll('.stat-num[data-count]');
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.getAttribute('data-count');
    let current = 0;
    const step = target / 50;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current);
    }, 30);
    counterObs.unobserve(el);
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObs.observe(c));

/* ══════════════════════════════════
   7. ACTIVE NAV HIGHLIGHT ON SCROLL
══════════════════════════════════ */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const navObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });
sections.forEach(s => navObs.observe(s));

/* ══════════════════════════════════
   8. HAMBURGER MOBILE MENU
══════════════════════════════════ */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

/* ══════════════════════════════════
   9. CONTACT FORM — VALIDATION + TOAST
══════════════════════════════════ */
const form = document.getElementById('contact-form');
const toastEl = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');

function showToast(msg, success = true) {
  toastMsg.textContent = msg;
  toastEl.querySelector('.toast-icon').textContent = success ? '✓' : '✕';
  toastEl.style.borderColor = success ? 'var(--accent)' : '#B94040'; // desaturated red
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 4000);
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = form.querySelector('#name').value.trim();
  const email = form.querySelector('#email').value.trim();
  const message = form.querySelector('#message').value.trim();

  if (!name) { showToast('Please enter your name.', false); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address.', false); return;
  }
  if (!message) { showToast('Please write a message.', false); return; }

  const btn = document.getElementById('submit-btn');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  setTimeout(() => {
    showToast("Message sent! I'll get back to you soon.");
    form.reset();
    btn.textContent = 'Send Message →';
    btn.disabled = false;
  }, 1500);
});

/* ══════════════════════════════════
   10. SMOOTH SCROLL FOR ANCHOR LINKS
══════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
