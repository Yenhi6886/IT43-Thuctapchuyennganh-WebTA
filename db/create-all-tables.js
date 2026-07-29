require('dotenv').config();
const { query, getPool } = require('./database');

async function createTables() {
  console.log('Creating missing tables...');

  await query(`CREATE TABLE IF NOT EXISTS youtube_listening (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    youtube_id VARCHAR(50) NOT NULL,
    category VARCHAR(100) DEFAULT 'conversation',
    level VARCHAR(50) DEFAULT 'intermediate',
    duration VARCHAR(20),
    transcript JSON,
    day_number INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  console.log('✅ youtube_listening');

  await query(`CREATE TABLE IF NOT EXISTS video_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    video_id INT NOT NULL,
    youtube_id VARCHAR(50),
    time INT NOT NULL,
    text_en TEXT NOT NULL,
    text_vi TEXT,
    category VARCHAR(100),
    note_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES youtube_listening(id) ON DELETE CASCADE
  )`);
  console.log('✅ video_notes');

  await query(`CREATE TABLE IF NOT EXISTS user_checkins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    checkin_date DATE NOT NULL,
    streak INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, checkin_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  console.log('✅ user_checkins');

  await query(`CREATE TABLE IF NOT EXISTS user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    badge_key VARCHAR(50) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  console.log('✅ user_badges');

  await query(`CREATE TABLE IF NOT EXISTS blog_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id VARCHAR(36),
    author_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
  )`);
  console.log('✅ blog_comments');

  console.log('\n🎉 All tables created!');

  // Show all tables
  const tables = await query('SHOW TABLES');
  console.log('\nAll tables:');
  tables.forEach(t => console.log('  -', Object.values(t)[0]));

  process.exit(0);
}

createTables().catch(e => { console.error('Error:', e.message); process.exit(1); });
