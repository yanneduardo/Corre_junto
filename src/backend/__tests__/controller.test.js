const usuarioController = require('../controllers/usuarioController');
const UsuarioModel = require('../models/usuario');
const pool = require('../config/database');

jest.mock('../config/database');
jest.mock('../models/usuario', () => ({
  NIVEIS_VALIDOS: ['iniciante', 'intermediario', 'avancado'],
  BIO_MAX_LENGTH: 500,
  buscarPorId: jest.fn(),
  atualizarPerfil: jest.fn(),
  _semSenha: jest.fn(),
}));

describe('UsuarioController - Endpoints', () => {
  let req, res;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    req = {
      params: {},
      body: {},
      usuario: { id: 'user-123', nome: 'João' },
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnValue({
        json: jest.fn(),
      }),
    };

    res.status.mockReturnValue(res);
    jest.clearAllMocks();
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('GET /usuarios/:id - buscarPerfil', () => {
    it('deve retornar perfil do usuário', async () => {
      req.params.id = 'user-456';

      const usuario = { id: 'user-456', nome: 'Maria', bio: 'Bio' };
      UsuarioModel.buscarPorId.mockResolvedValueOnce(usuario);
      UsuarioModel._semSenha.mockReturnValueOnce(usuario);

      await usuarioController.buscarPerfil(req, res);

      expect(res.json).toHaveBeenCalledWith({ usuario });
    });

    it('deve retornar 404 se usuário não existe', async () => {
      req.params.id = 'inexistente';
      UsuarioModel.buscarPorId.mockResolvedValueOnce(null);

      await usuarioController.buscarPerfil(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deve tratar erro de banco de dados', async () => {
      req.params.id = 'user-456';
      UsuarioModel.buscarPorId.mockRejectedValueOnce(new Error('DB Error'));

      await usuarioController.buscarPerfil(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('PUT /usuarios/:id/bio - atualizarBio', () => {
    it('deve atualizar bio com sucesso', async () => {
      req.params.id = 'user-123';
      req.body = { bio: 'Nova bio', runningLevel: 'avancado' };

      const usuarioAtualizado = { id: 'user-123', bio: 'Nova bio' };
      UsuarioModel.atualizarPerfil.mockResolvedValueOnce(usuarioAtualizado);
      UsuarioModel._semSenha.mockReturnValueOnce(usuarioAtualizado);

      await usuarioController.atualizarBio(req, res);

      expect(res.json).toHaveBeenCalledWith({
        mensagem: 'Perfil atualizado com sucesso.',
        usuario: usuarioAtualizado,
      });
    });

    it('deve rejeitar quando tentar editar perfil de outro', async () => {
      req.params.id = 'user-456';
      req.body = { bio: 'Hack' };

      await usuarioController.atualizarBio(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('deve validar comprimento máximo de bio', async () => {
      req.params.id = 'user-123';
      req.body = { bio: 'a'.repeat(501) };

      await usuarioController.atualizarBio(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve validar tipo de bio', async () => {
      req.params.id = 'user-123';
      req.body = { bio: 123 };

      await usuarioController.atualizarBio(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve validar runningLevel', async () => {
      req.params.id = 'user-123';
      req.body = { runningLevel: 'super-expert' };

      await usuarioController.atualizarBio(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve aceitar bio como null', async () => {
      req.params.id = 'user-123';
      req.body = { bio: null, runningLevel: 'avancado' };

      const usuarioAtualizado = { id: 'user-123' };
      UsuarioModel.atualizarPerfil.mockResolvedValueOnce(usuarioAtualizado);
      UsuarioModel._semSenha.mockReturnValueOnce(usuarioAtualizado);

      await usuarioController.atualizarBio(req, res);

      expect(UsuarioModel.atualizarPerfil).toHaveBeenCalledWith('user-123', {
        bio: null,
        runningLevel: 'avancado',
      });
    });

    it('deve aceitar runningLevel como null', async () => {
      req.params.id = 'user-123';
      req.body = { bio: 'Nova bio', runningLevel: null };

      const usuarioAtualizado = { id: 'user-123' };
      UsuarioModel.atualizarPerfil.mockResolvedValueOnce(usuarioAtualizado);
      UsuarioModel._semSenha.mockReturnValueOnce(usuarioAtualizado);

      await usuarioController.atualizarBio(req, res);

      expect(res.json).toHaveBeenCalled();
    });

    it('deve tratar erro de banco de dados', async () => {
      req.params.id = 'user-123';
      req.body = { bio: 'Nova bio' };
      UsuarioModel.atualizarPerfil.mockRejectedValueOnce(new Error('DB Error'));

      await usuarioController.atualizarBio(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('GET /usuarios/:id/training-stats - obterEstatisticasTreinos', () => {
    it('deve retornar estatísticas de treinos', async () => {
      req.params.id = 'user-123';

      pool.execute
        .mockResolvedValueOnce([[{ total: 5 }]])
        .mockResolvedValueOnce([[{ total: 12 }]]);

      await usuarioController.obterEstatisticasTreinos(req, res);

      expect(res.json).toHaveBeenCalledWith({
        created: 5,
        participated: 12,
      });
    });

    it('deve tratar erro de banco de dados', async () => {
      req.params.id = 'user-123';
      pool.execute.mockRejectedValueOnce(new Error('DB Error'));

      await usuarioController.obterEstatisticasTreinos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
