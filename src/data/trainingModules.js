// Training Modules — extracted from challenge day training blocks.
// Each module is a standalone training unit with content and quiz.
// Admin can override content and reorder via trainingConfig in settings.

export const TRAINING_MODULES = [
  // Modules will be populated from extracted content
  // Placeholder to prevent import errors during build
];

// Resolve modules with admin overrides (order, content edits, hidden)
export function getResolvedTrainingModules(trainingConfig = {}) {
  const { moduleOrder, moduleOverrides = {} } = trainingConfig;
  let modules = [...TRAINING_MODULES];

  // Apply content overrides
  modules = modules.map(mod => {
    const override = moduleOverrides[mod.id];
    if (!override) return mod;
    return {
      ...mod,
      ...(override.title !== undefined ? { title: override.title } : {}),
      ...(override.description !== undefined ? { description: override.description } : {}),
      ...(override.content !== undefined ? { content: override.content } : {}),
      ...(override.hidden !== undefined ? { hidden: override.hidden } : {}),
    };
  });

  // Apply custom order
  if (moduleOrder && Array.isArray(moduleOrder) && moduleOrder.length > 0) {
    const byId = {};
    for (const m of modules) byId[m.id] = m;
    const ordered = moduleOrder.map(id => byId[id]).filter(Boolean);
    const remaining = modules.filter(m => !moduleOrder.includes(m.id));
    modules = [...ordered, ...remaining];
  }

  return modules;
}
