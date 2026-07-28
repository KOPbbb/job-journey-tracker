import { useEffect, useMemo, useState } from 'react'
import {
  BellRing,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardPlus,
  ListFilter,
  Plus,
} from 'lucide-react'
import { toLocalDateInput } from '../utils/format.js'

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

function dateKey(date) {
  return toLocalDateInput(date)
}

function dateFromKey(key) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function dateFromReminder(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function monthCells(month) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const firstWeekday = (firstDay.getDay() + 6) % 7
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - firstWeekday)
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
    return {
      date: day,
      key: dateKey(day),
      inMonth: day.getMonth() === month.getMonth(),
    }
  })
}

function timeForEvent(event) {
  if (event.type !== 'reminder') return '投递'
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(event.date)
}

function selectedDateLabel(key) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(dateFromKey(key))
}

function buildEvents(applications) {
  const eventMap = new Map()
  const addEvent = (key, event) => {
    const current = eventMap.get(key) ?? []
    current.push(event)
    eventMap.set(key, current)
  }

  for (const application of applications) {
    if (application.appliedDate) {
      const date = dateFromKey(application.appliedDate)
      addEvent(application.appliedDate, {
        id: `${application.id}-applied`,
        type: 'applied',
        date,
        application,
        title: '投递岗位',
        detail: application.role,
      })
    }

    const reminderDate = dateFromReminder(application.reminderAt)
    if (reminderDate) {
      addEvent(dateKey(reminderDate), {
        id: `${application.id}-reminder`,
        type: 'reminder',
        date: reminderDate,
        application,
        title: application.nextStep || application.status,
        detail: application.role,
      })
    }
  }

  for (const events of eventMap.values()) {
    events.sort((left, right) => left.date - right.date)
  }
  return eventMap
}

export function DailyView({ applications, selectedDate, onDateChange, onViewDay, onAdd, onEdit }) {
  const todayKey = dateKey(new Date())
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const eventsByDate = useMemo(() => buildEvents(applications), [applications])
  const cells = useMemo(() => monthCells(visibleMonth), [visibleMonth])
  const selectedKey = selectedDate || todayKey
  const selectedEvents = eventsByDate.get(selectedKey) ?? []
  const monthTitle = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
  }).format(visibleMonth)

  useEffect(() => {
    if (!selectedDate) return
    const selected = dateFromKey(selectedDate)
    setVisibleMonth((current) => (
      current.getFullYear() === selected.getFullYear() && current.getMonth() === selected.getMonth()
        ? current
        : new Date(selected.getFullYear(), selected.getMonth(), 1)
    ))
  }, [selectedDate])

  const changeMonth = (offset) => {
    const next = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1)
    setVisibleMonth(next)
    onDateChange(dateKey(next))
  }

  const selectDay = (cell) => {
    if (!cell.inMonth) {
      setVisibleMonth(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1))
    }
    onDateChange(cell.key)
  }

  const selectToday = () => {
    const today = new Date()
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    onDateChange(dateKey(today))
  }

  return (
    <div className="daily-layout">
      <section className="calendar-panel" aria-label="每日安排日历">
        <div className="calendar-toolbar">
          <div>
            <h2>{monthTitle}</h2>
            <p>每天的投递与下一步安排，都集中在这里。</p>
          </div>
          <div className="calendar-actions">
            <button className="button ghost calendar-today" type="button" onClick={selectToday}>今天</button>
            <div className="month-switcher" aria-label="切换月份">
              <button type="button" aria-label="上个月" onClick={() => changeMonth(-1)}><ChevronLeft size={18} /></button>
              <button type="button" aria-label="下个月" onClick={() => changeMonth(1)}><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>

        <div className="calendar-weekdays" aria-hidden="true">
          {WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
        </div>
        <div className="calendar-grid">
          {cells.map((cell) => {
            const events = eventsByDate.get(cell.key) ?? []
            const selected = cell.key === selectedKey
            const today = cell.key === todayKey
            return (
              <button
                type="button"
                key={cell.key}
                className={`calendar-day ${cell.inMonth ? '' : 'outside'} ${selected ? 'selected' : ''} ${today ? 'today' : ''}`}
                aria-label={selectedDateLabel(cell.key)}
                aria-current={today ? 'date' : undefined}
                aria-pressed={selected}
                onClick={() => selectDay(cell)}
              >
                <span className="calendar-date-number">{cell.date.getDate()}</span>
                <span className="calendar-events">
                  {events.slice(0, 2).map((event) => (
                    <span className={`calendar-event ${event.type}`} key={event.id}>
                      {event.application.company}
                    </span>
                  ))}
                  {events.length > 2 ? <span className="calendar-more">+{events.length - 2}</span> : null}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <aside className="day-agenda" aria-label="选中日期的安排">
        <div className="agenda-heading">
          <div>
            <span>当日安排</span>
            <h2>{selectedDateLabel(selectedKey)}</h2>
          </div>
          <CalendarDays size={21} strokeWidth={1.8} />
        </div>

        {selectedEvents.length ? (
          <div className="agenda-list">
            {selectedEvents.map((event) => {
              const Icon = event.type === 'applied' ? ClipboardPlus : BellRing
              return (
                <button className={`agenda-item ${event.type}`} type="button" key={event.id} onClick={() => onEdit(event.application)}>
                  <span className="agenda-event-icon"><Icon size={17} /></span>
                  <span className="agenda-event-copy">
                    <small>{timeForEvent(event)} · {event.title}</small>
                    <strong>{event.application.company}</strong>
                    <em>{event.detail}</em>
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="agenda-empty">
            <span><CalendarDays size={25} /></span>
            <h3>这一天还没有安排</h3>
            <p>新增投递时设置投递日期或提醒时间，它就会出现在这里。</p>
            <button className="button secondary compact" type="button" onClick={() => onAdd(selectedKey)}><Plus size={16} />新增投递</button>
          </div>
        )}

        <button className="agenda-view-records" type="button" onClick={() => onViewDay(selectedKey)}>
          <ListFilter size={16} />只看这一天的信息
        </button>

        {selectedEvents.length ? (
          <button className="agenda-add" type="button" onClick={() => onAdd(selectedKey)}><Plus size={16} />在这一天新增投递</button>
        ) : null}
      </aside>
    </div>
  )
}
