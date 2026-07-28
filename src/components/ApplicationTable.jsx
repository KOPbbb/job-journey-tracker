import { useEffect, useRef, useState } from 'react'
import { ExternalLink, FileText, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { formatReminder, formatShortDate } from '../utils/format.js'
import { EmptyState } from './EmptyState.jsx'
import { StatusTag } from './StatusTag.jsx'

function RowMenu({ application, onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const close = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  return (
    <div className="row-menu" ref={wrapperRef}>
      <button
        className="icon-button"
        type="button"
        aria-label={`操作 ${application.company}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal size={21} />
      </button>
      {open ? (
        <div className="row-menu-popover">
          <button type="button" onClick={() => { setOpen(false); onEdit(application) }}>
            <Pencil size={15} /> 编辑记录
          </button>
          {application.link ? (
            <a href={application.link} target="_blank" rel="noreferrer">
              <ExternalLink size={15} /> 打开岗位链接
            </a>
          ) : null}
          <button className="danger" type="button" onClick={() => { setOpen(false); onDelete(application) }}>
            <Trash2 size={15} /> 删除记录
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function ApplicationTable({ applications, resumeNames, filtered, onAdd, onEdit, onDelete }) {
  if (applications.length === 0) {
    return <EmptyState filtered={filtered} onAdd={onAdd} />
  }

  return (
    <div className="table-wrap">
      <table className="application-table">
        <thead>
          <tr>
            <th>企业与岗位</th>
            <th>状态</th>
            <th>投递日期</th>
            <th>下一步</th>
            <th>简历版本</th>
            <th>渠道</th>
            <th aria-label="操作" />
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id} onDoubleClick={() => onEdit(application)}>
              <td>
                <button className="company-cell" type="button" onClick={() => onEdit(application)}>
                  <strong>{application.company}</strong>
                  <span>{application.role}{application.location ? ` · ${application.location}` : ''}</span>
                </button>
              </td>
              <td><StatusTag status={application.status} /></td>
              <td>{formatShortDate(application.appliedDate)}</td>
              <td>
                <div className="next-step-cell">
                  <span>{application.nextStep || '暂未安排'}</span>
                  {application.reminderAt ? <small>{formatReminder(application.reminderAt)}</small> : null}
                </div>
              </td>
              <td>
                {application.resumeId && resumeNames.has(application.resumeId) ? (
                  <span className="resume-version-tag"><FileText size={13} />{resumeNames.get(application.resumeId)}</span>
                ) : <span className="unlinked-resume">未关联</span>}
              </td>
              <td>{application.channel || '—'}</td>
              <td>
                <RowMenu application={application} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
