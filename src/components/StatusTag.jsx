import { STATUS_META } from '../data/constants.js'

export function StatusTag({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META['已投递']
  return <span className={`status-tag ${meta.tone}`}>{status}</span>
}
