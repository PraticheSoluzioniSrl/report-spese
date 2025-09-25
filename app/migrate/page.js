'use client'
import { useState } from 'react'

export default function MigratePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function runMigration() {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        error: 'Errore durante la migrazione',
        details: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Migrazione Database</h1>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Questa pagina esegue la migrazione del database per aggiungere il campo 
            <code className="bg-gray-100 px-2 py-1 rounded">payment_method</code> 
            alle tabelle expenses e incomes.
          </p>
          
          <button
            onClick={runMigration}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Eseguendo migrazione...' : 'Esegui Migrazione'}
          </button>
        </div>
        
        {result && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Risultato:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
