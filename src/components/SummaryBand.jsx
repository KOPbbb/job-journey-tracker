import { Clock3, Gift, Send, UsersRound } from 'lucide-react'

const METRIC_CONFIG = [
  { key: 'month', label: '本月投递', icon: Send, tone: 'blue' },
  { key: 'interviews', label: '面试进行中', icon: UsersRound, tone: 'mint' },
  { key: 'followUps', label: '待跟进', icon: Clock3, tone: 'amber' },
  { key: 'offers', label: '收到 Offer', icon: Gift, tone: 'violet' },
]

export function SummaryBand({ metrics }) {
  return (
    <section className="summary-band" aria-label="求职进度概览">
      {METRIC_CONFIG.map((item) => {
        const Icon = item.icon
        return (
          <div className="summary-item" key={item.key}>
            <div className={`summary-icon ${item.tone}`} aria-hidden="true">
              <Icon size={24} strokeWidth={1.8} />
            </div>
            <div>
              <p>{item.label}</p>
              <strong>{metrics[item.key]}</strong>
            </div>
          </div>
        )
      })}
    </section>
  )
}
