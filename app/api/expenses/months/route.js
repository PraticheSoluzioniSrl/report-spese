import { NextResponse } from 'next/server'
import { getDemoExpenses } from '../../../../lib/demo-storage'

export async function GET () {
  try {
    // Sistema dinamico: genera mesi solo quando necessario
    
    // Ottieni tutte le spese per estrarre i mesi utilizzati
    const allExpenses = getDemoExpenses()
    const usedMonths = new Set()
    
    // Estrai i mesi dalle spese esistenti
    allExpenses.forEach(expense => {
      const expenseMonth = `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, '0')}`
      usedMonths.add(expenseMonth)
    })
    
    // Aggiungi sempre il mese corrente
    const currentDate = new Date()
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    usedMonths.add(currentMonth)
    
    // Aggiungi i prossimi 2 mesi per facilità d'uso
    for (let i = 1; i <= 2; i++) {
      const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1)
      const futureMonth = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`
      usedMonths.add(futureMonth)
    }
    
    // Converti in array e ordina
    const availableMonths = Array.from(usedMonths).sort((a, b) => b.localeCompare(a))
    
    console.log('Mesi spese generati dinamicamente:', availableMonths)
    
    return NextResponse.json(availableMonths)
  } catch (error) {
    console.error('Errore nel recupero dei mesi:', error)
    // Fallback: restituisci mese corrente
    const currentDate = new Date()
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    return NextResponse.json([currentMonth])
  }
}

