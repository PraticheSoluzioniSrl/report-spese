import { NextResponse } from 'next/server'
import { getIncomes, createIncome, getMainCategories, getSubcategories } from '../../../lib/supabase-db'
import { getDemoIncomes, addDemoIncome, getDemoCategories, getDemoSubcategories } from '../../../lib/demo-storage'

export async function GET (req) {
  try {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    
    // Usa storage demo
    const items = getDemoIncomes(month)
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

    if (!description || !amount || !dateStr || !mainName || !subName) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }

    // Usa storage demo
    const mainCategories = getDemoCategories()
    const main = mainCategories.find(cat => cat.name === mainName)
    if (!main) return NextResponse.json({ error: 'main not found' }, { status: 404 })

    const subcategories = getDemoSubcategories(main.id)
    const sub = subcategories.find(sub => sub.name === subName)
    if (!sub) return NextResponse.json({ error: 'sub not found' }, { status: 404 })

    const incomeData = {
      description,
      amount,
      date: new Date(dateStr),
      mainCategoryId: main.id,
      subcategoryId: sub.id,
      mainCategoryName: mainName,
      subcategoryName: subName
    }
    addDemoIncome(incomeData)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Errore durante la creazione dell\'incasso:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}



