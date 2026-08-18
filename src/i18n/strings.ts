/**
 * UI strings.
 *
 * The application is English-only. Method terminology (POCI, ABCD, the
 * component letters, evidence tiers) is deliberately left as-is: these are
 * defined terms in the source documents and rewording them would break
 * traceability back to the method.
 */

export const STRINGS = {
  appName: 'sawitAI ABCD Scorecard',
  appSubtitle: 'Remote-first ABCD scoring and POCI site selection',

  nav: {
    concessions: 'Concessions',
    screening: 'POCI Screening',
    portfolio: 'Portfolio',
    scorecard: 'ABCD Scorecard',
    validation: 'Validation Queue',
    evidence: 'Evidence Register',
    dictionary: 'Indicator Dictionary',
    exports: 'Exports & Report',
  },

  common: {
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    none: 'None',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    clear: 'Clear',
    notAssessed: 'Not assessed',
    na: 'NA',
    naFull: 'Evidence not available',
    village: 'Village',
    villages: 'Villages',
    population: 'Population',
    households: 'Households',
    distance: 'Distance',
    coverage: 'Evidence coverage',
    confidence: 'Confidence',
    typology: 'Typology',
    exposure: 'Exposure',
    score: 'Score',
    notes: 'Notes',
    evidenceNote: 'Evidence note',
    sources: 'Sources',
    tiers: 'Evidence tiers',
    selected: 'Selected',
    comparator: 'Comparator',
    suggestion: 'Suggestion',
    accept: 'Accept',
    override: 'Override',
    proposed: 'Proposed',
    required: 'Required',
    optional: 'Optional',
    loading: 'Loading…',
    of: 'of',
    showing: 'Showing',
  },

  exposureBands: {
    high: 'High',
    moderate: 'Moderate',
    unbanded: 'Unbanded',
    low: 'Low',
  },

  concessions: {
    title: 'Concession Explorer',
    intro:
      'Step 1: standardise the concession polygon and select an operational-area case cluster. The concession is the source of influence. The village is the principal unit of ABCD assessment.',
    province: 'Province',
    group: 'Group',
    legalStatus: 'Legal status',
    commodity: 'Commodity',
    area: 'Area',
    openCase: 'Open case cluster',
    noCaseCluster:
      'No candidate-village layer has been generated for this concession. Case clusters are produced by the upstream GIS workflow and extracted with `npm run extract`.',
    loadGeometry: 'Load province geometry',
    missingData:
      'The national concession layer has not been generated. Run `npm run extract` to build it from the source maps.',
  },

  screening: {
    title: 'POCI Screening',
    intro:
      'POCI is a screening instrument for how strongly a community is functionally linked to palm-oil operations. It does not measure community-development success and does not replace the ABCD Scorecard.',
    missingDataRule:
      'Unavailable data is never converted to a score of 0. Provisional POCI is computed from the available components with weights renormalised, and evidence coverage is shown alongside.',
    economicMissing:
      'Economic linkage (E) is not evidenced. E carries the largest weight (0.30). A community must not be eliminated merely because records are unavailable.',
    componentEntry: 'Component entry',
    rubric: 'Rubric',
    noteRequired: 'An evidence note is required when recording a score.',
    provisional: 'Provisional POCI',
  },

  portfolio: {
    title: 'Assessment Portfolio Selection',
    intro:
      'Do not take the highest-POCI villages without regard to typology. Select a combination representing different contribution pathways, plus one or two low-exposure comparators.',
    exposedCount: 'Exposed communities',
    comparatorCount: 'Comparators',
    pathways: 'Distinct pathways',
    comparatorCriteria: 'Comparator criteria',
    undervisible: 'Represents a group under-visible to spatial data',
    valid: 'Portfolio satisfies the design rules',
  },

  scorecard: {
    title: 'ABCD Scorecard',
    intro:
      'Each indicator is rated across five dimensions (0-4). A score of 100 must not be read as evidence of full palm-oil contribution. It shows only the asset-strength profile supported by available evidence.',
    contributionSeparate:
      'Palm-oil contribution is assessed as a separate layer and is not folded into the asset-strength score.',
    interpretiveLimit: 'Interpretive limit',
    minimumEvidence: 'Minimum evidence package',
    contribution: 'Contribution category',
    beneficiaries: 'Beneficiaries',
    evidenceGaps: 'Evidence gaps',
    advocacyCritical: 'Advocacy-critical',
    contradiction: 'Source contradiction',
    pillarProfile: 'Pillar profile',
    composite: 'Composite score',
    compositeCaveat:
      'The composite is used cautiously. Published interpretation must prioritise pillar profiles, gaps and confidence over a single rank. CPOPC has not yet decided whether a composite may be displayed externally.',
    showComposite: 'Show composite',
    selectVillage: 'Select a community from the portfolio to begin scoring.',
    noPortfolio: 'No communities selected yet. Build the portfolio first.',
  },

  validation: {
    title: 'Validation Queue',
    intro:
      'Validation is directed only at evidence that is missing, contradictory, low-confidence, sensitive, or critical to a policy claim. Every P-R/P-L/P-C activity must link to a specific evidence gap.',
    trigger: 'Trigger',
    tier: 'Tier',
    status: 'Status',
    assignee: 'Assignee',
    resolution: 'Resolution',
    empty:
      'Queue is empty. Items appear automatically as indicators are scored and evidence gaps are detected.',
    statuses: {
      open: 'Open',
      'in-progress': 'In progress',
      resolved: 'Resolved',
      dismissed: 'Dismissed',
    },
  },

  evidence: {
    title: 'Evidence Register',
    intro:
      'Every dataset receives a source, date, spatial scale, licence, custodian, quality flag and permitted-use classification.',
    catalog: 'Source catalog',
    register: 'Acquisition register',
    addRecord: 'Add record',
    owner: 'Owner',
    period: 'Period',
    geography: 'Geography',
    accessRestriction: 'Access restriction',
    completeness: 'Completeness',
    sensitivity: 'Sensitivity',
    permittedUse: 'Permitted use',
    restricted: 'Requires formal request',
    empty: 'No acquisition records yet. Add entries as data is requested or received.',
  },

  dictionary: {
    title: 'Indicator Dictionary',
    intro: 'Five pillars, fifteen core indicators, and the evidence route for each.',
    rationale: 'Measurement focus',
    minimumVariables: 'Minimum variables',
    secondarySources: 'Secondary & administrative sources',
    geoAi: 'GeoAI / spatial sources',
    remoteValidation: 'Remote validation (P-R)',
    localVerification: 'Local geotagged verification (P-L)',
    centralField: 'Central field trigger (P-C)',
    intensityMatrix: 'Evidence intensity matrix',
  },

  exports: {
    title: 'Exports & Report',
    intro: 'Export the project file to store work durably, or CSV for onward analysis.',
    exportProject: 'Export project file (JSON)',
    importProject: 'Import project file',
    exportPoci: 'Export POCI scores (CSV)',
    exportAbcd: 'Export ABCD scores (CSV)',
    exportValidation: 'Export validation queue (CSV)',
    printReport: 'Printable report',
    importWarning: 'Importing replaces all work stored in this browser. Export first if needed.',
    storageNote:
      'Work is autosaved to this browser’s localStorage. Use the project-file export for durable storage and sharing.',
  },
} as const

export type Strings = typeof STRINGS
