import { NextResponse } from 'next/server'
import { createSubcategory, getMainCategories, deleteSubcategory } from '../../../lib/supabase-db'
import { addDemoSubcategory, getDemoCategories, deleteDemoSubcategory } from '../../../lib/demo-storage'

export async function POST (req) {
  try {
    const fd = await req.formData()
    const name = String(fd.get('name') || '').trim()
    const mainCategoryId = String(fd.get('mainCategoryId') || '').trim()
    
    if (!name || !mainCategoryId) {
      return NextResponse.json({ error: 'name and mainCategoryId required' }, { status: 400 })
    }
    
    // Usa Supabase se configurato, altrimenti demo storage
    const subcategory = await createSubcategory({ name, mainCategoryId: parseInt(mainCategoryId) })
    if (!subcategory) {
      return NextResponse.json({ error: 'Categoria principale non trovata' }, { status: 404 })
    }
    
    return NextResponse.json({ ok: true, subcategory })
  } catch (error) {
    console.error('Errore nella creazione della sottocategoria:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function DELETE (req) {
  try {
    const url = new URL(req.url)
    const main = url.searchParams.get('main')
    const sub = url.searchParams.get('sub')
    
    if (!main || !sub) {
      return NextResponse.json({ error: 'main and sub parameters required' }, { status: 400 })
    }
    
    // Usa Supabase se configurato, altrimenti demo storage
    await deleteSubcategory({ mainCategoryName: main, subcategoryName: sub })
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Errore nella cancellazione della sottocategoria:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}