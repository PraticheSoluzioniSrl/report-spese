// Utility per gestire il mese di default in modo centralizzato

/**
 * Determina il mese di default basato sulla data corrente
 * - Se siamo prima del 30 settembre, usa settembre dell'anno corrente
 * - Dal primo ottobre in poi, usa il mese corrente
 * - Se siamo nel 2026 o successivo, usa sempre il mese corrente
 */
export function getDefaultMonth() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1 // 1-12
  const currentYear = now.getFullYear()
  const currentDay = now.getDate()
  
  // Se siamo nel 2026 o successivo, usa sempre il mese corrente
  if (currentYear >= 2026) {
    return `${currentYear}-${String(currentMonth).padStart(2, '0')}`
  }
  
  // Se siamo prima del 30 settembre, usa settembre
  if (currentMonth < 10 || (currentMonth === 10 && currentDay < 1)) {
    return `${currentYear}-09`
  }
  
  // Altrimenti usa il mese corrente
  return `${currentYear}-${String(currentMonth).padStart(2, '0')}`
}

/**
 * Formatta una data nel formato gg/mm/aaaa per l'export
 */
export function formatDateForExport(date) {
  return new Date(date).toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}

/**
 * Formatta una data nel formato gg/mm/aaaa per l'import
 */
export function parseDateFromImport(dateString) {
  // Gestisce il formato gg/mm/aaaa
  const parts = dateString.split('/')
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0')
    const month = parts[1].padStart(2, '0')
    const year = parts[2]
    return new Date(`${year}-${month}-${day}`)
  }
  return new Date(dateString)
}
