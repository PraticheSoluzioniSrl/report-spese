import { NextResponse } from 'next/server'
import { getIncomes, createIncome, getMainCategories, getSubcategories } from '../../../lib/firebase-db'

export async function GET (req) {
  try {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
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

    if (!description || !amount || !dateStr || !mainName || !subName) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }

    // Trova la categoria principale
    const mainCategories = await getMainCategories()
    const main = mainCategories.find(cat => cat.name === mainName)
    if (!main) return NextResponse.json({ error: 'main not found' }, { status: 404 })

    // Trova la sottocategoria
    const subcategories = await getSubcategories(main.id)
    const sub = subcategories.find(sub => sub.name === subName)
    if (!sub) return NextResponse.json({ error: 'sub not found' }, { status: 404 })

    const incomeData = {
      description,
      amount,
      date: new Date(dateStr),
      mainCategoryId: main.id,
      subcategoryId: sub.id
    }
    await createIncome(incomeData)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Errore durante la creazione dell\'incasso:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}



