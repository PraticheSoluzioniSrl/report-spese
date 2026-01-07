# 🔍 Verifica e Aggiornamento Supabase Esistente

L'applicazione è già deployata su Vercel: **https://report-spese-ihi3.vercel.app**

## 📋 Passo 1: Verifica Configurazione Vercel

### Controlla le Variabili d'Ambiente su Vercel

1. Vai su [vercel.com](https://vercel.com) e accedi
2. Trova il progetto `report-spese-ihi3` (o simile)
3. Vai su **Settings** → **Environment Variables**
4. Verifica che siano presenti:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. **Se mancano**, aggiungile:
   - Vai su Supabase Dashboard → Settings → API
   - Copia il **Project URL**
   - Copia la chiave **anon public**
   - Aggiungi su Vercel come variabili d'ambiente
   - Seleziona tutti gli ambienti (Production, Preview, Development)
   - Clicca **Save**
   - **Riavvia il deploy** (Deployments → ... → Redeploy)

## 📋 Passo 2: Verifica Database Supabase

### Controlla che le Tabelle Esistano

1. Vai su [supabase.com](https://supabase.com) e accedi
2. Trova il progetto collegato a questa applicazione
3. Vai su **Table Editor** (menu laterale)
4. Verifica che esistano queste tabelle:
   - ✅ `users`
   - ✅ `main_categories`
   - ✅ `subcategories`
   - ✅ `expenses`
   - ✅ `incomes`
   - ✅ `accounts`
   - ✅ `deadlines`

### Se le Tabelle Non Esistono o Sono Incomplete

1. Vai su **SQL Editor** (menu laterale)
2. Clicca su **New query**
3. Apri il file `supabase-production.sql` dalla cartella del progetto
4. Copia tutto il contenuto
5. Incolla nello SQL Editor
6. Clicca su **Run**
7. Verifica che non ci siano errori

## 📋 Passo 3: Verifica Campi delle Tabelle

### Controlla che le Tabelle Abbiano Tutti i Campi Necessari

Esegui questa query nel SQL Editor di Supabase per verificare:

```sql
-- Verifica struttura tabella expenses
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'expenses';

-- Verifica struttura tabella incomes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'incomes';

-- Verifica struttura tabella main_categories
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'main_categories';
```

### Campi Richiesti

**Tabella `expenses` deve avere:**
- `id`
- `description`
- `amount`
- `date`
- `main_category_id`
- `subcategory_id`
- `payment_method` ⚠️ **IMPORTANTE**
- `account_id` ⚠️ **IMPORTANTE**
- `created_at`

**Tabella `incomes` deve avere:**
- `id`
- `description`
- `amount`
- `date`
- `main_category_id`
- `subcategory_id`
- `payment_method` ⚠️ **IMPORTANTE**
- `account_id` ⚠️ **IMPORTANTE**
- `created_at`

**Tabella `main_categories` deve avere:**
- `id`
- `name`
- `type` ⚠️ **IMPORTANTE** (per distinguere expenses/incomes)
- `user_id`
- `created_at`

### Se Mancano Campi

Esegui questi script per aggiungere i campi mancanti:

```sql
-- Aggiungi payment_method se manca
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'contanti';
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'contanti';

-- Aggiungi account_id se manca
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS account_id BIGINT REFERENCES accounts(id);
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS account_id BIGINT REFERENCES accounts(id);

-- Aggiungi type a main_categories se manca
ALTER TABLE main_categories ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expenses';
```

## 📋 Passo 4: Verifica Dati Iniziali

### Controlla che Ci Siano Categorie e Conti

1. Vai su **Table Editor** → `main_categories`
2. Dovresti vedere categorie come:
   - Alimentari, Trasporti, Casa (type: expenses)
   - Stipendio, Freelance (type: incomes)

3. Vai su **Table Editor** → `accounts`
4. Dovresti vedere almeno:
   - Contanti
   - Conto Corrente

### Se Mancano Dati Iniziali

Esegui lo script `supabase-production.sql` completo (include anche i dati iniziali).

## 📋 Passo 5: Test dell'Applicazione

1. Vai su **https://report-spese-ihi3.vercel.app**
2. Accedi con password: `C0S1M0`
3. Testa:
   - ✅ Aggiungi una spesa
   - ✅ Aggiungi un'entrata
   - ✅ Ricarica la pagina - i dati devono essere ancora presenti
   - ✅ Verifica che le categorie siano visibili
   - ✅ Verifica che i conti siano visibili

## 🔧 Aggiornamento Codice (se necessario)

Se devi aggiornare il codice deployato:

1. Fai le modifiche nel codice locale
2. Committa e fai push su GitHub:
   ```bash
   git add .
   git commit -m "Aggiornamento configurazione"
   git push origin main
   ```
3. Vercel aggiornerà automaticamente il deploy

## 🐛 Troubleshooting

### L'applicazione non si connette a Supabase

1. Verifica le variabili d'ambiente su Vercel
2. Controlla i log su Vercel Dashboard → Deployments → Logs
3. Verifica che Supabase non sia in pausa

### Dati non persistono

1. Verifica che le tabelle esistano nel database
2. Controlla i log di Supabase (Dashboard → Logs → Postgres Logs)
3. Verifica che lo script SQL sia stato eseguito correttamente

### Errore "relation does not exist"

- Le tabelle non sono state create
- Esegui lo script `supabase-production.sql`

### Errore "column does not exist"

- Manca un campo nella tabella
- Esegui gli script ALTER TABLE sopra indicati

## 📝 Checklist Verifica

- [ ] Variabili d'ambiente configurate su Vercel
- [ ] Tutte le tabelle esistono in Supabase
- [ ] Tutti i campi necessari sono presenti
- [ ] Dati iniziali (categorie, conti) sono presenti
- [ ] Applicazione si connette correttamente
- [ ] Dati persistono dopo ricaricamento
- [ ] Tutte le funzionalità funzionano

---

**Dopo aver completato questi passi, l'applicazione dovrebbe funzionare correttamente con persistenza dati garantita.**

