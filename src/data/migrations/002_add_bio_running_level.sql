-- Migration: adiciona biografia e nível de corrida ao usuário
-- Compatível com MySQL 8.0 (não usa "ADD COLUMN IF NOT EXISTS", não suportado nessa versão)
USE corre_junto;

SET @dbname = 'corre_junto';
SET @tablename = 'usuarios';

SET @coluna_bio_existe = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'bio'
);

SET @sql_bio = IF(@coluna_bio_existe = 0,
  'ALTER TABLE usuarios ADD COLUMN bio VARCHAR(500) NULL',
  'SELECT "Coluna bio já existe, nada a fazer."'
);

PREPARE stmt FROM @sql_bio;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @coluna_nivel_existe = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'running_level'
);

SET @sql_nivel = IF(@coluna_nivel_existe = 0,
  "ALTER TABLE usuarios ADD COLUMN running_level ENUM('iniciante','intermediario','avancado') NULL",
  'SELECT "Coluna running_level já existe, nada a fazer."'
);

PREPARE stmt FROM @sql_nivel;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
