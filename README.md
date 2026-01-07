# Cosimo - Gestionale Spese

Sistema completo di gestione spese e entrate con persistenza dati su Supabase.

## 🚀 Quick Start

### Setup Locale

1. **Installa le dipendenze:**
   ```bash
   npm install
   ```

2. **Configura Supabase** (opzionale per sviluppo locale):
   - Crea un file `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Avvia il server:**
   ```bash
   npm run dev
   ```

4. **Accedi:**
   - URL: `http://localhost:3000`
   - Password: `C0S1M0`

## 📦 Deploy Produzione

### Prerequisiti
- Account Supabase: [supabase.com](https://supabase.com)
- Account Vercel: [vercel.com](https://vercel.com)
- Account GitHub: [github.com](https://github.com)

### Passi per il Deploy

1. **Setup Supabase Database**
   - Segui le istruzioni in `SETUP_SUPABASE.md`
   - Esegui lo script `supabase-production.sql`

2. **Deploy su Vercel**
   - Segui le istruzioni complete in `DEPLOY_PRODUZIONE.md`
   - Configura le variabili d'ambiente per Supabase

3. **Verifica**
   - Accedi all'applicazione deployata
   - Cambia la password di default
   - Testa che i dati persistano

## 📚 Documentazione

- **`SETUP_SUPABASE.md`** - Guida completa per configurare Supabase
- **`DEPLOY_PRODUZIONE.md`** - Istruzioni dettagliate per il deploy
- **`DEPLOY_ISTRUZIONI.md`** - Guida generale al deploy

## 🔐 Sicurezza

- Password hashata con bcrypt
- Database protetto con Supabase
- Connessioni HTTPS su Vercel
- ⚠️ **Cambia la password di default** dopo il primo accesso!

## ✨ Funzionalità

- ✅ Gestione spese e entrate
- ✅ Categorie e sottocategorie personalizzabili
- ✅ Gestione conti multipli
- ✅ Scadenze e pagamenti
- ✅ Import Excel/CSV
- ✅ Analisi e grafici
- ✅ Persistenza dati su Supabase
- ✅ Backup automatico database

## 🛠️ Tecnologie

- **Framework**: Next.js 14
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Charts**: Chart.js
- **Hosting**: Vercel

## 📝 Note

- Il progetto è configurato per funzionare **solo con Supabase** in produzione
- La modalità demo è disponibile solo per sviluppo locale
- Tutti i dati sono salvati permanentemente nel database Supabase

## 🐛 Troubleshooting

Vedi `DEPLOY_PRODUZIONE.md` per la sezione troubleshooting completa.

## 📄 Licenza

Progetto privato - Tutti i diritti riservati

---

**Versione**: 1.0.0 - Produzione  
**Ultimo aggiornamento**: 2026
