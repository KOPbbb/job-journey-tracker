import { Download, Eye, FileText, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'

function formatFileSize(bytes) {
  if (!bytes) return '0 KB'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatUpdatedAt(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date)
}

export function ResumeLibrary({
  resumes,
  loading,
  error,
  usageCounts,
  onAdd,
  onEdit,
  onOpen,
  onDownload,
  onDelete,
}) {
  return (
    <div className="resume-library">
      <section className="resume-library-intro">
        <span className="resume-library-icon"><ShieldCheck size={24} /></span>
        <div>
          <h2>本地简历库</h2>
          <p>文件只保存在这台电脑的浏览器中。每次投递时选择版本，以后就能准确回看。</p>
        </div>
        <strong>{resumes.length} 个版本</strong>
      </section>

      {error ? <p className="resume-library-error" role="alert">{error}</p> : null}

      {loading ? (
        <div className="resume-loading">正在读取本地简历…</div>
      ) : resumes.length === 0 ? (
        <div className="resume-empty">
          <span><FileText size={31} /></span>
          <h3>还没有简历版本</h3>
          <p>先上传你现在使用的简历，之后新增投递时就可以直接选择。</p>
          <button className="button primary" type="button" onClick={onAdd}><Plus size={17} />上传第一份简历</button>
        </div>
      ) : (
        <div className="resume-table-wrap">
          <table className="resume-table">
            <thead>
              <tr>
                <th>版本名称</th>
                <th>文件</th>
                <th>已用于</th>
                <th>更新时间</th>
                <th>说明</th>
                <th aria-label="操作" />
              </tr>
            </thead>
            <tbody>
              {resumes.map((resume) => (
                <tr key={resume.id}>
                  <td>
                    <button className="resume-name-button" type="button" onClick={() => onOpen(resume)}>
                      <span><FileText size={18} /></span>
                      <strong>{resume.name}</strong>
                    </button>
                  </td>
                  <td>
                    <div className="resume-file-meta">
                      <span>{resume.fileName}</span>
                      <small>{formatFileSize(resume.fileSize)}</small>
                    </div>
                  </td>
                  <td>{usageCounts.get(resume.id) ?? 0} 次投递</td>
                  <td>{formatUpdatedAt(resume.updatedAt)}</td>
                  <td><span className="resume-notes">{resume.notes || '—'}</span></td>
                  <td>
                    <div className="resume-row-actions">
                      <button type="button" aria-label={`查看 ${resume.name}`} onClick={() => onOpen(resume)}><Eye size={16} /></button>
                      <button type="button" aria-label={`下载 ${resume.name}`} onClick={() => onDownload(resume)}><Download size={16} /></button>
                      <button type="button" aria-label={`编辑 ${resume.name}`} onClick={() => onEdit(resume)}><Pencil size={16} /></button>
                      <button className="danger" type="button" aria-label={`删除 ${resume.name}`} onClick={() => onDelete(resume)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
