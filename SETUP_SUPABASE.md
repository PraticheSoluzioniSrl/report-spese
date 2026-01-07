# 🗄️ Setup Supabase per Produzione

Questa guida ti aiuterà a configurare Supabase per garantire la persistenza dei dati.

## Passo 1: Crea un Progetto Supabase

1. Vai su [supabase.com](https://supabase.com)
2. Clicca su **"Start your project"** o **"New Project"**
3. Accedi con GitHub o crea un account
4. Crea un nuovo progetto:
   - **Name**: `cosimo-gestionale-spese` (o un nome a tua scelta)
   - **Database Password**: Scegli una password forte e **SALVALA** (ti servirà)
   - **Region**: Scegli la regione più vicina a te
   - Clicca su **"Create new project"**

5. Attendi che il progetto sia pronto (circa 2 minuti)

## Passo 2: Esegui lo Script SQL

1. Nel dashboard di Supabase, vai su **"SQL Editor"** (menu laterale)
2. Clicca su **"New query"**
3. Apri il file `supabase-production.sql` dalla cartella del progetto
4. Copia tutto il contenuto dello script
5. Incolla nello SQL Editor di Supabase
6. Clicca su **"Run"** o premi `Ctrl+Enter`
7. Verifica che non ci siano errori (dovrebbe dire "Success. No rows returned")

## Passo 3: Ottieni le Credenziali

1. Nel dashboard di Supabase, vai su **"Settings"** → **"API"**
2. Trova la sezione **"Project API keys"**
3. Copia questi valori:
   - **Project URL** (es: `https://xxxxx.supabase.co`)
   - **anon public** key (chiave pubblica anonima)

## Passo 4: Configura Vercel

Quando fai il deploy su Vercel, aggiungi queste variabili d'ambiente:

1. Vai su [vercel.com](https://vercel.com) → Il tuo progetto → **Settings** → **Environment Variables**
2. Aggiungi queste variabili:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Clicca su **"Save"**
4. **Riavvia il deploy** per applicare le nuove variabili

## Passo 5: Verifica il Setup

1. Dopo il deploy, accedi all'applicazione
2. Accedi con password: `C0S1M0`
3. Aggiungi una spesa di test
4. Ricarica la pagina - la spesa dovrebbe essere ancora presente ✅

## 🔐 Cambio Password

Dopo il primo accesso:
1. Vai su **Impostazioni**
2. Cambia la password di default `C0S1M0` con una password sicura
3. La nuova password sarà salvata nel database Supabase

## ✅ Verifica Database

Puoi verificare che i dati siano salvati correttamente:
1. Vai su Supabase Dashboard → **Table Editor**
2. Dovresti vedere le tabelle: `users`, `expenses`, `incomes`, `main_categories`, `subcategories`, `accounts`, `deadlines`
3. Controlla che i dati siano presenti

## 🐛 Troubleshooting

### Errore "relation does not exist"
- Lo script SQL non è stato eseguito correttamente
- Ripeti il Passo 2

### Dati non persistono
- Verifica che le variabili d'ambiente su Vercel siano corrette
- Controlla che non ci siano errori nei log di Vercel
- Verifica che Supabase sia attivo (non in pausa)

### Errore di autenticazione
- Verifica che la chiave `NEXT_PUBLIC_SUPABASE_ANON_KEY` sia corretta
- Assicurati di aver copiato la chiave "anon public" e non la "service_role"

## 📝 Note Importanti

- ✅ I dati sono ora salvati permanentemente nel database Supabase
- ✅ Non perderai più i dati tra le sessioni
- ✅ Puoi fare backup del database da Supabase Dashboard → Settings → Database
- ⚠️ Mantieni sicure le credenziali di Supabase

---

**Setup completato! I tuoi dati sono ora al sicuro nel database Supabase.** 🎉

