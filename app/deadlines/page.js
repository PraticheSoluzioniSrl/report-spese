import NavBar from '../../components/NavBar'
import { logoutAction } from '../../lib/actions'
import DeadlinesSection from './section'

export default function DeadlinesPage () {
  return (
    <div>
      <NavBar logout={logoutAction} />
      <div className='w-full max-w-5xl mx-auto'>
        <DeadlinesSection />
      </div>
    </div>
  )
}

