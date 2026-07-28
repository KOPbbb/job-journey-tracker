const DATE_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  month: 'numeric',
  day: 'numeric',
})

const TIME_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export function toLocalDateInput(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export function formatShortDate(value) {
  if (!value) return '—'
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  return `${month}月${day}日`
}

export function formatReminder(value) {
  if (!value) return '暂未安排'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${DATE_FORMATTER.format(date)} ${TIME_FORMATTER.format(date)}`
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function reminderDayLabel(value, now = new Date()) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const dayDistance = Math.round((startOfDay(date) - startOfDay(now)) / 86_400_000)
  if (dayDistance === 0) return '今天'
  if (dayDistance === 1) return '明天'
  if (dayDistance === -1) return '昨天'
  return DATE_FORMATTER.format(date)
}

export function reminderTimeLabel(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return TIME_FORMATTER.format(date)
}

export function isSameMonth(value, now = new Date()) {
  if (!value) return false
  const [year, month] = value.split('-').map(Number)
  return year === now.getFullYear() && month === now.getMonth() + 1
}

export function isSoon(value, now = new Date()) {
  if (!value) return false
  const date = new Date(value)
  const distance = date.getTime() - now.getTime()
  return distance > -60 * 60 * 1000 && distance < 3 * 24 * 60 * 60 * 1000
}
