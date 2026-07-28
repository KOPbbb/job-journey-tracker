import { useRef, useState } from 'react'
import {
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  Trash2,
  Upload,
} from 'lucide-react'
import { exportCsv, exportJson, importDataFile } from '../utils/dataTransfer.js'

export function BackupView({ applications, onReplace, onClear, onNotify }) {
  const fileRef = useRef(null)
  const [importing, setImporting] = useState(false)

  const importFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setImporting(true)
    try {
      const items = await importDataFile(file)
      if (!items.length) throw new Error('文件中没有完整的企业和岗位记录。')
      onReplace(items)
      onNotify(`已导入 ${items.length} 条投递记录`)
    } catch (error) {
      onNotify(error instanceof Error ? error.message : '导入失败，请检查文件格式。', 'error')
    } finally {
      setImporting(false)
    }
  }

  const clearAll = () => {
    if (!window.confirm('确定清空全部投递记录吗？建议先导出 JSON 备份。')) return
    onClear()
    onNotify('全部记录已清空')
  }

  return (
    <div className="backup-layout">
      <section className="backup-intro">
        <span className="backup-icon"><Database size={25} /></span>
        <div>
          <h2>数据在你的电脑里</h2>
          <p>软件不会上传你的求职信息。JSON 备份投递记录；简历文件可在“简历版本”中分别下载。</p>
        </div>
        <strong>{applications.length} 条记录</strong>
      </section>

      <div className="backup-actions-grid">
        <section className="backup-section">
          <div className="backup-section-heading">
            <FileSpreadsheet size={21} />
            <div><h3>导出表格</h3><p>用 Excel、Numbers 或 WPS 打开。</p></div>
          </div>
          <button className="button secondary" type="button" onClick={() => exportCsv(applications)} disabled={!applications.length}>
            <Download size={17} /> 下载 CSV
          </button>
        </section>

        <section className="backup-section">
          <div className="backup-section-heading">
            <FileJson size={21} />
            <div><h3>投递数据备份</h3><p>保留投递字段和简历版本关联，方便以后恢复。</p></div>
          </div>
          <button className="button secondary" type="button" onClick={() => exportJson(applications)} disabled={!applications.length}>
            <Download size={17} /> 下载 JSON
          </button>
        </section>

        <section className="backup-section wide-backup-section">
          <div className="backup-section-heading">
            <Upload size={21} />
            <div><h3>导入或恢复</h3><p>支持本软件导出的 JSON 和 CSV，导入后会替换当前记录。</p></div>
          </div>
          <button className="button primary" type="button" onClick={() => fileRef.current?.click()} disabled={importing}>
            <Upload size={17} /> {importing ? '正在导入…' : '选择备份文件'}
          </button>
          <input ref={fileRef} className="visually-hidden" type="file" accept=".json,.csv,application/json,text/csv" onChange={importFile} />
        </section>
      </div>

      <section className="data-maintenance">
        <div>
          <h3>数据维护</h3>
          <p>清空投递记录不会删除简历库里的文件；清空操作无法撤销。</p>
        </div>
        <div>
          <button className="button danger-button" type="button" onClick={clearAll} disabled={!applications.length}><Trash2 size={16} /> 清空全部</button>
        </div>
      </section>
    </div>
  )
}
