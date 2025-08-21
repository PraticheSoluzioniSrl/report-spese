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
- Password statica: `C0S1M0`

