import { NextResponse } from 'next/server'
import { 
  getMainCategories, 
  createMainCategory, 
  getSubcategories, 
  createSubcategory, 
  createExpense, 
  createIncome 
} from '../../../lib/supabase-db'
import { 
  getDemoCategories, 
  addDemoCategory, 
  getDemoSubcategories, 
  addDemoSubcategory, 
  addDemoExpense, 
  addDemoIncome 
} from '../../../lib/demo-storage'
import { parseDateFromImport } from '../../../lib/month-utils'
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
        // Gestisci i nomi delle colonne con spazi extra - cerca in tutte le possibili varianti
        const description = String(
          row.description || 
          row[' description'] || 
          row.Descrizione || 
          row.DESCRIZIONE || 
          row['Descrizione'] ||
          row['DESCRIZIONE'] ||
          ''
        ).trim()
        
        const amount = parseFloat(String(
          row.amount || 
          row[' amount'] || 
          row.Importo || 
          row.IMPORTO || 
          row['Importo'] ||
          row['IMPORTO'] ||
          '0'
        ).toString().replace(',', '.'))
        
        // Gestisci la data - potrebbe essere un numero Excel o una stringa
        let dateStr = String(
          row.date || 
          row[' date'] || 
          row.Data || 
          row.DATA || 
          row['Data'] ||
          row['DATA'] ||
          ''
        )
        
        let parsedDate = null
        
        if (dateStr && !isNaN(parseInt(dateStr))) {
          // Se è un numero Excel, convertilo in data
          const excelDate = parseInt(dateStr)
          // Excel conta i giorni dal 1 gennaio 1900, ma ha un bug per l'anno 1900
          // La formula corretta è: (excelDate - 25569) * 86400 * 1000
          parsedDate = new Date((excelDate - 25569) * 86400 * 1000)
          console.log('📅 Data Excel convertita:', excelDate, '->', parsedDate.toISOString().slice(0, 10))
        } else if (dateStr) {
          // Se è una stringa, prova a parsarla con la funzione utility
          try {
            parsedDate = parseDateFromImport(dateStr)
            console.log('📅 Data stringa parsata:', dateStr, '->', parsedDate.toISOString().slice(0, 10))
          } catch (error) {
            console.log('📅 Errore nel parsing della data:', dateStr, error.message)
            parsedDate = null
          }
        }
        
        // Se la data è ancora invalida, usa la data corrente
        if (!parsedDate || isNaN(parsedDate.getTime())) {
          parsedDate = new Date()
          console.log('📅 Data fallback usata:', parsedDate.toISOString().slice(0, 10))
        }
        
        dateStr = parsedDate.toISOString().slice(0, 10)
        
        const mainName = String(
          row.mainCategory || 
          row[' mainCategory'] || 
          row.Categoria || 
          row.CATEGORIA || 
          row['Categoria'] ||
          row['CATEGORIA'] ||
          ''
        ).trim()
        
        let subName = String(
          row.subcategory || 
          row[' subcategory'] || 
          row.Sottocategoria || 
          row.SOTTOCATEGORIA || 
          row['Sottocategoria'] ||
          row['SOTTOCATEGORIA'] ||
          ''
        ).trim()
        
        const paymentMethod = String(
          row.paymentMethod || 
          row[' paymentMethod'] || 
          row['Metodo Pagamento'] || 
          row['METODO PAGAMENTO'] || 
          row['metodo_pagamento'] ||
          row['METODO_PAGAMENTO'] ||
          'contanti'
        ).trim()
        
        // Correggi errori di battitura comuni
        if (subName === 'Spuoermercato') {
          subName = 'Supermercato'
          console.log('🔧 Corretto errore di battitura: Spuoermercato -> Supermercato')
        }
        
        if (!description || !amount || amount <= 0 || !dateStr || !mainName || !subName) {
          errors.push(`Riga ${index + 1}: Campi mancanti o invalidi (descrizione: "${description}", importo: ${amount}, data: "${dateStr}", categoria: "${mainName}", sottocategoria: "${subName}")`)
          continue
        }

        // Usa Supabase se configurato, altrimenti demo storage
        let mainCategories = await getMainCategories()
        let main = mainCategories.find(cat => cat.name === mainName)
        if (!main) {
          console.log('📝 Creo categoria:', mainName)
          main = await createMainCategory({ name: mainName, type: type })
          mainCategories = await getMainCategories()
        }

        let subcategories = await getSubcategories(main.id)
        let sub = subcategories.find(sub => sub.name === subName)
        if (!sub) {
          console.log('📝 Creo sottocategoria:', subName, 'per categoria:', mainName)
          sub = await createSubcategory({ name: subName, mainCategoryId: main.id })
        }

        const base = { 
          description, 
          amount, 
          date: new Date(dateStr), 
          mainCategoryId: main.id, 
          subcategoryId: sub.id,
          mainCategoryName: mainName,
          subcategoryName: subName,
          paymentMethod
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




