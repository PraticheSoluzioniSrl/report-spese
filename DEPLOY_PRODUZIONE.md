# 🚀 Deploy Produzione - Versione Definitiva con Supabase

## ✅ Prerequisiti

1. **Account Supabase**: [supabase.com](https://supabase.com)
2. **Account Vercel**: [vercel.com](https://vercel.com)
3. **Account GitHub**: [github.com](https://github.com)

## 📋 Passo 1: Setup Supabase Database

**IMPORTANTE**: Questo passo è **OBBLIGATORIO** per evitare perdita dati!

1. Vai su [supabase.com](https://supabase.com) e crea un nuovo progetto
2. Segui le istruzioni dettagliate in **`SETUP_SUPABASE.md`**
3. Esegui lo script `supabase-production.sql` nel SQL Editor di Supabase
4. Ottieni le credenziali:
   - Project URL
   - anon public key

## 📋 Passo 2: Push su GitHub

Il progetto è già configurato con Git. Se non hai ancora fatto il push:

```bash
cd report-spese
git add .
git commit -m "Versione produzione con Supabase"
git push origin main
```

Se il repository non esiste ancora su GitHub:
1. Crea un nuovo repository su GitHub
2. Aggiungi il remote:
   ```bash
   git remote add origin https://github.com/TUO_USERNAME/nome-repository.git
   git push -u origin main
   ```

## 📋 Passo 3: Deploy su Vercel

### Opzione A: Tramite Dashboard (Consigliato)

1. Vai su [vercel.com](https://vercel.com) e accedi
2. Clicca su **"Add New Project"**
3. Importa il repository GitHub appena creato
4. Configura il progetto:
   - **Framework Preset**: Next.js (rilevato automaticamente)
   - **Root Directory**: `report-spese` ⚠️ **IMPORTANTE**
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. **Variabili d'ambiente** - **OBBLIGATORIE**:
   - Vai su **"Environment Variables"**
   - Aggiungi:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - Sostituisci con i valori ottenuti da Supabase
   - Seleziona **"Production"**, **"Preview"** e **"Development"**
   - Clicca su **"Save"**

6. Clicca su **"Deploy"**

7. Attendi il completamento (2-3 minuti)

### Opzione B: Tramite CLI

```bash
cd report-spese
npm i -g vercel
vercel
```

Quando richiesto:
- Seleziona il progetto o creane uno nuovo
- Aggiungi le variabili d'ambiente quando richiesto:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

Per il deploy in produzione:
```bash
vercel --prod
```

## 📋 Passo 4: Verifica Post-Deploy

1. Apri l'URL fornito da Vercel (es: `https://tuo-progetto.vercel.app`)
2. Accedi con password: `C0S1M0`
3. **Cambia immediatamente la password**:
   - Vai su **Impostazioni**
   - Cambia la password di default con una password sicura
4. Testa le funzionalità:
   - ✅ Aggiungi una spesa
   - ✅ Aggiungi un'entrata
   - ✅ Ricarica la pagina - i dati devono essere ancora presenti
   - ✅ Elimina una spesa
   - ✅ Verifica che tutto funzioni

## 🔐 Sicurezza

- ✅ Password hashata nel database Supabase
- ✅ Connessione sicura HTTPS su Vercel
- ✅ Database protetto con Row Level Security (RLS) se configurato
- ⚠️ **Cambia la password di default** dopo il primo accesso!

## 📊 Monitoraggio

### Vercel Dashboard
- Controlla i log: Vercel Dashboard → Deployments → Logs
- Monitora le performance: Analytics

### Supabase Dashboard
- Controlla i dati: Table Editor
- Monitora le query: Logs → Postgres Logs
- Backup: Settings → Database → Backups

## 🐛 Troubleshooting

### Errore "Supabase non configurato"
- Verifica che le variabili d'ambiente su Vercel siano corrette
- Controlla che siano applicate a Production, Preview e Development
- Riavvia il deploy dopo aver aggiunto le variabili

### Dati non persistono
- Verifica che Supabase sia attivo (non in pausa)
- Controlla i log di Vercel per errori
- Verifica che lo script SQL sia stato eseguito correttamente

### Errore 500
- Controlla i log su Vercel Dashboard
- Verifica le credenziali Supabase
- Assicurati che tutte le tabelle siano state create

## ✅ Checklist Finale

- [ ] Supabase progetto creato
- [ ] Script SQL eseguito correttamente
- [ ] Credenziali Supabase ottenute
- [ ] Codice pushato su GitHub
- [ ] Progetto deployato su Vercel
- [ ] Variabili d'ambiente configurate su Vercel
- [ ] Deploy completato con successo
- [ ] Accesso testato con password `C0S1M0`
- [ ] Password cambiata
- [ ] Dati persistono dopo ricaricamento pagina
- [ ] Tutte le funzionalità testate

## 🎉 Completato!

Il tuo gestionale spese è ora online con persistenza dati garantita!

- **URL**: https://tuo-progetto.vercel.app
- **Database**: Supabase (dati persistenti)
- **Hosting**: Vercel (veloce e affidabile)

---

**Supporto**: Per problemi, controlla i log su Vercel e Supabase Dashboard.

