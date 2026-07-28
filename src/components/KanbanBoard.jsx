import { CalendarDays, FileText, MapPin } from 'lucide-react'
import { ACTIVE_INTERVIEW_STATUSES } from '../data/constants.js'
import { formatReminder, formatShortDate } from '../utils/format.js'
import { StatusTag } from './StatusTag.jsx'

const COLUMNS = [
  { id: 'prepare', title: '准备投递', tone: 'sky', matches: (status) => status === '准备投递' },
  { id: 'sent', title: '已投递', tone: 'slate', matches: (status) => status === '已投递' },
  { id: 'interview', title: '笔试 / 面试', tone: 'blue', matches: (status) => ACTIVE_INTERVIEW_STATUSES.has(status) },
  { id: 'offer', title: 'Offer', tone: 'mint', matches: (status) => status === 'Offer' },
  { id: 'closed', title: '已结束', tone: 'rose', matches: (status) => status === '拒绝' || status === '已结束' },
]

export function KanbanBoard({ applications, resumeNames, query, onEdit }) {
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')
  const visible = normalizedQuery
    ? applications.filter((item) => `${item.company} ${item.role} ${item.notes}`.toLocaleLowerCase('zh-CN').includes(normalizedQuery))
    : applications

  return (
    <div className="kanban-board">
      {COLUMNS.map((column) => {
        const cards = visible.filter((item) => column.matches(item.status))
        return (
          <section className="kanban-column" key={column.id}>
            <div className="kanban-column-heading">
              <span className={`column-dot ${column.tone}`} />
              <h3>{column.title}</h3>
              <em>{cards.length}</em>
            </div>
            <div className="kanban-cards">
              {cards.map((application) => (
                <button className="kanban-card" type="button" key={application.id} onClick={() => onEdit(application)}>
                  <div className="kanban-card-top">
                    <strong>{application.company}</strong>
                    <StatusTag status={application.status} />
                  </div>
                  <p>{application.role}</p>
                  <div className="kanban-card-meta">
                    {application.location ? <span><MapPin size={13} />{application.location}</span> : null}
                    <span><CalendarDays size={13} />{formatShortDate(application.appliedDate)}</span>
                  </div>
                  {application.resumeId && resumeNames.has(application.resumeId) ? (
                    <div className="kanban-resume"><FileText size={13} />{resumeNames.get(application.resumeId)}</div>
                  ) : null}
                  {application.nextStep ? (
                    <div className="kanban-next">
                      <span>{application.nextStep}</span>
                      {application.reminderAt ? <small>{formatReminder(application.reminderAt)}</small> : null}
                    </div>
                  ) : null}
                </button>
              ))}
              {cards.length === 0 ? <p className="kanban-empty">暂无记录</p> : null}
            </div>
          </section>
        )
      })}
    </div>
  )
}
