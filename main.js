import * as THREE from 'three';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- Data (mirrors github.com/MarketerKA README) ---------------- */
const X = id => `https://x.com/keterka/status/${id}`;

const PUBLIC = [
  { name:'BattleChain Confidence Pools', url:'https://codehawks.cyfrin.io/c/2026-07-battlechain-confidence-pools/results', findings:'QA 🥇', rank:7, post:X('2088384347376095498') },
  { name:'0xMarkets', url:'https://hackenproof.com/audit-programs/0xmarkets-audit-contest', findings:'5H, 11M, 3L', rank:5, post:X('2086493338140610908') },
  { name:'Monetrix', url:'https://code4rena.com/audits/2026-04-monetrix', findings:'QA 🥉', rank:5, post:X('2059434905482740185') },
  { name:'Revert Finance', url:'https://cantina.xyz/code/efb6f308-f13b-4110-aff8-0d67181608dd/overview', findings:'1M, 2L', rank:4, note:'$1M pool', post:X('2053072375910986073') },
  { name:'Reliq', url:'https://hackenproof.com/audit-programs/reliq-smart-contract-audit-contest', findings:'1H, 1M, 1L', rank:3, post:X('2009609869611941922') },
  { name:'Rain', url:'https://hackenproof.com/audit-programs/rain-smart-contract-audit-contest', findings:'3C, 1H, 4M, 2L', rank:5, post:X('2003708879713239429') },
  { name:'OpenEden', url:'https://hackenproof.com/audit-programs/openeden-usdo-express-smart-contract-audit-contest', findings:'2H, 1M', rank:3, post:X('1982205277895012839') },
  { name:'TipRun', url:'https://hackenproof.com/audit-programs/tiprun-smart-contract-audit-contest?tab=hackers&page=2', findings:'5C, 3H, 1L', rank:9, post:X('2086493338140610908') },
  { name:'IndexFun', url:null, platform:'HackenProof', findings:'1M', rank:15, post:X('1990937209604895084') },
  { name:'Blockz', url:'https://hackenproof.com/audit-programs/blockz-smart-contract-audit-contest', findings:'1M, 1L', rank:13, post:X('1982205277895012839') },
  { name:'Covenant', url:'https://code4rena.com/audits/2025-10-covenant', findings:'QA grade A', rank:null },
  { name:'Morpheus', url:'https://code4rena.com/audits/2025-08-morpheus', findings:'QA grade B', rank:null },
];

const FIRMS = {
  phage:{ name:'Phage Security', url:'https://phagesecurity.com/' },
  pashov:{ name:'Pashov Audit Group', url:'https://www.pashov.com/' },
  specsiege:{ name:'SpecSiege', url:'https://specsiege.codespect.net/' },
};

const PRIVATE = [
  { name:'Robin Markets', when:'Aug 2026', findings:'1M, 2L', firm:'phage', report:'https://github.com/phage-security/2026-08-robinMarkets/blob/main/2026-08-robinMarkets.pdf', post:X('2098211241051271630') },
  { name:'K3', when:'2026', findings:'-', firm:'pashov', report:null, post:'https://x.com/PashovAuditGrp/status/2092211480464617809' },
  { name:'bounceTech', when:'Aug 2026', findings:'1M, 1L', firm:'phage', report:'https://github.com/phage-security/2026-08-bounceTech/blob/main/2026-08-bounceTech.pdf', post:null },
  { name:'perpGame', when:'Jun 2026', findings:'1H, 4M, 3L', firm:'phage', report:'https://github.com/phage-security/audits/blob/main/2026-06-perpGame.pdf', post:'https://x.com/PhageSec/status/2082770382440837226' },
  { name:"ChainLabCTU's ERC-6909", when:'2026', findings:'1M, 2L', firm:'specsiege', report:null, post:X('2072157936567087372') },
  { name:'Covalence', when:'2026', findings:'TBA', firm:'phage', report:null, post:null },
  { name:'Robin Markets', when:'May 2026', findings:'1H, 3M', firm:'phage', report:'https://github.com/phage-security/audits/blob/main/2026-05-robinMarkets.pdf', post:'https://x.com/0x3b33/status/2062547130762264695' },
];

const HOTW = [
  'https://x.com/HackenProof/status/2000596103599923655',
  'https://x.com/HackenProof/status/2007382002073501739',
  'https://x.com/HackenProof/status/2012102537462390891',
  'https://x.com/HackenProof/status/2078146360591737091',
];

const SEV = [
  { k:'C', label:'Critical', color:0xf43f5e },
  { k:'H', label:'High',     color:0xfb923c },
  { k:'M', label:'Medium',   color:0xfbbf24 },
  { k:'L', label:'Low',      color:0x38bdf8 },
];

/* ---------------- Utils ---------------- */
const el = id => document.getElementById(id);
const hex = n => '#' + n.toString(16).padStart(6, '0');
const ext = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;

function parseFindings(s){
  const out = {};
  for(const m of s.matchAll(/(\d+)\s*([CHML])\b/g)) out[m[2]] = (out[m[2]]||0) + Number(m[1]);
  return out;
}
function chips(s){
  const f = parseFindings(s);
  const keys = SEV.map(x => x.k).filter(k => f[k]);
  if(keys.length) return keys.map(k => `<span class="sev sev-${k}">${f[k]}${k}</span>`).join('');
  if(/qa/i.test(s)) return `<span class="sev sev-QA">${s}</span>`;
  return `<span class="sev sev-NA">${s === '-' ? 'n/a' : s}</span>`;
}
function platformOf(a){
  if(a.platform) return a.platform;
  const h = new URL(a.url).hostname;
  if(h.includes('hackenproof')) return 'HackenProof';
  if(h.includes('code4rena')) return 'Code4rena';
  if(h.includes('cantina')) return 'Cantina';
  if(h.includes('cyfrin')) return 'CodeHawks';
  return h;
}
function attachTilt(card, amt = 10){
  let raf;
  card.addEventListener('mousemove', e => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(900px) rotateX(${-y*amt*.8}deg) rotateY(${x*amt}deg)`;
    });
  });
  card.addEventListener('mouseleave', () => { cancelAnimationFrame(raf); card.style.transform = ''; });
}

/* ---------------- Reveal on scroll ---------------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold:.12 });
const reveal = n => io.observe(n);

/* ---------------- Render: public audits ---------------- */
const pubGrid = el('public-grid');
PUBLIC.forEach((a, i) => {
  const c = document.createElement('article');
  c.className = 'glass audit card-3d reveal';
  c.style.transitionDelay = `${(i % 3) * 60}ms`;
  const rankCls = a.rank && a.rank <= 3 ? 'gold' : a.rank && a.rank <= 5 ? 'top' : '';
  const rank = a.rank ? `<span class="rank ${rankCls}">#${a.rank}</span>` : '';
  c.innerHTML = `
    <div class="audit-head">
      <div>
        <h3 class="audit-name">${a.name}</h3>
        <div class="audit-platform">${platformOf(a)}${a.note ? ' · ' + a.note : ''}</div>
      </div>
      ${rank}
    </div>
    <div class="chips">${chips(a.findings)}</div>
    <div class="audit-links">
      ${a.url ? ext(a.url, 'Contest →') : '<span class="off">Contest page closed</span>'}
      ${a.post ? ext(a.post, 'X post') : ''}
    </div>`;
  pubGrid.appendChild(c);
  reveal(c);
  attachTilt(c, 8);
});

/* ---------------- Render: private audits ---------------- */
const privBody = el('private-body');
PRIVATE.forEach(a => {
  const firm = FIRMS[a.firm];
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><strong>${a.name}</strong><div class="muted small">${a.when}</div></td>
    <td><div class="chips">${chips(a.findings)}</div></td>
    <td class="firm">${ext(firm.url, firm.name)}</td>
    <td>${a.report ? ext(a.report, 'PDF') : '<span class="tba">TBA</span>'}</td>
    <td>${a.post ? ext(a.post, 'Post') : '<span class="tba">TBA</span>'}</td>`;
  privBody.appendChild(tr);
});

/* ---------------- Render: hacker of the week ---------------- */
const hotwGrid = el('hotw-grid');
HOTW.forEach((url, i) => {
  const a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.rel = 'noopener';
  a.className = 'glass hotw card-3d reveal';
  a.style.transitionDelay = `${i * 70}ms`;
  a.innerHTML = `
    <div class="hotw-badge">#${i + 1}</div>
    <div class="hotw-title">Hacker of the Week</div>
    <div class="muted small">HackenProof announcement</div>
    <div class="more">View on X →</div>`;
  hotwGrid.appendChild(a);
  reveal(a);
  attachTilt(a, 12);
});

document.querySelectorAll('.reveal').forEach(reveal);
document.querySelectorAll('[data-tilt]').forEach(n => attachTilt(n, 10));
el('stat-audits').textContent = PUBLIC.length + PRIVATE.length;
el('year').textContent = new Date().getFullYear();

/* ---------------- Severity totals ---------------- */
const totals = { C:0, H:0, M:0, L:0 };
[...PUBLIC, ...PRIVATE].forEach(a => {
  const f = parseFindings(a.findings);
  for(const k in f) totals[k] += f[k];
});
const maxSev = Math.max(...Object.values(totals));
const sevRows = el('sev-rows');
sevRows.innerHTML = SEV.map(s => `
  <div class="sev-row">
    <span class="sev sev-${s.k}" style="justify-self:start">${s.label}</span>
    <div class="sev-bar"><i data-w="${(totals[s.k] / maxSev * 100).toFixed(1)}" style="background:${hex(s.color)}"></i></div>
    <span class="sev-count">${totals[s.k]}</span>
  </div>`).join('');
el('sev-legend').innerHTML = SEV.map(s => `<span class="sev sev-${s.k}">${s.k} · ${totals[s.k]}</span>`).join('');
let sevVisible = false;
new IntersectionObserver((entries, obs) => {
  if(!entries[0].isIntersecting) return;
  sevVisible = true;
  sevRows.querySelectorAll('i').forEach(i => { i.style.width = i.dataset.w + '%'; });
  obs.disconnect();
}, { threshold:.3 }).observe(sevRows);

/* ---------------- Nav state ---------------- */
const nav = document.querySelector('.nav');
const sections = ['audits', 'private', 'recognition', 'contact'];
const links = document.querySelectorAll('.nav-link');
function onScroll(){
  nav.classList.toggle('scrolled', window.scrollY > 20);
  const y = window.scrollY + 140;
  let cur = null;
  sections.forEach(id => { const s = el(id); if(s && s.offsetTop <= y) cur = id; });
  links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
  heroCanvas.style.opacity = Math.max(0.18, heroMax - window.scrollY / (window.innerHeight * 0.9));
}
window.addEventListener('scroll', onScroll, { passive:true });

/* ---------------- Three.js helpers ---------------- */
function makeRenderer(canvas){
  const r = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  r.setPixelRatio(Math.min(devicePixelRatio, 2));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.1;
  return r;
}
function baseLights(scene){
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 1.3);
  key.position.set(4, 6, 3); scene.add(key);
  const rim = new THREE.DirectionalLight(0x34d399, 0.8);
  rim.position.set(-4, 2, -4); scene.add(rim);
  const fill = new THREE.PointLight(0x22d3ee, 0.6, 14);
  fill.position.set(0, 3, 4); scene.add(fill);
}

/* =========================================================
   HERO — contract lattice scanned by a sweeping ring;
   vulnerable nodes flare red when the scan passes them
   ========================================================= */
const heroCanvas = el('hero');
const heroRenderer = makeRenderer(heroCanvas);
const heroScene = new THREE.Scene();
heroScene.fog = new THREE.Fog(0x060b14, 7, 22);
baseLights(heroScene);
const heroCam = new THREE.PerspectiveCamera(42, 1, .1, 80);
heroCam.position.set(0, 0.6, 8);

const lattice = new THREE.Group();
heroScene.add(lattice);
const R = 2.3;

// edges
const ico = new THREE.IcosahedronGeometry(R, 2);
const edges = new THREE.LineSegments(new THREE.EdgesGeometry(ico, 1),
  new THREE.LineBasicMaterial({ color:0x22d3ee, transparent:true, opacity:.28 }));
lattice.add(edges);

// unique vertices → nodes
const seen = new Map();
const pos = ico.attributes.position;
for(let i = 0; i < pos.count; i++){
  const v = new THREE.Vector3().fromBufferAttribute(pos, i);
  const key = v.toArray().map(n => n.toFixed(3)).join(',');
  if(!seen.has(key)) seen.set(key, v);
}
const verts = [...seen.values()];
const nodeGeo = new THREE.SphereGeometry(0.045, 10, 10);
const nodeMat = new THREE.MeshStandardMaterial({ color:0x34d399, emissive:0x0f5a3e, emissiveIntensity:.6, roughness:.3, metalness:.2 });
const nodes = new THREE.InstancedMesh(nodeGeo, nodeMat, verts.length);
const m4 = new THREE.Matrix4();
verts.forEach((v, i) => { m4.makeTranslation(v.x, v.y, v.z); nodes.setMatrixAt(i, m4); });
lattice.add(nodes);

// vulnerable nodes (deterministic pick)
const bugs = [];
for(let i = 0; i < verts.length; i += 9){
  const mat = new THREE.MeshStandardMaterial({ color:0xf43f5e, emissive:0xf43f5e, emissiveIntensity:.2, roughness:.3, transparent:true, opacity:.9 });
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), mat);
  m.position.copy(verts[i]);
  const halo = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.15, 24),
    new THREE.MeshBasicMaterial({ color:0xf43f5e, transparent:true, opacity:0, side:THREE.DoubleSide, depthWrite:false }));
  halo.position.copy(verts[i]);
  halo.lookAt(verts[i].clone().multiplyScalar(2));
  lattice.add(m, halo);
  bugs.push({ m, halo, heat:0 });
}

// core
const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.6, 0),
  new THREE.MeshStandardMaterial({ color:0x34d399, emissive:0x22d3ee, emissiveIntensity:.35, roughness:.2, metalness:.6, flatShading:true }));
lattice.add(core);
const coreWire = new THREE.Mesh(new THREE.OctahedronGeometry(0.95, 0),
  new THREE.MeshBasicMaterial({ color:0x22d3ee, wireframe:true, transparent:true, opacity:.35 }));
lattice.add(coreWire);

// scan ring (world-space, not rotating with lattice)
const scan = new THREE.Mesh(new THREE.TorusGeometry(1, 0.006, 8, 128),
  new THREE.MeshBasicMaterial({ color:0x6ee7b7, transparent:true, opacity:.45 }));
scan.rotation.x = Math.PI / 2;
const scanDisc = new THREE.Mesh(new THREE.CircleGeometry(1, 64),
  new THREE.MeshBasicMaterial({ color:0x34d399, transparent:true, opacity:.04, side:THREE.DoubleSide, depthWrite:false }));
scanDisc.rotation.x = -Math.PI / 2;
const scanGroup = new THREE.Group();
scanGroup.add(scan, scanDisc);
heroScene.add(scanGroup);

// particles
const ptsCount = 1200;
const ptsArr = new Float32Array(ptsCount * 3);
const ptsGeo = new THREE.BufferGeometry();
ptsGeo.setAttribute('position', new THREE.BufferAttribute(ptsArr, 3));
const pts = new THREE.Points(ptsGeo, new THREE.PointsMaterial({ color:0x34d399, size:0.03, transparent:true, opacity:.6 }));
heroScene.add(pts);

const grid = new THREE.GridHelper(30, 30, 0x1f3a3a, 0x0c1f24);
grid.position.y = -3.2; heroScene.add(grid);

let mx = 0, my = 0;
window.addEventListener('mousemove', e => {
  mx = (e.clientX / window.innerWidth - .5) * 2;
  my = (e.clientY / window.innerHeight - .5) * 2;
});

let heroMax = 1;
function fitHero(){
  const w = window.innerWidth, h = window.innerHeight;
  heroRenderer.setSize(w, h, false);
  heroCam.aspect = w / h; heroCam.updateProjectionMatrix();
  // keep lattice right of the headline on wide screens, centered behind it on mobile
  const wide = w > 900;
  lattice.position.set(wide ? 2.9 : 0, wide ? 0.1 : 1.2, wide ? 0 : -4.5);
  heroMax = wide ? 1 : 0.55;
  scanGroup.position.x = lattice.position.x;
  scanGroup.position.z = lattice.position.z;
}
fitHero();
window.addEventListener('resize', fitHero);

/* =========================================================
   SEVERITY — pillars that grow to the totals
   ========================================================= */
const sevCanvas = el('sev-canvas');
const sevRenderer = makeRenderer(sevCanvas);
const sevScene = new THREE.Scene();
baseLights(sevScene);
const sevCam = new THREE.PerspectiveCamera(38, 1, .1, 50);
sevCam.position.set(4.2, 3.4, 6.2);

const pillars = SEV.map((s, i) => {
  const h = 0.4 + totals[s.k] / maxSev * 3.4;
  const g = new THREE.BoxGeometry(0.8, 1, 0.8);
  g.translate(0, 0.5, 0);
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color:s.color, roughness:.3, metalness:.35, emissive:s.color, emissiveIntensity:.18 }));
  m.position.set((i - 1.5) * 1.2, -1.6, 0);
  m.scale.y = 0.001;
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.9),
    new THREE.MeshStandardMaterial({ color:s.color, emissive:s.color, emissiveIntensity:.5, roughness:.2 }));
  cap.position.copy(m.position);
  sevScene.add(m, cap);
  return { m, cap, h, cur:0.001 };
});
const sFloor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshStandardMaterial({ color:0x0b1a2c, roughness:.95 }));
sFloor.rotation.x = -Math.PI / 2; sFloor.position.y = -1.61; sevScene.add(sFloor);
const sGrid = new THREE.GridHelper(12, 24, 0x1c3348, 0x112235);
sGrid.position.y = -1.6; sevScene.add(sGrid);

let sevOnScreen = false;
new IntersectionObserver(e => { sevOnScreen = e[0].isIntersecting; }).observe(sevCanvas);
new ResizeObserver(() => {
  const r = sevCanvas.parentElement.getBoundingClientRect();
  sevRenderer.setSize(Math.max(r.width, 1), Math.max(r.height, 1), false);
  sevCam.aspect = Math.max(r.width, 1) / Math.max(r.height, 1);
  sevCam.updateProjectionMatrix();
}).observe(sevCanvas.parentElement);

/* ---------------- Render loop ---------------- */
let t = 0;
const tmp = new THREE.Vector3();
function frame(dt){
  t += dt;

  // hero
  if(window.scrollY < window.innerHeight * 2.5){
    lattice.rotation.y = t * 0.18 + mx * 0.35;
    lattice.rotation.x = Math.sin(t * 0.15) * 0.2 + my * 0.15;
    core.rotation.y = -t * 0.8; core.rotation.x = t * 0.4;
    coreWire.rotation.y = t * 0.5;

    const scanY = Math.sin(t * 0.55) * R;
    scanGroup.position.y = lattice.position.y + scanY;
    const rr = Math.sqrt(Math.max(R * R - scanY * scanY, 0.01)) * 1.08;
    scanGroup.scale.setScalar(rr);

    bugs.forEach(b => {
      b.m.getWorldPosition(tmp);
      const d = Math.abs(tmp.y - scanGroup.position.y);
      if(d < 0.12) b.heat = 1;
      b.heat = Math.max(0, b.heat - dt * 0.45);
      b.m.material.emissiveIntensity = 0.2 + b.heat * 2.2;
      b.m.scale.setScalar(1 + b.heat * 0.6);
      b.halo.material.opacity = b.heat * 0.8;
      b.halo.scale.setScalar(1 + (1 - b.heat) * 2.5);
    });

    for(let i = 0; i < ptsCount; i++){
      const a = (i / ptsCount) * Math.PI * 2 + t * 0.06;
      const r = 3.4 + Math.sin(i * 13.37) * 1.8;
      ptsArr[i*3]   = Math.cos(a) * r + lattice.position.x * 0.6;
      ptsArr[i*3+1] = Math.sin(i * 7.1) * 3.2 + Math.sin(t * 0.5 + i * 0.1) * 0.3;
      ptsArr[i*3+2] = Math.sin(a) * r - 1;
    }
    ptsGeo.attributes.position.needsUpdate = true;
    grid.rotation.y = t * 0.03;

    heroCam.position.x = mx * 0.5;
    heroCam.position.y = 0.6 - my * 0.35;
    heroCam.lookAt(lattice.position.x * 0.45, 0.2, 0);
    heroRenderer.render(heroScene, heroCam);
  }

  // severity
  if(sevOnScreen){
    pillars.forEach((p, i) => {
      const target = sevVisible ? p.h : 0.001;
      p.cur += (target - p.cur) * Math.min(1, dt * (2.2 - i * 0.25));
      p.m.scale.y = p.cur;
      p.cap.position.y = -1.6 + p.cur + 0.04 + Math.sin(t * 1.4 + i) * 0.03;
      p.m.rotation.y = p.cap.rotation.y = Math.sin(t * 0.4 + i) * 0.12;
    });
    sevCam.position.x = 4.2 + mx * 0.6;
    sevCam.lookAt(0, 0, 0);
    sevRenderer.render(sevScene, sevCam);
  }
}

if(reduced){
  // static frames, everything at final state
  sevVisible = true;
  pillars.forEach(p => { p.cur = p.h; });
  frame(0.016);
  const once = () => { frame(0); };
  window.addEventListener('resize', once);
  new IntersectionObserver(e => { if(e[0].isIntersecting){ sevOnScreen = true; frame(0); } }).observe(sevCanvas);
} else {
  let last = performance.now();
  const loop = now => {
    requestAnimationFrame(loop);
    frame(Math.min((now - last) / 1000, 0.05));
    last = now;
  };
  requestAnimationFrame(loop);
}
onScroll();
