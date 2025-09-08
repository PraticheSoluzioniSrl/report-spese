-- ========================================
-- SCRIPT COMPLETO PER CREARE TUTTE LE TABELLE
-- ========================================

-- 1. Crea tabella users
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crea tabella main_categories
CREATE TABLE IF NOT EXISTS main_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id BIGINT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crea tabella subcategories
CREATE TABLE IF NOT EXISTS subcategories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  main_category_id BIGINT REFERENCES main_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crea tabella expenses
CREATE TABLE IF NOT EXISTS expenses (
  id BIGSERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  main_category_id BIGINT REFERENCES main_categories(id),
  subcategory_id BIGINT REFERENCES subcategories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crea tabella incomes
CREATE TABLE IF NOT EXISTS incomes (
  id BIGSERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  main_category_id BIGINT REFERENCES main_categories(id),
  subcategory_id BIGINT REFERENCES subcategories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Crea tabella deadlines
CREATE TABLE IF NOT EXISTS deadlines (
  id BIGSERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INSERISCI DATI INIZIALI
-- ========================================

-- 1. Crea utente admin
INSERT INTO users (username, password_hash) 
VALUES ('admin', '$2a$10$demo.hash.for.testing.purposes.only')
ON CONFLICT (username) DO NOTHING;

-- 2. Inserisci categorie principali
INSERT INTO main_categories (name, user_id) 
SELECT 'Alimentari', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, user_id) 
SELECT 'Trasporti', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, user_id) 
SELECT 'Casa', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, user_id) 
SELECT 'Salute', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, user_id) 
SELECT 'Svago', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, user_id) 
SELECT 'Altro', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

-- 3. Inserisci sottocategorie per Alimentari
INSERT INTO subcategories (name, main_category_id) 
SELECT 'Supermercato', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Alimentari' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Ristorante', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Alimentari' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Bar', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Alimentari' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

-- 4. Inserisci sottocategorie per Trasporti
INSERT INTO subcategories (name, main_category_id) 
SELECT 'Benzina', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Trasporti' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Autobus', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Trasporti' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Taxi', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Trasporti' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

-- 5. Inserisci sottocategorie per Casa
INSERT INTO subcategories (name, main_category_id) 
SELECT 'Affitto', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Casa' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Bollette', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Casa' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Spese condominio', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Casa' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

-- 6. Inserisci sottocategorie per Salute
INSERT INTO subcategories (name, main_category_id) 
SELECT 'Medico', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Salute' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Farmacia', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Salute' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Dentista', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Salute' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

-- 7. Inserisci sottocategorie per Svago
INSERT INTO subcategories (name, main_category_id) 
SELECT 'Cinema', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Svago' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Sport', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Svago' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Viaggi', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Svago' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

-- 8. Inserisci sottocategorie per Altro
INSERT INTO subcategories (name, main_category_id) 
SELECT 'Vestiti', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Altro' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Regali', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Altro' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Varie', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Altro' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

-- ========================================
-- VERIFICA FINALE
-- ========================================

-- Mostra il riepilogo delle tabelle create
SELECT 'users' as tabella, COUNT(*) as record FROM users
UNION ALL
SELECT 'main_categories', COUNT(*) FROM main_categories
UNION ALL
SELECT 'subcategories', COUNT(*) FROM subcategories
UNION ALL
SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'incomes', COUNT(*) FROM incomes
UNION ALL
SELECT 'deadlines', COUNT(*) FROM deadlines;
