-- Script per aggiungere categorie specifiche per le entrate

-- Inserisci categorie principali per le entrate
INSERT INTO main_categories (name, user_id) 
SELECT 'Stipendio', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, user_id) 
SELECT 'Freelance', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, user_id) 
SELECT 'Investimenti', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, user_id) 
SELECT 'Vendite', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, user_id) 
SELECT 'Rimborsi', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, user_id) 
SELECT 'Altri Ricavi', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

-- Inserisci sottocategorie per Stipendio
INSERT INTO subcategories (name, main_category_id) 
SELECT 'Stipendio fisso', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Stipendio' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Bonus', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Stipendio' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Straordinari', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Stipendio' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

-- Inserisci sottocategorie per Freelance
INSERT INTO subcategories (name, main_category_id) 
SELECT 'Progetti web', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Freelance' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Consulenze', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Freelance' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Formazione', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Freelance' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

-- Inserisci sottocategorie per Investimenti
INSERT INTO subcategories (name, main_category_id) 
SELECT 'Dividendi', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Investimenti' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Interessi', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Investimenti' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Plusvalenze', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Investimenti' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

-- Inserisci sottocategorie per Vendite
INSERT INTO subcategories (name, main_category_id) 
SELECT 'Vendita oggetti', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Vendite' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Vendita servizi', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Vendite' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

-- Inserisci sottocategorie per Rimborsi
INSERT INTO subcategories (name, main_category_id) 
SELECT 'Rimborsi spese', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Rimborsi' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Rimborsi tasse', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Rimborsi' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

-- Inserisci sottocategorie per Altri Ricavi
INSERT INTO subcategories (name, main_category_id) 
SELECT 'Regali ricevuti', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Altri Ricavi' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Vincite', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Altri Ricavi' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Varie entrate', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Altri Ricavi' AND u.username = 'admin'
ON CONFLICT DO NOTHING;
