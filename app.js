/* ======================================
   ESCALA DO MINISTÉRIO DE LOUVOR
   app.js — Lógica principal
====================================== */

'use strict';

// ==================== CONFIG ====================
const CONFIG = {
  ADMIN_PASSWORD: 'manancial2025',
  STORAGE_KEY: 'escala_ministerio_v1',
  DEFAULT_TIMES: {
    domingo: '19:00',
    terca:   '19:30',
    quinta:  '19:30',
  },
  WEEK_DAYS: ['domingo','segunda','terca','quarta','quinta','sexta','sabado'],
  MONTHS_PT: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  DAYS_PT: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
};

// ==================== STATE ====================
let state = {
  isAdmin: false,
  currentView: 'proxima',
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  events: [],    // array of event objects
};

// ==================== STORAGE ====================
function saveToStorage() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.events));
  } catch (e) { console.warn('Storage unavailable', e); }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (raw) state.events = JSON.parse(raw);
  } catch (e) { state.events = []; }
}

// ==================== DOM REFS ====================
const $ = id => document.getElementById(id);

const splash       = $('splash');
const app          = $('app');
const adminBtn     = $('admin-btn');
const modalAdmin   = $('modal-admin');
const modalLogin   = $('modal-login-btn');
const modalCancel  = $('modal-cancel-btn');
const modalPassIn  = $('admin-pass-input');
const modalError   = $('modal-error');
const adminPanel   = $('admin-new-event');
const toast        = $('toast');
const navTabs      = document.querySelectorAll('.nav-tab');
const views        = document.querySelectorAll('.view');

// Form fields
const fData     = $('form-data');
const fDia      = $('form-dia');
const fHora     = $('form-hora');
const fLocal    = $('form-local');
const fTipo     = $('form-tipo');
const fObs      = $('form-obs');
const fApoio    = $('form-apoio');
const fBaixo    = $('form-baixo');
const fBateria  = $('form-bateria');
const fGuitarra = $('form-guitarra');
const fViolao   = $('form-violao');
const fTeclado  = $('form-teclado');

// ==================== SPLASH ====================
function initSplash() {
  setTimeout(() => {
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.classList.add('hidden');
      app.classList.remove('hidden');
      renderAll();
    }, 650);
  }, 2000);
}

// ==================== NAVIGATION ====================
function switchView(viewName) {
  state.currentView = viewName;
  navTabs.forEach(t => t.classList.toggle('active', t.dataset.view === viewName));
  views.forEach(v => {
    const isActive = v.id === `view-${viewName}`;
    v.classList.toggle('active', isActive);
  });
  renderView(viewName);
}

navTabs.forEach(tab => {
  tab.addEventListener('click', () => switchView(tab.dataset.view));
});

// ==================== ADMIN LOGIN ====================
adminBtn.addEventListener('click', () => {
  if (state.isAdmin) {
    logoutAdmin();
  } else {
    modalAdmin.classList.remove('hidden');
    modalPassIn.value = '';
    modalError.classList.add('hidden');
    setTimeout(() => modalPassIn.focus(), 100);
  }
});

modalLogin.addEventListener('click', tryLogin);
modalPassIn.addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });
modalCancel.addEventListener('click', () => modalAdmin.classList.add('hidden'));
modalAdmin.addEventListener('click', e => {
  if (e.target === modalAdmin) modalAdmin.classList.add('hidden');
});

function tryLogin() {
  if (modalPassIn.value === CONFIG.ADMIN_PASSWORD) {
    state.isAdmin = true;
    modalAdmin.classList.add('hidden');
    app.classList.add('admin-mode');
    adminPanel.classList.remove('hidden');
    adminBtn.title = 'Sair do modo Admin';
    showToast('✅ Modo administrador ativado');
    prefillForm();
  } else {
    modalError.classList.remove('hidden');
    modalPassIn.value = '';
    modalPassIn.focus();
    modalPassIn.style.borderColor = '#e05c5c';
    setTimeout(() => modalPassIn.style.borderColor = '', 1000);
  }
}

function logoutAdmin() {
  state.isAdmin = false;
  app.classList.remove('admin-mode');
  adminPanel.classList.add('hidden');
  adminBtn.title = 'Acesso Admin';
  showToast('🔒 Modo admin desativado');
}

// ==================== AUTO HORA ====================
fDia.addEventListener('change', () => {
  const dia = fDia.value;
  if (CONFIG.DEFAULT_TIMES[dia]) {
    fHora.value = CONFIG.DEFAULT_TIMES[dia];
  }
});

fData.addEventListener('change', () => {
  if (!fData.value) return;
  const d = new Date(fData.value + 'T12:00:00');
  const dayIdx = d.getDay();
  const dayMap = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'];
  const dia = dayMap[dayIdx];
  fDia.value = dia || 'outro';
  if (CONFIG.DEFAULT_TIMES[dia]) fHora.value = CONFIG.DEFAULT_TIMES[dia];
});

// ==================== FORM SAVE ====================
$('btn-salvar').addEventListener('click', saveEvent);
$('btn-limpar').addEventListener('click', clearForm);

function saveEvent() {
  if (!fData.value) { showToast('⚠️ Selecione uma data'); return; }
  if (!fLocal.value.trim()) { showToast('⚠️ Informe o local'); return; }

  const apoioRaw = fApoio.value.split(',').map(s => s.trim()).filter(Boolean).slice(0,5);

  const event = {
    id: Date.now().toString(),
    data: fData.value,
    dia: fDia.value,
    hora: fHora.value || '—',
    local: fLocal.value.trim(),
    tipo: fTipo.value,
    obs: fObs.value.trim(),
    apoio: apoioRaw,
    baixo: fBaixo.value.trim(),
    bateria: fBateria.value.trim(),
    guitarra: fGuitarra.value.trim(),
    violao: fViolao.value.trim(),
    teclado: fTeclado.value.trim(),
  };

  // Upsert: replace if same date+hora exists
  const idx = state.events.findIndex(e => e.data === event.data && e.hora === event.hora && e.id !== event.id);
  if (idx >= 0) state.events.splice(idx, 1);

  state.events.push(event);
  state.events.sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));

  saveToStorage();
  showToast('💾 Escala salva com sucesso!');
  renderAll();
  clearForm();
}

function clearForm() {
  [fData,fDia,fHora,fLocal,fObs,fApoio,fBaixo,fBateria,fGuitarra,fViolao,fTeclado].forEach(f => f.value = '');
  fTipo.value = 'Culto';
}

function prefillForm() {
  // Pre-set today's date
  const today = new Date();
  fData.value = today.toISOString().slice(0,10);
  fData.dispatchEvent(new Event('change'));
}

// ==================== RENDER ENGINE ====================
function renderAll() {
  renderProxima();
  renderMes();
  renderHistorico();
}

function renderView(view) {
  if (view === 'proxima') renderProxima();
  if (view === 'mes')     renderMes();
  if (view === 'historico') renderHistorico();
}

// --- FORMAT HELPERS ---
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function getDayLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return CONFIG.DAYS_PT[d.getDay()];
}

function getMonthAbbr(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return CONFIG.MONTHS_PT[d.getMonth()].slice(0,3);
}

function getDay(dateStr) {
  if (!dateStr) return '—';
  return dateStr.split('-')[2];
}

// --- PRÓXIMA ---
function renderProxima() {
  const today = new Date().toISOString().slice(0,10);
  const upcoming = state.events.filter(e => e.data >= today);
  const event = upcoming[0] || null;

  if (!event) {
    $('prox-tipo-badge').textContent = '—';
    $('prox-data').textContent = 'Sem escala cadastrada';
    $('prox-hora').textContent = '—';
    $('prox-local').textContent = '—';
    $('prox-obs-row').classList.add('hidden');
    $('prox-apoio').innerHTML = '<span class="member-chip empty">—</span>';
    ['baixo','bateria','guitarra','violao','teclado'].forEach(i => {
      const el = $(`prox-${i}`);
      el.textContent = '—';
      el.classList.add('empty');
    });
    return;
  }

  $('prox-tipo-badge').textContent = event.tipo;
  $('prox-data').textContent = `${getDayLabel(event.data)}, ${formatDate(event.data)}`;
  $('prox-hora').textContent = event.hora;
  $('prox-local').textContent = event.local;

  if (event.obs) {
    $('prox-obs-row').classList.remove('hidden');
    $('prox-obs').textContent = event.obs;
  } else {
    $('prox-obs-row').classList.add('hidden');
  }

  const apoioEl = $('prox-apoio');
  if (event.apoio && event.apoio.length > 0) {
    apoioEl.innerHTML = event.apoio.map(n => `<span class="member-chip">${n}</span>`).join('');
  } else {
    apoioEl.innerHTML = '<span class="member-chip empty">Nenhum</span>';
  }

  ['baixo','bateria','guitarra','violao','teclado'].forEach(i => {
    const el = $(`prox-${i}`);
    const val = event[i] || '—';
    el.textContent = val;
    el.classList.toggle('empty', !event[i]);
  });
}

// --- MÊS ---
function renderMes() {
  const label = $('mes-label');
  const list  = $('mes-list');
  const empty = $('mes-empty');
  const yr    = state.currentYear;
  const mo    = state.currentMonth;

  label.textContent = `${CONFIG.MONTHS_PT[mo]} ${yr}`;

  const moStr = String(mo + 1).padStart(2, '0');
  const filtered = state.events.filter(e => e.data.startsWith(`${yr}-${moStr}`));

  list.innerHTML = '';
  if (filtered.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  filtered.forEach(ev => {
    const today = new Date().toISOString().slice(0,10);
    const past  = ev.data < today;
    list.appendChild(buildMiniCard(ev, past));
  });
}

$('mes-prev').addEventListener('click', () => {
  state.currentMonth--;
  if (state.currentMonth < 0) { state.currentMonth = 11; state.currentYear--; }
  renderMes();
});
$('mes-next').addEventListener('click', () => {
  state.currentMonth++;
  if (state.currentMonth > 11) { state.currentMonth = 0; state.currentYear++; }
  renderMes();
});

// --- HISTÓRICO ---
function renderHistorico() {
  const list  = $('historico-list');
  const empty = $('historico-empty');
  const today = new Date().toISOString().slice(0,10);
  const past  = state.events.filter(e => e.data < today).sort((a,b) => b.data.localeCompare(a.data));

  list.innerHTML = '';
  if (past.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  past.forEach(ev => {
    list.appendChild(buildMiniCard(ev, true));
  });
}

// --- BUILD MINI CARD ---
function buildMiniCard(ev, past) {
  const card = document.createElement('div');
  card.className = `mini-card${past ? ' past' : ''}`;
  card.innerHTML = `
    <div class="mini-date-block">
      <span class="day-num">${getDay(ev.data)}</span>
      <span class="day-mon">${getMonthAbbr(ev.data)}</span>
    </div>
    <div class="mini-info">
      <div class="mini-tipo">${ev.tipo}</div>
      <div class="mini-local">${ev.local}</div>
      <div class="mini-hora">${getDayLabel(ev.data)} • ${ev.hora}</div>
    </div>
    <div class="mini-actions">
      ${state.isAdmin ? `<button class="btn-delete" data-id="${ev.id}">Excluir</button>` : ''}
      <span class="mini-arrow">›</span>
    </div>
  `;

  // Click → show details in proxima
  card.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) return;
    highlightEvent(ev);
  });

  // Delete
  const delBtn = card.querySelector('.btn-delete');
  if (delBtn) {
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteEvent(ev.id);
    });
  }

  return card;
}

function highlightEvent(ev) {
  // Temporarily render this event in proxima and switch view
  switchView('proxima');
  // Highlight by manually setting fields
  $('prox-tipo-badge').textContent = ev.tipo;
  $('prox-data').textContent = `${getDayLabel(ev.data)}, ${formatDate(ev.data)}`;
  $('prox-hora').textContent = ev.hora;
  $('prox-local').textContent = ev.local;

  if (ev.obs) {
    $('prox-obs-row').classList.remove('hidden');
    $('prox-obs').textContent = ev.obs;
  } else {
    $('prox-obs-row').classList.add('hidden');
  }

  const apoioEl = $('prox-apoio');
  if (ev.apoio && ev.apoio.length > 0) {
    apoioEl.innerHTML = ev.apoio.map(n => `<span class="member-chip">${n}</span>`).join('');
  } else {
    apoioEl.innerHTML = '<span class="member-chip empty">Nenhum</span>';
  }
  ['baixo','bateria','guitarra','violao','teclado'].forEach(i => {
    const el = $(`prox-${i}`);
    el.textContent = ev[i] || '—';
    el.classList.toggle('empty', !ev[i]);
  });
}

function deleteEvent(id) {
  state.events = state.events.filter(e => e.id !== id);
  saveToStorage();
  showToast('🗑️ Escala removida');
  renderAll();
}

// ==================== TOAST ====================
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 400);
  }, 2800);
}

// ==================== PWA SERVICE WORKER ====================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

// ==================== INIT ====================
loadFromStorage();
initSplash();
