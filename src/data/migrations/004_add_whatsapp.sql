-- Migration: adiciona número de WhatsApp e visibilidade (público/privado) ao usuário
-- Compatível com MySQL 8.0 (não usa "ADD COLUMN IF NOT EXISTS", não suportado nessa versão)
USE corre_junto;

SET @dbname = 'corre_junto';
SET @tablename = 'usuarios';

SET @coluna_whatsapp_existe = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'whatsapp'
);

SET @sql_whatsapp = IF(@coluna_whatsapp_existe = 0,
  'ALTER TABLE usuarios ADD COLUMN whatsapp VARCHAR(20) NULL',
  'SELECT "Coluna whatsapp já existe, nada a fazer."'
);

PREPARE stmt FROM @sql_whatsapp;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @coluna_whatsapp_publico_existe = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'whatsapp_publico'
);

SET @sql_whatsapp_publico = IF(@coluna_whatsapp_publico_existe = 0,
  'ALTER TABLE usuarios ADD COLUMN whatsapp_publico TINYINT(1) NOT NULL DEFAULT 0',
  'SELECT "Coluna whatsapp_publico já existe, nada a fazer."'
);

PREPARE stmt FROM @sql_whatsapp_publico;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
