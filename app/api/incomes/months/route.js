import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET () {
  // Genera sempre i mesi disponibili senza dipendere dal database
  const currentDate = new Date()
  const availableMonths = []
  
  // Aggiungi il mese corrente
  const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  availableMonths.push(currentMonthStr)
  
  // Aggiungi i prossimi 2 mesi
  for (let i = 1; i <= 2; i++) {
    const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1)
    const nextMonthStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`
    availableMonths.push(nextMonthStr)
  }
  
  // Aggiungi anche settembre 2024 specificamente se non è già presente
  const september2024 = '2024-09'
  if (!availableMonths.includes(september2024)) {
    availableMonths.push(september2024)
  }
  
  // Aggiungi i mesi con entrate esistenti solo se non siamo in fase di build
  if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV !== 'production') {
    try {
      const rows = await prisma.$queryRawUnsafe(`
        SELECT strftime('%Y-%m', "date") as ym
        FROM "Income"
        GROUP BY ym
        ORDER BY ym DESC
      `)
      const existingMonths = rows.map(r => r.ym).filter(month => month !== null && month !== undefined)
      existingMonths.forEach(month => {
        if (!availableMonths.includes(month)) {
          availableMonths.push(month)
        }
      })
    } catch (error) {
      console.log('Errore nel recupero dei mesi esistenti:', error)
    }
  }
  
  // Ordina i mesi in ordine decrescente
  availableMonths.sort((a, b) => b.localeCompare(a))
  
  console.log('Mesi entrate generati:', availableMonths)
  
  return NextResponse.json(availableMonths)
}




