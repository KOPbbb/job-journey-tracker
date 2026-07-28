import { useEffect, useRef, useState } from 'react'
import { FileText, Upload, X } from 'lucide-react'

const EMPTY_FORM = { name: '', notes: '', file: null }

export function ResumeModal({ open, resume, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const nameRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setForm({ name: resume?.name ?? '', notes: resume?.notes ?? '', file: null })
    setError('')
    const focusTimer = window.setTimeout(() => nameRef.current?.focus(), 50)
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
  }, [onClose, open, resume])

  if (!open) return null

  const chooseFile = (event) => {
    const file = event.target.files?.[0] ?? null
    setForm((current) => ({
      ...current,
      file,
      name: current.name || file?.name.replace(/\.(pdf|docx?)$/i, '') || '',
    }))
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('请填写便于识别的版本名称。')
      return
    }
    if (!resume && !form.file) {
      setError('请选择要上传的简历文件。')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave(form)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '保存简历失败，请重试。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !saving) onClose()
      }}
    >
      <section className="application-modal resume-modal" role="dialog" aria-modal="true" aria-labelledby="resume-modal-title">
        <div className="modal-heading">
          <div>
            <h2 id="resume-modal-title">{resume ? '编辑简历版本' : '上传简历版本'}</h2>
            <p>给每一份简历起个清楚的名字，投递时就不会选错。</p>
          </div>
          <button className="icon-button modal-close" type="button" aria-label="关闭" onClick={onClose} disabled={saving}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit}>
          <label className="field">
            <span>版本名称<b aria-hidden="true">*</b></span>
            <input
              ref={nameRef}
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="例如：产品经理版 / 运营版 V2"
            />
          </label>

          <label className="resume-file-picker">
            <input type="file" accept=".pdf,.doc,.docx,application/pdf" onChange={chooseFile} />
            <span className="resume-picker-icon"><Upload size={22} /></span>
            <span>
              <strong>{form.file?.name ?? resume?.fileName ?? '选择 PDF 或 Word 文件'}</strong>
              <small>{resume && !form.file ? '不选择新文件则保留当前文件' : '最大 20MB，仅保存在这台电脑上'}</small>
            </span>
          </label>

          <label className="field">
            <span>版本说明</span>
            <textarea
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="例如：突出增长项目，适合互联网产品岗位"
              rows={3}
            />
          </label>

          {resume ? (
            <div className="current-file-note">
              <FileText size={16} /> 当前文件：{resume.fileName}
            </div>
          ) : null}

          {error ? <p className="form-error" role="alert">{error}</p> : null}

          <div className="modal-actions">
            <button className="button secondary" type="button" onClick={onClose} disabled={saving}>取消</button>
            <button className="button primary" type="submit" disabled={saving}>
              {saving ? '正在保存…' : resume ? '保存修改' : '保存简历'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
