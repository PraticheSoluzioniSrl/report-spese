import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET () {
  const list = await prisma.deadline.findMany({ orderBy: { dueDate: 'asc' } })
  return NextResponse.json(list)
}

export async function POST (req) {
  const fd = await req.formData()
  const description = String(fd.get('description') || '')
  const amount = parseFloat(String(fd.get('amount') || '0'))
  const dueDate = String(fd.get('dueDate') || '')
  if (!description || !amount || !dueDate) return NextResponse.json({ error: 'missing' }, { status: 400 })
  await prisma.deadline.create({ data: { description, amount, dueDate: new Date(dueDate) } })
  return NextResponse.json({ ok: true })
}

