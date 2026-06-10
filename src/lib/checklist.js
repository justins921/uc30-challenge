// ---------------------------------------------------------------------------
// Default due-diligence checklist.
//
// Seeded for every new property. Sections map to the document-collection
// workflow a buyer works through before closing. `critical: true` items are
// flagged on the Report tab if they are still `not_started`.
// ---------------------------------------------------------------------------

export const CHECKLIST_STATUSES = ['not_started', 'in_progress', 'collected', 'na']

export const STATUS_LABEL = {
  not_started: 'Not started',
  in_progress: 'In progress',
  collected: 'Collected',
  na: 'N/A',
}

export const DEFAULT_CHECKLIST = [
  {
    section: 'Financials',
    items: [
      { label: 'Trailing 12-month (T12) income statement' },
      { label: 'Rent roll', critical: true },
      { label: 'Operating expense statements (2 years)' },
      { label: 'Utility bills (12 months)' },
      { label: 'Bank statements / proof of deposits' },
      { label: 'Capital improvements history' },
      { label: 'Current budget / pro forma' },
    ],
  },
  {
    section: 'Leases',
    items: [
      { label: 'Executed lease agreements (all units)', critical: true },
      { label: 'Lease abstracts / summary' },
      { label: 'Security deposit ledger' },
      { label: 'Tenant estoppel certificates' },
      { label: 'Delinquency / aging report' },
      { label: 'Move-in / move-out inspection reports' },
    ],
  },
  {
    section: 'Taxes & Legal',
    items: [
      { label: 'Title report / preliminary title', critical: true },
      { label: 'Property tax bills (current & prior year)', critical: true },
      { label: 'Survey / plat map' },
      { label: 'Zoning & permitted use verification' },
      { label: 'Certificate of occupancy' },
      { label: 'Open permits & code violations search' },
      { label: 'Pending litigation disclosure' },
      { label: 'Environmental report (Phase I)' },
    ],
  },
  {
    section: 'Insurance',
    items: [
      { label: 'Current insurance policy / declarations' },
      { label: 'Loss run history (3–5 years)' },
      { label: 'Flood zone determination' },
      { label: 'Replacement cost estimate' },
    ],
  },
  {
    section: 'Management & Contracts',
    items: [
      { label: 'Property management agreement' },
      { label: 'Service & vendor contracts' },
      { label: 'Warranties (roof, HVAC, etc.)' },
      { label: 'Personal property / FF&E inventory' },
      { label: 'Staff / payroll summary (if applicable)' },
      { label: 'Pending capital projects / bids' },
    ],
  },
]

export const CRITICAL_LABELS = ['title report', 'leases', 'property tax', 'rent roll']

export function buildSeedChecklistRows(propertyId) {
  const rows = []
  for (const section of DEFAULT_CHECKLIST) {
    for (const item of section.items) {
      rows.push({
        property_id: propertyId,
        section: section.section,
        label: item.label,
        status: 'not_started',
        notes: null,
        critical: !!item.critical,
      })
    }
  }
  return rows
}

export const TOTAL_DEFAULT_ITEMS = DEFAULT_CHECKLIST.reduce(
  (sum, s) => sum + s.items.length,
  0,
)
