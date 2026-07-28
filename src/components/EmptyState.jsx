import { BriefcaseBusiness, Plus } from 'lucide-react'

export function EmptyState({ filtered = false, onAdd }) {
  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden="true">
        <BriefcaseBusiness size={30} strokeWidth={1.6} />
      </span>
      <h3>{filtered ? '没有找到符合条件的记录' : '从第一份投递开始记录'}</h3>
      <p>{filtered ? '试试调整搜索词或状态筛选。' : '企业、岗位和下一步安排都会留在这里。'}</p>
      {filtered ? null : (
        <button className="button secondary compact" type="button" onClick={onAdd}>
          <Plus size={17} />
          新增投递
        </button>
      )}
    </div>
  )
}
