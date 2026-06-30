import Nav from '../components/Nav'
import TaskList from '../components/TaskList'
import { useWorkspace } from '../context/WorkspaceContext'

export default function DashboardPage() {
  const { loading, workspaces, activeWorkspaceId } = useWorkspace()

  return (
    <div className="app-shell">
      <Nav />
      {loading ? (
        <div className="center muted">Loading workspaces…</div>
      ) : workspaces.length === 0 ? (
        <div className="card">
          <h2>No workspaces yet</h2>
          <p className="muted">
            You aren't a member of any workspace. Seed some data and add a
            membership for your user — see the README and{' '}
            <code>supabase/seed.sql</code>.
          </p>
        </div>
      ) : (
        <>
          <h2>Tasks</h2>
          {activeWorkspaceId && <TaskList />}
        </>
      )}
    </div>
  )
}
