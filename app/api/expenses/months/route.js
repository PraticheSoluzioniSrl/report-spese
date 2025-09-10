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
    
    // Aggiungi i mesi futuri fino a dicembre 2025
    const currentYear = currentDate.getFullYear()
    const currentMonthIndex = currentDate.getMonth() // 0-11
    
    // Aggiungi tutti i mesi da quello corrente fino a dicembre 2025
    for (let monthIndex = currentMonthIndex; monthIndex <= 11; monthIndex++) {
      const futureMonth = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}`
      usedMonths.add(futureMonth)
    }
    
    // Converti in array e ordina
    let availableMonths = Array.from(usedMonths).sort((a, b) => b.localeCompare(a))
    
    // Filtra i mesi che non hanno dati significativi (solo per demo)
    availableMonths = availableMonths.filter(month => {
      const monthExpenses = allExpenses.filter(expense => {
        const expenseMonth = `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, '0')}`
        return expenseMonth === month
      })
      // Mantieni il mese se ha almeno una spesa, se è il mese corrente, o se è un mese futuro
      const monthYear = parseInt(month.split('-')[0])
      const monthIndex = parseInt(month.split('-')[1]) - 1
      const isFutureMonth = monthYear > currentYear || (monthYear === currentYear && monthIndex >= currentMonthIndex)
      return monthExpenses.length > 0 || month === currentMonth || isFutureMonth
    })
    
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

