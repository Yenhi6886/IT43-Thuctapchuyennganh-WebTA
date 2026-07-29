const { query } = require('./database');

// Danh sách category phù hợp cho từng topic
const topicCategories = {
  1:  ['Daily Life', 'Travel', 'Food', 'Nature', 'Entertainment', 'Sports', 'Health'],           // General English
  2:  ['Animals', 'Colors', 'Family', 'School', 'Toys', 'Food', 'Nature'],                       // Trẻ Em
  3:  ['Education', 'Campus Life', 'Academic', 'Research', 'Social', 'Career', 'Technology'],     // Sinh Viên
  4:  ['Business', 'Office', 'Meeting', 'Email', 'Finance', 'Management', 'HR'],                 // Người Đi Làm
  5:  ['Algorithms', 'Data Systems', 'Frontend', 'Backend', 'Database', 'DevOps', 'Cloud'],      // Developer
  6:  ['Testing & QA', 'Bug Report', 'Automation', 'Performance', 'Security', 'CI/CD', 'API'],   // Tester/QA
  7:  ['Business', 'Requirements', 'Stakeholder', 'Process', 'Documentation', 'Agile', 'UML'],   // BA
  8:  ['Networking', 'Security', 'Cloud', 'Server', 'Linux', 'Monitoring', 'DevOps'],            // SysAdmin
  9:  ['Product', 'Strategy', 'Metrics', 'Roadmap', 'Backlog', 'Agile', 'Stakeholder'],          // PO
  10: ['DevOps', 'CI/CD', 'Cloud', 'Docker', 'Kubernetes', 'Monitoring', 'Automation'],          // DevOps/SRE
  11: ['Design', 'UX Research', 'Prototyping', 'Typography', 'Color Theory', 'Wireframe', 'Accessibility'], // UI/UX Designer
};

async function updateCategories() {
  try {
    const topics = await query('SELECT id, slug FROM topics');
    console.log(`Found ${topics.length} topics.`);

    for (const topic of topics) {
      const cats = topicCategories[topic.id];
      if (!cats) { console.log(`No categories defined for topic ${topic.id} (${topic.slug}), skipping.`); continue; }

      // Lấy tất cả vocabulary_id thuộc topic này
      const vocabRows = await query('SELECT vocabulary_id FROM vocabulary_topics WHERE topic_id = ?', [topic.id]);
      if (!vocabRows.length) { console.log(`Topic ${topic.slug}: no vocabulary assigned, skipping.`); continue; }

      const vocabIds = vocabRows.map(r => r.vocabulary_id);
      console.log(`Topic ${topic.slug}: updating ${vocabIds.length} words across ${cats.length} categories...`);

      // Phân bổ đều các từ vào các category
      for (let i = 0; i < vocabIds.length; i++) {
        const cat = cats[i % cats.length];
        await query('UPDATE vocabulary SET category = ? WHERE id = ?', [cat, vocabIds[i]]);
      }
      console.log(`  ✅ Done: ${topic.slug}`);
    }

    console.log('\n✅ All categories updated successfully!');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

updateCategories();
