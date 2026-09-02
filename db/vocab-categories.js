const VOCAB_CATEGORIES = [
  'IT',
  'Công sở',
  'Giao tiếp',
  'Du lịch',
  'Ăn uống',
  'Hàng ngày',
  'Sức khỏe',
  'Mua sắm'
];

const IT_LEGACY_CATEGORIES = new Set([
  'Algorithms', 'Data Systems', 'Hardware & Infrastructure', 'Testing & QA',
  'DevOps', 'Frontend', 'Backend', 'Database', 'Security', 'Networking',
  'Cloud', 'Mobile', 'AI/ML', 'API', 'Automation', 'Performance', 'CI/CD',
  'Bug Report', 'Coding', 'DevOps & Cloud', 'Data & Security', 'Technology',
  'Tech', 'Server', 'Linux', 'Monitoring', 'Docker', 'Kubernetes',
  'Design', 'UX Research', 'Prototyping', 'Typography', 'Color Theory',
  'Wireframe', 'Accessibility', 'Product', 'Strategy', 'Metrics', 'Roadmap',
  'Backlog', 'Stakeholder', 'Requirements', 'Process', 'Documentation', 'UML',
  'Education', 'Campus Life', 'Academic', 'Research', 'Career', 'Agile',
  'Phỏng vấn IT', 'Công nghệ'
]);

const LEGACY_VOCAB_CATEGORY_MAP = {
  Business: 'Công sở',
  Office: 'Công sở',
  Meeting: 'Công sở',
  Email: 'Công sở',
  Finance: 'Công sở',
  Management: 'Công sở',
  HR: 'Công sở',
  Travel: 'Du lịch',
  Food: 'Ăn uống',
  'Daily Life': 'Hàng ngày',
  Chung: 'Hàng ngày',
  General: 'Hàng ngày',
  Family: 'Hàng ngày',
  Entertainment: 'Hàng ngày',
  Sports: 'Hàng ngày',
  Nature: 'Hàng ngày',
  Animals: 'Hàng ngày',
  Colors: 'Hàng ngày',
  School: 'Hàng ngày',
  Toys: 'Hàng ngày',
  Social: 'Giao tiếp',
  Health: 'Sức khỏe',
  Shopping: 'Mua sắm'
};

function normalizeVocabCategory(cat) {
  if (!cat || !String(cat).trim()) return 'Hàng ngày';
  const c = String(cat).trim();
  if (VOCAB_CATEGORIES.includes(c)) return c;
  if (LEGACY_VOCAB_CATEGORY_MAP[c]) return LEGACY_VOCAB_CATEGORY_MAP[c];
  if (IT_LEGACY_CATEGORIES.has(c)) return 'IT';
  return 'Hàng ngày';
}

async function migrateVocabCategories(query) {
  const rows = await query('SELECT DISTINCT category FROM vocabulary WHERE category IS NOT NULL');
  for (const r of rows) {
    const old = r.category;
    const neu = normalizeVocabCategory(old);
    if (neu !== old) {
      await query('UPDATE vocabulary SET category = ? WHERE category = ?', [neu, old]);
    }
  }
}

module.exports = {
  VOCAB_CATEGORIES,
  IT_LEGACY_CATEGORIES,
  LEGACY_VOCAB_CATEGORY_MAP,
  normalizeVocabCategory,
  migrateVocabCategories
};
