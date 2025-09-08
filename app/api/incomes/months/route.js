import { NextResponse } from 'next/server'
import { getIncomes } from '../../../../lib/supabase-db'

export async function GET () {
  try {
    // Genera i mesi da settembre 2025 a dicembre 2025
    const availableMonths = []
    
    // Aggiungi i mesi da settembre 2025 a dicembre 2025
    const months = [
      '2025-12', // Dicembre 2025
      '2025-11', // Novembre 2025
      '2025-10', // Ottobre 2025
      '2025-09'  // Settembre 2025
    ]
    
    availableMonths.push(...months)
    
    // Aggiungi il mese corrente se non è già presente
    const currentDate = new Date()
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    if (!availableMonths.includes(currentMonth)) {
      availableMonths.unshift(currentMonth) // Aggiungi all'inizio per renderlo il primo
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
    
    console.log('Mesi entrate generati (settembre-dicembre 2025):', availableMonths)
    
    return NextResponse.json(availableMonths)
  } catch (error) {
    console.error('Errore nel recupero dei mesi:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}




