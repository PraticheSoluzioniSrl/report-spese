import { NextResponse } from 'next/server'
import { getMainCategories, deleteMainCategory, getExpenses, getIncomes } from '../../../../lib/supabase-db'
import { getDemoCategories, deleteDemoCategory, getDemoExpenses } from '../../../../lib/demo-storage'

export async function DELETE (_req, { params }) {
  try {
    const name = decodeURIComponent(params.name)
    
    console.log('🗑️ Eliminazione categoria richiesta:', name)
    
    // Usa Supabase se configurato, altrimenti demo storage
    const mainCategories = await getMainCategories()
    const cat = mainCategories.find(category => category.name === name)
    
    if (!cat) {
      console.log('⚠️ Categoria non trovata:', name)
      return NextResponse.json({ ok: true })
    }
    
    console.log('📋 Categoria trovata:', { id: cat.id, name: cat.name })
    
    // Controlla se la categoria è usata in qualche spesa o entrata
    const expenses = await getExpenses()
    const incomes = await getIncomes()
    
    // Confronta gli ID come stringa per sicurezza
    const isUsedInExpenses = expenses.some(expense => String(expense.mainCategoryId) === String(cat.id))
    const isUsedInIncomes = incomes.some(income => String(income.mainCategoryId) === String(cat.id))
    
    if (isUsedInExpenses || isUsedInIncomes) {
      console.log('❌ Categoria usata da spese o entrate')
      return NextResponse.json({ error: 'Categoria usata da spese o entrate' }, { status: 400 })
    }
    
    console.log('✅ Categoria non usata, procedo con l\'eliminazione')
    await deleteMainCategory(cat.id)
    console.log('✅ Categoria eliminata con successo')
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('❌ Errore durante l\'eliminazione della categoria:', error)
    console.error('❌ Stack:', error.stack)
    return NextResponse.json({ 
      error: error.message || 'Errore interno del server' 
    }, { status: 500 })
  }
}

