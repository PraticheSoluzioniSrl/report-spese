import { NextResponse } from 'next/server'
import { getDemoAccounts, addDemoAccount, updateDemoAccount, deleteDemoAccount, calculateAccountBalance } from '../../../lib/demo-storage'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const accounts = getDemoAccounts()
    // Calcola il saldo corrente per ogni conto
    const accountsWithBalance = accounts.map(account => ({
      ...account,
      currentBalance: calculateAccountBalance(account.id)
    }))
    return NextResponse.json(accountsWithBalance)
  } catch (error) {
    console.error('Errore nel recupero dei conti:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const fd = await req.formData()
    const name = String(fd.get('name') || '').trim()
    const initialBalance = parseFloat(String(fd.get('initialBalance') || '0'))
    
    if (!name) {
      return NextResponse.json({ error: 'Il nome del conto è obbligatorio' }, { status: 400 })
    }
    
    const account = addDemoAccount(name, initialBalance)
    return NextResponse.json({ ok: true, account })
  } catch (error) {
    console.error('Errore nella creazione del conto:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}




