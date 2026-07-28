import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  ChevronDown,
  LayoutGrid,
  List,
  Plus,
  Search,
  XCircle,
} from 'lucide-react'
import { ApplicationModal } from './components/ApplicationModal.jsx'
import { ApplicationTable } from './components/ApplicationTable.jsx'
import { BackupView } from './components/BackupView.jsx'
import { DailyView } from './components/DailyView.jsx'
import { KanbanBoard } from './components/KanbanBoard.jsx'
import { ResumeLibrary } from './components/ResumeLibrary.jsx'
import { ResumeModal } from './components/ResumeModal.jsx'
import { Sidebar } from './components/Sidebar.jsx'
import { StatsView } from './components/StatsView.jsx'
import { SummaryBand } from './components/SummaryBand.jsx'
import { UpcomingRail } from './components/UpcomingRail.jsx'
import { ACTIVE_INTERVIEW_STATUSES, CLOSED_STATUSES, STATUSES } from './data/constants.js'
import { useApplications } from './hooks/useApplications.js'
import { useResumes } from './hooks/useResumes.js'
import { isSameMonth, isSoon } from './utils/format.js'

const PAGE_COPY = {
  records: ['投递记录', '把每一次尝试，都认真记下来。'],
  daily: ['每日安排', '按天查看投递、笔试、面试和跟进提醒。'],
  resumes: ['简历版本', '把每一版简历留好，投递时准确对应。'],
  kanban: ['进度看板', '一眼看清每个机会走到了哪里。'],
  stats: ['数据统计', '用真实进展调整接下来的投递节奏。'],
  backup: ['数据备份', '导出、恢复或整理保存在本机的数据。'],
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(onClose, 3200)
    return () => window.clearTimeout(timer)
  }, [onClose, toast])

  if (!toast) return null
  const Icon = toast.type === 'error' ? XCircle : CheckCircle2
  return (
    <div className={`toast ${toast.type}`} role="status">
      <Icon size={18} />
      <span>{toast.message}</span>
    </div>
  )
}

function SearchBox({ value, onChange, placeholder = '搜索企业或岗位' }) {
  return (
    <label className="search-box">
      <Search size={19} aria-hidden="true" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}

function RecordsToolbar({ query, status, onQueryChange, onStatusChange, onBoardView }) {
  return (
    <div className="records-toolbar">
      <div className="toolbar-filters">
        <SearchBox value={query} onChange={onQueryChange} />
        <label className="filter-select">
          <select value={status} onChange={(event) => onStatusChange(event.target.value)} aria-label="按状态筛选">
            <option value="all">全部状态</option>
            {STATUSES.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </label>
      </div>
      <div className="view-switch" aria-label="切换视图">
        <button className="selected" type="button"><List size={18} />列表</button>
        <button type="button" onClick={onBoardView}><LayoutGrid size={18} />看板</button>
      </div>
    </div>
  )
}

export default function App() {
  const {
    applications,
    addApplication,
    updateApplication,
    deleteApplication,
    replaceApplications,
    clearApplications,
  } = useApplications()
  const {
    resumes,
    loading: resumesLoading,
    error: resumesError,
    addResume,
    updateResume,
    deleteResume,
    downloadResume,
    openResume,
  } = useResumes()
  const [activePage, setActivePage] = useState('records')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [draftAppliedDate, setDraftAppliedDate] = useState('')
  const [resumeModalOpen, setResumeModalOpen] = useState(false)
  const [editingResume, setEditingResume] = useState(null)
  const [toast, setToast] = useState(null)
  const deferredQuery = useDeferredValue(query)

  const notify = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type })
  }, [])

  const closeToast = useCallback(() => setToast(null), [])
  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditing(null)
    setDraftAppliedDate('')
  }, [])
  const closeResumeModal = useCallback(() => {
    setResumeModalOpen(false)
    setEditingResume(null)
  }, [])

  const openCreate = (appliedDate) => {
    setEditing(null)
    setDraftAppliedDate(typeof appliedDate === 'string' ? appliedDate : '')
    setModalOpen(true)
  }

  const openEdit = (application) => {
    setDraftAppliedDate('')
    setEditing(application)
    setModalOpen(true)
  }

  const openResumeCreate = () => {
    setEditingResume(null)
    setResumeModalOpen(true)
  }

  const openResumeEdit = (resume) => {
    setEditingResume(resume)
    setResumeModalOpen(true)
  }

  const saveResumeVersion = async (values) => {
    if (editingResume) {
      await updateResume(editingResume.id, values)
      notify(`已更新简历版本“${values.name.trim()}”`)
    } else {
      await addResume(values)
      notify(`已保存简历版本“${values.name.trim()}”`)
    }
    closeResumeModal()
  }

  const handleOpenResume = async (resume) => {
    try {
      await openResume(resume.id)
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : '无法打开简历。', 'error')
    }
  }

  const handleDownloadResume = async (resume) => {
    try {
      await downloadResume(resume.id)
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : '无法下载简历。', 'error')
    }
  }

  const saveApplication = (values) => {
    if (editing) {
      updateApplication(editing.id, values)
      notify(`已更新 ${values.company} 的进展`)
    } else {
      addApplication(values)
      notify(`已记录 ${values.company} · ${values.role}`)
    }
    closeModal()
  }

  const removeApplication = (application) => {
    if (!window.confirm(`确定删除“${application.company} · ${application.role}”吗？`)) return
    deleteApplication(application.id)
    notify('投递记录已删除')
  }

  const resumeUsageCounts = useMemo(() => {
    const counts = new Map()
    for (const application of applications) {
      if (application.resumeId) {
        counts.set(application.resumeId, (counts.get(application.resumeId) ?? 0) + 1)
      }
    }
    return counts
  }, [applications])

  const removeResumeVersion = async (resume) => {
    const usageCount = resumeUsageCounts.get(resume.id) ?? 0
    if (usageCount > 0) {
      notify(`这份简历已关联 ${usageCount} 条投递，请先修改对应投递后再删除。`, 'error')
      return
    }
    if (!window.confirm(`确定删除简历版本“${resume.name}”吗？`)) return
    try {
      await deleteResume(resume.id)
      notify('简历版本已删除')
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : '删除简历失败。', 'error')
    }
  }

  const resumeNames = useMemo(
    () => new Map(resumes.map((resume) => [resume.id, resume.name])),
    [resumes],
  )

  const filteredApplications = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLocaleLowerCase('zh-CN')
    return applications
      .filter((item) => {
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter
        if (!matchesStatus) return false
        if (!normalizedQuery) return true
        return `${item.company} ${item.role} ${item.channel} ${item.location} ${item.notes} ${resumeNames.get(item.resumeId) ?? ''}`
          .toLocaleLowerCase('zh-CN')
          .includes(normalizedQuery)
      })
      .toSorted((a, b) => {
        const dateA = a.appliedDate || a.updatedAt || ''
        const dateB = b.appliedDate || b.updatedAt || ''
        return dateB.localeCompare(dateA)
      })
  }, [applications, deferredQuery, resumeNames, statusFilter])

  const metrics = useMemo(() => ({
    month: applications.filter((item) => isSameMonth(item.appliedDate)).length,
    interviews: applications.filter((item) => ACTIVE_INTERVIEW_STATUSES.has(item.status)).length,
    followUps: applications.filter((item) => isSoon(item.reminderAt) && !CLOSED_STATUSES.has(item.status)).length,
    offers: applications.filter((item) => item.status === 'Offer').length,
  }), [applications])

  const [title, subtitle] = PAGE_COPY[activePage]
  const showCreate = activePage !== 'backup'
  const createIsResume = activePage === 'resumes'

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="app-main">
        <header className="page-header">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {showCreate ? (
            <button
              className="button primary create-button"
              type="button"
              onClick={createIsResume ? openResumeCreate : () => openCreate()}
            >
              <Plus size={20} />{createIsResume ? '上传简历' : '新增投递'}
            </button>
          ) : null}
        </header>

        {activePage === 'records' ? (
          <div className="records-layout">
            <div className="records-center">
              <SummaryBand metrics={metrics} />
              <RecordsToolbar
                query={query}
                status={statusFilter}
                onQueryChange={setQuery}
                onStatusChange={setStatusFilter}
                onBoardView={() => setActivePage('kanban')}
              />
              <ApplicationTable
                applications={filteredApplications}
                resumeNames={resumeNames}
                filtered={Boolean(query || statusFilter !== 'all')}
                onAdd={openCreate}
                onEdit={openEdit}
                onDelete={removeApplication}
              />
            </div>
            <UpcomingRail applications={applications} onEdit={openEdit} />
          </div>
        ) : null}

        {activePage === 'daily' ? (
          <DailyView applications={applications} onAdd={openCreate} onEdit={openEdit} />
        ) : null}

        {activePage === 'resumes' ? (
          <ResumeLibrary
            resumes={resumes}
            loading={resumesLoading}
            error={resumesError}
            usageCounts={resumeUsageCounts}
            onAdd={openResumeCreate}
            onEdit={openResumeEdit}
            onOpen={handleOpenResume}
            onDownload={handleDownloadResume}
            onDelete={removeResumeVersion}
          />
        ) : null}

        {activePage === 'kanban' ? (
          <div className="kanban-page">
            <div className="kanban-toolbar">
              <SearchBox value={query} onChange={setQuery} placeholder="搜索看板中的企业或岗位" />
              <button className="button secondary compact" type="button" onClick={() => setActivePage('records')}>
                <List size={17} />切换到列表
              </button>
            </div>
            <KanbanBoard applications={applications} resumeNames={resumeNames} query={deferredQuery} onEdit={openEdit} />
          </div>
        ) : null}

        {activePage === 'stats' ? <StatsView applications={applications} /> : null}

        {activePage === 'backup' ? (
          <BackupView
            applications={applications}
            onReplace={replaceApplications}
            onClear={clearApplications}
            onNotify={notify}
          />
        ) : null}
      </main>

      <ApplicationModal
        open={modalOpen}
        application={editing}
        initialAppliedDate={draftAppliedDate}
        resumes={resumes}
        onClose={closeModal}
        onSave={saveApplication}
      />
      <ResumeModal
        open={resumeModalOpen}
        resume={editingResume}
        onClose={closeResumeModal}
        onSave={saveResumeVersion}
      />
      <Toast toast={toast} onClose={closeToast} />
    </div>
  )
}
