import { NextResponse } from 'next/server'
import { deleteExpense } from '../../../../lib/firebase-db'

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

