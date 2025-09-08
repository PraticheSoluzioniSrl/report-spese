-- Script semplificato per creare le tabelle

-- 1. Crea tabella users
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crea tabella main_categories
CREATE TABLE main_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id BIGINT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crea tabella subcategories
CREATE TABLE subcategories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  main_category_id BIGINT REFERENCES main_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crea tabella expenses
CREATE TABLE expenses (
  id BIGSERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  main_category_id BIGINT REFERENCES main_categories(id),
  subcategory_id BIGINT REFERENCES subcategories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crea tabella incomes
CREATE TABLE incomes (
  id BIGSERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  main_category_id BIGINT REFERENCES main_categories(id),
  subcategory_id BIGINT REFERENCES subcategories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Crea tabella deadlines
CREATE TABLE deadlines (
  id BIGSERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserisci utente admin
INSERT INTO users (username, password_hash) 
VALUES ('admin', '$2a$10$demo.hash.for.testing.purposes.only');

-- Inserisci categorie principali
INSERT INTO main_categories (name, user_id) VALUES 
('Alimentari', 1),
('Trasporti', 1),
('Casa', 1),
('Salute', 1),
('Svago', 1),
('Altro', 1);

-- Inserisci sottocategorie
INSERT INTO subcategories (name, main_category_id) VALUES 
-- Alimentari
('Supermercato', 1),
('Ristorante', 1),
('Bar', 1),
-- Trasporti
('Benzina', 2),
('Autobus', 2),
('Taxi', 2),
-- Casa
('Affitto', 3),
('Bollette', 3),
('Spese condominio', 3),
-- Salute
('Medico', 4),
('Farmacia', 4),
('Dentista', 4),
-- Svago
('Cinema', 5),
('Sport', 5),
('Viaggi', 5),
-- Altro
('Vestiti', 6),
('Regali', 6),
('Varie', 6);
