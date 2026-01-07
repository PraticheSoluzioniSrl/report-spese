-- ========================================
-- FIX URGENTE: Aggiungi colonna account_id mancante
-- Esegui questo script IMMEDIATAMENTE nel SQL Editor di Supabase
-- ========================================

-- 1. Crea tabella accounts se non esiste
CREATE TABLE IF NOT EXISTS accounts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  initial_balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Aggiungi colonna account_id alla tabella expenses se non esiste
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS account_id BIGINT REFERENCES accounts(id);

-- 3. Aggiungi colonna account_id alla tabella incomes se non esiste
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS account_id BIGINT REFERENCES accounts(id);

-- 4. Verifica che payment_method esista (per sicurezza)
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'contanti';
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'contanti';

-- 5. Aggiorna i record esistenti
UPDATE expenses SET payment_method = 'contanti' WHERE payment_method IS NULL;
UPDATE incomes SET payment_method = 'contanti' WHERE payment_method IS NULL;

-- 6. Inserisci conti di default se non esistono
INSERT INTO accounts (name, initial_balance) 
VALUES ('Contanti', 0)
ON CONFLICT DO NOTHING;

INSERT INTO accounts (name, initial_balance) 
VALUES ('Conto Corrente', 0)
ON CONFLICT DO NOTHING;

-- ========================================
-- FINE FIX - Script completato!
-- ========================================

