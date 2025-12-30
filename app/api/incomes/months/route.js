import { NextResponse } from 'next/server'
import { getDemoIncomes } from '../../../../lib/demo-storage'

export async function GET () {
  try {
    // Sistema dinamico: genera mesi solo quando necessario
    
    // Ottieni tutte le entrate per estrarre i mesi utilizzati
    const allIncomes = getDemoIncomes()
    const usedMonths = new Set()
    
    // Estrai i mesi dalle entrate esistenti
    allIncomes.forEach(income => {
      const incomeMonth = `${income.date.getFullYear()}-${String(income.date.getMonth() + 1).padStart(2, '0')}`
      usedMonths.add(incomeMonth)
    })
    
    // Aggiungi sempre il mese corrente
    const currentDate = new Date()
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    usedMonths.add(currentMonth)
    
    // Aggiungi i mesi futuri fino a dicembre dell'anno corrente
    const currentYear = currentDate.getFullYear()
    const currentMonthIndex = currentDate.getMonth() // 0-11
    
    // Aggiungi tutti i mesi da quello corrente fino a dicembre dell'anno corrente
    for (let monthIndex = currentMonthIndex; monthIndex <= 11; monthIndex++) {
      const futureMonth = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}`
      usedMonths.add(futureMonth)
    }
    
    // Aggiungi tutti i mesi del 2026 (gennaio-dicembre)
    for (let monthIndex = 0; monthIndex <= 11; monthIndex++) {
      const month2026 = `2026-${String(monthIndex + 1).padStart(2, '0')}`
      usedMonths.add(month2026)
    }
    
    // Converti in array e ordina
    let availableMonths = Array.from(usedMonths).sort((a, b) => b.localeCompare(a))
    
    // Filtra i mesi che non hanno dati significativi (solo per demo)
    availableMonths = availableMonths.filter(month => {
      const monthIncomes = allIncomes.filter(income => {
        const incomeMonth = `${income.date.getFullYear()}-${String(income.date.getMonth() + 1).padStart(2, '0')}`
        return incomeMonth === month
      })
      // Mantieni il mese se ha almeno un'entrata, se è il mese corrente, o se è un mese futuro
      const monthYear = parseInt(month.split('-')[0])
      const monthIndex = parseInt(month.split('-')[1]) - 1
      const isFutureMonth = monthYear > currentYear || (monthYear === currentYear && monthIndex >= currentMonthIndex)
      const is2026 = monthYear === 2026
      return monthIncomes.length > 0 || month === currentMonth || isFutureMonth || is2026
    })
    
    console.log('Mesi entrate generati dinamicamente:', availableMonths)
    
    return NextResponse.json(availableMonths)
  } catch (error) {
    console.error('Errore nel recupero dei mesi:', error)
    // Fallback: restituisci mese corrente
    const currentDate = new Date()
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    return NextResponse.json([currentMonth])
  }
}




