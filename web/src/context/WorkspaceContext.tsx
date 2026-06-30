import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import type { Role, WorkspaceWithRole } from '../lib/types'
import { useAuth } from './AuthContext'

interface WorkspaceValue {
  workspaces: WorkspaceWithRole[]
  activeWorkspaceId: string | null
  setActiveWorkspaceId: (id: string) => void
  activeRole: Role | null
  loading: boolean
  reload: () => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceValue | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [workspaces, setWorkspaces] = useState<WorkspaceWithRole[]>([])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!user) {
      setWorkspaces([])
      setActiveWorkspaceId(null)
      setLoading(false)
      return
    }
    setLoading(true)
    // Fetch the workspaces this user is a member of, with their role.
    const { data, error } = await supabase
      .from('memberships')
      .select('role, workspaces(id, name, created_at)')
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to load workspaces', error)
      setLoading(false)
      return
    }

    const rows: WorkspaceWithRole[] = (data ?? [])
      .map((m: any) => {
        const ws = Array.isArray(m.workspaces) ? m.workspaces[0] : m.workspaces
        if (!ws) return null
        return { ...ws, role: m.role as Role }
      })
      .filter(Boolean) as WorkspaceWithRole[]

    setWorkspaces(rows)
    setActiveWorkspaceId((prev) => prev ?? rows[0]?.id ?? null)
    setLoading(false)
  }, [user])

  useEffect(() => {
    void reload()
  }, [reload])

  const activeRole =
    workspaces.find((w) => w.id === activeWorkspaceId)?.role ?? null

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspaceId,
        setActiveWorkspaceId,
        activeRole,
        loading,
        reload,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within a WorkspaceProvider')
  return ctx
}
