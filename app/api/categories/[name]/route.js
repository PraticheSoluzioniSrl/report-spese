import { NextResponse } from 'next/server'
import { getMainCategories, deleteMainCategory, getExpenses } from '../../../../lib/supabase-db'
import { getDemoCategories, deleteDemoCategory, getDemoExpenses } from '../../../../lib/demo-storage'

export async function DELETE (_req, { params }) {
  try {
    const name = decodeURIComponent(params.name)
    
    // Usa Supabase se configurato, altrimenti demo storage
    const mainCategories = await getMainCategories()
    const cat = mainCategories.find(category => category.name === name)
    if (!cat) return NextResponse.json({ ok: true })
    
    // Controlla se la categoria è usata in qualche spesa
    const expenses = await getExpenses()
    const isUsed = expenses.some(expense => expense.mainCategoryId === cat.id)
    if (isUsed) return NextResponse.json({ error: 'Categoria usata da spese' }, { status: 400 })
    
    await deleteMainCategory(cat.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Errore durante l\'eliminazione della categoria:', error)
    // Fallback a demo storage
    try {
      const demoCategories = getDemoCategories()
      const cat = demoCategories.find(category => category.name === name)
      if (!cat) return NextResponse.json({ ok: true })
      
      const demoExpenses = getDemoExpenses()
      const isUsed = demoExpenses.some(expense => expense.mainCategoryId === cat.id)
      if (isUsed) return NextResponse.json({ error: 'Categoria usata da spese' }, { status: 400 })
      
      deleteDemoCategory(cat.id)
      return NextResponse.json({ ok: true })
    } catch (demoError) {
      console.error('Errore anche nel fallback demo:', demoError)
      return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
    }
  }
}

