-- Banco de dados CorreJunto para MySQL
CREATE DATABASE IF NOT EXISTS corre_junto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE corre_junto;

CREATE TABLE IF NOT EXISTS usuarios (
  id CHAR(36) NOT NULL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS treinos (
  id CHAR(36) NOT NULL PRIMARY KEY,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  local VARCHAR(255) NOT NULL,
  tipo ENUM('corrida_leve','intervalado','longao') NOT NULL,
  descricao TEXT NULL,
  pace_esperado VARCHAR(20) NULL,
  criador_id CHAR(36) NOT NULL,
  status ENUM('ativo','cancelado') NOT NULL DEFAULT 'ativo',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (criador_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS treino_participantes (
  treino_id CHAR(36) NOT NULL,
  usuario_id CHAR(36) NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (treino_id, usuario_id),
  FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
