// ── UC Points System ──────────────────────────────────────────────
// Point values for each of the 6 UC30 Indicators

export const UC_POINT_VALUES = {
  propertiesAnalyzed: 1,
  offersSubmitted: 10,
  dealSourcesActivated: 5,
  counteroffers: 15,
  followUps: 3,
  propertiesUnderContract: 100,
};

// Labels for display
export const INDICATOR_LABELS = {
  propertiesAnalyzed: 'Properties Analyzed',
  offersSubmitted: 'Offers Submitted',
  dealSourcesActivated: 'Deal Sources Activated',
  counteroffers: 'Counteroffers',
  followUps: 'Follow-Ups',
  propertiesUnderContract: 'Properties Under Contract',
};

// Short labels for compact displays
export const INDICATOR_SHORT_LABELS = {
  propertiesAnalyzed: 'Analyzed',
  offersSubmitted: 'Offers',
  dealSourcesActivated: 'Deal Sources',
  counteroffers: 'Counters',
  followUps: 'Follow-Ups',
  propertiesUnderContract: 'Under Contract',
};

// Colors for each indicator
export const INDICATOR_COLORS = {
  propertiesAnalyzed: '#533483',
  offersSubmitted: '#e94560',
  dealSourcesActivated: '#0f3460',
  counteroffers: '#f0a500',
  followUps: '#48c78e',
  propertiesUnderContract: '#c9a0ff',
};

// Ordered list of all 6 indicator keys
export const INDICATOR_KEYS = [
  'propertiesAnalyzed',
  'offersSubmitted',
  'dealSourcesActivated',
  'counteroffers',
  'followUps',
  'propertiesUnderContract',
];

// 5 daily-trackable indicators (excludes propertiesUnderContract which has no daily minimum)
export const DAILY_INDICATOR_KEYS = [
  'propertiesAnalyzed',
  'offersSubmitted',
  'dealSourcesActivated',
  'counteroffers',
  'followUps',
];

// Calculate total UC Points from cumulative metrics
export function calculateUCPoints(metrics) {
  return Object.entries(UC_POINT_VALUES).reduce((total, [key, pointValue]) => {
    return total + (metrics[key] || 0) * pointValue;
  }, 0);
}

// Calculate UC Points earned from a single day's activity
export function calculateDayPoints(dayMetrics) {
  return Object.entries(UC_POINT_VALUES).reduce((total, [key, pointValue]) => {
    return total + (dayMetrics[key] || 0) * pointValue;
  }, 0);
}
