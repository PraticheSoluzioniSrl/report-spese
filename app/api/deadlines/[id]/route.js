import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function PATCH (req, { params }) {
  const id = Number(params.id)
  const body = await req.json()
  await prisma.deadline.update({ where: { id }, data: { paid: Boolean(body.paid) } })
  return NextResponse.json({ ok: true })
}

export async function DELETE (_req, { params }) {
  const id = Number(params.id)
  await prisma.deadline.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

