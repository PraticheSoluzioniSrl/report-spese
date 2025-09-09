-- Aggiunge il campo 'type' alla tabella main_categories
-- Esegui questo script nel dashboard di Supabase

-- Aggiungi la colonna type
ALTER TABLE main_categories 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expenses';

-- Aggiorna le categorie esistenti con il tipo corretto
UPDATE main_categories 
SET type = 'expenses' 
WHERE name IN ('Alimentari', 'Trasporti', 'Casa', 'Salute', 'Svago', 'Altro');

UPDATE main_categories 
SET type = 'incomes' 
WHERE name IN ('Stipendio', 'Freelance', 'Investimenti', 'Vendite', 'Rimborsi', 'Altri Ricavi');

-- Se ci sono categorie senza tipo, imposta il default
UPDATE main_categories 
SET type = 'expenses' 
WHERE type IS NULL;
