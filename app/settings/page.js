import { Suspense } from 'react'
import NavBar from '../../components/NavBar'
import { logoutAction } from '../../lib/actions'
import SettingsSection from './section'

export default function SettingsPage () {
  return (
    <div className='min-h-screen bg-gray-100 py-4'>
      <NavBar logout={logoutAction} />
      <div className='w-full max-w-5xl mx-auto px-4'>
        <Suspense fallback={<div className='text-center py-8'>Caricamento...</div>}>
          <SettingsSection />
        </Suspense>
      </div>
    </div>
  )
}

