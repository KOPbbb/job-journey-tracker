import assert from 'node:assert/strict'
import {
  APPLICATION_STORAGE_KEY,
  APPLICATION_STORAGE_VERSION,
  loadApplications,
  persistApplications,
} from '../src/utils/applicationStorage.js'

class MemoryStorage {
  #values = new Map()

  getItem(key) {
    return this.#values.get(key) ?? null
  }

  setItem(key, value) {
    this.#values.set(key, String(value))
  }
}

const legacyRecord = { id: 'legacy-1', company: '示例企业', role: '产品经理' }
const storage = new MemoryStorage()

storage.setItem(
  APPLICATION_STORAGE_KEY,
  JSON.stringify({ version: 2, applications: [legacyRecord] }),
)
const legacyLoad = loadApplications(storage)
assert.deepEqual(legacyLoad.applications, [legacyRecord])
assert.equal(legacyLoad.canPersist, true)

persistApplications(storage, legacyLoad.applications)
const currentPayload = JSON.parse(storage.getItem(APPLICATION_STORAGE_KEY))
assert.equal(currentPayload.version, APPLICATION_STORAGE_VERSION)
assert.deepEqual(currentPayload.applications, [legacyRecord])

storage.setItem(
  APPLICATION_STORAGE_KEY,
  JSON.stringify({ version: 99, applications: [legacyRecord] }),
)
const futureLoad = loadApplications(storage)
assert.equal(futureLoad.canPersist, false)
assert.deepEqual(futureLoad.applications, [legacyRecord])

console.log('数据迁移兼容性校验通过')
