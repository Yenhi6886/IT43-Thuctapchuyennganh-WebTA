const { query, getPool } = require('./database');

async function migrate() {
  console.log('🔄 Starting multi-topic migration...\n');

  // 1. Create topics table
  await query(`CREATE TABLE IF NOT EXISTS topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) DEFAULT '🌍',
    color VARCHAR(20) DEFAULT '#4f46e5',
    description VARCHAR(255) DEFAULT '',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  console.log('✅ Created topics table');

  // 2. Seed default topics
  const defaultTopics = [
    ['general', 'General English', '🌍', '#6b7280', 'Tiếng Anh tổng quát cho mọi người', 0],
    ['children', 'Trẻ Em', '🧒', '#f59e0b', 'Tiếng Anh dành cho trẻ em', 1],
    ['student', 'Sinh Viên', '🎓', '#8b5cf6', 'Tiếng Anh cho sinh viên đại học', 2],
    ['worker', 'Người Đi Làm', '💼', '#0ea5e9', 'Tiếng Anh công sở, giao tiếp nghiệp vụ', 3],
    ['developer', 'Developer', '👨‍💻', '#10b981', 'Tiếng Anh cho lập trình viên', 4],
    ['tester', 'Tester / QA', '🧪', '#ec4899', 'Tiếng Anh cho kiểm thử phần mềm', 5],
    ['ba', 'Business Analyst', '📋', '#f97316', 'Tiếng Anh cho phân tích nghiệp vụ', 6],
    ['sysadmin', 'System Admin', '🖥️', '#14b8a6', 'Tiếng Anh cho quản trị hệ thống', 7],
    ['po', 'Product Owner', '📊', '#6366f1', 'Tiếng Anh cho quản lý sản phẩm', 8],
    ['devops', 'DevOps / SRE', '⚙️', '#a855f7', 'Tiếng Anh cho DevOps engineer', 9],
    ['designer', 'UI/UX Designer', '🎨', '#e11d48', 'Tiếng Anh cho thiết kế giao diện', 10],
  ];

  for (const t of defaultTopics) {
    const existing = await query('SELECT id FROM topics WHERE slug = ?', [t[0]]);
    if (existing.length === 0) {
      await query('INSERT INTO topics (slug, name, icon, color, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)', t);
    }
  }
  console.log(`✅ Seeded ${defaultTopics.length} default topics`);

  // 3. Create junction tables
  await query(`CREATE TABLE IF NOT EXISTS user_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    topic_id INT NOT NULL,
    UNIQUE KEY unique_user_topic (user_id, topic_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
  )`);
  console.log('✅ Created user_topics junction table');

  await query(`CREATE TABLE IF NOT EXISTS vocabulary_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vocabulary_id INT NOT NULL,
    topic_id INT NOT NULL,
    UNIQUE KEY unique_vocab_topic (vocabulary_id, topic_id),
    FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
  )`);
  console.log('✅ Created vocabulary_topics junction table');

  await query(`CREATE TABLE IF NOT EXISTS reading_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reading_id INT NOT NULL,
    topic_id INT NOT NULL,
    UNIQUE KEY unique_reading_topic (reading_id, topic_id),
    FOREIGN KEY (reading_id) REFERENCES reading_passages(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
  )`);

  await query(`CREATE TABLE IF NOT EXISTS listening_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listening_id INT NOT NULL,
    topic_id INT NOT NULL,
    UNIQUE KEY unique_listening_topic (listening_id, topic_id),
    FOREIGN KEY (listening_id) REFERENCES listening_dialogues(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
  )`);

  await query(`CREATE TABLE IF NOT EXISTS speaking_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    speaking_id INT NOT NULL,
    topic_id INT NOT NULL,
    UNIQUE KEY unique_speaking_topic (speaking_id, topic_id),
    FOREIGN KEY (speaking_id) REFERENCES speaking_prompts(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
  )`);

  await query(`CREATE TABLE IF NOT EXISTS writing_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    writing_id INT NOT NULL,
    topic_id INT NOT NULL,
    UNIQUE KEY unique_writing_topic (writing_id, topic_id),
    FOREIGN KEY (writing_id) REFERENCES writing_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
  )`);

  await query(`CREATE TABLE IF NOT EXISTS grammar_topics_map (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grammar_id INT NOT NULL,
    topic_id INT NOT NULL,
    UNIQUE KEY unique_grammar_topic (grammar_id, topic_id),
    FOREIGN KEY (grammar_id) REFERENCES grammar_exercises(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
  )`);

  await query(`CREATE TABLE IF NOT EXISTS grammar_lesson_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT NOT NULL,
    topic_id INT NOT NULL,
    UNIQUE KEY unique_lesson_topic (lesson_id, topic_id),
    FOREIGN KEY (lesson_id) REFERENCES grammar_lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
  )`);

  console.log('✅ Created all content junction tables');

  // 4. Migrate existing vocabulary categories → topic assignments
  // Map old categories to topic slugs
  const categoryToTopics = {
    'Algorithms': ['developer', 'student'],
    'Data Systems': ['developer', 'sysadmin', 'devops'],
    'Hardware & Infrastructure': ['sysadmin', 'devops', 'developer'],
    'Testing & QA': ['tester', 'developer'],
  };

  const allTopics = await query('SELECT id, slug FROM topics');
  const topicMap = {};
  allTopics.forEach(t => topicMap[t.slug] = t.id);

  // Also assign all existing vocab to 'general' topic
  const generalTopicId = topicMap['general'];

  const vocabRows = await query('SELECT id, category FROM vocabulary');
  let assignedCount = 0;
  for (const v of vocabRows) {
    const slugs = categoryToTopics[v.category] || ['general'];
    // Always include general
    const allSlugs = [...new Set([...slugs, 'general'])];
    for (const slug of allSlugs) {
      const tid = topicMap[slug];
      if (tid) {
        const exists = await query('SELECT id FROM vocabulary_topics WHERE vocabulary_id = ? AND topic_id = ?', [v.id, tid]);
        if (exists.length === 0) {
          await query('INSERT INTO vocabulary_topics (vocabulary_id, topic_id) VALUES (?, ?)', [v.id, tid]);
          assignedCount++;
        }
      }
    }
  }
  console.log(`✅ Assigned ${assignedCount} vocabulary-topic mappings`);

  // 5. Assign existing reading/listening/speaking/writing to developer + general topics
  const devTopicId = topicMap['developer'];

  const readings = await query('SELECT id FROM reading_passages');
  for (const r of readings) {
    for (const tid of [generalTopicId, devTopicId]) {
      const exists = await query('SELECT id FROM reading_topics WHERE reading_id = ? AND topic_id = ?', [r.id, tid]);
      if (exists.length === 0) await query('INSERT INTO reading_topics (reading_id, topic_id) VALUES (?, ?)', [r.id, tid]);
    }
  }

  const listenings = await query('SELECT id FROM listening_dialogues');
  for (const l of listenings) {
    for (const tid of [generalTopicId, devTopicId]) {
      const exists = await query('SELECT id FROM listening_topics WHERE listening_id = ? AND topic_id = ?', [l.id, tid]);
      if (exists.length === 0) await query('INSERT INTO listening_topics (listening_id, topic_id) VALUES (?, ?)', [l.id, tid]);
    }
  }

  const speakings = await query('SELECT id FROM speaking_prompts');
  for (const s of speakings) {
    for (const tid of [generalTopicId, devTopicId]) {
      const exists = await query('SELECT id FROM speaking_topics WHERE speaking_id = ? AND topic_id = ?', [s.id, tid]);
      if (exists.length === 0) await query('INSERT INTO speaking_topics (speaking_id, topic_id) VALUES (?, ?)', [s.id, tid]);
    }
  }

  const writings = await query('SELECT id FROM writing_tasks');
  for (const w of writings) {
    for (const tid of [generalTopicId, devTopicId]) {
      const exists = await query('SELECT id FROM writing_topics WHERE writing_id = ? AND topic_id = ?', [w.id, tid]);
      if (exists.length === 0) await query('INSERT INTO writing_topics (writing_id, topic_id) VALUES (?, ?)', [w.id, tid]);
    }
  }

  const grammars = await query('SELECT id FROM grammar_exercises');
  for (const g of grammars) {
    for (const tid of [generalTopicId, devTopicId]) {
      const exists = await query('SELECT id FROM grammar_topics_map WHERE grammar_id = ? AND topic_id = ?', [g.id, tid]);
      if (exists.length === 0) await query('INSERT INTO grammar_topics_map (grammar_id, topic_id) VALUES (?, ?)', [g.id, tid]);
    }
  }

  const lessons = await query('SELECT id FROM grammar_lessons');
  for (const l of lessons) {
    for (const tid of [generalTopicId, devTopicId]) {
      const exists = await query('SELECT id FROM grammar_lesson_topics WHERE lesson_id = ? AND topic_id = ?', [l.id, tid]);
      if (exists.length === 0) await query('INSERT INTO grammar_lesson_topics (lesson_id, topic_id) VALUES (?, ?)', [l.id, tid]);
    }
  }

  console.log('✅ Assigned existing content to general + developer topics');

  // 6. Migrate existing users' job_role → user_topics
  const roleToTopic = {
    'Developer': 'developer',
    'Tester': 'tester',
    'DevOps': 'devops',
    'BA': 'ba',
    'PM': 'po',
    'Designer': 'designer',
    'Full Stack': 'developer',
  };

  const users = await query('SELECT id, job_role FROM users');
  for (const u of users) {
    const slug = roleToTopic[u.job_role] || 'general';
    const tid = topicMap[slug];
    if (tid) {
      const exists = await query('SELECT id FROM user_topics WHERE user_id = ? AND topic_id = ?', [u.id, tid]);
      if (exists.length === 0) await query('INSERT INTO user_topics (user_id, topic_id) VALUES (?, ?)', [u.id, tid]);
    }
    // Also assign general
    if (generalTopicId) {
      const exists = await query('SELECT id FROM user_topics WHERE user_id = ? AND topic_id = ?', [u.id, generalTopicId]);
      if (exists.length === 0) await query('INSERT INTO user_topics (user_id, topic_id) VALUES (?, ?)', [u.id, generalTopicId]);
    }
  }
  console.log(`✅ Migrated ${users.length} users' roles to topics`);

  console.log('\n🎉 Migration completed successfully!');
  process.exit(0);
}

migrate().catch(e => { console.error('❌ Migration failed:', e); process.exit(1); });
