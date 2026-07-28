import { ArrowRight, BarChart3, Building2 } from 'lucide-react'
import { ACTIVE_INTERVIEW_STATUSES } from '../data/constants.js'

function getTopChannels(applications) {
  const counts = new Map()
  for (const item of applications) {
    const channel = item.channel || '未填写'
    counts.set(channel, (counts.get(channel) ?? 0) + 1)
  }
  return [...counts.entries()].toSorted((a, b) => b[1] - a[1]).slice(0, 6)
}

export function StatsView({ applications }) {
  const total = applications.length
  const sent = applications.filter((item) => item.status !== '准备投递').length
  const interviews = applications.filter((item) => ACTIVE_INTERVIEW_STATUSES.has(item.status)).length
  const offers = applications.filter((item) => item.status === 'Offer').length
  const channels = getTopChannels(applications)
  const maxChannel = Math.max(...channels.map(([, count]) => count), 1)
  const responseRate = sent ? Math.round(((interviews + offers) / sent) * 100) : 0

  const funnel = [
    ['全部机会', total],
    ['已经投递', sent],
    ['进入笔面试', interviews + offers],
    ['收到 Offer', offers],
  ]

  return (
    <div className="stats-layout">
      <section className="stats-primary">
        <div className="section-heading-row">
          <div>
            <h2>求职漏斗</h2>
            <p>从准备投递到 Offer，看看机会都走到了哪里。</p>
          </div>
          <span className="rate-callout">
            <strong>{responseRate}%</strong>
            <small>笔面试转化</small>
          </span>
        </div>

        <div className="funnel-list">
          {funnel.map(([label, count], index) => (
            <div className="funnel-row" key={label}>
              <span>{label}</span>
              <div className="funnel-track">
                <span style={{ width: `${total ? Math.max((count / total) * 100, count ? 8 : 0) : 0}%` }} />
              </div>
              <strong>{count}</strong>
              {index < funnel.length - 1 ? <ArrowRight size={15} aria-hidden="true" /> : <span className="funnel-spacer" />}
            </div>
          ))}
        </div>
      </section>

      <section className="stats-secondary">
        <div className="section-heading-row compact-heading">
          <div>
            <h2>投递渠道</h2>
            <p>哪些渠道带来了更多机会。</p>
          </div>
          <BarChart3 size={22} />
        </div>
        {channels.length ? (
          <div className="channel-list">
            {channels.map(([channel, count]) => (
              <div className="channel-row" key={channel}>
                <span>{channel}</span>
                <div><i style={{ width: `${(count / maxChannel) * 100}%` }} /></div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="plain-empty">有投递记录后，这里会显示渠道分布。</p>
        )}
      </section>

      <section className="stats-note">
        <Building2 size={22} />
        <div>
          <strong>{new Set(applications.map((item) => item.company)).size} 家企业</strong>
          <p>每次更新状态，统计都会自动变化，不需要额外维护。</p>
        </div>
      </section>
    </div>
  )
}
