import { CalendarDays } from 'lucide-react'
import { reminderDayLabel, reminderTimeLabel } from '../utils/format.js'

function scheduleTone(index) {
  return ['blue', 'mint', 'orange', 'violet'][index % 4]
}

export function UpcomingRail({ applications, onEdit }) {
  const now = Date.now()
  const upcoming = applications
    .filter((item) => item.reminderAt && new Date(item.reminderAt).getTime() > now - 3_600_000)
    .toSorted((a, b) => new Date(a.reminderAt) - new Date(b.reminderAt))
    .slice(0, 5)

  return (
    <aside className="upcoming-rail">
      <div className="upcoming-heading">
        <h2>近期安排</h2>
        <CalendarDays size={20} strokeWidth={1.8} />
      </div>
      {upcoming.length ? (
        <div className="schedule-list">
          {upcoming.map((item, index) => (
            <button className="schedule-item" type="button" key={item.id} onClick={() => onEdit(item)}>
              <span className={`schedule-dot ${scheduleTone(index)}`} />
              <span>
                <small>{reminderDayLabel(item.reminderAt)} {reminderTimeLabel(item.reminderAt)}</small>
                <strong>{item.company}</strong>
                <em>{item.nextStep || item.role}</em>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="schedule-empty">
          <p>近期没有安排</p>
          <span>新增或编辑记录时，可以设置提醒时间。</span>
        </div>
      )}
    </aside>
  )
}
