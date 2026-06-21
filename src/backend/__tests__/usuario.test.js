const UsuarioModel = require('../models/usuario');
const pool = require('../config/database');

jest.mock('../config/database');
jest.mock('bcryptjs');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

describe('UsuarioModel', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('criar usuário', () => {
    it('deve criar usuário com dados válidos', async () => {
      pool.execute.mockResolvedValueOnce([]);

      const usuario = await UsuarioModel.criar({
        nome: 'João',
        email: 'joao@example.com',
        senha: 'senha123',
      });

      expect(usuario.id).toBe('test-uuid-123');
      expect(usuario.nome).toBe('João');
      expect(usuario.email).toBe('joao@example.com');
    });

    it('deve normalizar email para minúsculas', async () => {
      pool.execute.mockResolvedValueOnce([]);

      await UsuarioModel.criar({
        nome: 'Test',
        email: '  TESTE@EXAMPLE.COM  ',
        senha: 'senha123',
      });

      expect(pool.execute).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['teste@example.com'])
      );
    });
  });

  describe('buscarPorEmail', () => {
    it('deve encontrar usuário por email', async () => {
      const mockUsuario = {
        id: '123',
        nome: 'João',
        email: 'joao@example.com',
        senha_hash: 'hash123',
        bio: 'Bio',
        running_level: 'intermediario',
        criado_em: '2024-01-01',
      };

      pool.execute.mockResolvedValueOnce([[mockUsuario]]);

      const resultado = await UsuarioModel.buscarPorEmail('joao@example.com');

      expect(resultado.id).toBe('123');
    });

    it('deve retornar null se email não existe', async () => {
      pool.execute.mockResolvedValueOnce([[]]);

      const resultado = await UsuarioModel.buscarPorEmail('inexistente@test.com');

      expect(resultado).toBeNull();
    });
  });

  describe('buscarPorId', () => {
    it('deve encontrar usuário por ID', async () => {
      const mockUsuario = {
        id: '123',
        nome: 'João',
        email: 'joao@example.com',
        senha_hash: 'hash123',
        bio: 'Bio',
        running_level: 'intermediario',
        criado_em: '2024-01-01',
      };

      pool.execute.mockResolvedValueOnce([[mockUsuario]]);

      const resultado = await UsuarioModel.buscarPorId('123');

      expect(resultado.id).toBe('123');
      expect(resultado.nome).toBe('João');
    });

    it('deve retornar null se não encontra usuário', async () => {
      pool.execute.mockResolvedValueOnce([[]]);

      const resultado = await UsuarioModel.buscarPorId('inexistente');

      expect(resultado).toBeNull();
    });
  });

  describe('atualizarPerfil', () => {
    it('deve atualizar bio e runningLevel', async () => {
      const usuarioAtualizado = {
        id: '123',
        bio: 'Nova bio',
        running_level: 'avancado',
      };

      pool.execute
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([[usuarioAtualizado]]);

      const resultado = await UsuarioModel.atualizarPerfil('123', {
        bio: 'Nova bio',
        runningLevel: 'avancado',
      });

      expect(resultado.bio).toBe('Nova bio');
    });

    it('deve retornar usuário se nenhum campo for atualizado', async () => {
      const usuario = { id: '123', nome: 'João' };
      pool.execute.mockResolvedValueOnce([[usuario]]);

      const resultado = await UsuarioModel.atualizarPerfil('123', {});

      expect(resultado.id).toBe('123');
    });
  });

  describe('verificarSenha', () => {
    it('deve comparar senhas', async () => {
      const bcrypt = require('bcryptjs');
      bcrypt.compare.mockResolvedValueOnce(true);

      const resultado = await UsuarioModel.verificarSenha('senha', 'hash');

      expect(bcrypt.compare).toHaveBeenCalledWith('senha', 'hash');
      expect(resultado).toBe(true);
    });
  });

  describe('_semSenha', () => {
    it('deve remover senhaHash do objeto', () => {
      const usuarioComSenha = {
        id: '123',
        nome: 'João',
        senhaHash: 'hash123',
        bio: 'Bio',
      };

      const resultado = UsuarioModel._semSenha(usuarioComSenha);

      expect(resultado.senhaHash).toBeUndefined();
      expect(resultado.id).toBe('123');
    });

    it('deve retornar null para null', () => {
      const resultado = UsuarioModel._semSenha(null);
      expect(resultado).toBeNull();
    });
  });
});
