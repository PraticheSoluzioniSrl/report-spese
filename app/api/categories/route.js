import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET () {
  const cats = await prisma.mainCategory.findMany({
    orderBy: { name: 'asc' },
    include: { subcategories: { orderBy: { name: 'asc' } } }
  })
  return NextResponse.json(cats.map(c => ({ id: c.id, name: c.name, subcategories: c.subcategories.map(s => s.name) })))
}

export async function POST (req) {
  const fd = await req.formData()
  const name = String(fd.get('name') || '').trim()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  await prisma.mainCategory.create({ data: { name } })
  return NextResponse.json({ ok: true })
}

