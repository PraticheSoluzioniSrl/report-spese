import { NextResponse } from 'next/server'
import { getIncomes } from '../../../../lib/supabase-db'
import { getDemoIncomes } from '../../../../lib/demo-storage'
import { formatDateForExport } from '../../../../lib/month-utils'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    const format = searchParams.get('format') || 'csv'
    
    // Recupera le entrate
    let incomes
    try {
      incomes = await getIncomes(month)
    } catch (error) {
      // Fallback al demo storage se Supabase non è configurato
      incomes = getDemoIncomes(month)
    }
    
    if (format === 'csv') {
      // Prepara i dati per CSV
      const csvHeaders = 'ID,Descrizione,Importo,Data,Categoria Principale,Sottocategoria,Data Creazione\n'
      const csvRows = incomes.map(income => {
        const date = formatDateForExport(income.date)
        const createdAt = income.created_at ? formatDateForExport(income.created_at) : 'N/A'
        return [
          income.id,
          `"${income.description.replace(/"/g, '""')}"`, // Escape quotes
          income.amount.toFixed(2).replace('.', ','), // Formato italiano
          date,
          `"${income.main_category_name || income.mainCategory?.name || 'N/A'}"`,
          `"${income.subcategory_name || income.subcategory?.name || 'N/A'}"`,
          createdAt
        ].join(',')
      }).join('\n')
      
      const csvContent = csvHeaders + csvRows
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="entrate_${month || 'tutte'}_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }
    
    // Se non è CSV, restituisci JSON
    return NextResponse.json(incomes)
    
  } catch (error) {
    console.error('Errore durante l\'esportazione delle entrate:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
