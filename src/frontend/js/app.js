const API = '';
let token = localStorage.getItem('cj_token');
let usuarioAtual = JSON.parse(localStorage.getItem('cj_usuario') || 'null');
let treinoEditandoId = null;

// ── UTILITÁRIOS ──────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

function mostrarMsg(elId, texto, tipo = 'erro') {
  $(elId).innerHTML = `<div class="msg msg-${tipo}">${texto}</div>`;
}

function limparMsg(elId) {
  $(elId).innerHTML = '';
}

function mostrarView(id) {
  ['view-auth', 'view-treinos', 'view-criar', 'view-editar', 'view-detalhe']
    .forEach(v => $(v).classList.add('hidden'));
  $(id).classList.remove('hidden');
}

async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API + path, { ...opts, headers });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

function tipoLabel(tipo) {
  const labels = { corrida_leve: 'Corrida leve', intervalado: 'Intervalado', longao: 'Longão' };
  return labels[tipo] || tipo;
}

function formatarData(iso) {
  if (!iso) return '';
  const dataStr = typeof iso === 'string' ? iso.split('T')[0] : iso.toISOString().split('T')[0];
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

// ── SESSÃO ───────────────────────────────────────────────────────────────────

function salvarSessao(t, u) {
  token = t;
  usuarioAtual = u;
  localStorage.setItem('cj_token', t);
  localStorage.setItem('cj_usuario', JSON.stringify(u));
  $('btn-logout').classList.remove('hidden');
}

function encerrarSessao() {
  token = null;
  usuarioAtual = null;
  localStorage.removeItem('cj_token');
  localStorage.removeItem('cj_usuario');
  $('btn-logout').classList.add('hidden');
  mostrarView('view-auth');
}

function inicializar() {
  if (token && usuarioAtual) {
    $('btn-logout').classList.remove('hidden');
    mostrarTreinos();
  } else {
    mostrarView('view-auth');
  }
}

// ── AUTH ─────────────────────────────────────────────────────────────────────

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const which = tab.dataset.tab;
    $('form-login').classList.toggle('hidden', which !== 'login');
    $('form-cadastro').classList.toggle('hidden', which !== 'cadastro');
    limparMsg('msg-auth');
  });
});

$('form-login').addEventListener('submit', async e => {
  e.preventDefault();
  limparMsg('msg-auth');
  const { ok, data } = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: $('login-email').value,
      senha: $('login-senha').value,
    }),
  });
  if (!ok) return mostrarMsg('msg-auth', data.erro);
  salvarSessao(data.token, data.usuario);
  mostrarTreinos();
});

$('form-cadastro').addEventListener('submit', async e => {
  e.preventDefault();
  limparMsg('msg-auth');
  const { ok, data } = await apiFetch('/auth/cadastro', {
    method: 'POST',
    body: JSON.stringify({
      nome: $('cad-nome').value,
      email: $('cad-email').value,
      senha: $('cad-senha').value,
    }),
  });
  if (!ok) return mostrarMsg('msg-auth', data.erro);
  salvarSessao(data.token, data.usuario);
  mostrarTreinos();
});

$('btn-logout').addEventListener('click', encerrarSessao);

// ── TREINOS ──────────────────────────────────────────────────────────────────

async function mostrarTreinos() {
  mostrarView('view-treinos');
  limparMsg('msg-treinos');
  $('saudacao').textContent = `Olá, ${usuarioAtual?.nome?.split(' ')[0]} 👋`;
  $('lista-treinos').innerHTML = '<p class="empty">Carregando...</p>';

  const { ok, data } = await apiFetch('/treinos');
  if (!ok) {
    if (data.erro?.includes('Token')) { encerrarSessao(); return; }
    return mostrarMsg('msg-treinos', data.erro);
  }

  if (data.total === 0) {
    $('lista-treinos').innerHTML = '<p class="empty">Nenhum treino disponível ainda.<br>Seja o primeiro a criar um! 🏃</p>';
    return;
  }

  $('lista-treinos').innerHTML = data.treinos.map(t => `
    <div class="treino-item">
      <div class="info">
        <div class="badge">${tipoLabel(t.tipo)}</div>
        <div class="titulo">${formatarData(t.data)} às ${t.horario}</div>
        <div class="meta">
          📍 ${t.local}<br>
          👤 ${t.criador?.nome || 'Desconhecido'}
          ${t.paceEsperado ? `&nbsp;⏱ ${t.paceEsperado}` : ''}
          &nbsp;👥 ${t.totalParticipantes} participante(s)
        </div>
      </div>
      <div class="acoes">
        <button class="btn btn-secondary" onclick="verDetalhe('${t.id}')">Ver</button>
        ${t.criadorId === usuarioAtual?.id
          ? `<button class="btn btn-danger" onclick="cancelarTreino('${t.id}')">Cancelar</button>`
          : ''}
      </div>
    </div>
  `).join('');
}

function mostrarCriar() {
  limparMsg('msg-criar');
  $('form-criar').reset();
  mostrarView('view-criar');
}

$('form-criar').addEventListener('submit', async e => {
  e.preventDefault();
  limparMsg('msg-criar');

  const horario = $('criar-horario').value.slice(0, 5);

  const body = {
    data:         $('criar-data').value,
    horario,
    local:        $('criar-local').value,
    tipo:         $('criar-tipo').value,
    paceEsperado: $('criar-pace').value || undefined,
    descricao:    $('criar-descricao').value || undefined,
  };

  const { ok, data } = await apiFetch('/treinos', { method: 'POST', body: JSON.stringify(body) });
  if (!ok) return mostrarMsg('msg-criar', data.erro);
  mostrarTreinos();
});

async function cancelarTreino(id) {
  if (!confirm('Cancelar este treino?')) return;
  const { ok, data } = await apiFetch(`/treinos/${id}`, { method: 'DELETE' });
  if (!ok) return alert(data.erro);
  mostrarTreinos();
}

// ── DETALHE ──────────────────────────────────────────────────────────────────

async function verDetalhe(id) {
  mostrarView('view-detalhe');
  $('detalhe-conteudo').innerHTML = '<p class="empty">Carregando...</p>';

  const { ok, data } = await apiFetch(`/treinos/${id}`);
  if (!ok) {
    $('detalhe-conteudo').innerHTML = `<p class="empty">${data.erro}</p>`;
    return;
  }

  const ehCriador = data.criadorId === usuarioAtual?.id;

  $('detalhe-conteudo').innerHTML = `
    <div class="badge" style="margin-bottom:.5rem;">${tipoLabel(data.tipo)}</div>
    <h2 style="margin-bottom:1rem;">${formatarData(data.data)} às ${data.horario}</h2>

    <div class="detalhe-label">Local</div>
    <div class="detalhe-valor">📍 ${data.local}</div>

    <div class="detalhe-label">Criador</div>
    <div class="detalhe-valor">👤 ${data.criador?.nome || '—'}</div>

    <div class="detalhe-label">Participantes</div>
    <div class="detalhe-valor">👥 ${data.totalParticipantes}</div>

    ${data.paceEsperado ? `
      <div class="detalhe-label">Pace esperado</div>
      <div class="detalhe-valor">⏱ ${data.paceEsperado}</div>` : ''}

    ${data.descricao ? `
      <div class="detalhe-label">Descrição</div>
      <div class="detalhe-valor">${data.descricao}</div>` : ''}

    <div class="detalhe-label">Criado em</div>
    <div class="detalhe-valor detalhe-criado">${new Date(data.criadoEm).toLocaleString('pt-BR')}</div>

    ${ehCriador ? `
      <div class="detalhe-cancelar">
        <button class="btn btn-secondary" onclick="mostrarEditar('${data.id}')">Editar treino</button>
        <button class="btn btn-danger" onclick="cancelarTreino('${data.id}')">Cancelar este treino</button>
      </div>` : ''}
  `;
}

async function mostrarEditar(id) {
  const { ok, data } = await apiFetch(`/treinos/${id}`);
  if (!ok) {
    return alert(data.erro || 'Não foi possível carregar o treino para edição.');
  }

  treinoEditandoId = id;
  limparMsg('msg-editar');
  $('editar-tipo').value = data.tipo || '';
  $('editar-data').value = data.data ? data.data.split('T')[0] : '';
  $('editar-horario').value = data.horario ? data.horario.slice(0, 5) : '';
  $('editar-local').value = data.local || '';
  $('editar-pace').value = data.paceEsperado || '';
  $('editar-descricao').value = data.descricao || '';
  mostrarView('view-editar');
}

$('form-editar').addEventListener('submit', async e => {
  e.preventDefault();
  limparMsg('msg-editar');

  if (!treinoEditandoId) {
    return mostrarMsg('msg-editar', 'Nenhum treino selecionado para edição.');
  }

  const horario = $('editar-horario').value.slice(0, 5);

  const body = {
    data:         $('editar-data').value,
    horario,
    local:        $('editar-local').value,
    tipo:         $('editar-tipo').value,
    paceEsperado: $('editar-pace').value || undefined,
    descricao:    $('editar-descricao').value || undefined,
  };

  const { ok, data } = await apiFetch(`/treinos/${treinoEditandoId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  if (!ok) return mostrarMsg('msg-editar', data.erro);

  treinoEditandoId = null;
  mostrarTreinos();
});

// ── INIT ─────────────────────────────────────────────────────────────────────
inicializar();
