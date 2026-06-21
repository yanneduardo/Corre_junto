const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const UsuarioModel = require('../models/usuario');

const PASTA_UPLOADS = path.join(__dirname, '../uploads/profile-pictures');

// Garante que a pasta de uploads exista (caso ainda não tenha sido criada)
fs.mkdirSync(PASTA_UPLOADS, { recursive: true });

const EXTENSOES_POR_TIPO = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PASTA_UPLOADS),
  filename: (req, file, cb) => {
    const extensao = EXTENSOES_POR_TIPO[file.mimetype] || path.extname(file.originalname);
    cb(null, `${req.params.id}-${uuidv4()}${extensao}`);
  },
});

function filtroDeArquivo(req, file, cb) {
  if (!UsuarioModel.TIPOS_FOTO_VALIDOS.includes(file.mimetype)) {
    return cb(new Error('TIPO_INVALIDO'));
  }
  cb(null, true);
}

const uploadFotoPerfil = multer({
  storage,
  fileFilter: filtroDeArquivo,
  limits: { fileSize: UsuarioModel.FOTO_MAX_BYTES },
}).single('foto');

/**
 * Middleware que envolve o multer para traduzir os erros dele
 * em respostas JSON consistentes com o resto da API.
 */
function processarUploadFoto(req, res, next) {
  uploadFotoPerfil(req, res, (erro) => {
    if (erro instanceof multer.MulterError) {
      if (erro.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          erro: `A foto deve ter no máximo ${UsuarioModel.FOTO_MAX_BYTES / (1024 * 1024)}MB.`,
        });
      }
      return res.status(400).json({ erro: 'Erro ao enviar o arquivo.' });
    }
    if (erro && erro.message === 'TIPO_INVALIDO') {
      return res.status(400).json({ erro: 'Tipo de arquivo inválido. Apenas JPG e PNG são aceitos.' });
    }
    if (erro) {
      return res.status(500).json({ erro: 'Erro ao processar upload da foto.' });
    }
    next();
  });
}

module.exports = { processarUploadFoto, PASTA_UPLOADS };
