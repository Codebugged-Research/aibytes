// Role-based learning paths — a role FILTERS the curriculum down to a
// curated unit whitelist — someone
// who picks "Project Manager" shouldn't have to scroll past 55 units of
// classical ML math to find what's relevant to their job. Unit 0
// (Orientation) is implicit for every role; roles.js callers should not
// need to list it, but we include it explicitly for clarity/robustness.
const r = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const u = (...ranges) => ranges.flat();

export const ROLES = [
  {
    id: 'pm',
    label: 'Project Manager',
    icon: '📋',
    unitIds: u(
      [0, 1, 2], r(3, 8), [28, 29, 30], [51, 52, 53],
      r(345, 349), r(355, 359), r(370, 374),
      r(480, 484), r(530, 534), [199, 297, 342],
    ),
  },
  {
    id: 'product',
    label: 'Product Manager',
    icon: '🧭',
    unitIds: u(
      [0], r(3, 8), [201, 202, 203, 204], [300], r(315, 319), r(330, 339),
      r(345, 349), r(355, 359), r(400, 404), r(455, 459), [465, 466, 467],
      r(480, 484), r(530, 534), [199, 297, 342],
    ),
  },
  {
    id: 'analyst',
    label: 'Data Analyst',
    icon: '📊',
    unitIds: u([0, 1, 2], r(3, 55), r(370, 374)),
  },
  {
    id: 'datasci',
    label: 'Data Scientist',
    icon: '🔬',
    unitIds: u(r(0, 55), r(56, 88), r(89, 96), r(221, 299), r(300, 344), r(345, 404)),
  },
  {
    id: 'aidev',
    label: 'AI App Developer',
    icon: '🧩',
    unitIds: u(r(0, 8), r(345, 404), r(405, 479), r(480, 534), r(545, 550)),
  },
  {
    id: 'designer',
    label: 'Designer (Creative AI)',
    icon: '🎨',
    unitIds: u(
      [0], [3, 4, 5, 6], [201, 202, 203, 204, 213, 214, 215], r(300, 344),
      r(370, 374), [539, 540, 543, 544],
    ),
  },
  {
    id: 'exec',
    label: 'Executive / Founder',
    icon: '💼',
    unitIds: u(
      [0, 1, 2], r(3, 8), [300], r(315, 319), r(345, 349), r(400, 404),
      r(480, 484), r(530, 534), [51, 52, 53], r(395, 399), r(475, 479),
      [199, 297, 342],
    ),
  },
  {
    id: 'marketing',
    label: 'Marketing / Content',
    icon: '📣',
    unitIds: u(
      [0], [3, 4, 5], r(345, 349), r(355, 359), r(405, 419), r(330, 339),
      [541, 542, 543, 544], [297, 342],
    ),
  },
  {
    id: 'sales',
    label: 'Sales / Solutions Engineer',
    icon: '🤝',
    unitIds: u(
      [0], r(3, 8), r(345, 349), r(400, 404), r(455, 472),
      r(480, 484), r(530, 534), r(395, 399), [199, 297, 342],
    ),
  },
  {
    id: 'student',
    label: 'Student (Learn Everything)',
    icon: '🎓',
    unitIds: null, // null = full catalog, no filtering
  },
];

export const roleById = (id) => ROLES.find((r2) => r2.id === id) || null;

/// Filters a units array down to a role's whitelist. `student` (or any role
/// with unitIds === null) and unknown/missing role ids are no-ops — the
/// caller decides whether "no role picked" means show everything.
export const filterUnitsByRole = (units, roleId) => {
  const role = roleById(roleId);
  if (!role || !role.unitIds) return units;
  const allowed = new Set(role.unitIds);
  return units.filter((unit) => allowed.has(unit.id));
};

