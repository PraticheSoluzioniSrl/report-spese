# Istruzioni per il Deploy su Vercel

## Preparazione

1. **Assicurati che il progetto sia su GitHub/GitLab/Bitbucket**
   - Se non lo è, crea un repository e fai il push del codice

2. **Installa Vercel CLI** (opzionale, puoi anche usare il sito web):
   ```bash
   npm i -g vercel
   ```

## Deploy tramite Vercel Dashboard (Consigliato)

1. Vai su [vercel.com](https://vercel.com) e accedi
2. Clicca su "Add New Project"
3. Importa il repository GitHub/GitLab/Bitbucket
4. Configura il progetto:
   - **Framework Preset**: Next.js (dovrebbe essere rilevato automaticamente)
   - **Root Directory**: `report-spese` (se il progetto è in una sottocartella)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. **Variabili d'ambiente** (opzionali, solo se vuoi usare Supabase):
   - `NEXT_PUBLIC_SUPABASE_URL`: URL del tuo progetto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chiave anonima di Supabase

6. Clicca su "Deploy"

## Deploy tramite CLI

```bash
cd report-spese
vercel
```

Segui le istruzioni interattive.

## Note Importanti

⚠️ **Modalità Demo su Vercel:**
- Su Vercel (serverless), il filesystem è read-only
- I dati salvati in `demo-data.json` NON persisteranno tra le richieste
- Ogni funzione serverless è isolata e i dati in memoria vengono persi
- Per avere persistenza reale, devi configurare Supabase o un altro database

✅ **Il sistema funzionerà comunque:**
- Le operazioni CRUD funzioneranno durante la sessione
- I dati rimarranno in memoria per la durata della funzione
- Per testare, funziona perfettamente
- Per produzione con persistenza, configura Supabase

## Configurazione Supabase (Opzionale)

Se vuoi persistenza reale:

1. Crea un progetto su [supabase.com](https://supabase.com)
2. Esegui gli script SQL nella cartella `report-spese`:
   - `supabase-setup.sql` o `supabase-simple.sql`
3. Aggiungi le variabili d'ambiente su Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Verifica dopo il Deploy

1. Vai all'URL fornito da Vercel
2. Accedi con password: `C0S1M0`
3. Testa le funzionalità:
   - Aggiungi spese/entrate
   - Modifica spese/entrate
   - Cambia categoria durante la modifica
   - Verifica che tutto funzioni

## Troubleshooting

Se vedi errori:
- Controlla i log su Vercel Dashboard → Deployments → Logs
- Verifica che tutte le dipendenze siano installate
- Assicurati che il build sia completato con successo



