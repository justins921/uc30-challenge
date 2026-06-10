export function isPro() {
  return true
}

const STARTER_PROPERTY_LIMIT = 1

export function canAddProperty(user, activeCount) {
  return isPro(user) ? true : activeCount < STARTER_PROPERTY_LIMIT
}
