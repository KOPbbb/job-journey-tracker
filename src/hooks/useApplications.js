import { useCallback, useEffect, useRef, useState } from 'react'
import {
  allowApplicationWrites,
  loadApplications,
  persistApplications,
} from '../utils/applicationStorage.js'

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `application-${Date.now()}`
}

export function useApplications() {
  const [initialStorage] = useState(() => loadApplications(window.localStorage))
  const [applications, setApplications] = useState(initialStorage.applications)
  const canPersistRef = useRef(initialStorage.canPersist)

  useEffect(() => {
    if (canPersistRef.current) persistApplications(window.localStorage, applications)
  }, [applications])

  const prepareWrite = useCallback(() => {
    if (!canPersistRef.current) {
      allowApplicationWrites(window.localStorage)
      canPersistRef.current = true
    }
  }, [])

  const addApplication = useCallback((values) => {
    prepareWrite()
    const now = new Date().toISOString()
    const next = {
      ...values,
      id: makeId(),
      createdAt: now,
      updatedAt: now,
    }
    setApplications((current) => [next, ...current])
    return next
  }, [prepareWrite])

  const updateApplication = useCallback((id, values) => {
    prepareWrite()
    setApplications((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, ...values, id, updatedAt: new Date().toISOString() }
          : item,
      ),
    )
  }, [prepareWrite])

  const deleteApplication = useCallback((id) => {
    prepareWrite()
    setApplications((current) => current.filter((item) => item.id !== id))
  }, [prepareWrite])

  const replaceApplications = useCallback((nextApplications) => {
    prepareWrite()
    setApplications(
      nextApplications.map((item) => ({
        ...item,
        id: item.id || makeId(),
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    )
  }, [prepareWrite])

  const clearApplications = useCallback(() => {
    prepareWrite()
    setApplications([])
  }, [prepareWrite])

  return {
    applications,
    addApplication,
    updateApplication,
    deleteApplication,
    replaceApplications,
    clearApplications,
    recoveryMessage: initialStorage.recoveryMessage,
  }
}
