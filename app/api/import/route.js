import { NextResponse } from 'next/server'
import { 
  getMainCategories, 
  createMainCategory, 
  getSubcategories, 
  createSubcategory, 
  createExpense, 
  createIncome 
} from '../../../lib/firebase-db'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'

export async function POST (req) {
  try {
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

      // Trova o crea la categoria principale
      let mainCategories = await getMainCategories()
      let main = mainCategories.find(cat => cat.name === mainName)
      if (!main) {
        await createMainCategory(mainName)
        mainCategories = await getMainCategories()
        main = mainCategories.find(cat => cat.name === mainName)
      }

      // Trova o crea la sottocategoria
      let subcategories = await getSubcategories(main.id)
      let sub = subcategories.find(sub => sub.name === subName)
      if (!sub) {
        await createSubcategory(subName, main.id)
        subcategories = await getSubcategories(main.id)
        sub = subcategories.find(sub => sub.name === subName)
      }

      const base = { 
        description, 
        amount, 
        date: new Date(dateStr), 
        mainCategoryId: main.id, 
        subcategoryId: sub.id 
      }
      
      if (type === 'income') {
        await createIncome(base)
      } else {
        await createExpense(base)
      }
      created++
    }

    return NextResponse.json({ ok: true, created })
  } catch (error) {
    console.error('Errore durante l\'importazione:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}




