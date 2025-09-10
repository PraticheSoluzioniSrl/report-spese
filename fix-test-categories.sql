-- Corregge le categorie di test che sono state create senza il tipo corretto
-- Esegui questo script nel dashboard di Supabase

-- Aggiorna le categorie di test per le spese
UPDATE main_categories 
SET type = 'expenses' 
WHERE name IN ('Test Category', 'Test Category 2', 'Test Category Expenses', 'Parcella');

-- Aggiorna le categorie di test per le entrate  
UPDATE main_categories 
SET type = 'incomes' 
WHERE name IN ('Test Category Incomes');

-- Verifica il risultato
SELECT id, name, type FROM main_categories ORDER BY id;

