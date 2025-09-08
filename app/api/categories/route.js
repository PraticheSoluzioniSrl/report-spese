import { NextResponse } from 'next/server'
import { getMainCategories, createMainCategory, getSubcategories } from '../../../lib/firebase-db'

export async function GET () {
  try {
    const categories = await getMainCategories()
    const result = []
    
    for (const cat of categories) {
      const subcategories = await getSubcategories(cat.id)
      result.push({
        id: cat.id,
        name: cat.name,
        subcategories: subcategories.map(s => s.name)
      })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Errore nel recupero delle categorie:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function POST (req) {
  try {
    const fd = await req.formData()
    const name = String(fd.get('name') || '').trim()
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
    
    await createMainCategory(name)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Errore nella creazione della categoria:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

