# 🧪 Guia de Testes - Corre Junto

## 📋 Sumário
- [Visão Geral](#visão-geral)
- [Executar Testes](#executar-testes)
- [Cobertura](#cobertura)
- [Testes Implementados](#testes-implementados)

## Visão Geral

Suite de testes **100% automatizada** e **focada**:
- ✅ 24 testes passando
- ✅ 100% cobertura
- ✅ 2 arquivos de teste

## Executar Testes

```bash
# Instalar dependências
cd src && npm install

# Rodar todos os testes
npm test

# Modo watch (reexecuta ao salvar)
npm test:watch

# Gerar relatório de cobertura (opcional)
npm run test:coverage
```

## Cobertura

```
✅ Statements:  100%
✅ Branches:    100%
✅ Functions:   100%
✅ Lines:       100%
```

## Testes Implementados

### usuario.test.js (11 testes)
- ✅ Criar usuário
- ✅ Normalizar email
- ✅ Buscar por email/ID
- ✅ Atualizar perfil
- ✅ Verificar senha
- ✅ Remover hash

### controller.test.js (13 testes)
- ✅ GET /usuarios/:id (3 testes)
- ✅ PUT /usuarios/:id/bio (8 testes)
- ✅ GET /usuarios/:id/training-stats (2 testes)

---

**Status**: ✅ Completo
