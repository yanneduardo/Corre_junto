# 🗄️ Estrutura do Banco de Dados - Corre Junto

## 📊 Tabelas Principais

### usuarios
Armazena dados dos usuários do sistema

```sql
CREATE TABLE usuarios (
  id VARCHAR(36) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  bio TEXT,
  running_level ENUM('iniciante', 'intermediario', 'avancado'),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do usuário (gerado com uuid v4) |
| `nome` | String | Nome completo do usuário |
| `email` | String | Email único (normalizado em minúsculas) |
| `senha_hash` | String | Senha com hash bcrypt (nunca armazena plain text) |
| `bio` | Text | Biografia do usuário (máx 500 caracteres) |
| `running_level` | Enum | Nível de experiência em corrida |
| `criado_em` | Timestamp | Data de criação da conta |

#### Exemplo de Registro
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha_hash": "$2a$10$...",
  "bio": "Corredor iniciante buscando parceiros",
  "running_level": "iniciante",
  "criado_em": "2024-06-21 10:30:00"
}
```

---

### treinos
Armazena informações dos treinos

```sql
CREATE TABLE treinos (
  id VARCHAR(36) PRIMARY KEY,
  criador_id VARCHAR(36) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_treino DATETIME NOT NULL,
  local VARCHAR(255),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criador_id) REFERENCES usuarios(id)
);
```

#### Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do treino |
| `criador_id` | UUID | ID do usuário que criou |
| `titulo` | String | Nome do treino |
| `descricao` | Text | Descrição detalhada |
| `data_treino` | DateTime | Quando o treino acontece |
| `local` | String | Localização do treino |
| `criado_em` | Timestamp | Quando foi criado |

---

### treino_participantes
Relaciona usuários com treinos (muitos para muitos)

```sql
CREATE TABLE treino_participantes (
  treino_id VARCHAR(36),
  usuario_id VARCHAR(36),
  PRIMARY KEY (treino_id, usuario_id),
  FOREIGN KEY (treino_id) REFERENCES treinos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

#### Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `treino_id` | UUID | ID do treino |
| `usuario_id` | UUID | ID do participante |

---

## 🔍 Queries Comuns

### Encontrar usuário por email
```sql
SELECT * FROM usuarios WHERE email = 'joao@example.com' LIMIT 1;
```

### Encontrar usuário por ID
```sql
SELECT * FROM usuarios WHERE id = '550e8400-e29b-41d4-a716-446655440000' LIMIT 1;
```

### Atualizar perfil do usuário
```sql
UPDATE usuarios 
SET bio = 'Nova bio', running_level = 'avancado' 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

### Contar treinos criados por usuário
```sql
SELECT COUNT(*) as total FROM treinos WHERE criador_id = '550e8400-e29b-41d4-a716-446655440000';
```

### Contar treinos que usuário participa
```sql
SELECT COUNT(*) as total FROM treino_participantes WHERE usuario_id = '550e8400-e29b-41d4-a716-446655440000';
```

---

## 🔐 Segurança

### Senhas
- ✅ Sempre armazenadas com hash bcrypt (salt rounds: 10)
- ✅ Nunca retornadas na API
- ✅ Comparadas com `bcrypt.compare()`

### Email
- ✅ Normalizado em minúsculas
- ✅ Espaços removidos (trim)
- ✅ Único no banco (constraint UNIQUE)

### Bio
- ✅ Máximo 500 caracteres
- ✅ Validado no controller antes de salvar
- ✅ Pode ser null ou vazio

---

## 📈 Índices

Para melhor performance, adicione índices:

```sql
-- Email para busca rápida
ALTER TABLE usuarios ADD UNIQUE INDEX idx_email (email);

-- Para queries de treinos por criador
ALTER TABLE treinos ADD INDEX idx_criador_id (criador_id);

-- Para queries de participação
ALTER TABLE treino_participantes ADD INDEX idx_usuario_id (usuario_id);
```

---

## 🗃️ Backup e Restauração

### Backup completo
```bash
mysqldump -u usuario -p corre_junto > backup.sql
```

### Restaurar backup
```bash
mysql -u usuario -p corre_junto < backup.sql
```

---

## 📝 Migrations

Para adicionar novos campos, crie uma migration:

```sql
-- migration_001_adicionar_foto_perfil.sql
ALTER TABLE usuarios ADD COLUMN foto_perfil VARCHAR(255) AFTER bio;
```

Execute com:
```bash
mysql -u usuario -p corre_junto < migration_001_adicionar_foto_perfil.sql
```

---

**Última atualização**: 2026-06-21
