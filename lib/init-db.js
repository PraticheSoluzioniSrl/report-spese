import { prisma } from './database.js'

export async function initializeDatabase() {
  try {
    // Controlla se il database è già inizializzato
    const userCount = await prisma.user.count()
    if (userCount > 0) {
      console.log('Database già inizializzato')
      return
    }

    console.log('Inizializzazione database...')

    // Crea le categorie principali
    const categories = [
      { name: 'Fisse', subs: ['Affitto/Mutuo', 'Bollette', 'Tasse', 'Abbonamenti'] },
      { name: 'Variabili', subs: ['Supermercato', 'Trasporti', 'Salute', 'Casa'] },
      { name: 'Occasionali', subs: ['Ristoranti', 'Shopping', 'Hobby', 'Regali'] }
    ]

    for (const cat of categories) {
      const created = await prisma.mainCategory.upsert({
        where: { name: cat.name },
        update: {},
        create: { name: cat.name }
      })

      for (const sub of cat.subs) {
        await prisma.subcategory.upsert({
          where: { name_mainCategoryId: { name: sub, mainCategoryId: created.id } },
          update: {},
          create: { name: sub, mainCategoryId: created.id }
        })
      }
    }

    // Crea l'utente admin di default
    const bcrypt = await import('bcryptjs')
    const defaultHash = await bcrypt.hash('C0S1M0', 10)
    await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: { username: 'admin', passwordHash: defaultHash }
    })

    console.log('Database inizializzato con successo')
  } catch (error) {
    console.error('Errore durante l\'inizializzazione del database:', error)
  }
}
