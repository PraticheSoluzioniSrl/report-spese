import { NextResponse } from 'next/server'
import { updateAccount, deleteAccount } from '../../../../lib/supabase-db'

export const dynamic = 'force-dynamic'

export async function PUT(req, { params }) {
  try {
    const { id } = params
    const fd = await req.formData()
    const name = String(fd.get('name') || '').trim()
    const initialBalanceStr = fd.get('initialBalance')
    const initialBalance = initialBalanceStr !== null && initialBalanceStr !== undefined 
      ? parseFloat(String(initialBalanceStr || '0')) 
      : undefined
    
    console.log('📝 PUT /api/accounts/[id] - Dati ricevuti:', { id, name, initialBalance })
    
    if (!name) {
      return NextResponse.json({ error: 'Il nome del conto è obbligatorio' }, { status: 400 })
    }
    
    const account = await updateAccount(id, name, initialBalance)
    
    if (!account) {
      console.error('❌ updateAccount ha restituito null per ID:', id)
      return NextResponse.json({ error: 'Conto non trovato' }, { status: 404 })
    }
    
    console.log('✅ Conto aggiornato con successo:', account)
    
    return NextResponse.json({ ok: true, account })
  } catch (error) {
    console.error('❌ Errore nell\'aggiornamento del conto:', error)
    console.error('❌ Stack:', error.stack)
    return NextResponse.json({ 
      error: error.message || 'Errore interno del server' 
    }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params
    const deleted = await deleteAccount(id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Conto non trovato' }, { status: 404 })
    }
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Errore nell\'eliminazione del conto:', error)
    return NextResponse.json({ 
      error: error.message || 'Errore interno del server' 
    }, { status: 500 })
  }
}




