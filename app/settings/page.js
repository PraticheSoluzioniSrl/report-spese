import { Suspense } from 'react'
import NavBar from '../../components/NavBar'
import { logoutAction } from '../../lib/actions'
import SettingsSection from './section'

export default function SettingsPage () {
  return (
    <div>
      <NavBar logout={logoutAction} />
      <div className='w-full max-w-5xl mx-auto'>
        <Suspense fallback={<div>Caricamento...</div>}>
          <SettingsSection />
        </Suspense>
      </div>
    </div>
  )
}

