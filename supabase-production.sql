-- ========================================
-- SCRIPT COMPLETO PER PRODUZIONE SUPABASE
-- Esegui questo script nel SQL Editor di Supabase
-- ========================================

-- 1. Crea tabella users
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crea tabella main_categories (con campo type per expenses/incomes)
CREATE TABLE IF NOT EXISTS main_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('expenses', 'incomes')) DEFAULT 'expenses',
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

-- 4. Crea tabella accounts
CREATE TABLE IF NOT EXISTS accounts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  initial_balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crea tabella expenses (con payment_method e account_id)
CREATE TABLE IF NOT EXISTS expenses (
  id BIGSERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  main_category_id BIGINT REFERENCES main_categories(id),
  subcategory_id BIGINT REFERENCES subcategories(id),
  payment_method TEXT DEFAULT 'contanti',
  account_id BIGINT REFERENCES accounts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Crea tabella incomes (con payment_method e account_id)
CREATE TABLE IF NOT EXISTS incomes (
  id BIGSERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  main_category_id BIGINT REFERENCES main_categories(id),
  subcategory_id BIGINT REFERENCES subcategories(id),
  payment_method TEXT DEFAULT 'contanti',
  account_id BIGINT REFERENCES accounts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Crea tabella deadlines
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

-- 1. Crea utente admin (password: C0S1M0)
-- NOTA: La password verrà hashata correttamente al primo login
INSERT INTO users (username, password_hash) 
VALUES ('admin', '$2a$10$demo.hash.for.testing.purposes.only')
ON CONFLICT (username) DO NOTHING;

-- 2. Inserisci categorie principali per SPESE
INSERT INTO main_categories (name, type, user_id) 
SELECT 'Alimentari', 'expenses', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, type, user_id) 
SELECT 'Trasporti', 'expenses', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, type, user_id) 
SELECT 'Casa', 'expenses', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, type, user_id) 
SELECT 'Salute', 'expenses', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, type, user_id) 
SELECT 'Svago', 'expenses', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO main_categories (name, type, user_id) 
SELECT 'Altro', 'expenses', id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

-- 3. Inserisci categorie principali per ENTRATE
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

-- 4. Inserisci sottocategorie per Alimentari
INSERT INTO subcategories (name, main_category_id) 
SELECT 'Supermercato', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Alimentari' AND u.username = 'admin' AND mc.type = 'expenses'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Ristorante', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Alimentari' AND u.username = 'admin' AND mc.type = 'expenses'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Bar', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Alimentari' AND u.username = 'admin' AND mc.type = 'expenses'
ON CONFLICT DO NOTHING;

-- 5. Inserisci sottocategorie per Trasporti
INSERT INTO subcategories (name, main_category_id) 
SELECT 'Benzina', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Trasporti' AND u.username = 'admin' AND mc.type = 'expenses'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Autobus', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Trasporti' AND u.username = 'admin' AND mc.type = 'expenses'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Treno', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Trasporti' AND u.username = 'admin' AND mc.type = 'expenses'
ON CONFLICT DO NOTHING;

-- 6. Inserisci sottocategorie per Casa
INSERT INTO subcategories (name, main_category_id) 
SELECT 'Affitto', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Casa' AND u.username = 'admin' AND mc.type = 'expenses'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Bollette', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Casa' AND u.username = 'admin' AND mc.type = 'expenses'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (name, main_category_id) 
SELECT 'Manutenzione', mc.id 
FROM main_categories mc 
JOIN users u ON mc.user_id = u.id 
WHERE mc.name = 'Casa' AND u.username = 'admin' AND mc.type = 'expenses'
ON CONFLICT DO NOTHING;

-- 7. Inserisci sottocategorie per Stipendio
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

-- 8. Inserisci sottocategorie per Freelance
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

-- 9. Inserisci conti di default
INSERT INTO accounts (name, initial_balance) 
VALUES ('Contanti', 0)
ON CONFLICT DO NOTHING;

INSERT INTO accounts (name, initial_balance) 
VALUES ('Conto Corrente', 0)
ON CONFLICT DO NOTHING;

-- ========================================
-- FINE SCRIPT
-- ========================================

