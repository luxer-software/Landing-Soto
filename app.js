/* =========================================================
   DATOS DEL LOCAL — reemplazá acá lo que esté marcado
   ========================================================= */
const LOCAL = {
  // Poné false cuando cargues el número y los horarios reales: se quitan las marcas "de ejemplo".
  ejemplo: true,
  // ⚠ NÚMERO DE EJEMPLO: código de país + área + número, sin "+" ni espacios.
  whatsapp: '5493510000000',
  // Ubicación tomada del link de Google Maps del local. Confirmá calle y número.
  direccion: 'Villa de Soto, Córdoba',
  // Horarios de ejemplo. 0 = domingo … 6 = sábado. Horas en formato 24 h; 24.5 = 00:30 del día siguiente.
  horarios: {
    0: [19.5, 24.5], 1: null, 2: [19.5, 24], 3: [19.5, 24], 4: [19.5, 24], 5: [19.5, 25], 6: [19.5, 25]
  },
  horariosTexto: 'Martes a domingo, 19:30 a 00:00 · viernes y sábado hasta la 01:00 · lunes cerrado'
};

// MENÚ DE EJEMPLO: reemplazá nombres, descripciones y precios (en pesos).
const MENU = [
  { id: 'hamburguesas', nombre: 'Hamburguesas', items: [
    { id: 'clasica', nombre: 'Good Clásica', desc: 'Medallón de 150 g, cheddar, lechuga, tomate y salsa Good en pan de papa.', precio: 9500, destacado: true },
    { id: 'doble', nombre: 'Doble Cheddar', desc: 'Doble medallón, doble cheddar y cebolla caramelizada.', precio: 12500, destacado: true, tag: 'La más pedida' },
    { id: 'bacon', nombre: 'Bacon Burguer', desc: 'Medallón, cheddar, panceta crocante y barbacoa ahumada.', precio: 12000, destacado: true },
    { id: 'serrana', nombre: 'La Serrana', desc: 'Medallón, provoleta, rúcula, jamón crudo y oliva.', precio: 13500 },
    { id: 'criolla', nombre: 'Criolla', desc: 'Medallón, huevo a la plancha, morrón asado y chimichurri de la casa.', precio: 12000 },
    { id: 'veggie', nombre: 'Veggie', desc: 'Medallón de garbanzos, palta, tomate y alioli de limón.', precio: 10500 }
  ]},
  { id: 'acompanar', nombre: 'Para acompañar', items: [
    { id: 'papas', nombre: 'Papas fritas', desc: 'Corte bastón, sal gruesa.', precio: 5500 },
    { id: 'papas-cheddar', nombre: 'Papas cheddar y panceta', desc: 'Con cheddar fundido, panceta y verdeo.', precio: 8000 },
    { id: 'aros', nombre: 'Aros de cebolla', desc: 'Rebozados en cerveza, con barbacoa.', precio: 6000 },
    { id: 'nuggets', nombre: 'Nuggets x8', desc: 'De pollo, con mostaza y miel.', precio: 6500 }
  ]},
  { id: 'bebidas', nombre: 'Bebidas', items: [
    { id: 'gaseosa', nombre: 'Gaseosa 500 ml', desc: 'Línea Coca-Cola.', precio: 2500 },
    { id: 'agua', nombre: 'Agua 500 ml', desc: 'Con o sin gas.', precio: 2000 },
    { id: 'limonada', nombre: 'Limonada casera', desc: 'Con menta y jengibre, jarra de 1 litro.', precio: 4500 },
    { id: 'cerveza', nombre: 'Cerveza lata 473 ml', desc: 'Rubia o negra.', precio: 3500 }
  ]},
  { id: 'postres', nombre: 'Postres', items: [
    { id: 'brownie', nombre: 'Brownie con helado', desc: 'Tibio, con helado de crema americana.', precio: 5000 },
    { id: 'flan', nombre: 'Flan casero', desc: 'Con dulce de leche o crema.', precio: 4500 }
  ]}
];

// RESEÑAS DE EJEMPLO: reemplazalas por reseñas reales de Google.
const RESENAS = [
  { texto: 'La Doble Cheddar es de otro planeta. Pedimos por WhatsApp y a los veinte minutos estaba en casa, calentita.', nombre: 'Lucía M.', estrellas: 5, cuando: 'hace 2 semanas' },
  { texto: 'Lugar lindo, atención rápida y las papas con cheddar son para volver. Buen precio para lo que es.', nombre: 'Martín G.', estrellas: 5, cuando: 'hace 1 mes' },
  { texto: 'Fui con amigos un sábado: lleno pero nos atendieron enseguida. La Serrana tiene un provoleta buenísimo.', nombre: 'Sofía R.', estrellas: 4, cuando: 'hace 1 mes' }
];

/* ========================================================= */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const ITEMS = Object.fromEntries(MENU.flatMap(c => c.items).map(i => [i.id, i]));
const fmt = n => '$' + Math.round(n).toLocaleString('es-AR');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const icon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- Estado de la comanda ---------- */
const STORE = 'gb-comanda';
let cart = {};
try { cart = JSON.parse(localStorage.getItem(STORE)) || {}; } catch { cart = {}; }
for (const id in cart) if (!ITEMS[id] || cart[id] < 1) delete cart[id];
const ticketNo = (() => {
  let n; try { n = sessionStorage.getItem('gb-no'); } catch {}
  if (!n) { n = String(Math.floor(1000 + Math.random() * 9000)); try { sessionStorage.setItem('gb-no', n); } catch {} }
  return n;
})();
const save = () => { try { localStorage.setItem(STORE, JSON.stringify(cart)); } catch {} };
const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
const total = () => Object.entries(cart).reduce((a, [id, q]) => a + ITEMS[id].precio * q, 0);

/* ---------- Render de la comanda ---------- */
let shownTotal = 0;
function ticketHTML() {
  const entries = Object.entries(cart);
  const lines = entries.length
    ? entries.map(([id, q]) => {
        const it = ITEMS[id];
        return `<div class="t-line" data-line="${id}">
          <span class="t-qty">${q}×</span>
          <span class="t-name">${esc(it.nombre)}</span>
          <span class="t-sub">${fmt(it.precio * q)}</span>
          <span class="t-step">
            <button class="step" type="button" data-dec="${id}" aria-label="Quitar una ${esc(it.nombre)}">${icon('minus')}</button>
            <button class="step" type="button" data-inc="${id}" aria-label="Sumar una ${esc(it.nombre)}">${icon('plus')}</button>
          </span>
        </div>`;
      }).join('')
    : `<div class="t-empty">${icon('burger')}La comanda está en blanco.<br>Sumá algo del menú y se imprime acá.</div>`;
  return `<div class="ticket" role="region" aria-label="Comanda">
    <div class="t-head">
      <div class="t-brand">Good Burguer</div>
      <div class="t-meta"><span>Comanda Nº ${ticketNo}</span><span data-clock></span></div>
    </div>
    <div class="t-lines" aria-live="polite">${lines}</div>
    <div class="t-total"><span>Total</span><strong data-total>${fmt(shownTotal)}</strong></div>
    <a class="t-go" href="#pedido" ${entries.length ? '' : 'aria-disabled="true" tabindex="-1"'}>${icon('wa')}Completar y enviar</a>
    <p class="t-foot">El envío se confirma por WhatsApp</p>
  </div>`;
}

function renderTickets(changedId) {
  const act = document.activeElement;
  const refocus = act && act.closest && act.closest('[data-ticket-host]') && (act.dataset.inc || act.dataset.dec)
    ? { host: act.closest('[data-ticket-host]').dataset.ticketHost, sel: act.dataset.inc ? `[data-inc="${act.dataset.inc}"]` : `[data-dec="${act.dataset.dec}"]` }
    : null;
  $$('[data-ticket-host]').forEach(host => {
    host.innerHTML = ticketHTML();
    if (changedId) {
      const line = $(`[data-line="${changedId}"]`, host);
      if (line) line.classList.add('printing');
      const t = $('.ticket', host);
      if (t && !reduced) t.classList.add('swing');
    }
  });
  const c = count(), t = total();
  $$('[data-count]').forEach(el => { el.textContent = c; });
  $$('.nav-count').forEach(el => { el.classList.remove('bump'); void el.offsetWidth; if (changedId) el.classList.add('bump'); });
  $('[data-total-btn]').textContent = fmt(t);
  $('[data-total-dock]').textContent = fmt(t);
  $('[data-dock]').classList.toggle('show', c > 0);
  tickClock();
  rollTotal(t);
  syncAddButtons();
  if (refocus) {
    const host = $(`[data-ticket-host="${refocus.host}"]`);
    const el = $(refocus.sel, host) || $('.t-step .step, .t-go', host);
    if (el) el.focus({ preventScroll: true });
  }
}

// Total que sube con movimiento amortiguado
let raf;
function rollTotal(target) {
  cancelAnimationFrame(raf);
  if (reduced) { shownTotal = target; $$('[data-total]').forEach(el => el.textContent = fmt(target)); return; }
  const from = shownTotal, start = performance.now(), dur = 650;
  const step = now => {
    const p = Math.min(1, (now - start) / dur);
    const e = 1 - Math.pow(1 - p, 4);
    shownTotal = from + (target - from) * e;
    $$('[data-total]').forEach(el => el.textContent = fmt(shownTotal));
    if (p < 1) raf = requestAnimationFrame(step); else shownTotal = target;
  };
  raf = requestAnimationFrame(step);
}

function tickClock() {
  const d = new Date();
  const s = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  $$('[data-clock]').forEach(el => el.textContent = s);
}

function change(id, delta, fromEl) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  save();
  if (delta > 0 && fromEl) fly(fromEl);
  renderTickets(delta > 0 ? id : null);
}

// La hamburguesita que vuela a la comanda
function fly(fromEl) {
  if (reduced) return;
  const target = [$('.board-aside .ticket'), $('.nav-ticket')].find(el => el && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().bottom > 0 && el.getBoundingClientRect().top < innerHeight);
  if (!target) return;
  const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'fly';
  el.innerHTML = icon('burger');
  el.firstChild.style.cssText = 'width:100%;height:100%';
  document.body.appendChild(el);
  const x0 = a.left + a.width / 2 - 15, y0 = a.top + a.height / 2 - 13;
  const x1 = b.left + b.width / 2 - 15, y1 = b.top + Math.min(60, b.height / 2);
  el.animate([
    { transform: `translate(${x0}px, ${y0}px) scale(1)`, opacity: 1 },
    { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 80}px) scale(1.2) rotate(-12deg)`, opacity: 1, offset: .5 },
    { transform: `translate(${x1}px, ${y1}px) scale(.5) rotate(8deg)`, opacity: 0 }
  ], { duration: 700, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => el.remove();
}

function syncAddButtons() {
  $$('[data-add]').forEach(b => {
    const q = cart[b.dataset.add] || 0;
    b.classList.toggle('added', q > 0);
    const label = $('span', b);
    if (label) label.textContent = q > 0 ? `En la comanda · ${q}` : 'Agregar';
  });
}

/* ---------- Menú ---------- */
const addBtn = it => `<button class="add" type="button" data-add="${it.id}" aria-label="Agregar ${esc(it.nombre)} a la comanda">${icon('plus')}<span>Agregar</span></button>`;

function renderMenu() {
  const tabs = $('[data-tabs]'), panels = $('[data-panels]');
  tabs.innerHTML = MENU.map((c, i) => `<button class="tab" role="tab" id="tab-${c.id}" aria-controls="panel-${c.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${c.nombre}</button>`).join('');
  panels.innerHTML = MENU.map((c, i) => `<div class="panel" role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}" ${i ? 'hidden' : ''}>
    ${c.items.map((it, n) => `<div class="item" style="--n:${n}">
      <div class="item-head"><span class="item-name">${esc(it.nombre)}${it.tag ? ` <span class="tag">${esc(it.tag)}</span>` : ''}</span><span class="leader" aria-hidden="true"></span><span class="price">${fmt(it.precio)}</span></div>
      <p class="item-desc">${esc(it.desc)}</p>
      ${addBtn(it)}
    </div>`).join('')}
  </div>`).join('');

  const select = tab => {
    $$('.tab', tabs).forEach(t => { const on = t === tab; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    $$('.panel', panels).forEach(p => {
      const on = p.id === tab.getAttribute('aria-controls');
      p.hidden = !on;
      if (on) { p.classList.remove('enter'); void p.offsetWidth; p.classList.add('enter'); }
    });
  };
  tabs.addEventListener('click', e => { const t = e.target.closest('.tab'); if (t) select(t); });
  tabs.addEventListener('keydown', e => {
    const list = $$('.tab', tabs), i = list.indexOf(document.activeElement);
    if (i < 0) return;
    let j = null;
    if (e.key === 'ArrowRight') j = (i + 1) % list.length;
    if (e.key === 'ArrowLeft') j = (i - 1 + list.length) % list.length;
    if (j !== null) { e.preventDefault(); list[j].focus(); select(list[j]); }
  });

  $('[data-specials]').innerHTML = MENU[0].items.filter(i => i.destacado).map(it => `<li class="special">
    <div><div class="special-name">${esc(it.nombre)}</div><div class="special-desc">${esc(it.desc)}</div></div>
    <span class="price">${fmt(it.precio)}</span>
    ${addBtn(it)}
  </li>`).join('');
}

/* ---------- Reseñas ---------- */
function stars(n) { return Array.from({ length: 5 }, (_, i) => `<svg style="opacity:${i < n ? 1 : .25}"><use href="#i-star"/></svg>`).join(''); }
function renderReviews() {
  $('[data-reviews]').innerHTML = RESENAS.map((r, n) => `<li class="review" style="--n:${n}">
    <span class="stars" aria-label="${r.estrellas} de 5 estrellas">${stars(r.estrellas)}</span>
    <blockquote>“${esc(r.texto)}”</blockquote>
    <div class="review-who"><strong>${esc(r.nombre)}</strong><span>${esc(r.cuando)}</span></div>
  </li>`).join('');
  $$('[data-stars]').forEach(el => el.innerHTML = stars(+el.dataset.stars));
}

/* ---------- Horario y cartel OPEN ---------- */
const hhmm = h => { const H = Math.floor(h) % 24, M = Math.round((h % 1) * 60); return `${String(H).padStart(2, '0')}:${String(M).padStart(2, '0')}`; };
function openState(d = new Date()) {
  const day = d.getDay(), h = d.getHours() + d.getMinutes() / 60;
  const today = LOCAL.horarios[day], prev = LOCAL.horarios[(day + 6) % 7];
  if (prev && prev[1] > 24 && h < prev[1] - 24) return { open: true, until: prev[1] };
  if (today && h >= today[0] && h < today[1]) return { open: true, until: today[1] };
  if (today && h < today[0]) return { open: false, next: `Abre hoy ${hhmm(today[0])}` };
  for (let k = 1; k <= 7; k++) {
    const nd = LOCAL.horarios[(day + k) % 7];
    if (nd) {
      const names = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      return { open: false, next: `Abre ${k === 1 ? 'mañana' : 'el ' + names[(day + k) % 7]} ${hhmm(nd[0])}` };
    }
  }
  return { open: false, next: '' };
}
function renderStatus() {
  const s = openState(), box = $('[data-status]');
  box.classList.toggle('is-closed', !s.open);
  $('[data-status-title]').textContent = s.open ? 'Abierto ahora' : 'Ahora cerrado';
  const tag = LOCAL.ejemplo ? ' · horario de ejemplo' : '';
  $('[data-status-sub]').textContent = (s.open ? `Hasta las ${hhmm(s.until)}` : s.next) + tag;
  return s.open;
}

/* ---------- Formulario → WhatsApp ---------- */
function setupForm() {
  const form = $('[data-form]'), addr = $('[data-address]');
  const err = (k, msg) => { const el = $(`[data-error="${k}"]`); if (el) el.textContent = msg || ''; };
  form.addEventListener('change', e => {
    if (e.target.name === 'mode') addr.hidden = e.target.value !== 'envio';
  });
  form.addEventListener('input', e => {
    if (e.target.name === 'name' || e.target.name === 'address') { err(e.target.name, ''); e.target.removeAttribute('aria-invalid'); }
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form);
    const name = (f.get('name') || '').trim(), mode = f.get('mode'), address = (f.get('address') || '').trim();
    let bad = null;
    err('cart', ''); err('name', ''); err('address', '');
    if (!count()) { err('cart', 'La comanda está vacía. Sumá al menos una cosa del menú.'); bad = bad || $('#menu'); }
    if (!name) { err('name', 'Poné tu nombre así sabemos de quién es el pedido.'); $('#f-name').setAttribute('aria-invalid', 'true'); bad = bad || $('#f-name'); }
    if (mode === 'envio' && !address) { err('address', 'Necesitamos la dirección para llevarte el pedido.'); $('#f-address').setAttribute('aria-invalid', 'true'); bad = bad || $('#f-address'); }
    if (bad) { bad.focus ? bad.focus({ preventScroll: false }) : bad.scrollIntoView(); if (bad.id === 'menu') bad.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); return; }

    const lines = Object.entries(cart).map(([id, q]) => `• ${q} x ${ITEMS[id].nombre} — ${fmt(ITEMS[id].precio * q)}`);
    const msg = [
      `*Comanda Nº ${ticketNo} · Good Burguer*`,
      '',
      ...lines,
      '',
      `*Total: ${fmt(total())}*${mode === 'envio' ? ' + envío a confirmar' : ''}`,
      '',
      `Nombre: ${name}`,
      mode === 'envio' ? `Envío a: ${address}` : 'Retiro en el local',
      `Pago: ${f.get('pay')}`,
      (f.get('notes') || '').trim() ? `Aclaraciones: ${(f.get('notes') || '').trim()}` : null
    ].filter(l => l !== null).join('\n');
    const a = document.createElement('a');
    a.href = `https://wa.me/${LOCAL.whatsapp}?text=${encodeURIComponent(msg)}`;
    a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
  });
}

/* ---------- Datos fijos ---------- */
function renderFacts() {
  $$('[data-address-text]').forEach(el => el.textContent = LOCAL.direccion);
  $('[data-hours-text]').innerHTML = `${esc(LOCAL.horariosTexto)}${LOCAL.ejemplo ? ' <span class="opt">(horario de ejemplo)</span>' : ''}`;
  const p = LOCAL.whatsapp;
  $('[data-phone-text]').innerHTML = `<a href="https://wa.me/${p}" target="_blank" rel="noopener">+${p.slice(0, 2)} ${p.slice(2, 3)} ${p.slice(3, 6)} ${p.slice(6, 9)}-${p.slice(9)}</a>${LOCAL.ejemplo ? ' <span class="opt">(número de ejemplo)</span>' : ''}`;
  const map = $('[data-map]'), frame = $('iframe', map);
  frame.addEventListener('load', () => map.classList.add('loaded'));
  $('[data-year]').textContent = new Date().getFullYear();
}

/* ---------- Revelados al hacer scroll ---------- */
function setupReveals() {
  const targets = [$('.reviews'), $('.facade')];
  if (reduced || !('IntersectionObserver' in window)) { targets.forEach(t => t.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .25 });
  targets.forEach(t => io.observe(t));
}

/* ---------- Encendido del local ---------- */
function ignite(isOpen) {
  const root = document.documentElement;
  if (!root.classList.contains('intro')) { if (isOpen) $('[data-status]').classList.add('neon-on'); return; }
  requestAnimationFrame(() => {
    root.classList.add('lit');
    root.classList.remove('intro');
    setTimeout(() => { if (isOpen) $('[data-status]').classList.add('neon-on'); }, 1500);
    setTimeout(() => root.classList.remove('lit'), 3200);
  });
}

/* ---------- Eventos ---------- */
document.addEventListener('click', e => {
  const add = e.target.closest('[data-add]'), inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
  if (add) change(add.dataset.add, 1, add);
  else if (inc) change(inc.dataset.inc, 1, null);
  else if (dec) change(dec.dataset.dec, -1, null);
  if (add || inc || dec) { const err = $('[data-error="cart"]'); if (err) err.textContent = ''; }
});

renderMenu();
renderReviews();
renderFacts();
setupForm();
setupReveals();
shownTotal = total();
renderTickets();
const isOpen = renderStatus();
ignite(isOpen);
setInterval(() => { tickClock(); renderStatus(); }, 30000);
