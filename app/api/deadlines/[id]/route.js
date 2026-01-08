import { NextResponse } from 'next/server'
import { updateDeadline, deleteDeadline } from '../../../../lib/supabase-db'

export async function PATCH (req, { params }) {
  try {
    const id = String(params.id)
    const body = await req.json()
    
    console.log('🔧 PATCH /api/deadlines/[id] chiamata con:', { id, body })
    
    const paidValue = Boolean(body.paid)
    console.log('🔧 Valore paid da applicare:', paidValue)
    
    const result = await updateDeadline(id, { paid: paidValue })
    
    console.log('✅ Scadenza aggiornata con successo:', result)
    return NextResponse.json({ ok: true, deadline: result })
  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento della scadenza:', error)
    console.error('❌ Stack:', error.stack)
    return NextResponse.json({ 
      error: error.message || 'Errore interno del server' 
    }, { status: 500 })
  }
}

export async function DELETE (_req, { params }) {
  try {
    const id = String(params.id)
    await deleteDeadline(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Errore durante l\'eliminazione della scadenza:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

