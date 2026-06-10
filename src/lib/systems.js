// ---------------------------------------------------------------------------
// Inspection systems catalog.
//
// 24 building systems with typical useful lives, replacement cost bases, and
// the unit each is measured in. These power the CapEx projection on the
// Inspection tab. Costs are rough national-average ballparks for a v1
// estimator — they are intentionally editable assumptions, not appraisals.
// ---------------------------------------------------------------------------

export const CONDITIONS = ['excellent', 'good', 'fair', 'poor']

export const CONDITION_MULTIPLIER = {
  excellent: 1.0,
  good: 0.75,
  fair: 0.45,
  poor: 0.15,
}

export const CONDITION_LABEL = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
}

// basis:
//   'per_sqft'  -> quantity is square footage
//   'per_unit'  -> quantity is a count (each / systems / kitchens / units)
//   'per_lf'    -> quantity is linear feet
//   'flat'      -> lump sum, quantity acts as a multiplier (default 1)
export const SYSTEMS = [
  { key: 'roof',            name: 'Roof',                    category: 'Exterior',   basis: 'per_sqft', unitLabel: 'sq ft',      cost: 6.5,   usefulLife: 25 },
  { key: 'gutters',         name: 'Gutters & Downspouts',    category: 'Exterior',   basis: 'per_lf',   unitLabel: 'linear ft',  cost: 9,     usefulLife: 20 },
  { key: 'exterior_siding', name: 'Siding / Exterior Walls', category: 'Exterior',   basis: 'per_sqft', unitLabel: 'sq ft',      cost: 8,     usefulLife: 30 },
  { key: 'exterior_paint',  name: 'Exterior Paint',          category: 'Exterior',   basis: 'per_sqft', unitLabel: 'sq ft',      cost: 2.5,   usefulLife: 8 },
  { key: 'windows',         name: 'Windows',                 category: 'Exterior',   basis: 'per_unit', unitLabel: 'windows',    cost: 650,   usefulLife: 25 },
  { key: 'foundation',      name: 'Foundation / Structure',  category: 'Structure',  basis: 'per_sqft', unitLabel: 'sq ft',      cost: 14,    usefulLife: 75 },
  { key: 'hvac',            name: 'HVAC (Heat & Cooling)',   category: 'Mechanical', basis: 'per_unit', unitLabel: 'systems',    cost: 7000,  usefulLife: 18 },
  { key: 'furnace',         name: 'Furnace / Boiler',        category: 'Mechanical', basis: 'per_unit', unitLabel: 'units',      cost: 4500,  usefulLife: 20 },
  { key: 'water_heater',    name: 'Water Heater',            category: 'Mechanical', basis: 'per_unit', unitLabel: 'units',      cost: 1400,  usefulLife: 12 },
  { key: 'electrical_panel',name: 'Electrical Panel',        category: 'Mechanical', basis: 'per_unit', unitLabel: 'panels',     cost: 2500,  usefulLife: 35 },
  { key: 'wiring',          name: 'Electrical Wiring',       category: 'Mechanical', basis: 'per_sqft', unitLabel: 'sq ft',      cost: 4,     usefulLife: 40 },
  { key: 'plumbing',        name: 'Plumbing Supply Lines',   category: 'Mechanical', basis: 'per_sqft', unitLabel: 'sq ft',      cost: 4.5,   usefulLife: 50 },
  { key: 'sewer_line',      name: 'Sewer / Main Line',       category: 'Mechanical', basis: 'per_lf',   unitLabel: 'linear ft',  cost: 120,   usefulLife: 50 },
  { key: 'septic',          name: 'Septic System',           category: 'Site',       basis: 'per_unit', unitLabel: 'systems',    cost: 12000, usefulLife: 30 },
  { key: 'water_well',      name: 'Well / Water System',     category: 'Site',       basis: 'per_unit', unitLabel: 'systems',    cost: 9000,  usefulLife: 30 },
  { key: 'driveway',        name: 'Driveway / Parking',      category: 'Site',       basis: 'per_sqft', unitLabel: 'sq ft',      cost: 7,     usefulLife: 25 },
  { key: 'deck',            name: 'Deck / Patio',            category: 'Site',       basis: 'per_sqft', unitLabel: 'sq ft',      cost: 35,    usefulLife: 20 },
  { key: 'landscaping',     name: 'Landscaping / Site Work', category: 'Site',       basis: 'flat',     unitLabel: 'lump sum',   cost: 6000,  usefulLife: 15 },
  { key: 'garage_door',     name: 'Garage Door & Opener',    category: 'Site',       basis: 'per_unit', unitLabel: 'doors',      cost: 1800,  usefulLife: 20 },
  { key: 'flooring',        name: 'Flooring',                category: 'Interior',   basis: 'per_sqft', unitLabel: 'sq ft',      cost: 6,     usefulLife: 12 },
  { key: 'interior_paint',  name: 'Interior Paint',          category: 'Interior',   basis: 'per_sqft', unitLabel: 'sq ft',      cost: 2.25,  usefulLife: 7 },
  { key: 'kitchen',         name: 'Kitchen (Cabinets/Tops)', category: 'Interior',   basis: 'per_unit', unitLabel: 'kitchens',   cost: 12000, usefulLife: 20 },
  { key: 'bathroom',        name: 'Bathrooms',               category: 'Interior',   basis: 'per_unit', unitLabel: 'bathrooms',  cost: 7500,  usefulLife: 22 },
  { key: 'appliances',      name: 'Appliances (set)',        category: 'Interior',   basis: 'per_unit', unitLabel: 'sets',       cost: 2800,  usefulLife: 12 },
]

export const SYSTEM_BY_KEY = Object.fromEntries(SYSTEMS.map((s) => [s.key, s]))

export const SYSTEM_CATEGORIES = ['Exterior', 'Structure', 'Mechanical', 'Site', 'Interior']

export function suggestQuantity(system, property) {
  if (!system) return 1
  const sqft = Number(property?.square_footage) || 0
  const units = Number(property?.unit_count) || 1
  switch (system.basis) {
    case 'per_sqft':
      if (system.key === 'exterior_siding' || system.key === 'exterior_paint') {
        return sqft ? Math.round(sqft * 0.85) : 0
      }
      if (system.key === 'roof' || system.key === 'driveway') {
        return sqft ? Math.round(sqft * 0.4) : 0
      }
      if (system.key === 'deck') return 0
      return sqft
    case 'per_lf':
      return sqft ? Math.round(4 * Math.sqrt(sqft)) : 0
    case 'per_unit':
      if (['hvac', 'furnace', 'water_heater', 'kitchen', 'appliances'].includes(system.key)) {
        return units
      }
      if (system.key === 'bathroom') return units
      return 1
    case 'flat':
    default:
      return 1
  }
}
