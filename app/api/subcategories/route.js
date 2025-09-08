import { NextResponse } from 'next/server'
import { getMainCategories, getSubcategories, createSubcategory, deleteSubcategory, getExpenses } from '../../../lib/firebase-db'

export async function POST (req) {
  try {
    const fd = await req.formData()
    const mainName = String(fd.get('mainName') || '').trim()
    const subName = String(fd.get('subName') || '').trim()
    
    const mainCategories = await getMainCategories()
    const main = mainCategories.find(cat => cat.name === mainName)
    if (!main) return NextResponse.json({ error: 'main not found' }, { status: 404 })
    
    await createSubcategory(subName, main.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Errore durante la creazione della sottocategoria:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function DELETE (req) {
  try {
    const { searchParams } = new URL(req.url)
    const main = searchParams.get('main')
    const sub = searchParams.get('sub')
    
    const mainCategories = await getMainCategories()
    const mainCat = mainCategories.find(cat => cat.name === main)
    if (!mainCat) return NextResponse.json({ ok: true })
    
    const subcategories = await getSubcategories(mainCat.id)
    const sc = subcategories.find(subcat => subcat.name === sub)
    if (!sc) return NextResponse.json({ ok: true })
    
    // Controlla se la sottocategoria è usata in qualche spesa
    const expenses = await getExpenses()
    const isUsed = expenses.some(expense => expense.subcategoryId === sc.id)
    if (isUsed) return NextResponse.json({ error: 'Sottocategoria usata' }, { status: 400 })
    
    await deleteSubcategory(sc.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Errore durante l\'eliminazione della sottocategoria:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

