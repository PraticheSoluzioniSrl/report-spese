import { NextResponse } from 'next/server'
import { getExpenses } from '../../../../lib/supabase-db'
import { getDemoExpenses } from '../../../../lib/demo-storage'
import { formatDateForExport } from '../../../../lib/month-utils'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    const format = searchParams.get('format') || 'csv'
    
    // Recupera le spese
    let expenses
    try {
      expenses = await getExpenses(month)
    } catch (error) {
      // Fallback al demo storage se Supabase non è configurato
      expenses = getDemoExpenses(month)
    }
    
    if (format === 'csv') {
      // Prepara i dati per CSV
      const csvHeaders = 'ID,Descrizione,Importo,Data,Categoria Principale,Sottocategoria,Metodo Pagamento,Data Creazione\n'
      const csvRows = expenses.map(expense => {
        const date = formatDateForExport(expense.date)
        const createdAt = expense.created_at ? formatDateForExport(expense.created_at) : 'N/A'
        return [
          expense.id,
          `"${expense.description.replace(/"/g, '""')}"`, // Escape quotes
          expense.amount.toFixed(2).replace('.', ','), // Formato italiano
          date,
          `"${expense.main_category_name || expense.mainCategory?.name || 'N/A'}"`,
          `"${expense.subcategory_name || expense.subcategory?.name || 'N/A'}"`,
          `"${expense.payment_method || expense.paymentMethod || 'contanti'}"`,
          createdAt
        ].join(',')
      }).join('\n')
      
      const csvContent = csvHeaders + csvRows
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="spese_${month || 'tutte'}_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }
    
    // Se non è CSV, restituisci JSON
    return NextResponse.json(expenses)
    
  } catch (error) {
    console.error('Errore durante l\'esportazione delle spese:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
