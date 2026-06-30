import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import { supabase } from '../lib/supabase'
import type { Task, TaskStatus } from '../lib/types'
import { useWorkspace } from '../context/WorkspaceContext'
import TaskItem from './TaskItem'

export default function TaskList() {
  const { activeWorkspaceId, activeRole } = useWorkspace()
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Task[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const canWrite = activeRole === 'admin' || activeRole === 'member'

  // --------------------------------------------------------------------------
  // PERFORMANCE ISSUE (Task 1b):
  // This pulls EVERY task in the database to the client on each load and the
  // current workspace's rows are then filtered out in memory below. It grows
  // linearly with total tasks across all workspaces, not with what's shown.
  // --------------------------------------------------------------------------
  const loadTasks = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Failed to load tasks', error)
    } else if (data) {
      setAllTasks(data as Task[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks, activeWorkspaceId])

  // Client-side filtering — paired with the over-fetch above.
  const tasks = useMemo(
    () => allTasks.filter((t) => t.workspace_id === activeWorkspaceId),
    [allTasks, activeWorkspaceId],
  )

  // --------------------------------------------------------------------------
  // BUG (Task 1a): "the app gets sluggish after switching workspaces a few
  // times." A new auto-refresh interval is started every time the workspace
  // changes, and nothing ever tears the old one down — they pile up.
  // --------------------------------------------------------------------------
  useEffect(() => {
    setInterval(() => {
      void loadTasks()
    }, 5000)
    // (no cleanup — the interval is never cleared)
  }, [activeWorkspaceId, loadTasks])

  // --------------------------------------------------------------------------
  // BUG (Task 1a): "the list sometimes shows results from a previous search."
  // Every keystroke fires a request and applies whatever comes back. A slow
  // earlier response can land after a newer one and clobber it. There is no
  // cancellation or last-write-wins guard.
  // --------------------------------------------------------------------------
  useEffect(() => {
    const term = search.trim()
    if (!term) {
      setSearchResults(null)
      return
    }
    supabase
      .from('tasks')
      .select('*')
      .eq('workspace_id', activeWorkspaceId)
      .ilike('title', `%${term}%`)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSearchResults((data ?? []) as Task[])
      })
  }, [search, activeWorkspaceId])

  // --------------------------------------------------------------------------
  // BUG (Task 1a, optional/stale-closure): this title updater is wired up once
  // and captures the first render's `tasks`, so the count it shows never moves
  // even as tasks change. (Cleanup is present here — the defect is the empty
  // dependency array capturing stale state.)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const id = setInterval(() => {
      document.title = `Nimbus — ${tasks.length} tasks`
    }, 2000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function createTask(e: FormEvent) {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title || !activeWorkspaceId) return
    const { error } = await supabase
      .from('tasks')
      .insert({ workspace_id: activeWorkspaceId, title, status: 'todo' })
    if (error) {
      console.error('Failed to create task', error)
      return
    }
    setNewTitle('')
    void loadTasks()
  }

  async function changeStatus(id: string, status: TaskStatus) {
    const { error } = await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      console.error('Failed to update task', error)
      return
    }
    void loadTasks()
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) {
      console.error('Failed to delete task', error)
      return
    }
    void loadTasks()
  }

  const visible = searchResults ?? tasks

  return (
    <div>
      {canWrite && (
        <form className="toolbar" onSubmit={createTask}>
          <input
            type="text"
            placeholder="New task title…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button className="primary" type="submit">
            Add task
          </button>
        </form>
      )}

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {loading && <span className="muted">Loading…</span>}
      </div>

      {visible.length === 0 ? (
        <p className="muted">No tasks{search ? ' match your search' : ' yet'}.</p>
      ) : (
        visible.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            role={activeRole}
            onChangeStatus={changeStatus}
            onDelete={deleteTask}
          />
        ))
      )}
    </div>
  )
}
