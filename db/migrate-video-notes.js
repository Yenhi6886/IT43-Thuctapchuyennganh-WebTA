require('dotenv').config();
const { query } = require('./database');

async function migrate() {
  try {
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
    console.log('✅ TABLE video_notes created successfully.');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  }
}

migrate();
