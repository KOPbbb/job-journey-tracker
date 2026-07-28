const EXPORT_FIELDS = [
  ['企业名称', 'company'],
  ['岗位名称', 'role'],
  ['当前状态', 'status'],
  ['投递日期', 'appliedDate'],
  ['招聘渠道', 'channel'],
  ['工作地点', 'location'],
  ['岗位链接', 'link'],
  ['下一步安排', 'nextStep'],
  ['提醒时间', 'reminderAt'],
  ['简历版本ID', 'resumeId'],
  ['备注', 'notes'],
]

function escapeCsv(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function fileStamp() {
  return new Date().toISOString().slice(0, 10)
}

export function exportCsv(applications) {
  const header = EXPORT_FIELDS.map(([label]) => escapeCsv(label)).join(',')
  const rows = applications.map((application) =>
    EXPORT_FIELDS.map(([, key]) => escapeCsv(application[key])).join(','),
  )
  downloadFile(
    `\uFEFF${[header, ...rows].join('\n')}`,
    `求职轨迹-${fileStamp()}.csv`,
    'text/csv;charset=utf-8',
  )
}

export function exportJson(applications) {
  downloadFile(
    JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), applications }, null, 2),
    `求职轨迹-备份-${fileStamp()}.json`,
    'application/json;charset=utf-8',
  )
}

function parseCsvRows(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]
    if (char === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(cell)
      cell = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1
      row.push(cell)
      if (row.some(Boolean)) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  row.push(cell)
  if (row.some(Boolean)) rows.push(row)
  return rows
}

export async function importDataFile(file) {
  const text = (await file.text()).replace(/^\uFEFF/, '')

  if (file.name.toLowerCase().endsWith('.json')) {
    const parsed = JSON.parse(text)
    const applications = Array.isArray(parsed) ? parsed : parsed.applications
    if (!Array.isArray(applications)) throw new Error('备份文件中没有可用的投递记录。')
    return applications
  }

  const rows = parseCsvRows(text)
  if (rows.length < 2) throw new Error('CSV 文件中没有可导入的记录。')
  const header = rows[0]
  const fieldByLabel = new Map(EXPORT_FIELDS)
  return rows.slice(1).map((cells) => {
    const item = {}
    header.forEach((label, index) => {
      const key = fieldByLabel.get(label.trim())
      if (key) item[key] = cells[index] ?? ''
    })
    return item
  }).filter((item) => item.company && item.role)
}
