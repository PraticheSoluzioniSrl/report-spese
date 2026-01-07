import { NextResponse } from 'next/server'
import { deleteExpense, updateExpense, getMainCategories, getSubcategories } from '../../../../lib/supabase-db'

export async function DELETE (_req, { params }) {
  try {
    const id = String(params.id)
    if (!id) return NextResponse.json({ ok: true })
    await deleteExpense(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Errore durante l\'eliminazione della spesa:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params
    const fd = await req.formData()
    
    const description = String(fd.get('description') || '').trim()
    const amount = parseFloat(String(fd.get('amount') || '0'))
    const dateStr = String(fd.get('date') || '')
    const mainName = String(fd.get('mainCategoryId') || '').trim()
    const subName = String(fd.get('subcategoryName') || '').trim()
    const paymentMethod = String(fd.get('paymentMethod') || 'contanti').trim()
    const accountId = String(fd.get('accountId') || '').trim() || null

    // Validazione dei campi (stesso pattern della route POST)
    if (!description) {
      return NextResponse.json({ error: 'La descrizione è obbligatoria' }, { status: 400 })
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'L\'importo deve essere maggiore di zero' }, { status: 400 })
    }
    if (!dateStr) {
      return NextResponse.json({ error: 'La data è obbligatoria' }, { status: 400 })
    }
    if (!mainName) {
      return NextResponse.json({ error: 'La categoria principale è obbligatoria' }, { status: 400 })
    }
    if (!subName) {
      return NextResponse.json({ error: 'La sottocategoria è obbligatoria' }, { status: 400 })
    }

    // Validazione della data (stesso pattern della route POST)
    const inputDate = new Date(dateStr)
    if (isNaN(inputDate.getTime())) {
      return NextResponse.json({ error: 'Data non valida' }, { status: 400 })
    }

    // Trova categoria e sottocategoria (stesso pattern della route POST)
    const mainCategories = await getMainCategories()
    const expenseCategories = mainCategories.filter(cat => {
      if (!cat.type) return true
      return cat.type === 'expenses'
    })
    const main = expenseCategories.find(cat => cat.name === mainName)
    if (!main) {
      return NextResponse.json({ error: `Categoria principale "${mainName}" non trovata` }, { status: 404 })
    }

    const subcategories = await getSubcategories(main.id)
    const sub = subcategories.find(sub => sub.name === subName)
    if (!sub) {
      return NextResponse.json({ error: `Sottocategoria "${subName}" non trovata per la categoria "${mainName}"` }, { status: 404 })
    }

    // Prepara i dati per l'aggiornamento (stesso pattern della route POST)
    const expenseData = {
      id: String(id),
      description,
      amount,
      date: inputDate,
      mainCategoryId: main.id,
      subcategoryId: sub.id,
      mainCategoryName: mainName,
      subcategoryName: subName,
      paymentMethod,
      accountId: accountId || null
    }
    
    // Aggiorna la spesa
    let updatedExpense
    try {
      updatedExpense = await updateExpense(expenseData)
    } catch (updateError) {
      console.error('❌ Errore in updateExpense:', updateError)
      console.error('❌ Stack:', updateError.stack)
      return NextResponse.json({ 
        error: updateError.message || 'Errore durante l\'aggiornamento della spesa'
      }, { status: 500 })
    }
    
    if (!updatedExpense) {
      return NextResponse.json({ error: 'Spesa non trovata' }, { status: 404 })
    }
    
    // Normalizza la data per la risposta
    let responseDate = updatedExpense.date
    if (responseDate instanceof Date) {
      responseDate = responseDate.toISOString().split('T')[0]
    } else if (typeof responseDate === 'string') {
      // Se è già una stringa, prendi solo la parte data
      responseDate = responseDate.split('T')[0]
    }
    
    // Restituisci il risultato
    const response = {
      ok: true, 
      expense: {
        id: String(updatedExpense.id),
        description: String(updatedExpense.description),
        amount: Number(updatedExpense.amount),
        date: responseDate,
        mainCategory: { name: String(mainName) },
        subcategory: { name: String(subName) },
        paymentMethod: String(updatedExpense.paymentMethod || paymentMethod),
        accountId: updatedExpense.accountId || accountId || null
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento della spesa:', error)
    console.error('❌ Stack:', error.stack)
    return NextResponse.json({ 
      error: error.message || 'Errore interno del server'
    }, { status: 500 })
  }
}
