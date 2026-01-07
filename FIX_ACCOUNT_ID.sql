-- ========================================
-- FIX URGENTE: Aggiungi colonna account_id mancante
-- Esegui questo script IMMEDIATAMENTE nel SQL Editor di Supabase
-- ========================================

-- 1. Aggiungi colonna account_id alla tabella expenses se non esiste
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS account_id BIGINT REFERENCES accounts(id);

-- 2. Aggiungi colonna account_id alla tabella incomes se non esiste
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS account_id BIGINT REFERENCES accounts(id);

-- 3. Verifica che la tabella accounts esista, altrimenti creala
CREATE TABLE IF NOT EXISTS accounts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  initial_balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Inserisci conti di default se non esistono
INSERT INTO accounts (name, initial_balance) 
VALUES ('Contanti', 0)
ON CONFLICT DO NOTHING;

INSERT INTO accounts (name, initial_balance) 
VALUES ('Conto Corrente', 0)
ON CONFLICT DO NOTHING;

-- 5. Verifica che payment_method esista (per sicurezza)
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'contanti';
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'contanti';

-- Aggiorna i record esistenti
UPDATE expenses SET payment_method = 'contanti' WHERE payment_method IS NULL;
UPDATE incomes SET payment_method = 'contanti' WHERE payment_method IS NULL;

-- ========================================
-- FINE FIX
-- ========================================

-- Verifica che tutto sia stato creato correttamente
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('expenses', 'incomes', 'accounts')
ORDER BY table_name, ordinal_position;

