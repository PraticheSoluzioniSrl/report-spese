import { NextResponse } from 'next/server'
import { getAccounts, calculateAccountBalance } from '../../../../lib/supabase-db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const accounts = await getAccounts()
    const balances = await Promise.all(accounts.map(async account => ({
      id: account.id,
      name: account.name,
      initialBalance: account.initialBalance || 0,
      currentBalance: await calculateAccountBalance(account.id)
    })))
    
    // Calcola il totale di tutti i conti
    const totalBalance = balances.reduce((sum, acc) => sum + acc.currentBalance, 0)
    
    return NextResponse.json({
      accounts: balances,
      totalBalance
    })
  } catch (error) {
    console.error('Errore nel calcolo dei saldi:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}




