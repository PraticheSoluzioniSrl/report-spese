import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'

export async function POST (req) {
  const fd = await req.formData()
  const file = fd.get('file')
  const type = String(fd.get('type') || 'expense') // 'expense' | 'income'
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'file required' }, { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' })

  // Expected headers: description, amount, date(YYYY-MM-DD), mainCategory, subcategory
  let created = 0
  for (const row of json) {
    const description = String(row.description || row.Descrizione || row.DESCRIZIONE || '').trim()
    const amount = parseFloat(String(row.amount || row.Importo || row.IMPORTO || '0').toString().replace(',', '.'))
    const dateStr = String(row.date || row.Data || row.DATA || '').slice(0, 10)
    const mainName = String(row.mainCategory || row.Categoria || row.CATEGORIA || '').trim()
    const subName = String(row.subcategory || row.Sottocategoria || row.SOTTOCATEGORIA || '').trim()
    if (!description || !amount || !dateStr || !mainName || !subName) continue
    const main = await prisma.mainCategory.upsert({ where: { name: mainName }, update: {}, create: { name: mainName } })
    let sub = await prisma.subcategory.findFirst({ where: { name: subName, mainCategoryId: main.id } })
    if (!sub) sub = await prisma.subcategory.create({ data: { name: subName, mainCategoryId: main.id } })
    const base = { description, amount, date: new Date(dateStr), mainCategoryId: main.id, subcategoryId: sub.id }
    if (type === 'income') {
      await prisma.income.create({ data: base })
    } else {
      await prisma.expense.create({ data: base })
    }
    created++
  }

  return NextResponse.json({ ok: true, created })
}




