import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { initializeDatabase } from '../../../lib/init-db'

export async function GET () {
  await initializeDatabase()
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
  await prisma.mainCategory.upsert({
    where: { name },
    update: {},
    create: { name }
  })
  return NextResponse.json({ ok: true })
}

