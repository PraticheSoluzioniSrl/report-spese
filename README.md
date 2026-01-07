Cosimo - Gestionale spese (Next.js 14)

## Setup Locale (Modalità Demo)

Il progetto funziona **immediatamente** in modalità demo senza configurazione database.

1. **Installa le dipendenze:**
   ```bash
   npm install
   ```

2. **Avvia il server di sviluppo:**
   ```bash
   npm run dev
   ```

3. **Apri il browser su:** `http://localhost:3000`

4. **Accedi con password:** `C0S1M0`

### Modalità Demo
- ✅ Funziona senza database configurato
- ✅ Dati salvati in memoria locale (persistono durante la sessione)
- ✅ Tutte le funzionalità disponibili: spese, entrate, categorie, conti, scadenze
- ⚠️ I dati vengono persi al riavvio del server (normale per modalità demo)

### Configurazione Database (Opzionale)

Se vuoi persistenza dei dati, configura Supabase:

1. **Crea un file `.env.local`** (opzionale):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Esegui lo script di inizializzazione:**
   ```bash
   npm run init-db
   ```

## Deploy su Vercel

1. **Preparazione:**
   - Assicurati che il progetto sia su GitHub/GitLab/Bitbucket
   - Vai su [vercel.com](https://vercel.com) e importa il repository

2. **Configurazione (opzionale, solo se usi Supabase):**
   - Aggiungi le variabili d'ambiente su Vercel:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Deploy:**
   - Vercel rileverà automaticamente Next.js
   - Il deploy funzionerà anche senza database (modalità demo)

⚠️ **Nota:** Su Vercel in modalità demo, i dati non persisteranno tra le richieste (ogni funzione serverless è isolata). Per produzione con persistenza, configura Supabase.

## Accesso

- **Password di default:** `C0S1M0`
- **Cambio password:** disponibile nella pagina Impostazioni

## Funzionalità

- ✅ **Spese:** gestione completa delle spese mensili
- ✅ **Entrate:** pagina dedicata per registrare e consultare le entrate mensili
- ✅ **Categorie:** gestione categorie e sottocategorie per spese e entrate
- ✅ **Conti:** gestione di più conti con saldi
- ✅ **Scadenze:** gestione scadenze e pagamenti
- ✅ **Import massivo:** carica Excel/CSV di spese o entrate
- ✅ **Analisi:** grafici e statistiche delle spese/entrate

