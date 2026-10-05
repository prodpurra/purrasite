/* =========================================================
   purra — script.js
   Wszystkie dane do edycji są na samej górze (sekcje 1–4).
   ========================================================= */

/* ---------- 1. KONFIGURACJA — kontakt i linki ---------- */
const CONFIG = {
  instagram: {
    handle: '@purra___',                               // ← INSTAGRAM: nazwa (trzy podkreślniki)
    url: 'https://www.instagram.com/purra___/',        // ← INSTAGRAM: link
  },
  email: 'prodpurra@gmail.com',                        // ← EMAIL
  youtube: '',      // ← YOUTUBE (na razie nieużywany w UI — zostaw albo wklej link na później)
  beatstars: '',    // ← BEATSTARS: link do profilu — fallback dla BUY, gdy beat nie ma własnego linku
};

/* ---------- 2. BEATY (6-track showcase na stronie) ----------
   - src:      plik audio (folder /audio obok index.html)
   - length:   długość wyświetlana zanim plik się wczyta
   - buy:      BEZPOŚREDNI link do tego beatu na BeatStars
               (puste → CONFIG.beatstars; oba puste → komunikat z kontaktem)
   - featured: true → beat na HOME + PLAY LATEST (jeśli żaden, użyty jest pierwszy)
   Dodanie beatu = dopisanie jednego obiektu. */
const BEATS = [
  { title: 'track #01', bpm: 136, key: 'C# MIN', length: '2:06', src: 'audio/track-01.mp3', buy: '', featured: true },
  { title: 'track #02', bpm: 135, key: 'D# MIN', length: '2:36', src: 'audio/track-02.mp3', buy: '' },
  { title: 'track #03', bpm: 143, key: 'F MIN',  length: '2:28', src: 'audio/track-03.mp3', buy: '' },
  { title: 'track #04', bpm: 136, key: 'F MIN',  length: '2:09', src: 'audio/track-04.mp3', buy: '' },
  { title: 'track #05', bpm: 139, key: 'F MIN',  length: '1:30', src: 'audio/track-05.mp3', buy: '' },
  { title: 'track #06', bpm: 150, key: 'C# MIN', length: '2:30', src: 'audio/track-06.mp3', buy: '' },
];

/* ---------- 3. ARCHIVE → old_beats (osobno od głównego 6-track showcase) ----------
   Puste = „folder is empty.” Przykład wpisu:
   { title: 'nazwa_pliku', bpm: 140, key: 'A MIN', length: '2:10', src: 'audio/old/nazwa_pliku.mp3' } */
const OLD_BEATS = [];

/* ---------- 4. PLACEMENTS (archive → placements + about → credits) ----------
   - title:   tytuł utworu
   - project: wydawnictwo / mixtape / album
   - role:    Twoja rola
   - year:    rok (opcjonalnie)
   - url:     link np. do Spotify (puste = bez przycisku „listen”)
   - cover:   link / ścieżka do okładki (np. 'img/cover.jpg'); puste + link Spotify = okładka pobierana automatycznie
   Kolejny placement = dopisanie jednego obiektu. */
const PLACEMENTS = [
  {
    title: 'Open Source',
    project: 'Villa Mombasa Mixtape',
    role: 'prod. purra',
    year: '',
    url: 'https://open.spotify.com/track/3QUayv9DeZjNQ1zGyg3IJq',
    // okładka (oryginalna, z Spotify). Puste = strona spróbuje pobrać ją sama z linku Spotify.
    cover: 'https://i.scdn.co/image/ab67616d0000b273904a7e0bdbcb793675c6beb9',
    coverFallback: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02904a7e0bdbcb793675c6beb9',
  },
];

/* ---------- 5. DRUM KIT (okno „kit” + promo na HOME) ----------
   - url:      link do pobrania / zakupu (puste = komunikat z kontaktem)
   - price:    np. 'free' albo '€20' (puste = nie pokazuj)
   - contents: lista zawartości, np. ['808s', 'kicks', 'snares'] (puste = nie pokazuj) */
const KIT = {
  title: 'stash kit',
  tagline: 'go to 2027',
  price: '',
  url: '',
  contents: [],
};

/* ---------- 6. ARCHIVE → ??? (kod dostępu) ----------
   - code:  kod do wpisania (wielkość liter nie ma znaczenia)
   - title / text: co pokazać po odblokowaniu (później wstawisz tu swoją zawartość) */
const SECRET = {
  code: '2027',                       // ← ZMIEŃ KOD
  title: 'access granted',
  text: 'nothing here yet. come back later.',
};

/* =========================================================
   KOD — poniżej nie musisz nic zmieniać
   ========================================================= */

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const mq = window.matchMedia('(max-width: 760px)');
const isMobile = () => mq.matches;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = (n, l = 2) => String(n).padStart(l, '0');
const parseLen = (t) => {
  const [m, s] = String(t).split(':').map(Number);
  return (m * 60 + (s || 0)) || 0;
};
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};
const setText = (el, t) => { if (el && el.textContent !== t) el.textContent = t; };

const ICON_PP = '<svg class="i-play" aria-hidden="true"><use href="#g-play"/></svg><svg class="i-pause" aria-hidden="true"><use href="#g-pause"/></svg>';

/* ---------- tracks: identyfikatory + featured ---------- */
BEATS.forEach((t, i) => Object.assign(t, { id: `b${i}`, list: BEATS, index: i }));
OLD_BEATS.forEach((t, i) => Object.assign(t, { id: `o${i}`, list: OLD_BEATS, index: i, archived: true }));
const TRACKS = new Map([...BEATS, ...OLD_BEATS].map((t) => [t.id, t]));
const FEATURED = BEATS.find((b) => b.featured) || BEATS[0] || null;
const buyUrl = (t) => (t && t.buy) || CONFIG.beatstars || '';

function setBuy(a, t) {
  if (!a || !t) return;
  const url = buyUrl(t);
  const label = $('span', a);
  a.setAttribute('aria-label', url ? `buy ${t.title}` : `get ${t.title}`);
  a.dataset.buyMissing = url ? '0' : '1';
  if (label) label.textContent = url ? 'buy beat' : 'get this beat';
  if (url) {
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
  } else {
    a.setAttribute('href', '#');
    a.removeAttribute('target');
    a.removeAttribute('rel');
  }
}

/* =========================================================
   CONFIG → DOM
   ========================================================= */
function applyConfig() {
  const links = {
    instagram: CONFIG.instagram.url,
    beatstars: CONFIG.beatstars,
    youtube: CONFIG.youtube,
    email: `mailto:${CONFIG.email}`,
    send: `mailto:${CONFIG.email}?subject=${encodeURIComponent('beats / collab — purra')}`,
  };
  $$('[data-link]').forEach((a) => {
    const k = a.dataset.link;
    const url = links[k];
    if (!url) { a.hidden = true; return; }
    a.href = url;
    if (k === 'instagram') { a.target = '_blank'; a.rel = 'noopener'; }
  });
  $$('.dock [data-link="instagram"]').forEach((a) => (a.dataset.tip = CONFIG.instagram.handle));
  $$('[data-text="email"]').forEach((el) => (el.textContent = CONFIG.email));
  $$('[data-text="instagram"]').forEach((el) => (el.textContent = CONFIG.instagram.handle));
  $$('[data-text="beatstars"]').forEach((el) => (el.textContent = CONFIG.beatstars || 'coming soon'));
  $$('[data-text="youtube"]').forEach((el) => (el.textContent = CONFIG.youtube || 'coming soon'));
  $$('[data-link-row]').forEach((row) => {
    const key = row.dataset.linkRow;
    if (!CONFIG[key]) row.hidden = true;
  });

  // Gdy nie ma jeszcze BeatStars/direct BUY, CTA prowadzi do kontaktu zamiast w ślepą uliczkę.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-buy]');
    if (!a || a.dataset.buyMissing !== '1') return;
    e.preventDefault();
    openWindow('contact');
  });

  // app feeling: bez natywnego przeciągania obrazków / linków
  document.addEventListener('dragstart', (e) => { if (!e.target.closest('input')) e.preventDefault(); });
}

/* =========================================================
   OKNA — HOME to główne okno; nad nim otwiera się jedna sekcja naraz
   (beats / archive / about / contact). Kolejna zastępuje poprzednią.
   ========================================================= */
const panels = $('#panels');
const wins = {};
let panel = null;   // aktualnie otwarta sekcja (poza home)
let overlayParent = null; // LINKS otwiera się nad ABOUT i nie zastępuje go
let front = null;   // okno na wierzchu
let z = 20;
let cascadeN = 0;

const dockH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dock-h')) || 56;

function setupWindows() {
  $$('#panels > .window').forEach((el) => {
    const id = el.dataset.win;
    wins[id] = { el, placed: false, timer: 0, min: false };
    el.addEventListener('pointerdown', () => focusWin(id));
    $$('[data-action]', el).forEach((btn) =>
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (btn.dataset.action === 'max') toggleMax(id);
        if (btn.dataset.action === 'min') minimize(id);
        if (btn.dataset.action === 'close') closeWin(id);
      })
    );
    const bar = $('.titlebar', el);
    if (bar) {
      bar.addEventListener('dblclick', (e) => { if (!e.target.closest('button')) toggleMax(id); });
      makeDraggable(el, bar);
    }
  });

  // każdy element z data-open (dock, menu bar, przyciski) otwiera okno
  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-open]');
    if (!o) return;
    e.preventDefault();
    openWindow(o.dataset.open);
  });

  window.addEventListener('resize', () => {
    Object.values(wins).forEach(({ el }) => {
      if (el.hidden || isMobile()) return;
      el.style.left = clamp(el.offsetLeft, 8, Math.max(8, panels.clientWidth - el.offsetWidth - 8)) + 'px';
      el.style.top = clamp(el.offsetTop, 8, Math.max(8, panels.clientHeight - 120)) + 'px';
    });
  });
}

function place(id) {
  const el = wins[id].el;
  const W = panels.clientWidth;
  const H = panels.clientHeight - dockH() - 18 - 10;
  const w = el.offsetWidth, h = el.offsetHeight;
  let x = (W - w) / 2, y = (H - h) / 2;
  if (id !== 'home') {
    // sekcje lekko przesunięte względem home — warstwowo, jak okna systemu
    const n = cascadeN++ % 3;
    x += 40 + n * 22;
    y += 26 + n * 18;
  }
  el.style.left = clamp(x, 8, Math.max(8, W - w - 8)) + 'px';
  el.style.top = clamp(y, 10, Math.max(10, H - h)) + 'px';
  wins[id].placed = true;
}

function showWin(id) {
  const w = wins[id];
  clearTimeout(w.timer);
  w.el.classList.remove('is-closing');
  if (w.min) {                      // przywrócenie z docka (odwrotna animacja)
    w.min = false;
    w.el.hidden = false;
    void w.el.offsetWidth;
    w.el.classList.remove('is-min');
    SFX.play('open');
    return;
  }
  if (!w.el.hidden) return;
  SFX.play('open');
  w.el.classList.add('is-opening');
  w.el.hidden = false;
  if (!w.placed) place(id);
  void w.el.offsetWidth; // reflow → animacja
  w.el.classList.remove('is-opening');
}

function openWindow(id) {
  const w = wins[id];
  if (!w) return;

  // LINKS jest małym oknem pomocniczym otwieranym NAD ABOUT.
  // Nie zamyka About i po zamknięciu wracamy dokładnie do niego.
  if (id === 'links') {
    overlayParent = (panel && panel !== 'links') ? panel : (front && front !== 'home' ? front : 'about');
    showWin('links');
    focusWin('links');
    updateDock();
    w.el.focus({ preventScroll: true });
    return;
  }

  // przejście do innej głównej sekcji zamyka ewentualny overlay LINKS od razu
  if (wins.links && !wins.links.el.hidden) {
    wins.links.el.hidden = true;
    wins.links.el.classList.remove('is-closing', 'is-opening', 'is-min');
    wins.links.min = false;
    overlayParent = null;
  }

  if (id === 'home') {
    const prev = panel;
    showWin('home');
    focusWin('home');
    updateDock();

    // Na mobile najpierw pokazujemy HOME pod starym oknem, dopiero potem
    // wygaszamy stare okno. Nie ma pustej klatki / błysku między ekranami.
    if (prev) {
      if (isMobile()) setTimeout(() => closeWin(prev), 55);
      else closeWin(prev);
    }
    return;
  }

  const prev = panel && panel !== id ? panel : null;

  if (isMobile() && prev) {
    // MOBILE: crossfade sekcja → sekcja.
    // Najpierw nowe okno trafia NAD stare, więc HOME nigdy nie przebija.
    panel = id;
    showWin(id);
    focusWin(id);
    updateDock();
    w.el.focus({ preventScroll: true });

    // Stare okno zostaje pod spodem przez początek fade-in nowego.
    // Potem dopiero znika, co daje ciągłe, płynne przejście.
    setTimeout(() => closeWin(prev), 85);
    return;
  }

  if (prev) closeWin(prev);
  panel = id;
  showWin(id);
  focusWin(id);
  updateDock();
  w.el.focus({ preventScroll: true });
}

function focusWin(id) {
  const w = wins[id];
  if (!w || w.el.hidden) return;
  w.el.style.zIndex = ++z;
  front = id;
  Object.entries(wins).forEach(([k, o]) => o.el.classList.toggle('is-active', k === id));
  setNav(id);
  syncUI();
}

function closeWin(id) {
  const w = wins[id];
  if (!w) return;
  if (w.min) {                      // zminimalizowane → po prostu zamknij
    w.min = false;
    w.el.classList.remove('is-min');
    w.el.hidden = true;
    if (panel === id) panel = null;
    updateDock();
    return;
  }
  if (w.el.hidden) return;

  if (id === 'links') {
    const backTo = overlayParent;
    SFX.play('close');
    w.el.classList.add('is-closing');
    clearTimeout(w.timer);
    w.timer = setTimeout(() => {
      w.el.hidden = true;
      w.el.classList.remove('is-closing', 'is-max');
      front = null;
      overlayParent = null;
      if (backTo && wins[backTo] && !wins[backTo].el.hidden) focusWin(backTo);
      else if (wins.about && !wins.about.el.hidden) focusWin('about');
      updateDock();
    }, 180);
    return;
  }

  SFX.play('close');
  w.el.classList.add('is-closing');
  clearTimeout(w.timer);
  w.timer = setTimeout(() => { w.el.hidden = true; w.el.classList.remove('is-closing', 'is-max'); }, 180);
  if (panel === id) panel = null;
  if (front === id) {
    front = null;
    const next = Object.keys(wins).find((k) => k !== id && !wins[k].el.hidden && !wins[k].min && !wins[k].el.classList.contains('is-closing'));
    if (next) focusWin(next);
    else { Object.values(wins).forEach((o) => o.el.classList.remove('is-active')); setNav(null); }
  }
  setTimeout(updateDock, 190);
}

// żółte światło → okno „wpada” do swojej ikony w docku
function minimize(id) {
  const w = wins[id];
  if (!w || w.el.hidden || w.min) return;
  const r = w.el.getBoundingClientRect();
  const target = $(`.dock [data-open="${id}"]`);
  const t = target ? target.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight, width: 0, height: 0 };
  const dx = (t.left + t.width / 2) - (r.left + r.width / 2);
  const dy = (t.top + t.height / 2) - (r.top + r.height / 2);
  w.el.style.setProperty('--min-t', `translate(${dx}px, ${dy}px) scale(.06)`);
  w.min = true;
  w.el.classList.add('is-min');
  SFX.play('min');
  clearTimeout(w.timer);
  w.timer = setTimeout(() => { if (w.min) w.el.hidden = true; }, 360);
  if (front === id) {
    front = null;
    const next = Object.keys(wins).find((k) => k !== id && !wins[k].el.hidden && !wins[k].min && !wins[k].el.classList.contains('is-closing'));
    if (next) focusWin(next);
    else { Object.values(wins).forEach((o) => o.el.classList.remove('is-active')); setNav(null); }
  }
  updateDock();
  if (target) { target.classList.remove('is-bump'); void target.offsetWidth; target.classList.add('is-bump'); }
}

function updateDock() {
  if (typeof syncUI === 'function') syncUI();
  $$('.dock [data-open]').forEach((b) => {
    const w = wins[b.dataset.open];
    b.classList.toggle('is-open', !!w && (w.min || (!w.el.hidden && !w.el.classList.contains('is-closing'))));
  });
}

function setNav(id) {
  const navId = id === 'links' ? (overlayParent || 'about') : id;
  $$('.dock [data-open]').forEach((b) => {
    const on = b.dataset.open === navId;
    b.classList.toggle('is-current', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
}

function toggleMax(id) {
  if (isMobile()) return;
  const on = wins[id].el.classList.toggle('is-max');
  if (id === 'home') store.set('purra_home', on ? 'full' : 'window');
  if (!on) place(id);   // wracając do okna — wyśrodkuj
  SFX.play('zoom');
  setTimeout(wavesResize, 300);
}

function makeDraggable(el, handle) {
  let sx = 0, sy = 0, ox = 0, oy = 0, drag = false;
  handle.addEventListener('pointerdown', (e) => {
    if (isMobile() || e.button !== 0 || e.target.closest('button') || el.classList.contains('is-max')) return;
    drag = true;
    sx = e.clientX; sy = e.clientY; ox = el.offsetLeft; oy = el.offsetTop;
    handle.setPointerCapture(e.pointerId);
    el.classList.add('is-dragging');
  });
  handle.addEventListener('pointermove', (e) => {
    if (!drag) return;
    el.style.left = clamp(ox + e.clientX - sx, -el.offsetWidth + 120, panels.clientWidth - 120) + 'px';
    el.style.top = clamp(oy + e.clientY - sy, 0, panels.clientHeight - 120) + 'px';
  });
  const end = () => { drag = false; el.classList.remove('is-dragging'); };
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
}

/* =========================================================
   TOOLTIP / NOTIFY / DIALOG / GLITCH
   ========================================================= */
function setupTooltips() {
  const tip = $('#tooltip');
  let timer = 0;
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-tip]');
    if (!t || e.pointerType !== 'mouse' || !t.dataset.tip) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      tip.textContent = t.dataset.tip;
      const r = t.getBoundingClientRect();
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      const x = clamp(r.left + r.width / 2 - tw / 2, 6, innerWidth - tw - 6);
      const y = r.top > innerHeight / 2 ? r.top - th - 8 : r.bottom + 8;
      tip.style.transform = `translate(${x}px, ${y}px)`;
      tip.classList.add('is-on');
    }, 450);
  });
  document.addEventListener('pointerout', (e) => {
    const t = e.target.closest('[data-tip]');
    if (t && !t.contains(e.relatedTarget)) { clearTimeout(timer); tip.classList.remove('is-on'); }
  });
  document.addEventListener('pointerdown', () => { clearTimeout(timer); tip.classList.remove('is-on'); });
}

function notify(title, text) {
  const n = document.createElement('div');
  n.className = 'notif';
  n.setAttribute('role', 'status');
  n.innerHTML = '<div><b></b><p></p></div><button class="notif__x" type="button" aria-label="dismiss">×</button>';
  n.querySelector('b').textContent = title;
  n.querySelector('p').textContent = text;
  $('#notifs').appendChild(n);
  const kill = () => { n.classList.add('is-out'); setTimeout(() => n.remove(), 240); };
  n.querySelector('button').addEventListener('click', kill);
  setTimeout(kill, 5000);
}

let dialogTimer = 0;
let dialogReturn = null;
function dialog(title, msg, { auto = 0, warn = false } = {}) {
  const d = $('#dialog');
  dialogReturn = document.activeElement;
  $('#dialogTitle').textContent = title;
  $('#dialogMsg').textContent = msg;
  const alertBox = $('.alert', d);
  if (alertBox) alertBox.classList.toggle('is-warn', warn);
  SFX.play(warn ? 'error' : 'pop');
  d.hidden = true; void d.offsetWidth; // restart animacji
  d.hidden = false;
  clearTimeout(dialogTimer);
  if (auto) dialogTimer = setTimeout(closeDialog, auto);
  $('#dialogOk').focus({ preventScroll: true });
}
function closeDialog() {
  const d = $('#dialog');
  if (d.hidden) return false;
  d.hidden = true;
  if (dialogReturn && document.contains(dialogReturn)) dialogReturn.focus({ preventScroll: true });
  return true;
}
function setupDialog() {
  $('#dialogOk').addEventListener('click', closeDialog);
  $('#dialog').addEventListener('click', (e) => { if (e.target === $('#dialog')) closeDialog(); });
}

function glitch() {
  if (reduced) return;
  document.body.classList.remove('is-glitch');
  void document.body.offsetWidth;
  document.body.classList.add('is-glitch');
  setTimeout(() => document.body.classList.remove('is-glitch'), 550);
}

/* =========================================================
   SFX — dźwięki interfejsu generowane w Web Audio (bez plików).
   Bardzo ciche. Wyłącznik: ikona głośnika w docku (zapamiętywany).
   Osobny kontekst — nie dotyka odtwarzacza beatów.
   ========================================================= */
const SFX = {
  ctx: null,
  on: store.get('purra_sfx') === '1',
  volume: 0.15,   // ← GŁOŚNOŚĆ dźwięków UI (0–1)
  init() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  tone(f1, f2, dur, { type = 'sine', gain = 0.05, delay = 0 } = {}) {
    const c = this.ctx;
    if (!c) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain * this.volume, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  },
  noise(dur, { gain = 0.03, freq = 3000 } = {}) {
    const c = this.ctx;
    if (!c) return;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
    const src = c.createBufferSource();
    const f = c.createBiquadFilter();
    const g = c.createGain();
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.2;
    g.gain.value = gain * this.volume;
    src.buffer = buf;
    src.connect(f).connect(g).connect(c.destination);
    src.start();
  },
  play(name) {
    if (!this.on || !this.ctx || this.ctx.state !== 'running') return;
    switch (name) {
      case 'tap':   this.noise(0.025, { gain: 0.05, freq: 4200 }); this.tone(2100, 1500, 0.03, { type: 'triangle', gain: 0.02 }); break;
      case 'open':  this.tone(520, 880, 0.12, { gain: 0.04 }); this.tone(880, 1320, 0.1, { gain: 0.025, delay: 0.05 }); break;
      case 'close': this.tone(760, 420, 0.12, { gain: 0.035 }); break;
      case 'min':   this.tone(900, 220, 0.3, { type: 'triangle', gain: 0.035 }); this.noise(0.25, { gain: 0.02, freq: 1400 }); break;
      case 'zoom':  this.tone(440, 660, 0.09, { type: 'triangle', gain: 0.035 }); break;
      case 'nav':   this.tone(1240, 0, 0.05, { type: 'triangle', gain: 0.03 }); break;
      case 'pop':   this.tone(990, 1480, 0.07, { gain: 0.04 }); this.tone(1480, 0, 0.12, { gain: 0.03, delay: 0.06 }); break;
      case 'error': this.tone(196, 0, 0.12, { type: 'square', gain: 0.025 }); this.tone(165, 0, 0.16, { type: 'square', gain: 0.025, delay: 0.11 }); break;
      case 'play':  this.tone(660, 990, 0.08, { type: 'triangle', gain: 0.035 }); break;
      case 'pause': this.tone(990, 660, 0.08, { type: 'triangle', gain: 0.03 }); break;
      case 'copy':  this.tone(1320, 0, 0.05, { gain: 0.035 }); this.tone(1760, 0, 0.08, { gain: 0.03, delay: 0.05 }); break;
      default: break;
    }
  },
  setOn(v) {
    this.on = v;
    store.set('purra_sfx', v ? '1' : '0');
    document.body.classList.toggle('sfx-off', !v);
    const b = $('#sfxBtn');
    b.setAttribute('aria-pressed', String(v));
    b.dataset.tip = `sounds: ${v ? 'on' : 'off'}`;
  },
};

function setupSfx() {
  SFX.setOn(SFX.on);
  // kontekst audio może wystartować dopiero po geście użytkownika
  document.addEventListener('pointerdown', () => SFX.init(), { capture: true });
  document.addEventListener('keydown', () => SFX.init(), { capture: true });
  $('#sfxBtn').addEventListener('click', () => { SFX.setOn(!SFX.on); if (SFX.on) SFX.play('pop'); });
}

/* =========================================================
   AUDIO — JEDEN wspólny element Audio() i jeden stan P.
   HOME, floating player i archive to tylko różne kontrolki
   tego samego odtwarzania.
   ========================================================= */
const audio = new Audio();
audio.preload = 'metadata';
const P = { track: null, playing: false, demo: false, demoT: 0, demoDur: 0, pendingFrac: 0, demoNotified: false, last: 0 };
let miniCollapsed = false;

/* --- czas --- */
const cur = () => (P.demo ? P.demoT : audio.currentTime || 0);
const dur = () => {
  if (!P.track) return 0;
  if (P.demo) return P.demoDur;
  return isFinite(audio.duration) && audio.duration > 0 ? audio.duration : parseLen(P.track.length);
};

/* --- sterowanie --- */
function safePlay(track) {
  let pr;
  try { pr = audio.play(); } catch { enterDemo(track); return; }
  if (pr && typeof pr.catch === 'function') {
    pr.catch((err) => {
      if (err && err.name === 'AbortError') return;
      if (err && err.name === 'NotAllowedError') { setPlaying(false); return; }
      enterDemo(track);
    });
  }
}

function playTrack(track, frac = null) {
  if (!track) return;
  if (track === P.track) {
    if (frac !== null) { seekFrac(frac); if (!P.playing) toggle(); }
    else toggle();
    return;
  }
  P.track = track;
  P.demo = false;
  P.playing = false;
  P.demoT = 0;
  P.pendingFrac = frac || 0;
  audio.src = track.src;
  safePlay(track);
  syncUI();
}

// brak pliku audio → podgląd wizualny (wyraźnie oznaczony „demo”)
function enterDemo(track) {
  if (P.demo || track !== P.track) return;
  P.demo = true;
  P.demoDur = parseLen(track.length) || 150;
  P.demoT = (P.pendingFrac || 0) * P.demoDur;
  P.pendingFrac = 0;
  setPlaying(true);
  if (!P.demoNotified) {
    P.demoNotified = true;
    notify('demo mode', `no file at ${track.src} — visual preview only. drop your mp3s into /audio.`);
  }
}

function toggle() {
  if (!P.track) { playTrack(FEATURED); return; }
  if (P.demo) { setPlaying(!P.playing); return; }
  if (audio.paused) safePlay(P.track); else audio.pause();
}

function seekFrac(f) {
  const d = dur();
  if (!d) return;
  if (P.demo) P.demoT = f * d;
  else if (isFinite(audio.duration)) audio.currentTime = f * audio.duration;
  else P.pendingFrac = f;
}

function next() {
  if (!P.track) return;
  const L = P.track.list;
  playTrack(L[(P.track.index + 1) % L.length]);
}
function prev() {
  if (!P.track) return;
  if (cur() > 3) { seekFrac(0); return; }
  const L = P.track.list;
  playTrack(L[(P.track.index - 1 + L.length) % L.length]);
}

function setPlaying(v) {
  if (v !== P.playing) SFX.play(v ? 'play' : 'pause');
  P.playing = v;
  syncUI();
}

/* --- synchronizacja WSZYSTKICH kontrolek z jednym stanem --- */
function syncUI() {
  const t = P.track, on = P.playing;
  document.body.classList.toggle('audio-on', on);
  document.body.classList.toggle('has-track', !!t);

  // wiersze w archive / old_beats
  $$('[data-row]').forEach((r) => {
    const act = !!t && r.dataset.row === t.id;
    r.classList.toggle('is-active', act);
    r.classList.toggle('is-playing', act && on);
    const b = $('.file__play', r);
    if (b) b.setAttribute('aria-label', `${act && on ? 'pause' : 'play'} ${r.dataset.title}`);
  });

  // HOME — odtwarzacz
  trackInfo();
  $('#nwPlay').classList.toggle('is-playing', on);
  $('#nwPlay').setAttribute('aria-label', on ? 'pause' : 'play');
  $('#nowCard').classList.toggle('is-playing', on);
  const st = $('#npState');
  setText(st, !t ? 'ready' : P.demo ? (on ? 'demo' : 'paused') : on ? 'playing' : 'paused');

  // floating player — tylko gdy HOME nie jest na wierzchu
  const home = wins.home;
  const homeVisible = home && !home.el.hidden && !home.min && front === 'home';
  const mini = $('#mini');
  const miniRestore = $('#miniRestore');
  const canShowMini = !!t && !homeVisible;
  const collapsedOnMobile = isMobile() && miniCollapsed && canShowMini;
  mini.hidden = !canShowMini || collapsedOnMobile;
  if (miniRestore) miniRestore.hidden = !collapsedOnMobile;
  document.body.classList.toggle('mini-on', !mini.hidden);
  document.body.classList.toggle('mini-collapsed', collapsedOnMobile);
  mini.classList.toggle('is-playing', on);
  $('#miniPlay').setAttribute('aria-label', on ? 'pause' : 'play');

  document.title = on ? '▶ purra — producer' : 'purra — producer';
}

/* --- celowo bez podglądu czasu i postępu (nie widać, ile zostało) --- */
function updateProgress() {}

// minimalne info: numer tracka (bez tytułów i szczegółów)
function trackInfo() {
  const t = P.track || FEATURED;
  if (!t) return;
  const L = t.list || BEATS;
  const no = pad(t.index + 1);
  setText($('#nwNum'), no);
  setText($('#nwOf'), t.archived ? '/ archive' : `/ ${pad(L.length)}`);
  setText($('#nwTrackLabel'), `track #${no}`);
  setText($('#miniNum'), `track #${no}`);
  setBuy($('#buyBeats'), t);
}

/* =========================================================
   HOME VISUAL — tylko wariant WAVE
   ========================================================= */

/* --- poziome słupki w karcie „now playing” --- */
function levels(n, t, E) {
  const bpm = (P.track || FEATURED || { bpm: 140 }).bpm;
  const pulse = P.playing ? E * Math.pow(1 - ((cur() * bpm / 60) % 1), 4) : 0;
  const out = [];
  for (let i = 0; i < n; i++) {
    const v = 0.5 + 0.5 * Math.sin(i * 0.9 + t * 2.1) * Math.sin(i * 0.23 - t * 1.3);
    out.push({ v, a: 0.06 + E * (0.35 + 0.65 * v) * 0.9 + pulse * 0.25 * v });
  }
  return out;
}

function drawLevelsRow(ctx, w, h, t, E) {
  const bw = 2, gap = 3;
  const n = Math.floor(w / (bw + gap));
  levels(n, t, E).forEach(({ v, a }, k) => {
    const bh = Math.max(2, h * (0.08 + 0.85 * a));
    ctx.fillStyle = E > 0.3 && v > 0.9 ? `rgba(255,63,164,${0.7 * E})` : `rgba(255,255,255,${0.16 + 0.2 * E})`;
    ctx.fillRect(k * (bw + gap), (h - bh) / 2, bw, bh);
  });
}

const NV = { c: null, ctx: null, w: 0, h: 0, dpr: 1, t: 0, e: 0 };
function nowVizDraw(dt) {
  const c = NV.c;
  if (!NV.ctx || !c || !c.clientWidth) return;
  if (c.clientWidth !== NV.w || c.clientHeight !== NV.h) {
    NV.dpr = Math.min(window.devicePixelRatio || 1, 2);
    NV.w = c.clientWidth;
    NV.h = c.clientHeight;
    c.width = Math.round(NV.w * NV.dpr);
    c.height = Math.round(NV.h * NV.dpr);
  }
  NV.e += ((P.playing ? 1 : 0) - NV.e) * Math.min(1, dt * 3);
  NV.t += dt * (0.4 + 0.8 * NV.e);
  NV.ctx.setTransform(NV.dpr, 0, 0, NV.dpr, 0, 0);
  NV.ctx.clearRect(0, 0, NV.w, NV.h);
  drawLevelsRow(NV.ctx, NV.w, NV.h, NV.t, NV.e);
}

/* --- WAVE: miękkie fale w tle, subtelnie reagujące na playback --- */
const WV = { c: null, ctx: null, w: 0, h: 0, dpr: 1, t: 0, e: 0 };
function wavesResize() {
  const c = WV.c;
  if (!c || !c.clientWidth) return;
  WV.dpr = Math.min(window.devicePixelRatio || 1, 2);
  WV.w = c.clientWidth;
  WV.h = c.clientHeight;
  c.width = Math.round(WV.w * WV.dpr);
  c.height = Math.round(WV.h * WV.dpr);
}

function wavesDraw(dt) {
  const { c, ctx } = WV;
  if (!ctx || !c || !c.clientWidth) return;
  if (c.clientWidth !== WV.w || c.clientHeight !== WV.h) wavesResize();
  const w = WV.w, h = WV.h;
  WV.e += ((P.playing ? 1 : 0) - WV.e) * Math.min(1, dt * 1.2);
  const E = WV.e;
  WV.t += dt * (0.1 + 0.22 * E);
  const t = WV.t;
  const bpm = (P.track || FEATURED || { bpm: 140 }).bpm;
  const beat = P.playing ? Math.pow(1 - ((cur() * bpm / 60) % 1), 3) : 0;
  ctx.setTransform(WV.dpr, 0, 0, WV.dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const mob = isMobile();
  const base = mob ? 0.16 : 0.34;
  const bands = [
    { y: base + 0.00, a: 0.10, f: 0.9, s: 0.6,  p: 0.0, top: [255, 255, 255, 0.045], line: 0.12 },
    { y: base + 0.10, a: 0.09, f: 1.2, s: -0.5, p: 1.8, top: [255, 63, 164, 0.10],  line: 0.0, pink: true },
    { y: base + 0.20, a: 0.08, f: 1.5, s: 0.7,  p: 3.3, top: [150, 165, 200, 0.06], line: 0.08 },
    { y: base + 0.32, a: 0.07, f: 1.1, s: -0.4, p: 4.6, top: [0, 0, 0, 0.35],       line: 0.05 },
  ];
  bands.forEach((B) => {
    const amp = h * B.a * (1 + 0.25 * E + 0.08 * beat);
    const pts = [];
    for (let x = -10; x <= w + 10; x += 10) {
      const u = x / w;
      pts.push([x, h * B.y
        + Math.sin(u * Math.PI * B.f + t * B.s + B.p) * amp
        + Math.sin(u * Math.PI * B.f * 2.4 - t * B.s * 1.4 + B.p * 2) * amp * 0.28]);
    }
    const [r, g, b, al] = B.top;
    const alpha = B.pink ? al * (0.6 + 0.8 * E) : al;
    const grad = ctx.createLinearGradient(0, h * (B.y - B.a), 0, h * (B.y + 0.45));
    grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.beginPath();
    pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.lineTo(w + 10, h);
    ctx.lineTo(-10, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.beginPath();
    pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.lineWidth = B.pink ? 1.4 : 1;
    ctx.strokeStyle = B.pink ? `rgba(255,63,164,${0.3 + 0.35 * E})` : `rgba(255,255,255,${B.line})`;
    ctx.stroke();
  });
}

function setupViz() {
  NV.c = $('#nowViz');
  NV.ctx = NV.c && NV.c.getContext ? NV.c.getContext('2d') : null;
}

function setupWaves() {
  WV.c = $('#waves');
  WV.ctx = WV.c && WV.c.getContext ? WV.c.getContext('2d') : null;
  wavesResize();
}

/* --- jedna pętla: audio demo + waveformy + wave HOME --- */
function loop(now) {
  const dt = P.last ? Math.min((now - P.last) / 1000, 0.1) : 0;
  P.last = now;
  if (P.demo && P.playing) {
    P.demoT += dt;
    if (P.demoT >= P.demoDur) { P.demoT = P.demoDur; setPlaying(false); next(); }
  }
  if (P.track) updateProgress();
  if (!document.hidden) {
    if (reduced) { wavesDraw(0); nowVizDraw(0); }
    else { wavesDraw(dt); nowVizDraw(dt); }
  }
  requestAnimationFrame(loop);
}

/* --- TRANSPORT: wstecz / play-pauza / dalej (bez listy, bez szczegółów) --- */
function startOrToggle() {
  if (!P.track) { playTrack(FEATURED || BEATS[0]); return; }
  toggle();
}
function step(dir) {
  if (!BEATS.length) return;
  if (!P.track || P.track.archived) { playTrack(dir > 0 ? (FEATURED || BEATS[0]) : BEATS[BEATS.length - 1]); return; }
  if (dir > 0) next(); else prev();
}
function setupTransport() {
  $('#nwPlay').addEventListener('click', startOrToggle);
  $('#nwPrev').addEventListener('click', () => step(-1));
  $('#nwNext').addEventListener('click', () => step(1));
  // brak przewijania w dowolne miejsce i brak podglądu czasu — tylko wstecz / play / dalej
  $('#miniPlay').addEventListener('click', startOrToggle);
  $('#miniPrev').addEventListener('click', () => step(-1));
  $('#miniNext').addEventListener('click', () => step(1));
  const miniHide = $('#miniHide');
  const miniRestore = $('#miniRestore');
  if (miniHide) miniHide.addEventListener('click', () => {
    if (!isMobile()) return;
    miniCollapsed = true;
    syncUI();
  });
  if (miniRestore) miniRestore.addEventListener('click', () => {
    miniCollapsed = false;
    syncUI();
  });
  mq.addEventListener?.('change', () => {
    if (!isMobile()) miniCollapsed = false;
    syncUI();
  });
  trackInfo();
}

function setupPlayer() {
  audio.addEventListener('play', () => { if (!P.demo) setPlaying(true); });
  audio.addEventListener('pause', () => { if (!P.demo) setPlaying(false); });
  audio.addEventListener('ended', next);
  audio.addEventListener('error', () => { if (P.track && !P.demo) enterDemo(P.track); });
  audio.addEventListener('loadedmetadata', () => {
    if (P.pendingFrac) { audio.currentTime = P.pendingFrac * audio.duration; P.pendingFrac = 0; }
  });
  audio.volume = 0.9;
  setupWaves();
  setupTransport();
  syncUI();
  requestAnimationFrame(loop);
}

/* =========================================================
   CONTACT
   ========================================================= */
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch {
    const ta = document.createElement('textarea');
    ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch { /* noop */ }
    ta.remove(); return ok;
  }
}

function setupKit() {
  // KIT jest zawsze widoczny jako część serwisu — nawet przed publikacją linku.
  // Gdy KIT.url jest pusty, przycisk GET pokazuje komunikat „coming soon”.

  setText($('#kitWinTitle'), KIT.title);
  setText($('#kitTitle'), KIT.title);
  setText($('#kitTagline'), KIT.tagline);
  setText($('#kitArtWord'), KIT.title.split(' ')[0]);
  setText($('#kitArtTag'), KIT.tagline);
  setText($('#kitPrice'), KIT.price);
  setText($('#promoTitle'), KIT.title);
  setText($('#promoTagline'), KIT.url ? KIT.tagline : (KIT.tagline || 'coming soon'));
  const promoBadge = $('#kitPromo .promo__tag');
  if (promoBadge) promoBadge.textContent = KIT.url ? 'new' : 'soon';
  const list = $('#kitList');
  list.innerHTML = KIT.contents.map((c) => `<li>${esc(c)}</li>`).join('');
  list.hidden = !KIT.contents.length;
  const get = $('#kitGet');
  const getLabel = $('span', get);
  if (KIT.url) {
    get.href = KIT.url;
    get.target = '_blank';
    get.rel = 'noopener';
    get.classList.remove('is-soon');
    get.removeAttribute('aria-disabled');
    if (getLabel) getLabel.textContent = 'get kit';
  } else {
    get.setAttribute('href', '#');
    get.removeAttribute('target');
    get.removeAttribute('rel');
    get.classList.add('is-soon');
    get.setAttribute('aria-disabled', 'true');
    if (getLabel) getLabel.textContent = 'coming soon';
  }
  get.addEventListener('click', (e) => {
    if (KIT.url) return;
    e.preventDefault();
  });
}

function setupContact() {
  const bindCopy = (btn) => {
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const ok = await copyText(CONFIG.email);
      if (ok) SFX.play('copy');
      dialog('purra', ok ? `copied to clipboard — ${CONFIG.email}` : `couldn't copy. email: ${CONFIG.email}`, { auto: 1800 });
      btn.textContent = 'copied';
      btn.classList.add('is-done');
      setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('is-done'); }, 1400);
    });
  };
  bindCopy($('#copyEmail'));
  bindCopy($('#copyEmailLinks'));
}

/* =========================================================
   ARCHIVE — nawigacja po folderach
   ========================================================= */
const FOLDERS = [
  { id: 'placements' },
  { id: 'old_beats' },
  { id: 'unreleased', locked: true },
  { id: '???', locked: true, odd: true },
];
const FOLDER_SVG = '<svg viewBox="0 0 48 40" aria-hidden="true"><use href="#i-folder"/></svg>';
const LOCK_SVG = '<span class="folder__lock" aria-hidden="true"><svg><use href="#g-lock"/></svg></span>';

let archParent = 'root';
const spotifyId = (url) => { const m = String(url || '').match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?track\/([A-Za-z0-9]+)/); return m ? m[1] : ''; };

function renderArchive(view = 'root') {
  const box = $('#archView');
  const root = view === 'root';
  const isPl = view.startsWith('placement:');
  const pl = isPl ? PLACEMENTS[+view.split(':')[1]] : null;
  archParent = isPl ? 'placements' : 'root';
  setText($('#archTitle'), root ? 'archive' : pl ? pl.title.toLowerCase() : view);
  $('#archUp').disabled = root;
  box.style.animation = 'none'; void box.offsetWidth; box.style.animation = '';

  if (root) {
    box.innerHTML = `<div class="folders">${FOLDERS.map((f) => `
      <button class="folder${f.odd ? ' folder--odd' : ''}" type="button" data-folder="${esc(f.id)}"
        aria-label="${f.locked ? 'locked folder' : 'folder'} ${esc(f.id)}">
        ${FOLDER_SVG}${f.locked ? LOCK_SVG : ''}<span>${esc(f.id)}</span>
      </button>`).join('')}</div>`;
    setText($('#archStatus'), `${FOLDERS.length} items · purra : archive`);
    return;
  }

  SFX.play('nav');
  if (view === 'placements') {
    if (!PLACEMENTS.length) {
      box.innerHTML = `<div class="empty">${FOLDER_SVG}<span>no public placements indexed yet.</span></div>`;
    } else {
      box.innerHTML = `<ul class="credits">${PLACEMENTS.map((p, i) => `
        <li><button class="credit" type="button" data-pl="${i}" aria-label="open ${esc(p.title)}">
          <span class="credit__art" aria-hidden="true" data-cover="${i}"><b>${esc(p.title.trim().charAt(0).toLowerCase())}</b></span>
          <span class="credit__text">
            <b>${esc(p.title)}</b>
            <small>${esc(p.project || '')}${p.year ? ' · ' + esc(p.year) : ''}</small>
            <small class="credit__role">${esc(p.role || 'prod. purra')}</small>
          </span>
          <span class="credit__go" aria-hidden="true"><svg><use href="#g-arrow"/></svg></span>
        </button></li>`).join('')}</ul>`;
    }
    setText($('#archStatus'), `${PLACEMENTS.length} ${PLACEMENTS.length === 1 ? 'item' : 'items'} · public credits`);
    fillCovers(box);
    return;
  }

  if (pl) {
    const id = spotifyId(pl.url);
    box.innerHTML = `<div class="pl">
      <div class="pl__art" aria-hidden="true" data-cover="${view.split(':')[1]}"><b>${esc(pl.title.trim().charAt(0).toLowerCase())}</b></div>
      <div class="pl__info">
        <span class="feat__tag"><i class="dot"></i>placement</span>
        <h2 class="pl__title">${esc(pl.title)}</h2>
        <p class="pl__meta">${esc(pl.project || '')}${pl.year ? ' · ' + esc(pl.year) : ''}<br>${esc(pl.role || 'prod. purra')}</p>
        <div class="pl__actions">
          ${pl.url ? `<a class="buy buy--lg" href="${esc(pl.url)}" target="_blank" rel="noopener"><span>listen on spotify</span><svg aria-hidden="true"><use href="#g-arrow"/></svg></a>` : ''}
        </div>
      </div>
      ${id ? `<iframe class="pl__embed" title="${esc(pl.title)} on spotify" src="https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>` : ''}
    </div>`;
    setText($('#archStatus'), `placement · ${(pl.project || '').toLowerCase()}`);
    fillCovers(box);
    return;
  }

  if (view === '???') {
    box.innerHTML = `<div class="secret"><b>${esc(SECRET.title)}</b>${esc(SECRET.text)}</div>`;
    setText($('#archStatus'), 'unlocked');
    return;
  }

  if (view === 'old_beats') {
    if (!OLD_BEATS.length) {
      box.innerHTML = `<div class="empty">${FOLDER_SVG}<span>folder is empty.</span></div>`;
    } else {
      box.innerHTML = `<ul class="files">
        <li class="files__head" aria-hidden="true"><span></span><span>name</span><span>bpm</span><span class="h-key">key</span><span>time</span></li>
        ${OLD_BEATS.map((t) => `
          <li class="file" data-row="${t.id}" data-title="${esc(t.title)}">
            <button class="file__play" type="button" aria-label="play ${esc(t.title)}">${ICON_PP}</button>
            <span class="file__name"><svg aria-hidden="true"><use href="#i-file"/></svg><span>${esc(t.title.toLowerCase())}.mp3</span></span>
            <span>${t.bpm}</span>
            <span class="file__key">${esc(t.key)}</span>
            <span data-len="${t.id}">${esc(t.length)}</span>
          </li>`).join('')}
      </ul>`;
    }
    setText($('#archStatus'), `${OLD_BEATS.length} items`);
    syncUI();
  }
}

function openFolder(id) {
  const f = FOLDERS.find((x) => x.id === id);
  if (!f) return;
  if (f.odd) {
    if (unlocked()) { renderArchive('???'); return; }
    openCode();
    return;
  }
  if (f.locked) {
    dialog('access denied', `purra : archive : ${id} is private. not for public ears yet.`, { warn: true });
    return;
  }
  renderArchive(id);
}

/* --- okładki placementów: cover → coverFallback → automatycznie z oEmbed Spotify → wygenerowana --- */
const COVER_CACHE = new Map();
async function coverFor(i) {
  if (COVER_CACHE.has(i)) return COVER_CACHE.get(i);
  const p = PLACEMENTS[i];
  const list = [p.cover, p.coverFallback].filter(Boolean);
  if (!list.length && spotifyId(p.url)) {
    try {
      const r = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(p.url)}`);
      const j = await r.json();
      if (j && j.thumbnail_url) list.push(j.thumbnail_url);
    } catch { /* offline / zablokowane — zostaje wygenerowana okładka */ }
  }
  COVER_CACHE.set(i, list);
  return list;
}
function fillCovers(root) {
  $$('[data-cover]', root).forEach(async (box) => {
    const srcs = await coverFor(+box.dataset.cover);
    const tryNext = (k) => {
      if (k >= srcs.length) return;
      const img = new Image();
      img.alt = '';
      img.decoding = 'async';
      img.onload = () => { box.appendChild(img); box.classList.add('has-img'); };
      img.onerror = () => tryNext(k + 1);
      img.src = srcs[k];
    };
    tryNext(0);
  });
}

function renderCredits() {
  const el = $('#aboutCredits');
  if (!el) return;
  el.innerHTML = PLACEMENTS.length
    ? PLACEMENTS.map((p, i) => `<button class="credit-link" type="button" data-credit="${i}">${esc(p.title.toLowerCase())}${p.project ? ' — ' + esc(p.project.toLowerCase()) : ''}</button>`).join('')
    : 'no public placements yet';
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-credit]');
    if (!b) return;
    openWindow('archive');
    renderArchive(`placement:${b.dataset.credit}`);
  });
}

/* --- kod dostępu do ??? --- */
const unlocked = () => { try { return sessionStorage.getItem('purra_unlocked') === '1'; } catch { return false; } };
function openCode() {
  const d = $('#codeDialog');
  setText($('#codeMsg'), 'purra : archive : ???');
  $('#codeInput').value = '';
  d.hidden = false;
  SFX.play('pop');
  setTimeout(() => $('#codeInput').focus(), 30);
}
function closeCode() {
  const d = $('#codeDialog');
  if (d.hidden) return false;
  d.hidden = true;
  return true;
}
function setupCode() {
  $('#codeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#codeInput').value.trim().toLowerCase();
    if (v && v === String(SECRET.code).toLowerCase()) {
      try { sessionStorage.setItem('purra_unlocked', '1'); } catch { /* noop */ }
      closeCode();
      SFX.play('copy');
      renderArchive('???');
      return;
    }
    const f = $('#codeForm');
    f.classList.remove('is-shake'); void f.offsetWidth; f.classList.add('is-shake');
    SFX.play('error');
    glitch();
    setText($('#codeMsg'), 'access denied — wrong code');
    $('#codeInput').value = '';
    $('#codeInput').focus();
  });
  $('#codeCancel').addEventListener('click', closeCode);
  $('#codeDialog').addEventListener('click', (e) => { if (e.target === $('#codeDialog')) closeCode(); });
}

function setupArchive() {
  renderCredits();
  $('#archView').addEventListener('click', (e) => {
    const f = e.target.closest('[data-folder]');
    if (f) { openFolder(f.dataset.folder); return; }
    const pl = e.target.closest('[data-pl]');
    if (pl) { renderArchive(`placement:${pl.dataset.pl}`); return; }
    const row = e.target.closest('[data-row]');
    if (row && !e.target.closest('a')) playTrack(TRACKS.get(row.dataset.row));
  });
  $('#archUp').addEventListener('click', () => renderArchive(archParent));
  setupCode();
  // klik w odtwarzacz Spotify (iframe) → pauza beatu, żeby nie grały dwa naraz
  window.addEventListener('blur', () => {
    setTimeout(() => { if (document.activeElement && document.activeElement.tagName === 'IFRAME' && P.playing) toggle(); }, 0);
  });
  renderArchive('root');
}

/* =========================================================
   KLAWIATURA
   ========================================================= */
function setupKeys() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (closeCode()) return;
      if (closeDialog()) return;
      if (panel) closeWin(panel);
      return;
    }
    // ← / → = poprzedni / następny beat
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault();
      step(e.key === 'ArrowRight' ? 1 : -1);
      return;
    }
    // spacja = play / pause (gdy fokus nie jest na kontrolce)
    const tag = e.target && e.target.tagName;
    if (e.code === 'Space' && !['BUTTON', 'A', 'INPUT', 'TEXTAREA'].includes(tag)) {
      e.preventDefault();
      startOrToggle();
    }
  });
}

/* =========================================================
   EASTER EGG — 5 kliknięć w logo
   ========================================================= */
function setupEasterEgg() {
  let clicks = 0, t = 0;
  $('#logo').addEventListener('click', () => {
    clicks++;
    clearTimeout(t);
    t = setTimeout(() => (clicks = 0), 1500);
    if (clicks >= 5) {
      clicks = 0;
      glitch();
      notify('purra', 'you found it. something unreleased is loading… soon.');
    }
  });
}

/* =========================================================
   INTRO — pełne (~0.7 s) tylko przy 1. wejściu w sesji
   ========================================================= */
function intro() {
  // HOME: główny shell aplikacji, domyślnie na cały ekran z marginesem i dockiem
  if (store.get('purra_home') !== 'window') wins.home.el.classList.add('is-max');
  openWindow('home');
  requestAnimationFrame(wavesResize);
  if (reduced) return;
  document.body.classList.add('is-intro');
  setTimeout(() => document.body.classList.remove('is-intro'), 1300);
}

function boot() {
  const b = $('#boot');
  let quick = false;
  try {
    quick = sessionStorage.getItem('purra_booted') === '1';
    sessionStorage.setItem('purra_booted', '1');
  } catch { /* private mode */ }

  if (quick || !b) {
    if (b) b.remove();
    intro();
    return;
  }
  requestAnimationFrame(() => b.classList.add('is-loading'));
  setTimeout(() => {
    b.classList.add('is-done');
    setTimeout(() => b.remove(), 350);
    intro();
  }, reduced ? 150 : 700);
}

document.addEventListener('DOMContentLoaded', () => {
  applyConfig();

  setupWindows();
  setupDialog();
  setupSfx();
  setupTooltips();
  setupViz();
  setupPlayer();
  setupKit();
  setupContact();
  setupArchive();
  setupKeys();
  setupEasterEgg();
  boot();
});
