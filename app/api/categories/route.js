import { NextResponse } from 'next/server'
import { getMainCategories, createMainCategory, getSubcategories } from '../../../lib/supabase-db'

export async function GET (req) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'expenses' | 'incomes'
    
    const categories = await getMainCategories()
    const result = []

    // Categorie per le uscite (spese)
    const expenseCategories = ['Alimentari', 'Trasporti', 'Casa', 'Salute', 'Svago', 'Altro']
    
    // Categorie per le entrate
    const incomeCategories = ['Stipendio', 'Freelance', 'Investimenti', 'Vendite', 'Rimborsi', 'Altri Ricavi']

    for (const cat of categories) {
      const subcategories = await getSubcategories(cat.id)
      
      // Filtra le categorie in base al tipo richiesto
      if (type === 'expenses' && expenseCategories.includes(cat.name)) {
        result.push({
          id: cat.id,
          name: cat.name,
          subcategories: subcategories.map(s => s.name)
        })
      } else if (type === 'incomes' && incomeCategories.includes(cat.name)) {
        result.push({
          id: cat.id,
          name: cat.name,
          subcategories: subcategories.map(s => s.name)
        })
      } else if (!type) {
        // Se non viene specificato il tipo, restituisci tutte le categorie
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
    // Se Supabase non è configurato, restituisci categorie demo
    if (error.message && error.message.includes('Supabase non configurato')) {
      const { searchParams } = new URL(req.url)
      const type = searchParams.get('type')
      
      if (type === 'expenses') {
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
      } else if (type === 'incomes') {
        return NextResponse.json([
          {
            id: 'demo-3',
            name: 'Stipendio',
            subcategories: ['Stipendio fisso', 'Bonus']
          },
          {
            id: 'demo-4',
            name: 'Freelance',
            subcategories: ['Progetti web', 'Consulenze']
          }
        ])
      }
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

