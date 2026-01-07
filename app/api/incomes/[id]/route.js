import { NextResponse } from 'next/server'
import { deleteIncome, updateIncome } from '../../../../lib/supabase-db'

export async function DELETE (_req, { params }) {
  try {
    const id = String(params.id)
    if (!id) return NextResponse.json({ ok: true })
    await deleteIncome(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Errore durante l\'eliminazione dell\'incasso:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params
    const fd = await req.formData()
    
    console.log('📝 PUT /api/incomes/[id] - Aggiornamento entrata:', id)
    
    const description = String(fd.get('description') || '').trim()
    const amount = parseFloat(String(fd.get('amount') || '0'))
    const dateStr = String(fd.get('date') || '')
    const mainName = String(fd.get('mainCategoryId') || '').trim()
    const subName = String(fd.get('subcategoryName') || '').trim()
    const paymentMethod = String(fd.get('paymentMethod') || 'contanti').trim()
    const accountId = String(fd.get('accountId') || '').trim() || null
    
    console.log('📝 Dati ricevuti:', { description, amount, dateStr, mainName, subName, paymentMethod, accountId })

    // Validazione dei campi
    if (!description) {
      return NextResponse.json({ error: 'La descrizione è obbligatoria' }, { status: 400 })
    }
    if (amount <= 0) {
      return NextResponse.json({ error: 'L\'importo deve essere maggiore di zero' }, { status: 400 })
    }
    if (!dateStr) {
      return NextResponse.json({ error: 'La data è obbligatoria' }, { status: 400 })
    }

    // Parsing della data
    const inputDate = new Date(dateStr)
    if (isNaN(inputDate.getTime())) {
      return NextResponse.json({ error: 'Formato data non valido' }, { status: 400 })
    }

    // Recupera l'entrata esistente per verificare se la categoria è cambiata
    const { getIncomes, getMainCategories, getSubcategories } = await import('../../../../lib/supabase-db')
    let existingIncome = null
    let categoryChanged = false
    try {
      const allIncomes = await getIncomes()
      existingIncome = allIncomes.find(i => String(i.id) === String(id))
      if (existingIncome && existingIncome.mainCategory) {
        categoryChanged = existingIncome.mainCategory.name !== mainName
        console.log('📋 Entrata esistente:', { 
          id: existingIncome.id, 
          oldCategory: existingIncome.mainCategory.name,
          newCategory: mainName,
          categoryChanged: categoryChanged,
          subcategoryName: existingIncome.subcategory?.name 
        })
      }
    } catch (error) {
      console.warn('⚠️ Errore nel recupero dell\'entrata esistente (continuo comunque):', error.message)
    }
    
    // Trova categoria e sottocategoria
    const categories = await getMainCategories()
    
    const main = categories.find(cat => cat.name === mainName)
    if (!main) {
      return NextResponse.json({ error: `Categoria principale "${mainName}" non trovata` }, { status: 404 })
    }
    
    // Ottieni le sottocategorie per la categoria specifica (NUOVA categoria se è cambiata)
    const subcategories = await getSubcategories(main.id)
    let sub = null
    
    // Gestisci il caso in cui subName è vuoto o non specificato
    const trimmedSubName = subName ? subName.trim() : ''
    
    if (trimmedSubName) {
      // Sottocategoria specificata: cerca nella nuova categoria
      sub = subcategories.find(s => s.name === trimmedSubName)
      if (!sub) {
        console.error(`❌ Sottocategoria "${trimmedSubName}" non trovata per la categoria "${mainName}"`)
        console.error('📋 Sottocategorie disponibili:', subcategories.map(s => s.name))
        return NextResponse.json({ error: `Sottocategoria "${trimmedSubName}" non trovata per la categoria "${mainName}"` }, { status: 404 })
      }
    } else {
      // Nessuna sottocategoria specificata: usa SEMPRE quella originale dell'entrata
      // Questo è più sicuro e prevedibile
      if (existingIncome && existingIncome.subcategoryId) {
        // Cerca la sottocategoria originale per ID nella nuova categoria
        sub = subcategories.find(s => String(s.id) === String(existingIncome.subcategoryId))
        
        // Se non trovata per ID nella nuova categoria, prova per nome
        if (!sub && existingIncome.subcategory && existingIncome.subcategory.name) {
          sub = subcategories.find(s => s.name === existingIncome.subcategory.name)
        }
        
        // Se ancora non trovata, potrebbe essere che la categoria è cambiata
        // In questo caso, usa la prima disponibile della nuova categoria
        if (!sub) {
          if (categoryChanged) {
            console.log('⚠️ Categoria cambiata e sottocategoria originale non trovata nella nuova categoria')
            if (subcategories && subcategories.length > 0) {
              sub = subcategories[0]
              console.log(`✅ Uso la prima sottocategoria disponibile della nuova categoria: "${sub.name}"`)
            }
          } else {
            // Categoria non cambiata ma sottocategoria non trovata: errore
            console.error(`❌ Sottocategoria originale non trovata per la categoria "${mainName}"`)
            console.error('📋 Sottocategorie disponibili:', subcategories.map(s => ({ id: s.id, name: s.name })))
            return NextResponse.json({ error: `Sottocategoria originale non trovata. Seleziona una sottocategoria.` }, { status: 400 })
          }
        } else {
          console.log(`✅ Uso la sottocategoria originale: "${sub.name}"`)
        }
      } else {
        // Nessuna sottocategoria originale disponibile: usa la prima della nuova categoria
        if (subcategories && subcategories.length > 0) {
          sub = subcategories[0]
          console.log(`⚠️ Nessuna sottocategoria originale, uso la prima disponibile: "${sub.name}"`)
        } else {
          console.error(`❌ Nessuna sottocategoria trovata per la categoria "${mainName}"`)
          return NextResponse.json({ error: `Nessuna sottocategoria trovata per la categoria "${mainName}". Aggiungi almeno una sottocategoria.` }, { status: 404 })
        }
      }
    }
    
    if (!sub || !sub.id) {
      console.error('❌ Sottocategoria non valida:', sub)
      return NextResponse.json({ error: 'Sottocategoria non valida' }, { status: 400 })
    }

    // Aggiorna l'entrata
    const incomeData = {
      id,
      description,
      amount,
      date: inputDate,
      mainCategoryId: main.id,
      subcategoryId: sub.id,
      mainCategoryName: mainName,
      subcategoryName: sub.name, // Usa il nome della sottocategoria trovata
      paymentMethod,
      accountId: accountId || null
    }
    
    console.log('📝 Chiamata updateIncome con:', incomeData)
    let updatedIncome
    try {
      updatedIncome = await updateIncome(incomeData)
      console.log('📝 Risultato updateIncome:', updatedIncome)
    } catch (updateError) {
      console.error('❌ Errore durante updateIncome:', updateError.message)
      console.error('❌ Stack trace:', updateError.stack)
      return NextResponse.json({ 
        error: 'Errore durante l\'aggiornamento dell\'entrata',
        details: process.env.NODE_ENV === 'development' ? updateError.message : undefined
      }, { status: 500 })
    }

    if (!updatedIncome) {
      console.error('❌ Entrata non trovata con ID:', id)
      return NextResponse.json({ error: 'Entrata non trovata' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      ok: true, 
      income: {
        id: updatedIncome.id,
        description: updatedIncome.description,
        amount: updatedIncome.amount,
        date: updatedIncome.date,
        mainCategory: { name: mainName },
        subcategory: { name: sub.name }, // Usa il nome della sottocategoria trovata
        paymentMethod: updatedIncome.paymentMethod || paymentMethod,
        accountId: updatedIncome.accountId || accountId || null
      }
    })
  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento dell\'entrata:', error)
    console.error('❌ Stack trace:', error.stack)
    console.error('❌ Dettagli errore:', {
      message: error.message,
      name: error.name,
      id: params.id
    })
    return NextResponse.json({ 
      error: 'Errore interno del server',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}




