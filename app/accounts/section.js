'use client'
import { useEffect, useState } from 'react'

export default function AccountsSection () {
  const [accounts, setAccounts] = useState([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  async function loadBalances () {
    try {
      setLoading(true)
      const response = await fetch('/api/accounts/balances')
      if (!response.ok) throw new Error('Errore nel caricamento dei saldi')
      const data = await response.json()
      setAccounts(data.accounts || [])
      setTotalBalance(data.totalBalance || 0)
    } catch (error) {
      console.error('Errore nel caricamento dei saldi:', error)
      setAccounts([])
      setTotalBalance(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBalances()
    // Ricarica i saldi ogni 30 secondi per aggiornamenti in tempo reale
    const interval = setInterval(loadBalances, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className='w-full max-w-5xl mx-auto bg-white rounded-2xl shadow p-6'>
        <div className='text-center py-8'>
          <p className='text-gray-500'>Caricamento saldi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-5xl mx-auto bg-white rounded-2xl shadow p-6'>
      <h2 className='text-2xl font-bold mb-6 text-gray-900'>Gestione Conti</h2>
      
      {/* Totale complessivo */}
      <div className='mb-8'>
        <div className={`bg-gradient-to-r ${totalBalance >= 0 ? 'from-green-600 to-green-500' : 'from-red-600 to-red-500'} text-white rounded-xl p-6 shadow-lg`}>
          <h3 className='text-lg font-medium opacity-90 mb-2'>Saldo Totale Complessivo</h3>
          <p className='text-4xl font-bold'>€ {totalBalance.toFixed(2)}</p>
        </div>
      </div>

      {/* Lista conti */}
      <div>
        <h3 className='text-xl font-semibold mb-4 border-b pb-2'>Dettaglio Conti</h3>
        {accounts.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            <p>Nessun conto configurato.</p>
            <p className='text-sm mt-2'>Vai nelle Impostazioni per aggiungere un nuovo conto.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {accounts.map(account => (
              <div
                key={account.id}
                className={`p-5 rounded-lg shadow-md border-l-4 ${
                  account.currentBalance >= 0
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='text-lg font-semibold text-gray-900'>{account.name}</h4>
                  <span className={`text-xl font-bold ${
                    account.currentBalance >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    € {account.currentBalance.toFixed(2)}
                  </span>
                </div>
                <div className='text-sm text-gray-600'>
                  <p>Saldo iniziale: € {account.initialBalance.toFixed(2)}</p>
                  <p className='mt-1'>
                    Variazione: € {(account.currentBalance - account.initialBalance).toFixed(2)}
                    {account.currentBalance - account.initialBalance >= 0 ? (
                      <span className='text-green-600 ml-1'>↑</span>
                    ) : (
                      <span className='text-red-600 ml-1'>↓</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informazioni */}
      <div className='mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200'>
        <p className='text-sm text-blue-800'>
          <strong>Nota:</strong> I saldi vengono calcolati automaticamente sommando il saldo iniziale con tutte le entrate e sottraendo tutte le spese associate a ciascun conto.
        </p>
      </div>
    </div>
  )
}




