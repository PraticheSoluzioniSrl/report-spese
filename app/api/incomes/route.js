import { NextResponse } from 'next/server'
import { getIncomes, createIncome, getMainCategories, getSubcategories } from '../../../lib/supabase-db'
import { getDemoIncomes, addDemoIncome, getDemoCategories, getDemoSubcategories } from '../../../lib/demo-storage'

export async function GET (req) {
  try {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    
    // Usa Supabase se configurato, altrimenti demo storage
    const items = await getIncomes(month)
    return NextResponse.json(items)
  } catch (error) {
    console.error('Errore nel recupero degli incassi:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function POST (req) {
  try {
    const fd = await req.formData()
    const description = String(fd.get('description') || '').trim()
    const amount = parseFloat(String(fd.get('amount') || '0'))
    const dateStr = String(fd.get('date') || '')
    const mainName = String(fd.get('mainCategoryId') || '').trim()
    const subName = String(fd.get('subcategoryName') || '').trim()

    // Validazione dei campi
    if (!description) {
      return NextResponse.json({ error: 'La descrizione è obbligatoria' }, { status: 400 })
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'L\'importo deve essere maggiore di zero' }, { status: 400 })
    }
    if (!dateStr) {
      return NextResponse.json({ error: 'La data è obbligatoria' }, { status: 400 })
    }
    if (!mainName) {
      return NextResponse.json({ error: 'La categoria principale è obbligatoria' }, { status: 400 })
    }
    if (!subName) {
      return NextResponse.json({ error: 'La sottocategoria è obbligatoria' }, { status: 400 })
    }

    // Validazione della data
    const inputDate = new Date(dateStr)
    if (isNaN(inputDate.getTime())) {
      return NextResponse.json({ error: 'Data non valida' }, { status: 400 })
    }

    // Usa Supabase se configurato, altrimenti demo storage
    const mainCategories = await getMainCategories()
    const main = mainCategories.find(cat => cat.name === mainName)
    if (!main) {
      return NextResponse.json({ error: `Categoria principale "${mainName}" non trovata` }, { status: 404 })
    }

    const subcategories = await getSubcategories(main.id)
    const sub = subcategories.find(sub => sub.name === subName)
    if (!sub) {
      return NextResponse.json({ error: `Sottocategoria "${subName}" non trovata per la categoria "${mainName}"` }, { status: 404 })
    }

    // Crea l'entrata
    const incomeData = {
      description,
      amount,
      date: new Date(dateStr),
      mainCategoryId: main.id,
      subcategoryId: sub.id,
      mainCategoryName: mainName,
      subcategoryName: subName
    }
    
    await createIncome(incomeData)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Errore durante la creazione dell\'incasso:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}



