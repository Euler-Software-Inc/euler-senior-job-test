import { useAuth } from '../context/AuthContext'
import WorkspaceSwitcher from './WorkspaceSwitcher'

export default function Nav() {
  const { user, signOut } = useAuth()
  return (
    <div className="nav">
      <div className="row">
        <span className="brand">Nimbus</span>
        <WorkspaceSwitcher />
      </div>
      <div className="row">
        <span className="muted">{user?.email}</span>
        <button onClick={() => void signOut()}>Sign out</button>
      </div>
    </div>
  )
}
