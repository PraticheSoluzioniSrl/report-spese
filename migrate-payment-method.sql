-- Script per aggiungere il campo payment_method alle tabelle esistenti
-- Eseguire questo script nel database Supabase

-- 1. Aggiungi il campo payment_method alla tabella expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'contanti';

-- 2. Aggiungi il campo payment_method alla tabella incomes  
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'contanti';

-- 3. Aggiorna i record esistenti con il valore di default
UPDATE expenses SET payment_method = 'contanti' WHERE payment_method IS NULL;
UPDATE incomes SET payment_method = 'contanti' WHERE payment_method IS NULL;

-- 4. Verifica che i campi siano stati aggiunti correttamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name IN ('expenses', 'incomes') 
AND column_name = 'payment_method';
