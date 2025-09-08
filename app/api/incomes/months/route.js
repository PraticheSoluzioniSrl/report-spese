import { NextResponse } from 'next/server'
import { getIncomes } from '../../../../lib/firebase-db'

export async function GET () {
  try {
    // Genera sempre i mesi disponibili
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
    
    // Aggiungi i mesi con entrate esistenti
    try {
      const incomes = await getIncomes()
      const existingMonths = new Set()
      
      incomes.forEach(income => {
        if (income.date) {
          const date = income.date.toDate ? income.date.toDate() : new Date(income.date)
          const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          existingMonths.add(monthStr)
        }
      })
      
      existingMonths.forEach(month => {
        if (!availableMonths.includes(month)) {
          availableMonths.push(month)
        }
      })
    } catch (error) {
      console.log('Errore nel recupero dei mesi esistenti:', error)
    }
    
    // Ordina i mesi in ordine decrescente
    availableMonths.sort((a, b) => b.localeCompare(a))
    
    console.log('Mesi entrate generati:', availableMonths)
    
    return NextResponse.json(availableMonths)
  } catch (error) {
    console.error('Errore nel recupero dei mesi:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}




