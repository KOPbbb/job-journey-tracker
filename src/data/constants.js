export const STATUSES = [
  '准备投递',
  '已投递',
  '笔试',
  '一面',
  '二面',
  '终面',
  'Offer',
  '拒绝',
  '已结束',
]

export const ACTIVE_INTERVIEW_STATUSES = new Set(['笔试', '一面', '二面', '终面'])
export const CLOSED_STATUSES = new Set(['Offer', '拒绝', '已结束'])

export const CHANNELS = [
  'Boss直聘',
  '官网',
  '内推',
  '实习僧',
  '拉勾',
  '猎聘',
  'LinkedIn',
  '其他',
]

export const STATUS_META = {
  准备投递: { tone: 'sky', short: '准备' },
  已投递: { tone: 'slate', short: '已投递' },
  笔试: { tone: 'amber', short: '笔试' },
  一面: { tone: 'blue', short: '一面' },
  二面: { tone: 'indigo', short: '二面' },
  终面: { tone: 'violet', short: '终面' },
  Offer: { tone: 'mint', short: 'Offer' },
  拒绝: { tone: 'rose', short: '拒绝' },
  已结束: { tone: 'slate', short: '结束' },
}
