export const APPLICATION_STORAGE_KEY = 'job-journey-tracker'
export const APPLICATION_STORAGE_VERSION = 3

const SAFETY_COPY_KEY = `${APPLICATION_STORAGE_KEY}:last-known-good`
const MIGRATION_SNAPSHOT_KEY = `${APPLICATION_STORAGE_KEY}:before-migration`

function parsePayload(raw) {
  if (!raw) return null
  try {
    const payload = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!payload || !Array.isArray(payload.applications)) return null
    return {
      version: Number.isInteger(payload.version) ? payload.version : 1,
      applications: payload.applications,
    }
  } catch {
    return null
  }
}

function saveSnapshot(storage, key, payload) {
  try {
    storage.setItem(key, JSON.stringify({ savedAt: new Date().toISOString(), payload }))
  } catch {
    // Storage can be full or unavailable. The primary data remains untouched.
  }
}

function readSafetyCopy(storage) {
  try {
    const saved = JSON.parse(storage.getItem(SAFETY_COPY_KEY) || 'null')
    return parsePayload(saved?.payload)
  } catch {
    return null
  }
}

export function loadApplications(storage) {
  const primaryRaw = storage.getItem(APPLICATION_STORAGE_KEY)
  const primary = parsePayload(primaryRaw)

  if (primary) {
    if (primary.version > APPLICATION_STORAGE_VERSION) {
      return {
        applications: primary.applications,
        canPersist: false,
        recoveryMessage: '',
      }
    }

    if (primary.version !== APPLICATION_STORAGE_VERSION) {
      saveSnapshot(storage, MIGRATION_SNAPSHOT_KEY, primary)
    }

    return {
      applications: primary.applications,
      canPersist: true,
      recoveryMessage: '',
    }
  }

  const safetyCopy = readSafetyCopy(storage)
  if (safetyCopy) {
    return {
      applications: safetyCopy.applications,
      canPersist: true,
      recoveryMessage: '已从本机安全副本恢复投递记录。',
    }
  }

  return {
    applications: [],
    canPersist: true,
    recoveryMessage: '',
  }
}

export function persistApplications(storage, applications) {
  const current = parsePayload(storage.getItem(APPLICATION_STORAGE_KEY))
  if (current) saveSnapshot(storage, SAFETY_COPY_KEY, current)

  storage.setItem(
    APPLICATION_STORAGE_KEY,
    JSON.stringify({ version: APPLICATION_STORAGE_VERSION, applications }),
  )
}

export function allowApplicationWrites(storage) {
  const current = parsePayload(storage.getItem(APPLICATION_STORAGE_KEY))
  if (current) saveSnapshot(storage, MIGRATION_SNAPSHOT_KEY, current)
}
