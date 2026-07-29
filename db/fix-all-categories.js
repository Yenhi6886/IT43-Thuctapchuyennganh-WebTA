require('dotenv').config();
const { query } = require('./database');

// Define 3-4 categories per topic - merge all others into these
const topicCategories = {
  // topic_id: { newCategory: [oldCategories to merge] }
  1: { // General English
    'Daily Life': ['Daily Life', 'Food', 'Travel', 'Nature', 'Health', 'Sports', 'Entertainment', 'Social', 'Colors', 'Animals', 'Toys', 'Family', 'School'],
    'Work & Business': ['Business', 'Office', 'Meeting', 'Email', 'Finance', 'HR', 'Management', 'Career'],
    'Education': ['Academic', 'Education', 'Research', 'Campus Life', 'Technology'],
  },
  2: { // Trẻ Em
    'Animals & Nature': ['Animals', 'Nature', 'Food', 'Colors', 'Toys', 'Sports'],
    'Family & School': ['Family', 'School', 'Education', 'Daily Life', 'Social', 'Entertainment', 'Campus Life', 'Health'],
    'Fun & Play': ['Travel', 'Academic', 'Career'],
  },
  3: { // Sinh Viên
    'Campus Life': ['Campus Life', 'Academic', 'Education', 'Research', 'School', 'Social'],
    'Career Prep': ['Career', 'Business', 'Meeting', 'Email', 'HR', 'Finance', 'Office', 'Management'],
    'Tech Basics': ['Technology', 'API', 'Automation', 'Cloud', 'Database', 'DevOps', 'Security', 'Testing & QA', 'CI/CD', 'Networking', 'Linux', 'Server', 'Performance', 'Bug Report', 'Monitoring', 'Frontend', 'Backend', 'Coding', 'Data & Security', 'DevOps & Cloud', 'Algorithms', 'Data Systems'],
  },
  4: { // Người Đi Làm
    'Office & Email': ['Office', 'Email', 'Meeting', 'Management', 'HR'],
    'Business & Finance': ['Business', 'Finance', 'Career', 'Strategy', 'Stakeholder', 'Product', 'Roadmap'],
    'Communication': ['Social', 'Daily Life', 'Travel', 'Health', 'Entertainment', 'Food', 'Nature', 'Sports', 'Academic', 'Education', 'Research'],
  },
  5: { // Developer - already fixed
    'Coding': ['Coding', 'Algorithms', 'Backend', 'Frontend', 'API', 'Data Systems'],
    'DevOps & Cloud': ['DevOps & Cloud', 'DevOps', 'Cloud', 'CI/CD', 'Docker', 'Kubernetes', 'Server', 'Monitoring', 'Linux'],
    'Data & Security': ['Data & Security', 'Database', 'Security', 'Networking', 'Performance'],
  },
  6: { // Tester / QA
    'Testing': ['Testing & QA', 'Bug Report', 'Automation', 'Performance', 'Security'],
    'Tools & Process': ['CI/CD', 'API', 'Coding', 'Data & Security', 'DevOps & Cloud'],
    'Workplace': ['Business', 'Office', 'Meeting', 'Email', 'HR', 'Finance', 'Management'],
  },
  7: { // BA
    'Requirements': ['Stakeholder', 'Product', 'Roadmap', 'Strategy', 'Backlog', 'Agile', 'Metrics'],
    'Business': ['Business', 'Finance', 'Management', 'Office', 'Meeting', 'Email', 'HR'],
    'Technical': ['API', 'Automation', 'CI/CD', 'Cloud', 'Database', 'DevOps', 'Security', 'Testing & QA', 'Performance', 'Bug Report', 'Networking', 'Server', 'Monitoring', 'Linux', 'Frontend', 'Backend', 'Coding', 'Data & Security', 'DevOps & Cloud', 'Algorithms', 'Data Systems'],
  },
  8: { // System Admin
    'Server & Network': ['Server', 'Networking', 'Linux', 'Monitoring', 'Performance'],
    'Cloud & DevOps': ['Cloud', 'DevOps', 'CI/CD', 'DevOps & Cloud', 'Docker', 'Kubernetes', 'Automation'],
    'Security': ['Security', 'Data & Security', 'API', 'Bug Report', 'Coding'],
    'Workplace': ['Business', 'Office', 'Meeting', 'Email', 'HR', 'Finance', 'Management'],
  },
  9: { // Product Owner
    'Product Strategy': ['Product', 'Strategy', 'Roadmap', 'Backlog', 'Metrics', 'Stakeholder', 'Agile'],
    'Business': ['Business', 'Finance', 'Management', 'Office', 'Meeting', 'Email', 'HR'],
    'Technical': ['API', 'Automation', 'CI/CD', 'Cloud', 'Database', 'DevOps', 'Security', 'Testing & QA', 'Performance', 'Bug Report', 'Networking', 'Server', 'Monitoring', 'Linux', 'Frontend', 'Backend', 'Coding', 'Data & Security', 'DevOps & Cloud', 'Algorithms', 'Data Systems'],
  },
  10: { // DevOps / SRE
    'Infrastructure': ['Server', 'Linux', 'Networking', 'Monitoring', 'Performance', 'Docker', 'Kubernetes'],
    'CI/CD & Automation': ['CI/CD', 'DevOps', 'Automation', 'DevOps & Cloud', 'Cloud', 'Coding'],
    'Security & Data': ['Security', 'Data & Security', 'Database', 'API', 'Bug Report'],
    'Workplace': ['Business', 'Office', 'Meeting', 'Email', 'HR', 'Finance', 'Management'],
  },
  11: { // UI/UX Designer
    'Design': ['Design', 'Color Theory', 'Typography', 'Wireframe', 'Prototyping', 'Accessibility', 'UX Research'],
    'Product & Strategy': ['Product', 'Strategy', 'Roadmap', 'Stakeholder', 'Agile', 'Backlog', 'Metrics'],
    'Workplace': ['Business', 'Office', 'Meeting', 'Email', 'HR', 'Finance', 'Management', 'Career'],
  },
};

async function fixAllCategories() {
  try {
    let totalUpdated = 0;

    for (const [topicId, categoryMap] of Object.entries(topicCategories)) {
      const topicRows = await query('SELECT name FROM topics WHERE id = ?', [topicId]);
      const topicName = topicRows[0]?.name || topicId;
      
      for (const [newCat, oldCats] of Object.entries(categoryMap)) {
        if (oldCats.length === 0) continue;
        
        const placeholders = oldCats.map(() => '?').join(',');
        const result = await query(`
          UPDATE vocabulary v
          INNER JOIN vocabulary_topics vt ON v.id = vt.vocabulary_id
          SET v.category = ?
          WHERE vt.topic_id = ? AND v.category IN (${placeholders}) AND v.category != ?
        `, [newCat, topicId, ...oldCats, newCat]);
        
        if (result.affectedRows > 0) {
          totalUpdated += result.affectedRows;
        }
      }

      // Any remaining categories not in the map → merge into first category
      const firstCat = Object.keys(categoryMap)[0];
      const allMapped = Object.values(categoryMap).flat();
      const remaining = await query(`
        SELECT DISTINCT v.category FROM vocabulary v
        INNER JOIN vocabulary_topics vt ON v.id = vt.vocabulary_id
        WHERE vt.topic_id = ? AND v.category NOT IN (${Object.keys(categoryMap).map(() => '?').join(',')})
      `, [topicId, ...Object.keys(categoryMap)]);
      
      if (remaining.length > 0) {
        const unmapped = remaining.map(r => r.category);
        const ph = unmapped.map(() => '?').join(',');
        await query(`
          UPDATE vocabulary v INNER JOIN vocabulary_topics vt ON v.id = vt.vocabulary_id
          SET v.category = ? WHERE vt.topic_id = ? AND v.category IN (${ph})
        `, [firstCat, topicId, ...unmapped]);
      }

      // Print result
      const cats = await query(`
        SELECT v.category, COUNT(*) as cnt FROM vocabulary v
        INNER JOIN vocabulary_topics vt ON v.id = vt.vocabulary_id
        WHERE vt.topic_id = ? GROUP BY v.category ORDER BY v.category
      `, [topicId]);
      console.log(`\n${topicName}:`);
      cats.forEach(c => console.log(`  ${c.category}: ${c.cnt} words`));
    }

    console.log(`\n✅ Fixed categories for all topics! (${totalUpdated} rows updated)`);
    process.exit(0);
  } catch (e) { console.error('Error:', e); process.exit(1); }
}

fixAllCategories();
