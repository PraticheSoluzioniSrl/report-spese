import { NextResponse } from 'next/server'

export async function GET () {
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
  
  console.log('Mesi generati (settembre-dicembre 2025 + corrente):', availableMonths)
  
  return NextResponse.json(availableMonths)
}

