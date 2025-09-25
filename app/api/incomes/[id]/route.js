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
    
    const description = String(fd.get('description') || '').trim()
    const amount = parseFloat(String(fd.get('amount') || '0'))
    const dateStr = String(fd.get('date') || '')
    const mainName = String(fd.get('mainCategoryId') || '').trim()
    const subName = String(fd.get('subcategoryName') || '').trim()
    const paymentMethod = String(fd.get('paymentMethod') || 'contanti').trim()

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

    // Trova categoria e sottocategoria
    const { getMainCategories, getSubcategories } = await import('../../../../lib/supabase-db')
    const categories = await getMainCategories()
    
    const main = categories.find(cat => cat.name === mainName)
    if (!main) {
      return NextResponse.json({ error: `Categoria principale "${mainName}" non trovata` }, { status: 404 })
    }
    
    // Ottieni le sottocategorie per la categoria specifica
    const subcategories = await getSubcategories(main.id)
    let sub = null
    
    if (subName) {
      sub = subcategories.find(sub => sub.name === subName)
      if (!sub) {
        return NextResponse.json({ error: `Sottocategoria "${subName}" non trovata per la categoria "${mainName}"` }, { status: 404 })
      }
    } else {
      // Se non c'è sottocategoria, usa la prima disponibile per quella categoria
      sub = subcategories[0]
      if (!sub) {
        return NextResponse.json({ error: `Nessuna sottocategoria trovata per la categoria "${mainName}"` }, { status: 404 })
      }
    }

    // Aggiorna l'entrata
    const incomeData = {
      id,
      description,
      amount,
      date: inputDate,
      mainCategoryId: main.id,
      subcategoryId: sub.id,
      paymentMethod
    }
    
    const updatedIncome = await updateIncome(incomeData)

    return NextResponse.json({ 
      ok: true, 
      income: {
        id: updatedIncome.id,
        description: updatedIncome.description,
        amount: updatedIncome.amount,
        date: updatedIncome.date,
        mainCategory: { name: mainName },
        subcategory: { name: subName },
        paymentMethod: updatedIncome.paymentMethod || paymentMethod
      }
    })
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dell\'entrata:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}




