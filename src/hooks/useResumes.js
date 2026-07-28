import { useCallback, useEffect, useState } from 'react'

const DATABASE_NAME = 'job-journey-resumes'
const DATABASE_VERSION = 2
const STORE_NAME = 'resumes'
const MAX_FILE_SIZE = 20 * 1024 * 1024

let databasePromise

function openDatabase() {
  if (databasePromise) return databasePromise
  databasePromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      // Schema changes are additive: existing resume files are never cleared during an update.
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => {
      const database = request.result
      database.onversionchange = () => {
        database.close()
        databasePromise = undefined
      }
      resolve(database)
    }
    request.onerror = () => reject(request.error ?? new Error('无法打开本地简历库。'))
  })
  return databasePromise
}

function waitForRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('本地简历操作失败。'))
  })
}

async function getStore(mode) {
  const database = await openDatabase()
  return database.transaction(STORE_NAME, mode).objectStore(STORE_NAME)
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `resume-${Date.now()}`
}

function withoutFile(record) {
  const { file: _file, ...metadata } = record
  return metadata
}

async function listResumeMetadata() {
  const store = await getStore('readonly')
  const records = await waitForRequest(store.getAll())
  return records
    .map(withoutFile)
    .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

async function readResume(id) {
  const store = await getStore('readonly')
  return waitForRequest(store.get(id))
}

async function saveResume(record) {
  const store = await getStore('readwrite')
  await waitForRequest(store.put(record))
}

async function removeResume(id) {
  const store = await getStore('readwrite')
  await waitForRequest(store.delete(id))
}

function assertValidFile(file) {
  if (!file) throw new Error('请选择要上传的简历文件。')
  if (file.size > MAX_FILE_SIZE) throw new Error('简历文件不能超过 20MB。')
  const extension = file.name.split('.').pop()?.toLocaleLowerCase('zh-CN')
  if (!['pdf', 'doc', 'docx'].includes(extension)) {
    throw new Error('目前支持 PDF、DOC 和 DOCX 文件。')
  }
}

export function useResumes() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    const items = await listResumeMetadata()
    setResumes(items)
    return items
  }, [])

  useEffect(() => {
    let active = true
    listResumeMetadata()
      .then((items) => {
        if (active) setResumes(items)
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : '无法读取本地简历库。')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const addResume = useCallback(async ({ name, notes, file }) => {
    assertValidFile(file)
    const now = new Date().toISOString()
    const record = {
      id: makeId(),
      name: name.trim(),
      notes: notes.trim(),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      createdAt: now,
      updatedAt: now,
      file,
    }
    await saveResume(record)
    await refresh()
    return withoutFile(record)
  }, [refresh])

  const updateResume = useCallback(async (id, { name, notes, file }) => {
    const existing = await readResume(id)
    if (!existing) throw new Error('没有找到这份简历。')
    if (file) assertValidFile(file)
    const record = {
      ...existing,
      name: name.trim(),
      notes: notes.trim(),
      fileName: file?.name ?? existing.fileName,
      fileType: file?.type ?? existing.fileType,
      fileSize: file?.size ?? existing.fileSize,
      updatedAt: new Date().toISOString(),
      file: file ?? existing.file,
    }
    await saveResume(record)
    await refresh()
    return withoutFile(record)
  }, [refresh])

  const deleteResume = useCallback(async (id) => {
    await removeResume(id)
    await refresh()
  }, [refresh])

  const downloadResume = useCallback(async (id) => {
    const record = await readResume(id)
    if (!record?.file) throw new Error('没有找到这份简历文件。')
    const url = URL.createObjectURL(record.file)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = record.fileName
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
  }, [])

  const openResume = useCallback(async (id) => {
    const record = await readResume(id)
    if (!record?.file) throw new Error('没有找到这份简历文件。')
    const extension = record.fileName.split('.').pop()?.toLocaleLowerCase('zh-CN')
    if (extension !== 'pdf') {
      const url = URL.createObjectURL(record.file)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = record.fileName
      anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
      return
    }
    const url = URL.createObjectURL(record.file)
    window.open(url, '_blank', 'noopener,noreferrer')
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }, [])

  return {
    resumes,
    loading,
    error,
    addResume,
    updateResume,
    deleteResume,
    downloadResume,
    openResume,
  }
}
