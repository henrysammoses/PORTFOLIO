// ==================== CURSOR ====================
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let mx = 0, my = 0, fx = 0, fy = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
});
function animCursor() {
  fx += (mx - fx) * 0.12; fy += (my - fy) * 0.12;
  follower.style.left = fx + 'px'; follower.style.top = fy + 'px';
  requestAnimationFrame(animCursor);
}
animCursor();
document.querySelectorAll('a,button,.project-card,.profile-card,.skill-orb').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(2)';
    cursor.style.background = '#7c3aed';
    follower.style.width = '60px'; follower.style.height = '60px';
    follower.style.borderColor = '#06b6d4';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    cursor.style.background = '#06b6d4';
    follower.style.width = '36px'; follower.style.height = '36px';
    follower.style.borderColor = '#7c3aed';
  });
});

// ==================== LOADER ====================
const loaderCanvas = document.getElementById('loader-canvas');
const lctx = loaderCanvas.getContext('2d');
loaderCanvas.width = 200; loaderCanvas.height = 200;
let loaderAngle = 0;
function drawLoader() {
  lctx.clearRect(0, 0, 200, 200);
  lctx.save();
  lctx.translate(100, 100);
  for (let i = 0; i < 8; i++) {
    const a = (loaderAngle + i * (Math.PI * 2 / 8));
    const x = Math.cos(a) * 70, y = Math.sin(a) * 70;
    const size = 8 + Math.sin(loaderAngle * 2 + i) * 4;
    lctx.beginPath();
    lctx.arc(x, y, size, 0, Math.PI * 2);
    const grad = lctx.createRadialGradient(x, y, 0, x, y, size);
    grad.addColorStop(0, '#06b6d4');
    grad.addColorStop(1, '#7c3aed');
    lctx.fillStyle = grad;
    lctx.fill();
  }
  // center orb
  lctx.beginPath();
  lctx.arc(0, 0, 22, 0, Math.PI * 2);
  const cg = lctx.createRadialGradient(0, 0, 0, 0, 0, 22);
  cg.addColorStop(0, '#fff');
  cg.addColorStop(1, '#7c3aed');
  lctx.fillStyle = cg;
  lctx.fill();
  lctx.restore();
  loaderAngle += 0.04;
}
let loadPct = 0;
const loaderFill = document.querySelector('.loader-fill');
const loaderSub = document.querySelector('.loader-sub');
const loader = document.getElementById('loader');
const msgs = ['Initializing 3D Universe...','Loading Assets...','Building Experience...','Almost Ready...'];
function runLoader() {
  drawLoader();
  loadPct = Math.min(loadPct + 1.2, 100);
  loaderFill.style.width = loadPct + '%';
  loaderSub.textContent = msgs[Math.floor(loadPct / 26)] || msgs[3];
  if (loadPct < 100) requestAnimationFrame(runLoader);
  else setTimeout(() => { loader.classList.add('hidden'); initAll(); }, 400);
}
runLoader();

// ==================== HERO THREE.JS ====================
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Particle field
  const pCount = 1800;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pCol = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - .5) * 20;
    pPos[i * 3 + 1] = (Math.random() - .5) * 20;
    pPos[i * 3 + 2] = (Math.random() - .5) * 20;
    const c = Math.random() > .5 ? new THREE.Color('#7c3aed') : new THREE.Color('#06b6d4');
    pCol[i * 3] = c.r; pCol[i * 3 + 1] = c.g; pCol[i * 3 + 2] = c.b;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  const pMat = new THREE.PointsMaterial({ size: .04, vertexColors: true, transparent: true, opacity: .8 });
  scene.add(new THREE.Points(pGeo, pMat));

  // Floating geometric shapes
  const shapes = [];
  const geos = [
    new THREE.IcosahedronGeometry(.35, 0),
    new THREE.OctahedronGeometry(.4, 0),
    new THREE.TetrahedronGeometry(.4, 0),
    new THREE.BoxGeometry(.5, .5, .5),
  ];
  for (let i = 0; i < 12; i++) {
    const geo = geos[i % geos.length];
    const mat = new THREE.MeshPhongMaterial({
      color: i % 2 === 0 ? 0x7c3aed : 0x06b6d4,
      wireframe: true, transparent: true, opacity: .4
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((Math.random() - .5) * 14, (Math.random() - .5) * 10, (Math.random() - .5) * 8);
    mesh.userData = { rx: Math.random() * .012, ry: Math.random() * .012, fy: Math.random() * .005, t: Math.random() * 100 };
    scene.add(mesh); shapes.push(mesh);
  }

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, .3));
  const pl = new THREE.PointLight(0x7c3aed, 2, 20); pl.position.set(-5, 5, 5); scene.add(pl);
  const pl2 = new THREE.PointLight(0x06b6d4, 2, 20); pl2.position.set(5, -5, 3); scene.add(pl2);

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - .5) * 2;
    mouseY = (e.clientY / window.innerHeight - .5) * 2;
  });

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += .01;
    camera.position.x += (mouseX * .5 - camera.position.x) * .04;
    camera.position.y += (-mouseY * .3 - camera.position.y) * .04;
    shapes.forEach(m => {
      m.rotation.x += m.userData.rx;
      m.rotation.y += m.userData.ry;
      m.position.y += Math.sin(t + m.userData.t) * m.userData.fy;
    });
    pGeo.attributes.position.array.forEach((_, i) => {
      if (i % 3 === 1) pGeo.attributes.position.array[i] += Math.sin(t + i) * .0002;
    });
    pGeo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }
  animate();
}

// ==================== ABOUT CANVAS ====================
function initAboutCanvas() {
  const canvas = document.getElementById('about-canvas');
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
  camera.position.z = 4;

  // DNA helix-like structure
  const points = [];
  for (let i = 0; i < 80; i++) {
    const t = (i / 80) * Math.PI * 6;
    points.push(new THREE.Vector3(Math.cos(t) * 1.2, (i / 80) * 4 - 2, Math.sin(t) * 1.2));
  }
  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeo = new THREE.TubeGeometry(curve, 200, .04, 8, false);
  const tubeMat = new THREE.MeshPhongMaterial({ color: 0x7c3aed, emissive: 0x3a0090, transparent: true, opacity: .8 });
  scene.add(new THREE.Mesh(tubeGeo, tubeMat));

  // Nodes on helix
  for (let i = 0; i < 20; i++) {
    const t = (i / 20) * Math.PI * 6;
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(.1, 8, 8),
      new THREE.MeshPhongMaterial({ color: 0x06b6d4, emissive: 0x003344 })
    );
    sphere.position.set(Math.cos(t) * 1.2, (i / 20) * 4 - 2, Math.sin(t) * 1.2);
    scene.add(sphere);
  }
  scene.add(new THREE.AmbientLight(0xffffff, .5));
  const pl = new THREE.PointLight(0x7c3aed, 3, 15); pl.position.set(2, 2, 2); scene.add(pl);

  function resize() {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let t2 = 0;
  function animate() {
    requestAnimationFrame(animate);
    t2 += .008;
    scene.rotation.y = t2 * .4;
    renderer.render(scene, camera);
  }
  animate();
}

// ==================== SKILL ORBS ====================
function initSkillOrbs() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const defs = document.createElementNS(svgNS, 'defs');
  const grad = document.createElementNS(svgNS, 'linearGradient');
  grad.setAttribute('id', 'orbGrad');
  grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
  grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '100%');
  const s1 = document.createElementNS(svgNS, 'stop');
  s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', '#7c3aed');
  const s2 = document.createElementNS(svgNS, 'stop');
  s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', '#06b6d4');
  grad.appendChild(s1); grad.appendChild(s2); defs.appendChild(grad);
  document.querySelector('.skills-3d-grid svg')?.before(defs);

  const circum = 2 * Math.PI * 44;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.orb-progress').forEach(circle => {
          const pct = parseFloat(circle.getAttribute('data-pct') || 0);
          circle.style.strokeDashoffset = circum * (1 - pct / 100);
        });
        observer.disconnect();
      }
    });
  }, { threshold: .3 });
  const grid = document.getElementById('skills-grid');
  if (grid) observer.observe(grid);
}

// ==================== PROFILE CARD 3D ====================
function initProfileCard() {
  const card = document.getElementById('profile-card');
  const wrapper = document.getElementById('profile-card-wrapper');
  if (!card || !wrapper) return;

  // Tilt on mouse move
  wrapper.addEventListener('mousemove', e => {
    if (card.classList.contains('flipped')) return;
    const rect = wrapper.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `rotateY(${dx * 18}deg) rotateX(${-dy * 12}deg)`;
  });
  wrapper.addEventListener('mouseleave', () => {
    if (!card.classList.contains('flipped'))
      card.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
    card.style.transform = card.classList.contains('flipped') ? 'rotateY(180deg)' : '';
  });

  // Avatar canvas mini-animation
  const ac = document.getElementById('avatar-canvas');
  if (!ac) return;
  ac.width = 100; ac.height = 100;
  const ctx = ac.getContext('2d');
  let at = 0;
  function drawAvatar() {
    ctx.clearRect(0, 0, 100, 100);
    const g = ctx.createRadialGradient(50, 50, 0, 50, 50, 50);
    g.addColorStop(0, `hsl(${260 + Math.sin(at) * 20},80%,60%)`);
    g.addColorStop(1, `hsl(${190 + Math.cos(at) * 20},80%,50%)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(50, 50, 50, 0, Math.PI * 2); ctx.fill();
    at += .03;
    requestAnimationFrame(drawAvatar);
  }
  drawAvatar();
}

// ==================== CONTACT CANVAS ====================
function initContactCanvas() {
  const canvas = document.getElementById('contact-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);
  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + .5,
    vx: (Math.random() - .5) * .4,
    vy: (Math.random() - .5) * .4,
    color: Math.random() > .5 ? '#7c3aed' : '#06b6d4'
  }));
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color; ctx.globalAlpha = .5; ctx.fill();
      ctx.globalAlpha = 1;
    });
    // connect nearby
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#7c3aed';
          ctx.globalAlpha = (1 - d / 100) * .15;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// ==================== STAT COUNTERS ====================
function initCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.getAttribute('data-target'));
    let cur = 0;
    const step = target / 40;
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = Math.floor(cur) + '+';
      if (cur >= target) clearInterval(t);
    }, 40);
  });
}

// ==================== SCROLL REVEAL ====================
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('revealed'), i * 100);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: .15 });
  document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));
}

// ==================== NAVBAR SCROLL ====================
function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 50
      ? 'rgba(4,4,15,.95)'
      : 'rgba(4,4,15,.7)';
  });
  // Active link highlight
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    document.querySelectorAll('.nav-link').forEach(l => {
      l.style.color = l.getAttribute('href') === '#' + current ? '#06b6d4' : '';
    });
  });
}

// ==================== INIT ALL ====================
function initAll() {
  initHeroCanvas();
  initAboutCanvas();
  initProfileCard();
  initContactCanvas();
  initSkillOrbs();
  initCounters();
  initReveal();
  initNavbar();

  // SVG gradient injection for orbs
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.width = '0'; svg.style.height = '0'; svg.style.position = 'absolute';
  svg.innerHTML = `<defs><linearGradient id="orbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#7c3aed"/>
    <stop offset="100%" stop-color="#06b6d4"/>
  </linearGradient></defs>`;
  document.body.prepend(svg);

  // Smooth section transitions
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}
