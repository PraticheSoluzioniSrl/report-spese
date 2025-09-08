import { NextResponse } from 'next/server'

export async function GET () {
  // Genera i mesi da settembre 2025 a dicembre 2025
  const availableMonths = []
  
  // Aggiungi i mesi da settembre 2025 a dicembre 2025
  const months = [
    '2025-09', // Settembre 2025 (primo)
    '2025-10', // Ottobre 2025
    '2025-11', // Novembre 2025
    '2025-12'  // Dicembre 2025 (ultimo)
  ]
  
  availableMonths.push(...months)
  
  console.log('Mesi generati (settembre-dicembre 2025):', availableMonths)
  
  return NextResponse.json(availableMonths)
}

