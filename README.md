Cosimo - Gestionale spese (Next.js 14)

Setup locale

1. Crea `.env.local` con:

DATABASE_URL="postgresql://user:password@localhost:5432/cosimo?schema=public"

2. Installa le dipendenze e genera Prisma client:

npm i
npm run db:push
npm run db:seed

3. Avvia:

npm run dev

Deploy su Vercel
- Crea un database Postgres (Vercel Postgres o Neon)
- Imposta `DATABASE_URL` come variabile d'ambiente su Vercel
- Post-deploy esegui: `npx prisma db push` (una tantum) e poi `npm run db:seed` se vuoi le categorie base

Accesso
- Primo accesso: utente bootstrap (admin) con password `C0S1M0`. Cambia la password da Impostazioni.

Novità
- Entrate: pagina dedicata per registrare e consultare le entrate mensili
- Import massivo: carica Excel/CSV di spese o entrate (colonne: description, amount, date YYYY-MM-DD, mainCategory, subcategory)
- Cambio password: nella pagina Impostazioni

