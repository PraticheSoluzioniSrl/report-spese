import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function DELETE (_req, { params }) {
  const id = Number(params.id)
  if (!id) return NextResponse.json({ ok: true })
  await prisma.income.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}




