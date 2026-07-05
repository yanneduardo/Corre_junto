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
  ['view-auth', 'view-treinos', 'view-criar', 'view-editar', 'view-detalhe', 'view-perfil']
    .forEach(v => $(v).classList.add('hidden'));
  $(id).classList.remove('hidden');
}

function nivelLabel(nivel) {
  const labels = { iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado' };
  return labels[nivel] || 'Não informado';
}

async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API + path, { ...opts, headers });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// Upload de arquivos usa FormData; o navegador define o Content-Type (multipart) automaticamente.
async function apiUpload(path, formData) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API + path, { method: 'POST', headers, body: formData });
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
  $('header-acoes').classList.remove('hidden');
}

function encerrarSessao() {
  token = null;
  usuarioAtual = null;
  localStorage.removeItem('cj_token');
  localStorage.removeItem('cj_usuario');
  $('header-acoes').classList.add('hidden');
  mostrarView('view-auth');
}

function inicializar() {
  if (token && usuarioAtual) {
    $('header-acoes').classList.remove('hidden');
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
    <div class="detalhe-valor">👤 <a href="#" onclick="mostrarPerfil('${data.criadorId}'); return false;">${data.criador?.nome || '—'}</a></div>

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
    ${!ehCriador && data.participantes && data.participantes.includes(usuarioAtual?.id) ? `
      <div class="detalhe-sair">
        <button class="btn btn-warning" onclick="sairTreino('${data.id}')">Sair do treino</button>
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

async function sairTreino(id) {
  if (!confirm('Tem certeza que deseja sair deste treino?')) return;
  const { ok, data } = await apiFetch(`/treinos/${id}/sair`, { method: 'POST' });
  if (!ok) return alert(data.erro || 'Erro ao tentar sair do treino.');
  // Recarrega os detalhes para refletir a mudança
  verDetalhe(id);
}

// ── PERFIL ───────────────────────────────────────────────────────────────────

let perfilVisualizadoId = null;
let arquivoFotoSelecionado = null;

const TIPOS_FOTO_ACEITOS = ['image/jpeg', 'image/jpg', 'image/png'];
const FOTO_MAX_BYTES = 5 * 1024 * 1024; // 5MB

function exibirAvatar(imgId, placeholderId, url) {
  const img = $(imgId);
  const placeholder = $(placeholderId);
  if (url) {
    img.src = url;
    img.classList.remove('hidden');
    placeholder.classList.add('hidden');
  } else {
    img.removeAttribute('src');
    img.classList.add('hidden');
    placeholder.classList.remove('hidden');
  }
}

async function mostrarPerfil(usuarioId) {
  perfilVisualizadoId = usuarioId || usuarioAtual?.id;
  const ehMeuPerfil = perfilVisualizadoId === usuarioAtual?.id;

  mostrarView('view-perfil');
  limparMsg('msg-perfil');
  $('perfil-leitura').classList.remove('hidden');
  $('form-perfil').classList.add('hidden');
  $('perfil-titulo').textContent = ehMeuPerfil ? 'Meu perfil' : 'Perfil';
  $('btn-editar-perfil').classList.toggle('hidden', !ehMeuPerfil);

  $('perfil-nome').textContent = 'Carregando...';
  $('perfil-nivel').textContent = '';
  $('perfil-bio').textContent = '';
  exibirAvatar('perfil-foto', 'perfil-foto-placeholder', null);

  const { ok, data } = await apiFetch(`/usuarios/${perfilVisualizadoId}`);
  if (!ok) {
    if (data.erro?.includes('Token')) { encerrarSessao(); return; }
    return mostrarMsg('msg-perfil', data.erro || 'Não foi possível carregar o perfil.');
  }

  const u = data.usuario;
  $('perfil-nome').textContent = u.nome;
  $('perfil-nivel').textContent = nivelLabel(u.runningLevel);
  $('perfil-bio').textContent = u.bio || 'Nenhuma biografia cadastrada ainda.';
  exibirAvatar('perfil-foto', 'perfil-foto-placeholder', u.profilePictureUrl);

  if (u.whatsappLink) {
    $('perfil-whatsapp-link').href = u.whatsappLink;
    $('perfil-whatsapp-wrap').classList.remove('hidden');
  } else {
    $('perfil-whatsapp-wrap').classList.add('hidden');
  }
}

$('btn-perfil').addEventListener('click', () => mostrarPerfil(usuarioAtual?.id));

$('btn-editar-perfil').addEventListener('click', async () => {
  limparMsg('msg-perfil');
  const { ok, data } = await apiFetch(`/usuarios/${perfilVisualizadoId}`);
  if (!ok) return mostrarMsg('msg-perfil', data.erro);

  const u = data.usuario;
  $('perfil-edit-nivel').value = u.runningLevel || '';
  $('perfil-edit-bio').value = u.bio || '';
  $('perfil-contador').textContent = `${(u.bio || '').length}/500`;
  $('perfil-edit-whatsapp').value = u.whatsapp || '';
  $('perfil-edit-whatsapp-publico').checked = !!u.whatsappPublico;
  $('perfil-whatsapp-erro').classList.add('hidden');

  arquivoFotoSelecionado = null;
  $('perfil-edit-foto-input').value = '';
  $('perfil-foto-erro').classList.add('hidden');
  exibirAvatar('perfil-edit-preview', 'perfil-edit-preview-placeholder', u.profilePictureUrl);
  $('btn-remover-foto').classList.toggle('hidden', !u.profilePictureUrl);

  $('perfil-leitura').classList.add('hidden');
  $('form-perfil').classList.remove('hidden');
});

$('perfil-edit-bio').addEventListener('input', () => {
  $('perfil-contador').textContent = `${$('perfil-edit-bio').value.length}/500`;
});

$('btn-cancelar-edicao').addEventListener('click', () => {
  arquivoFotoSelecionado = null;
  $('perfil-edit-foto-input').value = '';
  $('form-perfil').classList.add('hidden');
  $('perfil-leitura').classList.remove('hidden');
});

// ── FOTO DE PERFIL: seleção, preview e remoção ──

$('btn-escolher-foto').addEventListener('click', () => $('perfil-edit-foto-input').click());

$('perfil-edit-foto-input').addEventListener('change', () => {
  const arquivo = $('perfil-edit-foto-input').files[0];
  $('perfil-foto-erro').classList.add('hidden');
  if (!arquivo) return;

  if (!TIPOS_FOTO_ACEITOS.includes(arquivo.type)) {
    mostrarMsg('perfil-foto-erro', 'Apenas arquivos JPG ou PNG são aceitos.');
    $('perfil-foto-erro').classList.remove('hidden');
    $('perfil-edit-foto-input').value = '';
    return;
  }
  if (arquivo.size > FOTO_MAX_BYTES) {
    mostrarMsg('perfil-foto-erro', 'A foto deve ter no máximo 5MB.');
    $('perfil-foto-erro').classList.remove('hidden');
    $('perfil-edit-foto-input').value = '';
    return;
  }

  arquivoFotoSelecionado = arquivo;
  const leitor = new FileReader();
  leitor.onload = () => exibirAvatar('perfil-edit-preview', 'perfil-edit-preview-placeholder', leitor.result);
  leitor.readAsDataURL(arquivo);
  $('btn-remover-foto').classList.remove('hidden');
});

$('btn-remover-foto').addEventListener('click', async () => {
  if (arquivoFotoSelecionado) {
    arquivoFotoSelecionado = null;
    $('perfil-edit-foto-input').value = '';
    const { data } = await apiFetch(`/usuarios/${perfilVisualizadoId}`);
    const urlAtual = data?.usuario?.profilePictureUrl || null;
    exibirAvatar('perfil-edit-preview', 'perfil-edit-preview-placeholder', urlAtual);
    $('btn-remover-foto').classList.toggle('hidden', !urlAtual);
    return;
  }

  if (!confirm('Remover sua foto de perfil?')) return;

  const { ok, data } = await apiFetch(`/usuarios/${perfilVisualizadoId}/profile-picture`, { method: 'DELETE' });
  if (!ok) return mostrarMsg('msg-perfil', data.erro || 'Erro ao remover a foto de perfil.');

  exibirAvatar('perfil-edit-preview', 'perfil-edit-preview-placeholder', null);
  $('btn-remover-foto').classList.add('hidden');

  if (perfilVisualizadoId === usuarioAtual?.id) {
    usuarioAtual = { ...usuarioAtual, ...data.usuario };
    localStorage.setItem('cj_usuario', JSON.stringify(usuarioAtual));
  }
});

const WHATSAPP_REGEX = /^[1-9]\d{9,14}$/;

$('form-perfil').addEventListener('submit', async e => {
  e.preventDefault();
  limparMsg('msg-perfil');
  $('perfil-whatsapp-erro').classList.add('hidden');

  const whatsappDigitado = $('perfil-edit-whatsapp').value.replace(/\D/g, '');
  if (whatsappDigitado && !WHATSAPP_REGEX.test(whatsappDigitado)) {
    mostrarMsg('perfil-whatsapp-erro', 'Número de WhatsApp inválido. Use o código do país + DDD + número, ex: 5511999998888.');
    $('perfil-whatsapp-erro').classList.remove('hidden');
    return;
  }

  if (arquivoFotoSelecionado) {
    const formData = new FormData();
    formData.append('foto', arquivoFotoSelecionado);
    const { ok, data } = await apiUpload(`/usuarios/${perfilVisualizadoId}/profile-picture`, formData);
    if (!ok) return mostrarMsg('msg-perfil', data.erro || 'Erro ao enviar a foto de perfil.');
    arquivoFotoSelecionado = null;
    $('perfil-edit-foto-input').value = '';
  }

  const body = {
    bio: $('perfil-edit-bio').value,
    runningLevel: $('perfil-edit-nivel').value || null,
  };

  const { ok, data } = await apiFetch(`/usuarios/${perfilVisualizadoId}/bio`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  if (!ok) return mostrarMsg('msg-perfil', data.erro);

  const whatsappBody = {
    whatsapp: whatsappDigitado || null,
    whatsappPublico: $('perfil-edit-whatsapp-publico').checked,
  };

  const respWhatsapp = await apiFetch(`/usuarios/${perfilVisualizadoId}/whatsapp`, {
    method: 'PUT',
    body: JSON.stringify(whatsappBody),
  });

  if (!respWhatsapp.ok) {
    mostrarMsg('perfil-whatsapp-erro', respWhatsapp.data.erro || 'Erro ao salvar o WhatsApp.');
    $('perfil-whatsapp-erro').classList.remove('hidden');
    return;
  }

  if (perfilVisualizadoId === usuarioAtual?.id) {
    usuarioAtual = { ...usuarioAtual, ...data.usuario, ...respWhatsapp.data.usuario };
    localStorage.setItem('cj_usuario', JSON.stringify(usuarioAtual));
  }

  mostrarPerfil(perfilVisualizadoId);
});

// ── INIT ─────────────────────────────────────────────────────────────────────
inicializar();
