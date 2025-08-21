import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST (req) {
  const fd = await req.formData()
  const mainName = String(fd.get('mainName') || '')
  const subName = String(fd.get('subName') || '')
  const main = await prisma.mainCategory.findUnique({ where: { name: mainName } })
  if (!main) return NextResponse.json({ error: 'main not found' }, { status: 404 })
  await prisma.subcategory.create({ data: { name: subName, mainCategoryId: main.id } })
  return NextResponse.json({ ok: true })
}

export async function DELETE (req) {
  const { searchParams } = new URL(req.url)
  const main = searchParams.get('main')
  const sub = searchParams.get('sub')
  const mainCat = await prisma.mainCategory.findUnique({ where: { name: main } })
  if (!mainCat) return NextResponse.json({ ok: true })
  const sc = await prisma.subcategory.findFirst({ where: { name: sub, mainCategoryId: mainCat.id }, include: { expenses: true } })
  if (!sc) return NextResponse.json({ ok: true })
  if (sc.expenses.length > 0) return NextResponse.json({ error: 'Sottocategoria usata' }, { status: 400 })
  await prisma.subcategory.delete({ where: { id: sc.id } })
  return NextResponse.json({ ok: true })
}

