import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Columns3,
  DatabaseBackup,
  Files,
  Route,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'records', label: '投递记录', icon: ClipboardList },
  { id: 'daily', label: '每日安排', icon: CalendarDays },
  { id: 'resumes', label: '简历版本', icon: Files },
  { id: 'kanban', label: '进度看板', icon: Columns3 },
  { id: 'stats', label: '数据统计', icon: BarChart3 },
]

export function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <button className="brand" type="button" aria-label="返回投递记录" onClick={() => onNavigate('records')}>
        <span className="brand-mark" aria-hidden="true">
          <Route size={28} strokeWidth={1.9} />
          <span />
        </span>
        <span className="brand-text">求职轨迹</span>
      </button>

      <nav className="main-nav" aria-label="主要导航">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = activePage === item.id
          return (
            <button
              className={`nav-item ${active ? 'active' : ''}`}
              type="button"
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              key={item.id}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={21} strokeWidth={1.8} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-bottom">
        <button
          className={`nav-item ${activePage === 'backup' ? 'active' : ''}`}
          type="button"
          aria-label="数据备份"
          onClick={() => onNavigate('backup')}
        >
          <DatabaseBackup size={21} strokeWidth={1.8} />
          <span>数据备份</span>
        </button>
        <p className="local-note">数据仅保存在这台电脑</p>
      </div>
    </aside>
  )
}
