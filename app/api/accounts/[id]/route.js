import { NextResponse } from 'next/server'
import { getDemoAccounts, updateDemoAccount, deleteDemoAccount } from '../../../../lib/demo-storage'

export const dynamic = 'force-dynamic'

export async function PUT(req, { params }) {
  try {
    const { id } = params
    const fd = await req.formData()
    const name = String(fd.get('name') || '').trim()
    const initialBalance = fd.get('initialBalance') !== null ? parseFloat(String(fd.get('initialBalance') || '0')) : undefined
    
    if (!name) {
      return NextResponse.json({ error: 'Il nome del conto è obbligatorio' }, { status: 400 })
    }
    
    const account = updateDemoAccount(id, name, initialBalance)
    if (!account) {
      return NextResponse.json({ error: 'Conto non trovato' }, { status: 404 })
    }
    
    return NextResponse.json({ ok: true, account })
  } catch (error) {
    console.error('Errore nell\'aggiornamento del conto:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params
    const deleted = deleteDemoAccount(id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Conto non trovato' }, { status: 404 })
    }
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Errore nell\'eliminazione del conto:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}




