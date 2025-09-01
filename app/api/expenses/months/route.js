import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET () {
  try {
    // Prova a ottenere i mesi dalle spese esistenti
    const exp = await prisma.$queryRawUnsafe(`
      SELECT to_char(date_trunc('month', "date"), 'YYYY-MM') as ym
      FROM "Expense"
      GROUP BY ym
      ORDER BY ym DESC
    `)
    const existingMonths = exp.map(r => r.ym)
    
    // Genera i mesi disponibili (incluso il mese corrente e i prossimi 2 mesi)
    const currentDate = new Date()
    const currentMonth = currentDate.getFullYear() * 100 + (currentDate.getMonth() + 1)
    
    const availableMonths = []
    
    // Aggiungi i mesi esistenti
    for (const month of existingMonths) {
      availableMonths.push(month)
    }
    
    // Aggiungi il mese corrente se non è già presente
    const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    if (!availableMonths.includes(currentMonthStr)) {
      availableMonths.push(currentMonthStr)
    }
    
    // Aggiungi i prossimi 2 mesi
    for (let i = 1; i <= 2; i++) {
      const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1)
      const nextMonthStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`
      if (!availableMonths.includes(nextMonthStr)) {
        availableMonths.push(nextMonthStr)
      }
    }
    
    // Ordina i mesi in ordine decrescente
    availableMonths.sort((a, b) => b.localeCompare(a))
    
    return NextResponse.json(availableMonths)
    
  } catch (error) {
    // Se c'è un errore (es. database non disponibile), genera mesi di default
    console.log('Errore database, genero mesi di default:', error.message)
    
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
    
    // Ordina i mesi in ordine decrescente
    availableMonths.sort((a, b) => b.localeCompare(a))
    
    return NextResponse.json(availableMonths)
  }
}

