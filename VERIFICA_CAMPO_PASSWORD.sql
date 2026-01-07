-- ========================================
-- Verifica e Fix campo password nella tabella users
-- Esegui questo script se il cambio password non funziona
-- ========================================

-- 1. Verifica la struttura della tabella users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';

-- 2. Se il campo si chiama 'password' invece di 'password_hash', rinominalo
-- (Esegui solo se necessario)
-- ALTER TABLE users RENAME COLUMN password TO password_hash;

-- 3. Verifica che il campo password_hash esista e sia di tipo TEXT
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 4. Se esiste un campo 'password' senza hash, aggiornalo
-- (Esegui solo se necessario - questo crea un hash per la password di default)
-- UPDATE users SET password_hash = '$2a$10$demo.hash.for.testing.purposes.only' WHERE password_hash IS NULL;

-- ========================================
-- Verifica utente esistente
-- ========================================
SELECT id, username, 
       CASE 
         WHEN password_hash IS NULL THEN 'Password hash mancante'
         WHEN LENGTH(password_hash) < 20 THEN 'Password hash troppo corto'
         ELSE 'OK'
       END as password_status
FROM users
LIMIT 1;

