import NavBar from '../../components/NavBar'
import { logoutAction } from '../../lib/actions'
import DeadlinesSection from './section'

export default function DeadlinesPage () {
  return (
    <div className='min-h-screen bg-gray-100 py-4'>
      <NavBar logout={logoutAction} />
      <div className='w-full max-w-5xl mx-auto px-4'>
        <DeadlinesSection />
      </div>
    </div>
  )
}

