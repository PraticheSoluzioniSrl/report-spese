import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET () {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT to_char(date_trunc('month', "date"), 'YYYY-MM') as ym
    FROM "Income"
    GROUP BY ym
    ORDER BY ym DESC
  `)
  const months = rows.map(r => r.ym)
  return NextResponse.json(months)
}




