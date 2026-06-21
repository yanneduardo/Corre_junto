-- Migration: adiciona biografia e nível de corrida ao usuário
USE corre_junto;

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS bio VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS running_level ENUM('iniciante','intermediario','avancado') NULL;
