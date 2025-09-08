const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main () {
  console.log('Inizializzazione database...')
  
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
  const defaultHash = await bcrypt.hash('C0S1M0', 10)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', passwordHash: defaultHash }
  })

  console.log('Database inizializzato con successo!')
}

main().finally(async () => {
  await prisma.$disconnect()
})

