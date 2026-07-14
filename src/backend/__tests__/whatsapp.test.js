const UsuarioModel = require('../models/usuario');
const usuarioController = require('../controllers/usuarioController');
const pool = require('../config/database');

jest.mock('../config/database');
jest.mock('bcryptjs');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

describe('UsuarioModel - WhatsApp', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('limparWhatsapp', () => {
    it('remove espaços, parênteses, hífen e sinal de mais', () => {
      expect(UsuarioModel.limparWhatsapp('+55 (11) 99999-8888')).toBe('5511999998888');
    });

    it('mantém string já limpa inalterada', () => {
      expect(UsuarioModel.limparWhatsapp('5511999998888')).toBe('5511999998888');
    });
  });

  describe('WHATSAPP_REGEX', () => {
    it('aceita número válido com código do país do Brasil', () => {
      expect(UsuarioModel.WHATSAPP_REGEX.test('5511999998888')).toBe(true);
    });

    it('rejeita número começando com 0', () => {
      expect(UsuarioModel.WHATSAPP_REGEX.test('0511999998888')).toBe(false);
    });

    it('rejeita número muito curto', () => {
      expect(UsuarioModel.WHATSAPP_REGEX.test('123')).toBe(false);
    });

    it('rejeita número com letras', () => {
      expect(UsuarioModel.WHATSAPP_REGEX.test('55abc999998888')).toBe(false);
    });

    it('rejeita número muito longo', () => {
      expect(UsuarioModel.WHATSAPP_REGEX.test('123456789012345678')).toBe(false);
    });
  });

  describe('gerarLinkWhatsapp', () => {
    it('gera link no formato https://wa.me/<numero>', () => {
      expect(UsuarioModel.gerarLinkWhatsapp('5511999998888')).toBe('https://wa.me/5511999998888');
    });

    it('retorna null quando não há número', () => {
      expect(UsuarioModel.gerarLinkWhatsapp(null)).toBeNull();
      expect(UsuarioModel.gerarLinkWhatsapp(undefined)).toBeNull();
      expect(UsuarioModel.gerarLinkWhatsapp('')).toBeNull();
    });
  });

  describe('atualizarPerfil - whatsapp', () => {
    it('atualiza whatsapp e whatsappPublico no banco', async () => {
      pool.execute.mockResolvedValueOnce([]); // UPDATE
      pool.execute.mockResolvedValueOnce([[{
        id: 'user-1',
        nome: 'João',
        email: 'joao@example.com',
        senha_hash: 'hash',
        bio: null,
        running_level: null,
        profile_picture_url: null,
        whatsapp: '5511999998888',
        whatsapp_publico: 1,
        criado_em: new Date(),
      }]]); // buscarPorId

      const resultado = await UsuarioModel.atualizarPerfil('user-1', {
        whatsapp: '5511999998888',
        whatsappPublico: true,
      });

      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('whatsapp = ?'),
        expect.arrayContaining(['5511999998888', 1, 'user-1'])
      );
      expect(resultado.whatsapp).toBe('5511999998888');
      expect(resultado.whatsappPublico).toBe(true);
    });

    it('permite remover o whatsapp definindo null', async () => {
      pool.execute.mockResolvedValueOnce([]); // UPDATE
      pool.execute.mockResolvedValueOnce([[{
        id: 'user-1',
        nome: 'João',
        email: 'joao@example.com',
        senha_hash: 'hash',
        bio: null,
        running_level: null,
        profile_picture_url: null,
        whatsapp: null,
        whatsapp_publico: 0,
        criado_em: new Date(),
      }]]);

      const resultado = await UsuarioModel.atualizarPerfil('user-1', { whatsapp: null });

      expect(resultado.whatsapp).toBeNull();
    });
  });
});

describe('UsuarioController - WhatsApp', () => {
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
      status: jest.fn().mockReturnValue({ json: jest.fn() }),
    };
    res.status.mockReturnValue(res);

    jest.spyOn(UsuarioModel, 'limparWhatsapp');
    jest.spyOn(UsuarioModel, 'atualizarPerfil');
    jest.spyOn(UsuarioModel, '_semSenha');
    jest.spyOn(UsuarioModel, 'gerarLinkWhatsapp');
    jest.spyOn(UsuarioModel, 'buscarPorId');
  });

  afterEach(() => {
    console.error.mockRestore();
    jest.restoreAllMocks();
  });

  describe('PUT /usuarios/:id/whatsapp - atualizarWhatsapp', () => {
    it('atualiza o whatsapp com sucesso e retorna o link gerado', async () => {
      req.params.id = 'user-123';
      req.body = { whatsapp: '+55 (11) 99999-8888', whatsappPublico: true };

      const usuarioAtualizado = {
        id: 'user-123',
        whatsapp: '5511999998888',
        whatsappPublico: true,
      };
      UsuarioModel.atualizarPerfil.mockResolvedValueOnce(usuarioAtualizado);
      UsuarioModel._semSenha.mockReturnValueOnce(usuarioAtualizado);

      await usuarioController.atualizarWhatsapp(req, res);

      expect(UsuarioModel.atualizarPerfil).toHaveBeenCalledWith('user-123', {
        whatsapp: '5511999998888',
        whatsappPublico: true,
      });
      expect(res.json).toHaveBeenCalledWith({
        mensagem: 'WhatsApp atualizado com sucesso.',
        usuario: {
          ...usuarioAtualizado,
          whatsappLink: 'https://wa.me/5511999998888',
        },
      });
    });

    it('retorna 400 para número de whatsapp em formato inválido', async () => {
      req.params.id = 'user-123';
      req.body = { whatsapp: '123' };

      await usuarioController.atualizarWhatsapp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(UsuarioModel.atualizarPerfil).not.toHaveBeenCalled();
    });

    it('retorna 400 quando whatsapp não é uma string', async () => {
      req.params.id = 'user-123';
      req.body = { whatsapp: 123456789012 };

      await usuarioController.atualizarWhatsapp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('permite remover o whatsapp enviando null', async () => {
      req.params.id = 'user-123';
      req.body = { whatsapp: null };

      const usuarioAtualizado = { id: 'user-123', whatsapp: null, whatsappPublico: false };
      UsuarioModel.atualizarPerfil.mockResolvedValueOnce(usuarioAtualizado);
      UsuarioModel._semSenha.mockReturnValueOnce(usuarioAtualizado);

      await usuarioController.atualizarWhatsapp(req, res);

      expect(UsuarioModel.atualizarPerfil).toHaveBeenCalledWith('user-123', {
        whatsapp: null,
        whatsappPublico: undefined,
      });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        usuario: expect.objectContaining({ whatsappLink: null }),
      }));
    });

    it('retorna 403 se o usuário tentar editar o whatsapp de outra pessoa', async () => {
      req.params.id = 'outro-usuario';
      req.body = { whatsapp: '5511999998888' };

      await usuarioController.atualizarWhatsapp(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(UsuarioModel.atualizarPerfil).not.toHaveBeenCalled();
    });

    it('retorna 400 se whatsappPublico não for booleano', async () => {
      req.params.id = 'user-123';
      req.body = { whatsappPublico: 'sim' };

      await usuarioController.atualizarWhatsapp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('trata erro de banco de dados', async () => {
      req.params.id = 'user-123';
      req.body = { whatsapp: '5511999998888' };
      UsuarioModel.atualizarPerfil.mockRejectedValueOnce(new Error('DB Error'));

      await usuarioController.atualizarWhatsapp(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('GET /usuarios/:id - buscarPerfil com privacidade do whatsapp', () => {
    it('mostra o whatsapp quando o próprio dono acessa o perfil', async () => {
      req.params.id = 'user-123';
      req.usuario = { id: 'user-123' };

      const usuario = {
        id: 'user-123',
        nome: 'João',
        whatsapp: '5511999998888',
        whatsappPublico: false,
      };
      UsuarioModel.buscarPorId.mockResolvedValueOnce(usuario);
      UsuarioModel._semSenha.mockReturnValueOnce(usuario);

      await usuarioController.buscarPerfil(req, res);

      expect(res.json).toHaveBeenCalledWith({
        usuario: expect.objectContaining({
          whatsapp: '5511999998888',
          whatsappLink: 'https://wa.me/5511999998888',
        }),
      });
    });

    it('esconde o whatsapp de outro usuário quando está marcado como privado', async () => {
      req.params.id = 'user-456';
      req.usuario = { id: 'user-123' };

      const usuario = {
        id: 'user-456',
        nome: 'Maria',
        whatsapp: '5511988887777',
        whatsappPublico: false,
      };
      UsuarioModel.buscarPorId.mockResolvedValueOnce(usuario);
      UsuarioModel._semSenha.mockReturnValueOnce(usuario);

      await usuarioController.buscarPerfil(req, res);

      expect(res.json).toHaveBeenCalledWith({
        usuario: expect.objectContaining({
          whatsapp: null,
          whatsappLink: null,
        }),
      });
    });

    it('mostra o whatsapp de outro usuário quando está marcado como público', async () => {
      req.params.id = 'user-456';
      req.usuario = { id: 'user-123' };

      const usuario = {
        id: 'user-456',
        nome: 'Maria',
        whatsapp: '5511988887777',
        whatsappPublico: true,
      };
      UsuarioModel.buscarPorId.mockResolvedValueOnce(usuario);
      UsuarioModel._semSenha.mockReturnValueOnce(usuario);

      await usuarioController.buscarPerfil(req, res);

      expect(res.json).toHaveBeenCalledWith({
        usuario: expect.objectContaining({
          whatsapp: '5511988887777',
          whatsappLink: 'https://wa.me/5511988887777',
        }),
      });
    });
  });
});
