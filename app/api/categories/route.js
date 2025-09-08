import { NextResponse } from 'next/server'
import { getMainCategories, createMainCategory, getSubcategories } from '../../../lib/supabase-db'

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
    // Se Firebase non è configurato, restituisci categorie demo
    if (error.message && error.message.includes('Firebase non configurato')) {
      return NextResponse.json([
        {
          id: 'demo-1',
          name: 'Alimentari',
          subcategories: ['Supermercato', 'Ristorante']
        },
        {
          id: 'demo-2', 
          name: 'Trasporti',
          subcategories: ['Benzina', 'Autobus']
        }
      ])
    }
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

