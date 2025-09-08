import { NextResponse } from 'next/server'
import { getMainCategories, deleteMainCategory, getExpenses } from '../../../../lib/supabase-db'

export async function DELETE (_req, { params }) {
  try {
    const name = decodeURIComponent(params.name)
    
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
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

