import { NextResponse } from 'next/server'
import { addDemoSubcategory, getDemoCategories } from '../../../lib/demo-storage'

export async function POST (req) {
  try {
    const fd = await req.formData()
    const name = String(fd.get('name') || '').trim()
    const mainCategoryId = String(fd.get('mainCategoryId') || '').trim()
    
    if (!name || !mainCategoryId) {
      return NextResponse.json({ error: 'name and mainCategoryId required' }, { status: 400 })
    }
    
    // Usa storage demo
    const subcategory = addDemoSubcategory(name, mainCategoryId)
    if (!subcategory) {
      return NextResponse.json({ error: 'Categoria principale non trovata' }, { status: 404 })
    }
    
    return NextResponse.json({ ok: true, subcategory })
  } catch (error) {
    console.error('Errore nella creazione della sottocategoria:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}