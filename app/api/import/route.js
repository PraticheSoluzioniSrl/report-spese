import { NextResponse } from 'next/server'
import { 
  getMainCategories, 
  createMainCategory, 
  getSubcategories, 
  createSubcategory, 
  createExpense, 
  createIncome 
} from '../../../lib/supabase-db'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'

export async function POST (req) {
  try {
    const fd = await req.formData()
    const file = fd.get('file')
    const type = String(fd.get('type') || 'expense') // 'expense' | 'income'
    
    console.log('📊 Import CSV - Inizio')
    console.log('📊 File ricevuto:', file?.name, 'Tipo:', type)
    
    if (!file || typeof file === 'string') {
      console.log('❌ File mancante o non valido')
      return NextResponse.json({ error: 'file required' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    console.log('📊 ArrayBuffer size:', arrayBuffer.byteLength)
    
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' })

    console.log('📊 Import CSV - Tipo:', type, 'Righe:', json.length)
    console.log('📊 Prime righe:', json.slice(0, 3))

    // Expected headers: description, amount, date(YYYY-MM-DD), mainCategory, subcategory
    let created = 0
    let errors = []
    
    for (const [index, row] of json.entries()) {
      try {
        const description = String(row.description || row.Descrizione || row.DESCRIZIONE || '').trim()
        const amount = parseFloat(String(row.amount || row.Importo || row.IMPORTO || '0').toString().replace(',', '.'))
        const dateStr = String(row.date || row.Data || row.DATA || '').slice(0, 10)
        const mainName = String(row.mainCategory || row.Categoria || row.CATEGORIA || '').trim()
        const subName = String(row.subcategory || row.Sottocategoria || row.SOTTOCATEGORIA || '').trim()
        
        if (!description || !amount || !dateStr || !mainName || !subName) {
          errors.push(`Riga ${index + 1}: Campi mancanti`)
          continue
        }

        // Trova o crea la categoria principale
        let mainCategories = await getMainCategories()
        let main = mainCategories.find(cat => cat.name === mainName)
        if (!main) {
          console.log('📝 Creo categoria:', mainName)
          await createMainCategory(mainName)
          mainCategories = await getMainCategories()
          main = mainCategories.find(cat => cat.name === mainName)
        }

        // Trova o crea la sottocategoria
        let subcategories = await getSubcategories(main.id)
        let sub = subcategories.find(sub => sub.name === subName)
        if (!sub) {
          console.log('📝 Creo sottocategoria:', subName, 'per categoria:', mainName)
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
        console.log('✅ Importato:', description, amount, '€')
      } catch (rowError) {
        console.error(`❌ Errore riga ${index + 1}:`, rowError)
        errors.push(`Riga ${index + 1}: ${rowError.message}`)
      }
    }

    console.log('📊 Import completato:', created, 'record creati,', errors.length, 'errori')
    
    return NextResponse.json({ 
      ok: true, 
      created, 
      errors: errors.length > 0 ? errors : undefined 
    })
  } catch (error) {
    console.error('❌ Errore durante l\'importazione:', error)
    return NextResponse.json({ 
      error: 'Errore interno del server durante l\'importazione',
      details: error.message 
    }, { status: 500 })
  }
}




