import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronDown, X } from 'lucide-react'
import { CHANNELS, STATUSES } from '../data/constants.js'
import { toLocalDateInput } from '../utils/format.js'

const EMPTY_FORM = {
  company: '',
  role: '',
  status: '已投递',
  appliedDate: '',
  channel: '',
  location: '',
  link: '',
  nextStep: '',
  reminderAt: '',
  resumeId: '',
  notes: '',
}

function Field({ label, required, className = '', children }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}{required ? <b aria-hidden="true">*</b> : null}</span>
      {children}
    </label>
  )
}

export function ApplicationModal({ open, application, initialAppliedDate, resumes, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const firstInputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setForm({
      ...EMPTY_FORM,
      appliedDate: initialAppliedDate || toLocalDateInput(),
      ...application,
    })
    setError('')
    const focusTimer = window.setTimeout(() => firstInputRef.current?.focus(), 50)
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.classList.add('modal-open')
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('modal-open')
    }
  }, [application, initialAppliedDate, onClose, open])

  if (!open) return null

  const update = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const submit = (event) => {
    event.preventDefault()
    if (!form.company.trim() || !form.role.trim()) {
      setError('请填写企业名称和岗位名称。')
      return
    }
    onSave({
      ...form,
      company: form.company.trim(),
      role: form.role.trim(),
      channel: form.channel.trim(),
      location: form.location.trim(),
      link: form.link.trim(),
      nextStep: form.nextStep.trim(),
      notes: form.notes.trim(),
    })
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose()
      }}
    >
      <section className="application-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading">
          <div>
            <h2 id="modal-title">{application ? '编辑投递' : '新增投递'}</h2>
            <p>{application ? '更新这次机会的最新进展。' : '记录这次机会，之后就不会忘记。'}</p>
          </div>
          <button className="icon-button modal-close" type="button" aria-label="关闭" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="form-grid">
            <Field label="企业名称" required>
              <input
                ref={firstInputRef}
                name="company"
                value={form.company}
                onChange={update}
                placeholder="例如：字节跳动"
                autoComplete="organization"
              />
            </Field>
            <Field label="岗位名称" required>
              <input name="role" value={form.role} onChange={update} placeholder="例如：产品经理" />
            </Field>

            <Field label="当前状态">
              <span className="select-wrap">
                <select name="status" value={form.status} onChange={update}>
                  {STATUSES.map((status) => <option key={status}>{status}</option>)}
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </span>
            </Field>
            <Field label="投递日期">
              <span className="date-wrap">
                <input type="date" name="appliedDate" value={form.appliedDate} onChange={update} />
                <CalendarDays size={17} aria-hidden="true" />
              </span>
            </Field>

            <Field label="招聘渠道">
              <span className="select-wrap">
                <select name="channel" value={form.channel} onChange={update}>
                  <option value="">选择渠道</option>
                  {CHANNELS.map((channel) => <option key={channel}>{channel}</option>)}
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </span>
            </Field>
            <Field label="工作地点">
              <input name="location" value={form.location} onChange={update} placeholder="例如：上海" />
            </Field>

            <Field label="岗位链接" className="full-field">
              <input type="url" name="link" value={form.link} onChange={update} placeholder="粘贴招聘页面链接" />
            </Field>

            <Field label="下一步安排">
              <input name="nextStep" value={form.nextStep} onChange={update} placeholder="例如：一面或跟进进度" />
            </Field>
            <Field label="提醒时间（可选）">
              <input type="datetime-local" name="reminderAt" value={form.reminderAt} onChange={update} />
            </Field>

            <Field label="使用的简历版本" className="full-field">
              <span className="select-wrap">
                <select name="resumeId" value={form.resumeId} onChange={update}>
                  <option value="">{resumes.length ? '选择这次投递使用的简历' : '还没有上传简历版本'}</option>
                  {resumes.map((resume) => (
                    <option value={resume.id} key={resume.id}>{resume.name} · {resume.fileName}</option>
                  ))}
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </span>
              {resumes.length === 0 ? <small className="field-help">可先到左侧“简历版本”上传文件。</small> : null}
            </Field>

            <Field label="备注" className="full-field">
              <textarea
                name="notes"
                value={form.notes}
                onChange={update}
                placeholder="记录联系人、面试准备或其他信息"
                rows={3}
              />
            </Field>
          </div>

          {error ? <p className="form-error" role="alert">{error}</p> : null}

          <div className="modal-actions">
            <button className="button secondary" type="button" onClick={onClose}>取消</button>
            <button className="button primary" type="submit">{application ? '保存修改' : '保存投递'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
