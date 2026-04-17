import { useEffect, useMemo, useState } from 'react'
import { siteData } from '../content/siteData'

const STORAGE_KEY = 'portfolio-admin-data-v1'
const UPDATE_EVENT = 'portfolio-data-updated-v1'

function safeParse(json) {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

function mergeData(defaultData, overrides) {
  if (!overrides || typeof overrides !== 'object') return defaultData

  return {
    ...defaultData,
    ...overrides,
    about: { ...(defaultData.about ?? {}), ...(overrides.about ?? {}) },
    contact: { ...(defaultData.contact ?? {}), ...(overrides.contact ?? {}) },
    skills: Array.isArray(overrides.skills) ? overrides.skills : defaultData.skills,
    projects: Array.isArray(overrides.projects) ? overrides.projects : defaultData.projects,
    timeline: Array.isArray(overrides.timeline) ? overrides.timeline : defaultData.timeline,
    social: Array.isArray(overrides.social) ? overrides.social : defaultData.social,
    headlinePhrases: Array.isArray(overrides.headlinePhrases) ? overrides.headlinePhrases : defaultData.headlinePhrases,
  }
}

export function usePortfolioData() {
  const defaultData = useMemo(() => siteData, [])
  const [data, setData] = useState(defaultData)

  useEffect(() => {
    const load = () => {
      const raw = window.localStorage?.getItem(STORAGE_KEY)
      if (!raw) {
        setData(defaultData)
        return
      }
      const parsed = safeParse(raw)
      setData(mergeData(defaultData, parsed))
    }

    load()

    const onUpdated = () => load()
    window.addEventListener(UPDATE_EVENT, onUpdated)
    return () => window.removeEventListener(UPDATE_EVENT, onUpdated)
  }, [defaultData])

  const saveOverrides = (overrides) => {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(overrides))
    window.dispatchEvent(new Event(UPDATE_EVENT))
  }

  const clearOverrides = () => {
    window.localStorage?.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event(UPDATE_EVENT))
  }

  return { data, saveOverrides, clearOverrides, STORAGE_KEY }
}

