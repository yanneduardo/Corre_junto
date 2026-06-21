-- Migration: adiciona URL da foto de perfil ao usuário
-- Compatível com MySQL 8.0 (não usa "ADD COLUMN IF NOT EXISTS", não suportado nessa versão)
USE corre_junto;

SET @dbname = 'corre_junto';
SET @tablename = 'usuarios';

SET @coluna_foto_existe = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'profile_picture_url'
);

SET @sql_foto = IF(@coluna_foto_existe = 0,
  'ALTER TABLE usuarios ADD COLUMN profile_picture_url VARCHAR(500) NULL',
  'SELECT "Coluna profile_picture_url já existe, nada a fazer."'
);

PREPARE stmt FROM @sql_foto;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
