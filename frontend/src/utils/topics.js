// Broad learning-focus categories for the "what do you want to learn" survey.
// Each category maps to the curriculum unit ids (including their mini-project
// units) that belong to it. Unit 0 (Orientation) is intentionally excluded —
// it always stays first regardless of preference.
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export const TOPIC_CATEGORIES = [
  {
    id: 'ml',
    label: 'Machine Learning',
    icon: '🤖',
    unitIds: range(1, 55),
  },
  {
    id: 'dl',
    label: 'Deep Learning',
    icon: '🧠',
    unitIds: [...range(56, 88), 535, 536],
  },
  {
    id: 'cv',
    label: 'Computer Vision',
    icon: '👁️',
    unitIds: [...range(89, 200), 537, 538],
  },
  {
    id: 'nlp',
    label: 'NLP & Language Models',
    icon: '💬',
    unitIds: [...range(221, 299), ...range(345, 404), 541, 542, 545, 546],
  },
  {
    id: 'genai',
    label: 'Generative AI',
    icon: '🎨',
    unitIds: [...range(201, 220), ...range(300, 344), 539, 540, 543, 544],
  },
  {
    id: 'llmapp',
    label: 'LLM Engineering',
    icon: '🔌',
    unitIds: [...range(405, 479), 547, 548],
  },
  {
    id: 'agents',
    label: 'AI Agents',
    icon: '⚡',
    unitIds: [...range(480, 534), 549, 550],
  },
];

const UNIT_TO_CATEGORY = new Map();
TOPIC_CATEGORIES.forEach((cat) => cat.unitIds.forEach((id) => UNIT_TO_CATEGORY.set(id, cat.id)));

export const categoryForUnit = (unitId) => UNIT_TO_CATEGORY.get(unitId) || null;

// Reorders curriculum units so the categories the learner picked come first
// (in their original relative order), then everything else (also in its
// original relative order). Units with no category (Orientation) always lead.
// No selection => no-op, original order is preserved.
export const reorderUnitsByTopics = (units, selectedIds) => {
  if (!Array.isArray(units) || !selectedIds || selectedIds.length === 0) return units;
  const selected = new Set(selectedIds);
  const uncategorized = [];
  const prioritized = [];
  const rest = [];
  units.forEach((u) => {
    const cat = categoryForUnit(u.id);
    if (!cat) uncategorized.push(u);
    else if (selected.has(cat)) prioritized.push(u);
    else rest.push(u);
  });
  return [...uncategorized, ...prioritized, ...rest];
};
