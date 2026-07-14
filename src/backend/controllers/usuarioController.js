const pool = require('../config/database');
const fs = require('fs');
const path = require('path');
const UsuarioModel = require('../models/usuario');
const { PASTA_UPLOADS } = require('../middlewares/upload');

// Obter estatísticas de treinos do usuário
exports.obterEstatisticasTreinos = async (req, res) => {
  try {
    const usuarioId = req.params.id;

    const [treinosCriados] = await pool.execute(
      'SELECT COUNT(*) as total FROM treinos WHERE criador_id = ?',
      [usuarioId]
    );

    const [treinosParticipa] = await pool.execute(
      'SELECT COUNT(*) as total FROM treino_participantes WHERE usuario_id = ?',
      [usuarioId]
    );

    res.json({
      created: treinosCriados[0].total,
      participated: treinosParticipa[0].total
    });
  } catch (erro) {
    console.error('Erro ao obter estatísticas:', erro);
    res.status(500).json({ erro: 'Erro ao obter estatísticas de treinos' });
  }
};

/**
 * PUT /usuarios/:id/bio
 * Atualiza a biografia e/ou nível de corrida do usuário autenticado.
 * Apenas o próprio usuário pode editar seu perfil.
 */
exports.atualizarBio = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.usuario.id !== id) {
      return res.status(403).json({ erro: 'Você só pode editar o seu próprio perfil.' });
    }

    const { bio, runningLevel } = req.body;

    if (bio !== undefined && bio !== null) {
      if (typeof bio !== 'string') {
        return res.status(400).json({ erro: 'A biografia deve ser um texto.' });
      }
      if (bio.length > UsuarioModel.BIO_MAX_LENGTH) {
        return res.status(400).json({
          erro: `A biografia deve ter no máximo ${UsuarioModel.BIO_MAX_LENGTH} caracteres.`,
        });
      }
    }

    if (runningLevel !== undefined && runningLevel !== null) {
      if (!UsuarioModel.NIVEIS_VALIDOS.includes(runningLevel)) {
        return res.status(400).json({
          erro: `Nível de corrida inválido. Valores aceitos: ${UsuarioModel.NIVEIS_VALIDOS.join(', ')}.`,
        });
      }
    }

    const usuarioAtualizado = await UsuarioModel.atualizarPerfil(id, { bio, runningLevel });
    return res.json({
      mensagem: 'Perfil atualizado com sucesso.',
      usuario: UsuarioModel._semSenha(usuarioAtualizado),
    });
  } catch (erro) {
    console.error('Erro ao atualizar perfil:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar perfil.' });
  }
};

/**
 * PUT /usuarios/:id/whatsapp
 * Atualiza o número de WhatsApp e a visibilidade (público/privado) do usuário autenticado.
 * Apenas o próprio usuário pode editar seu WhatsApp.
 * O número deve incluir o código do país (ex: 55 para Brasil) e conter apenas dígitos.
 * Envie whatsapp: null para remover o número cadastrado.
 */
exports.atualizarWhatsapp = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.usuario.id !== id) {
      return res.status(403).json({ erro: 'Você só pode editar o seu próprio perfil.' });
    }

    const { whatsapp, whatsappPublico } = req.body;

    let whatsappLimpo;
    if (whatsapp === undefined) {
      whatsappLimpo = undefined;
    } else if (whatsapp === null || whatsapp === '') {
      whatsappLimpo = null;
    } else {
      if (typeof whatsapp !== 'string') {
        return res.status(400).json({ erro: 'O número de WhatsApp deve ser um texto.' });
      }
      whatsappLimpo = UsuarioModel.limparWhatsapp(whatsapp);
      if (!UsuarioModel.WHATSAPP_REGEX.test(whatsappLimpo)) {
        return res.status(400).json({
          erro: 'Número de WhatsApp inválido. Use o formato com código do país, ex: 5511999998888 (Brasil = 55).',
        });
      }
    }

    if (whatsappPublico !== undefined && typeof whatsappPublico !== 'boolean') {
      return res.status(400).json({ erro: 'whatsappPublico deve ser verdadeiro ou falso.' });
    }

    const usuarioAtualizado = await UsuarioModel.atualizarPerfil(id, {
      whatsapp: whatsappLimpo,
      whatsappPublico,
    });

    const usuarioPublico = UsuarioModel._semSenha(usuarioAtualizado);
    return res.json({
      mensagem: 'WhatsApp atualizado com sucesso.',
      usuario: {
        ...usuarioPublico,
        whatsappLink: UsuarioModel.gerarLinkWhatsapp(usuarioPublico.whatsapp),
      },
    });
  } catch (erro) {
    console.error('Erro ao atualizar WhatsApp:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar WhatsApp.' });
  }
};

/**
 * POST /usuarios/:id/profile-picture
 * Faz upload de uma nova foto de perfil para o usuário autenticado.
 * Apenas o próprio usuário pode alterar sua foto.
 * Se já existir uma foto anterior, ela é substituída (o arquivo antigo é removido).
 */
exports.uploadFotoPerfil = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.usuario.id !== id) {
      if (req.file) _removerArquivoFisico(req.file.path);
      return res.status(403).json({ erro: 'Você só pode editar o seu próprio perfil.' });
    }

    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhum arquivo de imagem foi enviado.' });
    }

    const usuarioAtual = await UsuarioModel.buscarPorId(id);
    if (!usuarioAtual) {
      _removerArquivoFisico(req.file.path);
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const novaUrl = `/uploads/profile-pictures/${req.file.filename}`;
    const usuarioAtualizado = await UsuarioModel.atualizarPerfil(id, { profilePictureUrl: novaUrl });

    if (usuarioAtual.profilePictureUrl) {
      _removerArquivoFisico(path.join(PASTA_UPLOADS, path.basename(usuarioAtual.profilePictureUrl)));
    }

    return res.json({
      mensagem: 'Foto de perfil atualizada com sucesso.',
      usuario: UsuarioModel._semSenha(usuarioAtualizado),
    });
  } catch (erro) {
    if (req.file) _removerArquivoFisico(req.file.path);
    console.error('Erro ao fazer upload da foto de perfil:', erro);
    res.status(500).json({ erro: 'Erro ao fazer upload da foto de perfil.' });
  }
};

/**
 * DELETE /usuarios/:id/profile-picture
 * Remove a foto de perfil do usuário autenticado.
 */
exports.removerFotoPerfil = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.usuario.id !== id) {
      return res.status(403).json({ erro: 'Você só pode editar o seu próprio perfil.' });
    }

    const usuarioAtual = await UsuarioModel.buscarPorId(id);
    if (!usuarioAtual) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    if (!usuarioAtual.profilePictureUrl) {
      return res.status(400).json({ erro: 'Usuário não possui foto de perfil para remover.' });
    }

    const usuarioAtualizado = await UsuarioModel.atualizarPerfil(id, { profilePictureUrl: null });
    _removerArquivoFisico(path.join(PASTA_UPLOADS, path.basename(usuarioAtual.profilePictureUrl)));

    return res.json({
      mensagem: 'Foto de perfil removida com sucesso.',
      usuario: UsuarioModel._semSenha(usuarioAtualizado),
    });
  } catch (erro) {
    console.error('Erro ao remover foto de perfil:', erro);
    res.status(500).json({ erro: 'Erro ao remover foto de perfil.' });
  }
};

function _removerArquivoFisico(caminho) {
  fs.unlink(caminho, (erro) => {
    if (erro && erro.code !== 'ENOENT') {
      console.error('Erro ao remover arquivo de foto de perfil:', erro);
    }
  });
}

/**
 * GET /usuarios/:id
 * Retorna os dados públicos do perfil de um usuário (nome, bio, nível).
 */
exports.buscarPerfil = async (req, res) => {
  try {
    const usuario = await UsuarioModel.buscarPorId(req.params.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const usuarioPublico = UsuarioModel._semSenha(usuario);
    const ehDonoDoPerfil = req.usuario?.id === usuario.id;

    // O número só é exposto para o dono do perfil ou se o usuário marcou como público.
    const podeVerWhatsapp = ehDonoDoPerfil || usuarioPublico.whatsappPublico;
    const whatsapp = podeVerWhatsapp ? usuarioPublico.whatsapp : null;

    return res.json({
      usuario: {
        ...usuarioPublico,
        whatsapp,
        whatsappLink: podeVerWhatsapp ? UsuarioModel.gerarLinkWhatsapp(whatsapp) : null,
      },
    });
  } catch (erro) {
    console.error('Erro ao buscar perfil:', erro);
    res.status(500).json({ erro: 'Erro ao buscar perfil.' });
  }
};
