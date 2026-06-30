import { useWorkspace } from '../context/WorkspaceContext'

export default function WorkspaceSwitcher() {
  const { workspaces, activeWorkspaceId, setActiveWorkspaceId, activeRole } =
    useWorkspace()

  if (workspaces.length === 0) return null

  return (
    <div className="row">
      <select
        value={activeWorkspaceId ?? ''}
        onChange={(e) => setActiveWorkspaceId(e.target.value)}
        aria-label="Active workspace"
      >
        {workspaces.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
      {activeRole && <span className="badge">{activeRole}</span>}
    </div>
  )
}
