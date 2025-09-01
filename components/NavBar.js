'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavBar ({ logout }) {
  const pathname = usePathname()
  const tabs = [
    { href: '/expenses', label: 'Report Spese' },
    { href: '/incomes', label: 'Entrate' },
    { href: '/deadlines', label: 'Scadenze' },
    { href: '/analysis', label: 'Analisi Grafica' },
    { href: '/import', label: 'Import' },
    { href: '/settings', label: 'Impostazioni' }
  ]

  return (
    <div className='w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-lg my-6 p-6'>
      <header className='mb-6 text-center'>
        <h1 className='text-3xl font-bold text-gray-900'>Dashboard Finanziaria</h1>
        <p className='text-gray-500 mt-1'>Gestisci spese, scadenze e analisi in un unico posto.</p>
      </header>
      <div className='border-b border-gray-200 mb-6 flex items-center justify-between'>
        <nav className='-mb-px flex space-x-6' aria-label='Tabs'>
          {tabs.map(t => (
            <Link key={t.href} href={t.href} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${pathname === t.href ? 'border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'}`}>{t.label}</Link>
          ))}
        </nav>
        <form action={logout}>
          <button className='text-sm text-gray-600 hover:text-red-600'>Esci</button>
        </form>
      </div>
    </div>
  )
}

