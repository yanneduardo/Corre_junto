const express = require('express');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('./config/database');

dotenv.config();

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'mudar_este_segredo';
const PORT = Number(process.env.PORT || 3000);

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

app.get('/', (req, res) => {
  res.json({ mensagem: 'CorreJunto backend MySQL ativo' });
});

app.post('/auth/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'nome, email e senha são obrigatórios.' });
  }

  const usuarioExistente = await query('SELECT id FROM usuarios WHERE email = ?', [email.toLowerCase()]);
  if (usuarioExistente.length) {
    return res.status(409).json({ erro: 'E-mail já cadastrado.' });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const id = uuidv4();
  await query('INSERT INTO usuarios (id, nome, email, senha_hash) VALUES (?, ?, ?, ?)', [id, nome, email.toLowerCase(), senhaHash]);

  const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: '8h' });
  res.status(201).json({ token, usuario: { id, nome, email: email.toLowerCase() } });
});

app.post('/auth/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: 'email e senha são obrigatórios.' });
  }

  const usuarios = await query('SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ?', [email.toLowerCase()]);
  const usuario = usuarios[0];
  if (!usuario) {
    return res.status(401).json({ erro: 'Credenciais inválidas.' });
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaValida) {
    return res.status(401).json({ erro: 'Credenciais inválidas.' });
  }

  const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
});

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuarioId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

app.get('/treinos', autenticar, async (req, res) => {
  const treinos = await query(
    `SELECT t.id,
            t.data,
            t.horario,
            t.local,
            t.tipo,
            t.descricao,
            t.pace_esperado,
            t.status,
            t.criador_id,
            u.nome AS criador_nome,
            EXISTS(SELECT 1 FROM treino_participantes tp WHERE tp.treino_id = t.id AND tp.usuario_id = ?) AS participando,
            (SELECT COUNT(*) FROM treino_participantes tp WHERE tp.treino_id = t.id) AS total_participantes
     FROM treinos t
     JOIN usuarios u ON u.id = t.criador_id
     WHERE t.status = 'ativo'`,
    [req.usuarioId]
  );

  const lista = treinos.map((t) => ({
    id: t.id,
    data: t.data,
    horario: t.horario,
    local: t.local,
    tipo: t.tipo,
    descricao: t.descricao,
    paceEsperado: t.pace_esperado,
    status: t.status,
    criadorId: t.criador_id,
    criador: { id: t.criador_id, nome: t.criador_nome },
    totalParticipantes: Number(t.total_participantes),
    participando: Boolean(t.participando),
  }));

  res.json({ total: lista.length, treinos: lista });
});

app.get('/treinos/:id', autenticar, async (req, res) => {
  const [treino] = await query(
    `SELECT t.id,
            t.data,
            t.horario,
            t.local,
            t.tipo,
            t.descricao,
            t.pace_esperado,
            t.status,
            t.criador_id,
            u.nome AS criador_nome,
            EXISTS(SELECT 1 FROM treino_participantes tp WHERE tp.treino_id = t.id AND tp.usuario_id = ?) AS participando,
            (SELECT COUNT(*) FROM treino_participantes tp WHERE tp.treino_id = t.id) AS total_participantes
     FROM treinos t
     JOIN usuarios u ON u.id = t.criador_id
     WHERE t.id = ?`,
    [req.usuarioId, req.params.id]
  );

  if (!treino) {
    return res.status(404).json({ erro: 'Treino não encontrado.' });
  }

  res.json({
    id: treino.id,
    data: treino.data,
    horario: treino.horario,
    local: treino.local,
    tipo: treino.tipo,
    descricao: treino.descricao,
    paceEsperado: treino.pace_esperado,
    status: treino.status,
    criadorId: treino.criador_id,
    criador: { id: treino.criador_id, nome: treino.criador_nome },
    totalParticipantes: Number(treino.total_participantes),
    participando: Boolean(treino.participando),
  });
});

app.post('/treinos', autenticar, async (req, res) => {
  const { data, horario, local, tipo, descricao, paceEsperado } = req.body;
  if (!data || !horario || !local || !tipo) {
    return res.status(400).json({ erro: 'data, horario, local e tipo são obrigatórios.' });
  }

  const id = uuidv4();
  await query(
    'INSERT INTO treinos (id, data, horario, local, tipo, descricao, pace_esperado, criador_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data, horario, local, tipo, descricao || null, paceEsperado || null, req.usuarioId]
  );

  await query('INSERT INTO treino_participantes (treino_id, usuario_id) VALUES (?, ?)', [id, req.usuarioId]);

  res.status(201).json({ mensagem: 'Treino criado com sucesso.', treino: { id, data, horario, local, tipo, descricao, paceEsperado, criadorId: req.usuarioId, status: 'ativo', totalParticipantes: 1, participando: true } });
});

app.post('/treinos/:id/participar', autenticar, async (req, res) => {
  const treinoId = req.params.id;
  const [treino] = await query('SELECT status FROM treinos WHERE id = ?', [treinoId]);
  if (!treino) {
    return res.status(404).json({ erro: 'Treino não encontrado.' });
  }
  if (treino.status !== 'ativo') {
    return res.status(409).json({ erro: 'Não é possível participar de um treino cancelado.' });
  }

  const participante = await query('SELECT 1 FROM treino_participantes WHERE treino_id = ? AND usuario_id = ? LIMIT 1', [treinoId, req.usuarioId]);
  if (participante.length > 0) {
    return res.status(409).json({ erro: 'Você já participa deste treino.' });
  }

  await query('INSERT INTO treino_participantes (treino_id, usuario_id) VALUES (?, ?)', [treinoId, req.usuarioId]);
  res.json({ mensagem: 'Participação confirmada.' });
});

app.listen(PORT, () => {
  console.log(`Servidor CorreJunto rodando em http://localhost:${PORT}`);
});
