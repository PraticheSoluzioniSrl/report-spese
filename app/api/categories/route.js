import { NextResponse } from 'next/server'
import { getMainCategories, createMainCategory, getSubcategories } from '../../../lib/supabase-db'
import { getDemoCategories, addDemoCategory } from '../../../lib/demo-storage'

export async function GET (req) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'expenses' | 'incomes'
    
    // Usa Supabase se configurato, altrimenti demo storage
    const categories = await getMainCategories()
    const result = []

    for (const cat of categories) {
      // Filtra le categorie in base al tipo richiesto
      if (!type || cat.type === type) {
        const subcategories = await getSubcategories(cat.id)
        result.push({
          id: cat.id,
          name: cat.name,
          subcategories: subcategories.map(s => s.name)
        })
      }
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
    const type = String(fd.get('type') || '').trim() // 'expenses' o 'incomes'
    if (!name) return NextResponse.json({ error: 'Il nome della categoria è obbligatorio' }, { status: 400 })
    
    // Usa Supabase se configurato, altrimenti demo storage
    const category = await createMainCategory({ name, type: type || 'expenses' })
    if (!category) {
      console.error('createMainCategory ha restituito null/undefined')
      return NextResponse.json({ error: 'Errore nella creazione della categoria' }, { status: 500 })
    }
    console.log('Categoria creata con successo:', category)
    return NextResponse.json({ ok: true, category })
  } catch (error) {
    console.error('Errore nella creazione della categoria:', error)
    console.error('Stack trace:', error.stack)
    return NextResponse.json({ error: error.message || 'Errore interno del server' }, { status: 500 })
  }
}

