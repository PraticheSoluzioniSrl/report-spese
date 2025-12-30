// Utility per gestire il mese di default in modo centralizzato

/**
 * Determina il mese di default basato sulla data corrente
 * Usa sempre il mese corrente in base al giorno di accesso
 */
export function getDefaultMonth() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1 // 1-12
  const currentYear = now.getFullYear()
  
  // Usa sempre il mese corrente in base alla data di accesso
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
