import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectStore } from './project'
import { PROJECT_SCHEMA_VERSION, APPLICATION_ID } from './types'

const emptyCase = (caseId: string) => ({
  caseId, screening: {}, assessments: {}, validation: {}, evidence: [],
  updatedAt: new Date().toISOString(),
})

describe('project import after the ABCD Scorecard rename', () => {
  beforeEach(() => useProjectStore.setState({ cases: {}, activeCaseId: null }))

  it('writes the new application id on export', () => {
    useProjectStore.setState({ cases: { c1: emptyCase('c1') } })
    expect(useProjectStore.getState().exportProject().application).toBe(APPLICATION_ID)
    expect(APPLICATION_ID).toBe('ABCD-SCORECARD')
  })

  it('accepts a file exported by this build', () => {
    useProjectStore.setState({ cases: { c1: emptyCase('c1') } })
    const payload = useProjectStore.getState().exportProject()
    useProjectStore.setState({ cases: {} })
    expect(useProjectStore.getState().importProject(payload)).toEqual({ ok: true, cases: 1 })
  })

  it('still accepts a pre-rename ABCDS-RF export', () => {
    const legacy = {
      schemaVersion: PROJECT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      application: 'ABCDS-RF',
      cases: { old: emptyCase('old') },
    }
    expect(useProjectStore.getState().importProject(legacy)).toEqual({ ok: true, cases: 1 })
    expect(Object.keys(useProjectStore.getState().cases)).toEqual(['old'])
  })

  it('rejects a file from some other application', () => {
    const alien = {
      schemaVersion: PROJECT_SCHEMA_VERSION, exportedAt: '', application: 'SOMETHING-ELSE', cases: {},
    }
    expect(useProjectStore.getState().importProject(alien).ok).toBe(false)
  })

  it('syncValidation is a no-op when nothing changed, so the queue cannot loop', () => {
    useProjectStore.setState({ cases: { c1: emptyCase('c1') } })
    const derived = [{ id: 'c1:v1:HUM-1:missing-evidence', tier: 'P-R' }] as never[]
    const s = useProjectStore.getState()
    s.syncValidation('c1', derived)
    const after1 = useProjectStore.getState().cases
    useProjectStore.getState().syncValidation('c1', derived)
    // Identical input must not allocate a new cases object.
    expect(useProjectStore.getState().cases).toBe(after1)
  })
})
