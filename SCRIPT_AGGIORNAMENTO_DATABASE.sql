-- ========================================
-- SCRIPT DI AGGIORNAMENTO DATABASE ESISTENTE
-- Esegui questo script se il database esiste già ma mancano alcuni campi
-- ========================================

-- 1. Aggiungi campo payment_method se manca
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'contanti';
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'contanti';

-- Aggiorna i record esistenti con il valore di default
UPDATE expenses SET payment_method = 'contanti' WHERE payment_method IS NULL;
UPDATE incomes SET payment_method = 'contanti' WHERE payment_method IS NULL;

-- 2. Crea tabella accounts se non esiste
CREATE TABLE IF NOT EXISTS accounts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  initial_balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Aggiungi campo account_id se manca
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS account_id BIGINT REFERENCES accounts(id);
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS account_id BIGINT REFERENCES accounts(id);

-- 4. Aggiungi campo type a main_categories se manca
ALTER TABLE main_categories ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expenses';

-- Aggiorna le categorie esistenti con il tipo corretto
UPDATE main_categories 
SET type = 'expenses' 
WHERE name IN ('Alimentari', 'Trasporti', 'Casa', 'Salute', 'Svago', 'Altro')
AND type IS NULL;

UPDATE main_categories 
SET type = 'incomes' 
WHERE name IN ('Stipendio', 'Freelance', 'Investimenti', 'Vendite', 'Rimborsi', 'Altri Ricavi')
AND type IS NULL;

-- Se ci sono categorie senza tipo, imposta il default
UPDATE main_categories 
SET type = 'expenses' 
WHERE type IS NULL;

-- 5. Inserisci conti di default se non esistono
INSERT INTO accounts (name, initial_balance) 
VALUES ('Contanti', 0)
ON CONFLICT DO NOTHING;

INSERT INTO accounts (name, initial_balance) 
VALUES ('Conto Corrente', 0)
ON CONFLICT DO NOTHING;

-- 6. Inserisci categorie per entrate se non esistono
INSERT INTO main_categories (name, type, user_id) 
SELECT 'Stipendio', 'incomes', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, type, user_id) 
SELECT 'Freelance', 'incomes', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, type, user_id) 
SELECT 'Investimenti', 'incomes', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, type, user_id) 
SELECT 'Vendite', 'incomes', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, type, user_id) 
SELECT 'Rimborsi', 'incomes', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, type, user_id) 
SELECT 'Altri Ricavi', 'incomes', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

-- 7. Inserisci sottocategorie per entrate se non esistono
INSERT INTO subcategories (name, main_category_id) 
SELECT 'Stipendio fisso', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Stipendio' AND u.username = 'admin' AND mc.type = 'incomes'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Bonus', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Stipendio' AND u.username = 'admin' AND mc.type = 'incomes'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Progetti web', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Freelance' AND u.username = 'admin' AND mc.type = 'incomes'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Consulenze', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Freelance' AND u.username = 'admin' AND mc.type = 'incomes'
ON CONFLICT DO NOTHING;

-- ========================================
-- FINE SCRIPT DI AGGIORNAMENTO
-- ========================================

