// ---------------------------------------------------------------------------
// CapEx projection engine.
//
// Pure functions that turn a row of inspection data (year installed, condition,
// quantity) into a remaining-useful-life estimate, replacement cost, and an
// urgency bucket. Kept side-effect free so it can be reused in the report,
// dashboard rollups, and the public report viewer.
// ---------------------------------------------------------------------------

import { CONDITION_MULTIPLIER, SYSTEM_BY_KEY } from './systems'

export const URGENCY_BUCKETS = ['immediate', '1-3', '4-7', '8+']

export const URGENCY_LABEL = {
  immediate: 'Immediate',
  '1-3': '1–3 years',
  '4-7': '4–7 years',
  '8+': '8+ years',
}

export const URGENCY_ORDER = { immediate: 0, '1-3': 1, '4-7': 2, '8+': 3 }

export function currentYear() {
  return new Date().getFullYear()
}

export function computeAge(yearInstalled) {
  const y = Number(yearInstalled)
  if (!y || Number.isNaN(y)) return null
  return Math.max(0, currentYear() - y)
}

export function computeRemainingLife(system, { year_installed, condition }) {
  if (!system) return null
  const age = computeAge(year_installed)
  if (age === null) return null
  const mult = CONDITION_MULTIPLIER[condition] ?? CONDITION_MULTIPLIER.good
  const effectiveLife = system.usefulLife * mult
  return Math.max(0, Math.round(effectiveLife - age))
}

export function computeReplacementCost(system, quantity) {
  if (!system) return 0
  const qty = system.basis === 'flat' ? Number(quantity) || 1 : Number(quantity) || 0
  return Math.round(system.cost * qty)
}

export function urgencyForRemainingLife(remaining) {
  if (remaining === null || remaining === undefined) return null
  if (remaining <= 0) return 'immediate'
  if (remaining <= 3) return '1-3'
  if (remaining <= 7) return '4-7'
  return '8+'
}

export function projectSystem(row) {
  const system = SYSTEM_BY_KEY[row.system_key]
  const age = computeAge(row.year_installed)
  const remainingLife = computeRemainingLife(system, row)
  const replacementCost = computeReplacementCost(system, row.quantity)
  const urgency = urgencyForRemainingLife(remainingLife)
  return {
    ...row,
    system,
    name: system?.name ?? row.system_key,
    age,
    remainingLife,
    replacementCost,
    urgency,
  }
}

export function summarizeCapex(rows = []) {
  const included = rows.filter((r) => r.included).map(projectSystem)

  const byUrgency = { immediate: 0, '1-3': 0, '4-7': 0, '8+': 0 }
  let total = 0
  for (const s of included) {
    total += s.replacementCost
    if (s.urgency) byUrgency[s.urgency] += s.replacementCost
  }

  const topUrgent = [...included]
    .filter((s) => s.remainingLife !== null)
    .sort((a, b) => {
      const ru = URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]
      if (ru !== 0) return ru
      if (a.remainingLife !== b.remainingLife) return a.remainingLife - b.remainingLife
      return b.replacementCost - a.replacementCost
    })
    .slice(0, 5)

  const sortedSystems = [...included].sort((a, b) => {
    const ua = a.urgency ? URGENCY_ORDER[a.urgency] : 99
    const ub = b.urgency ? URGENCY_ORDER[b.urgency] : 99
    if (ua !== ub) return ua - ub
    return b.replacementCost - a.replacementCost
  })

  return {
    total,
    byUrgency,
    topUrgent,
    includedCount: included.length,
    systems: sortedSystems,
  }
}

export function formatCurrency(value, { compact = false } = {}) {
  const n = Number(value) || 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  }).format(n)
}
