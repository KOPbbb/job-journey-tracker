import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'job-journey-tracker'
const STORAGE_VERSION = 2

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const saved = JSON.parse(raw)
    if (saved.version !== STORAGE_VERSION || !Array.isArray(saved.applications)) {
      return []
    }
    return saved.applications
  } catch {
    return []
  }
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `application-${Date.now()}`
}

export function useApplications() {
  const [applications, setApplications] = useState(readStorage)

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, applications }),
    )
  }, [applications])

  const addApplication = useCallback((values) => {
    const now = new Date().toISOString()
    const next = {
      ...values,
      id: makeId(),
      createdAt: now,
      updatedAt: now,
    }
    setApplications((current) => [next, ...current])
    return next
  }, [])

  const updateApplication = useCallback((id, values) => {
    setApplications((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, ...values, id, updatedAt: new Date().toISOString() }
          : item,
      ),
    )
  }, [])

  const deleteApplication = useCallback((id) => {
    setApplications((current) => current.filter((item) => item.id !== id))
  }, [])

  const replaceApplications = useCallback((nextApplications) => {
    setApplications(
      nextApplications.map((item) => ({
        ...item,
        id: item.id || makeId(),
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    )
  }, [])

  const clearApplications = useCallback(() => {
    setApplications([])
  }, [])

  return {
    applications,
    addApplication,
    updateApplication,
    deleteApplication,
    replaceApplications,
    clearApplications,
  }
}
