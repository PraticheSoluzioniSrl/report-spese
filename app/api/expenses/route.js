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
  const fd = await req.formData()
  const description = String(fd.get('description') || '')
  const amount = parseFloat(String(fd.get('amount') || '0'))
  const dateStr = String(fd.get('date') || '')
  const mainName = String(fd.get('mainCategoryId') || '')
  const subName = String(fd.get('subcategoryName') || '')

  if (!description || !amount || !dateStr || !mainName || !subName) return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  const main = await prisma.mainCategory.findUnique({ where: { name: mainName } })
  if (!main) return NextResponse.json({ error: 'main not found' }, { status: 404 })
  const sub = await prisma.subcategory.findFirst({ where: { name: subName, mainCategoryId: main.id } })
  if (!sub) return NextResponse.json({ error: 'sub not found' }, { status: 404 })

  await prisma.expense.create({ data: { description, amount, date: new Date(dateStr), mainCategoryId: main.id, subcategoryId: sub.id } })
  return NextResponse.json({ ok: true })
}

