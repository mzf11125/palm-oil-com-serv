/**
 * The module list, shared by the workspace tab bar and the landing page.
 *
 * Both surfaces describe the same workflow, so they read one list rather than
 * keeping parallel copies that drift the first time a module is renamed.
 */

export type ModuleKey =
  | 'concessions'
  | 'screening'
  | 'portfolio'
  | 'scorecard'
  | 'validation'
  | 'evidence'
  | 'dictionary'
  | 'exports'

export interface ModuleEntry {
  key: ModuleKey
  /** Present only on the five numbered workflow steps. */
  step?: number
}

/**
 * Order follows the method's own workflow: concession -> candidate universe ->
 * portfolio -> assessment -> validation. Reference modules sit after the
 * working ones and carry no step number.
 */
export const MODULES: ModuleEntry[] = [
  { key: 'concessions', step: 1 },
  { key: 'screening', step: 2 },
  { key: 'portfolio', step: 3 },
  { key: 'scorecard', step: 4 },
  { key: 'validation', step: 5 },
  { key: 'evidence' },
  { key: 'dictionary' },
  { key: 'exports' },
]

/** The five numbered steps, in order. */
export const WORKFLOW_STEPS = MODULES.filter(
  (m): m is ModuleEntry & { step: number } => m.step !== undefined,
)

/** Reference modules that support the workflow without being a step in it. */
export const REFERENCE_MODULES = MODULES.filter((m) => m.step === undefined)
