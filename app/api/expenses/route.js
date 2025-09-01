import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET (req) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const where = month ? {
    date: {
      gte: new Date(month + '-01T00:00:00.000Z'),
      lt: new Date(new Date(month + '-01T00:00:00.000Z').getFullYear(), new Date(month + '-01T00:00:00.000Z').getMonth() + 1, 1)
    }
  } : {}
  const items = await prisma.expense.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { mainCategory: true, subcategory: true }
  })
  return NextResponse.json(items)
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

    // Trova la categoria principale
    const main = await prisma.mainCategory.findUnique({ where: { name: mainName } })
    if (!main) {
      return NextResponse.json({ error: `Categoria principale "${mainName}" non trovata` }, { status: 404 })
    }

    // Trova la sottocategoria
    const sub = await prisma.subcategory.findFirst({ 
      where: { 
        name: subName, 
        mainCategoryId: main.id 
      } 
    })
    if (!sub) {
      return NextResponse.json({ error: `Sottocategoria "${subName}" non trovata per la categoria "${mainName}"` }, { status: 404 })
    }

    // Crea la spesa
    const expense = await prisma.expense.create({ 
      data: { 
        description, 
        amount, 
        date: inputDate, 
        mainCategoryId: main.id, 
        subcategoryId: sub.id 
      } 
    })

    return NextResponse.json({ 
      ok: true, 
      expense: {
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        date: expense.date
      }
    })
  } catch (error) {
    console.error('Errore durante la creazione della spesa:', error)
    return NextResponse.json({ 
      error: 'Errore interno del server durante la creazione della spesa' 
    }, { status: 500 })
  }
}

