import { PrismaClient } from '@prisma/client'

// Configurazione database per diversi ambienti
function getDatabaseUrl() {
  // In produzione su Vercel, usa un database in-memory
  if (process.env.VERCEL_ENV === 'production') {
    return 'file::memory:?cache=shared'
  }
  
  // In sviluppo, usa il file locale
  if (process.env.NODE_ENV === 'development') {
    return 'file:./dev.db'
  }
  
  // Fallback per altri ambienti
  return process.env.DATABASE_URL || 'file:./dev.db'
}

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
