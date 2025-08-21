import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function DELETE (_req, { params }) {
  const name = decodeURIComponent(params.name)
  const cat = await prisma.mainCategory.findUnique({ where: { name }, include: { expenses: true } })
  if (!cat) return NextResponse.json({ ok: true })
  if (cat.expenses.length > 0) return NextResponse.json({ error: 'Categoria usata da spese' }, { status: 400 })
  await prisma.mainCategory.delete({ where: { id: cat.id } })
  return NextResponse.json({ ok: true })
}

