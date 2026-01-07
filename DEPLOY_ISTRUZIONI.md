# 🚀 Istruzioni Deploy su Vercel

## ✅ Progetto Pronto per il Deploy

Il progetto è stato verificato e compila correttamente. Esegui il deploy seguendo questi passaggi:

## Metodo 1: Deploy tramite Vercel Dashboard (Consigliato)

### Passo 1: Prepara il Repository
1. Assicurati che il progetto sia su GitHub/GitLab/Bitbucket
2. Se non hai ancora fatto il push:
   ```bash
   cd report-spese
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <URL_DEL_TUO_REPOSITORY>
   git push -u origin main
   ```

### Passo 2: Deploy su Vercel
1. Vai su [vercel.com](https://vercel.com) e accedi (o crea un account)
2. Clicca su **"Add New Project"**
3. Importa il tuo repository GitHub/GitLab/Bitbucket
4. Configura il progetto:
   - **Framework Preset**: Next.js (rilevato automaticamente)
   - **Root Directory**: `report-spese` ⚠️ **IMPORTANTE**: Se il progetto è in una sottocartella
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

5. **Variabili d'ambiente** (OPZIONALI - solo se vuoi usare Supabase):
   - `NEXT_PUBLIC_SUPABASE_URL`: URL del tuo progetto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chiave anonima di Supabase
   
   ⚠️ **Nota**: Se non configuri Supabase, il sistema funzionerà in modalità demo (dati in memoria)

6. Clicca su **"Deploy"**

### Passo 3: Attendi il Deploy
- Vercel compilerà automaticamente il progetto
- Il deploy richiede circa 2-3 minuti
- Riceverai un URL tipo: `https://tuo-progetto.vercel.app`

## Metodo 2: Deploy tramite CLI

### Passo 1: Installa Vercel CLI
```bash
npm i -g vercel
```

### Passo 2: Esegui il Deploy
```bash
cd report-spese
vercel
```

Segui le istruzioni interattive:
- Seleziona il progetto esistente o creane uno nuovo
- Conferma le impostazioni
- Attendi il completamento

### Passo 3: Deploy in Produzione
```bash
vercel --prod
```

## 📝 Note Importanti

### Modalità Demo su Vercel
- ✅ Il sistema funziona **senza database** configurato
- ⚠️ I dati vengono salvati **in memoria** e vengono persi tra le richieste
- ✅ Per test e sviluppo funziona perfettamente
- ⚠️ Per produzione con persistenza, configura Supabase

### Accesso dopo il Deploy
- **URL**: L'URL fornito da Vercel
- **Password**: `C0S1M0`
- **Cambio password**: Disponibile nella pagina Impostazioni

### Funzionalità Disponibili
- ✅ Aggiungi spese/entrate
- ✅ Elimina spese/entrate
- ⚠️ **Modifica spese**: Attualmente non funziona - usa "Elimina e Ricrea" come workaround
- ✅ Gestione categorie e sottocategorie
- ✅ Gestione conti
- ✅ Gestione scadenze
- ✅ Import Excel/CSV
- ✅ Analisi e grafici

## 🔧 Configurazione Supabase (Opzionale - per Persistenza)

Se vuoi che i dati persistano:

1. Crea un progetto su [supabase.com](https://supabase.com)
2. Esegui gli script SQL nella cartella `report-spese`:
   - `supabase-setup.sql` o `supabase-simple.sql`
3. Aggiungi le variabili d'ambiente su Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Riavvia il deploy

## 🐛 Troubleshooting

### Build Fallisce
- Controlla i log su Vercel Dashboard → Deployments → Logs
- Verifica che tutte le dipendenze siano nel `package.json`
- Assicurati che il Root Directory sia corretto (`report-spese`)

### Errore 500
- Controlla i log delle funzioni serverless su Vercel
- Verifica le variabili d'ambiente se usi Supabase

### Dati Non Persistono
- Normale in modalità demo (senza Supabase)
- Configura Supabase per persistenza reale

## ✅ Verifica Post-Deploy

1. Apri l'URL fornito da Vercel
2. Accedi con password `C0S1M0`
3. Testa le funzionalità:
   - Aggiungi una spesa
   - Elimina una spesa
   - Verifica che tutto funzioni

---

**Buon deploy! 🚀**

