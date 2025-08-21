import NavBar from '../../components/NavBar'
import { logoutAction } from '../../lib/auth'
import SettingsSection from './section'

export default function SettingsPage () {
  return (
    <div>
      <NavBar logout={logoutAction} />
      <div className='w-full max-w-5xl mx-auto'>
        <SettingsSection />
      </div>
    </div>
  )
}

