-- Script per aggiungere il campo payment_method alle tabelle esistenti

-- Aggiungi il campo payment_method alla tabella expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'contanti';

-- Aggiungi il campo payment_method alla tabella incomes  
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'contanti';

-- Aggiorna i record esistenti con il valore di default
UPDATE expenses SET payment_method = 'contanti' WHERE payment_method IS NULL;
UPDATE incomes SET payment_method = 'contanti' WHERE payment_method IS NULL;
