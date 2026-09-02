require('dotenv').config();
const express = require('express');
const { ensureSampleContent } = require('./db/ensure-sample-content');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query } = require('./db/database');
const multer = require('multer');

async function ensureUserColumns() {
  const alters = [
    'ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP NULL'
  ];
  for (const sql of alters) {
    try { await query(sql); } catch (_) {}
  }
}

const app = express();
const PORT = 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer config for avatar upload
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${req.params.userId}_${Date.now()}${ext}`);
  }
});
const uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files allowed'));
}});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== TOPICS API (public) =====
app.get('/api/topics', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM topics ORDER BY sort_order, name');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== AUTH ROUTES =====
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, display_name, english_level, job_role, language, topics } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const existing = await query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const id = uuidv4();
    const hash = bcrypt.hashSync(password, 10);
    const level = english_level || 'Beginner';
    const role = job_role || '';
    const lang = language || 'vi';
    await query('INSERT INTO users (id, username, password, display_name, english_level, job_role, language) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, username, hash, display_name || username, level, role, lang]);

    // Save user topics
    const topicIds = Array.isArray(topics) ? topics : [];
    for (const tid of topicIds) {
      await query('INSERT IGNORE INTO user_topics (user_id, topic_id) VALUES (?, ?)', [id, parseInt(tid)]);
    }
    // If no topics selected, assign 'general'
    if (topicIds.length === 0) {
      const general = await query('SELECT id FROM topics WHERE slug = ?', ['general']);
      if (general.length) await query('INSERT IGNORE INTO user_topics (user_id, topic_id) VALUES (?, ?)', [id, general[0].id]);
    }

    // Fetch user's topics for response
    const userTopics = await query('SELECT t.* FROM topics t JOIN user_topics ut ON t.id = ut.topic_id WHERE ut.user_id = ? ORDER BY t.sort_order', [id]);

    res.json({ id, username, display_name: display_name || username, english_level: level, job_role: role, language: lang, topics: userTopics, created_at: new Date().toISOString(), last_login_at: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const rows = await query('SELECT id, username, password, display_name, streak_days, last_study_date, english_level, job_role, language, role, avatar_url, email, created_at, last_login_at FROM users WHERE username = ?', [username]);

    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const lastStudy = user.last_study_date;
    let streak = user.streak_days || 0;

    if (lastStudy) {
      const diff = (new Date(today) - new Date(lastStudy)) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak += 1;
      else if (diff > 1) streak = 1;
    } else {
      streak = 1;
    }

    await query('UPDATE users SET streak_days = ?, last_study_date = ?, last_login_at = NOW() WHERE id = ?', [streak, today, user.id]);

    // Fetch user's topics
    const userTopics = await query('SELECT t.* FROM topics t JOIN user_topics ut ON t.id = ut.topic_id WHERE ut.user_id = ? ORDER BY t.sort_order', [user.id]);
    const fresh = await query('SELECT created_at, last_login_at FROM users WHERE id = ?', [user.id]);

    res.json({ id: user.id, username: user.username, display_name: user.display_name, streak_days: streak, english_level: user.english_level || 'Beginner', job_role: user.job_role || '', language: user.language || 'vi', role: user.role || 'user', topics: userTopics, avatar: user.avatar_url || '', email: user.email || '', created_at: fresh[0]?.created_at, last_login_at: fresh[0]?.last_login_at });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/auth/profile/:userId', async (req, res) => {
  try {
    const rows = await query('SELECT id, username, display_name, email, avatar_url, role, created_at, last_login_at FROM users WHERE id = ?', [req.params.userId]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    const u = rows[0];
    res.json({ id: u.id, username: u.username, display_name: u.display_name, email: u.email || '', avatar: u.avatar_url || '', role: u.role, created_at: u.created_at, last_login_at: u.last_login_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== SOCIAL LOGIN =====
app.post('/api/auth/social', async (req, res) => {
  try {
    const { provider, token } = req.body;
    if (!provider || !token) return res.status(400).json({ error: 'Provider and token required' });

    let email, name, picture;

    if (provider === 'google') {
      // Verify Google Access Token
      const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!googleRes.ok) return res.status(401).json({ error: 'Invalid Google access token' });
      const googleData = await googleRes.json();
      email = googleData.email;
      name = googleData.name || googleData.email;
      picture = googleData.picture;
    } else if (provider === 'facebook') {
      // Verify Facebook token
      const fbRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${encodeURIComponent(token)}`);
      if (!fbRes.ok) return res.status(401).json({ error: 'Invalid Facebook token' });
      const fbData = await fbRes.json();
      email = fbData.email || `${fbData.id}@facebook.com`;
      name = fbData.name;
      picture = fbData.picture?.data?.url;
    } else {
      return res.status(400).json({ error: 'Unsupported provider' });
    }

    if (!email) return res.status(400).json({ error: 'Could not get email from provider' });

    // Check if user exists
    const existing = await query('SELECT * FROM users WHERE username = ?', [email]);
    let isNewUser = false;

    if (existing.length === 0) {
      // Create new user
      isNewUser = true;
      const id = uuidv4();
      const hash = bcrypt.hashSync(uuidv4(), 10); // random password
      await query('INSERT INTO users (id, username, password, display_name, english_level, job_role, language, avatar_url, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, email, hash, name, 'Intermediate', '', 'en', picture || '', email]);

      // Assign general topic
      const general = await query('SELECT id FROM topics WHERE slug = ?', ['general']);
      if (general.length) await query('INSERT IGNORE INTO user_topics (user_id, topic_id) VALUES (?, ?)', [id, general[0].id]);

      const userTopics = await query('SELECT t.* FROM topics t JOIN user_topics ut ON t.id = ut.topic_id WHERE ut.user_id = ? ORDER BY t.sort_order', [id]);
      res.json({ id, username: email, display_name: name, streak_days: 0, english_level: 'Intermediate', job_role: '', language: 'en', role: 'user', topics: userTopics, isNewUser: true, avatar: picture || '', email });
    } else {
      const user = existing[0];
      // Update streak
      const today = new Date().toISOString().split('T')[0];
      let streak = user.streak_days || 0;
      const lastStudy = user.last_study_date;
      if (lastStudy) {
        const diff = (new Date(today) - new Date(lastStudy)) / (1000 * 60 * 60 * 24);
        if (diff === 1) streak += 1;
        else if (diff > 1) streak = 1;
      } else { streak = 1; }
      // Update avatar if not already set
      const avatarUpdate = (!user.avatar_url && picture) ? ', avatar_url = ?' : '';
      const avatarParams = (!user.avatar_url && picture) ? [streak, today, name, picture, user.id] : [streak, today, name, user.id];
      await query(`UPDATE users SET streak_days = ?, last_study_date = ?, display_name = ?${avatarUpdate} WHERE id = ?`, avatarParams);

      const userTopics = await query('SELECT t.* FROM topics t JOIN user_topics ut ON t.id = ut.topic_id WHERE ut.user_id = ? ORDER BY t.sort_order', [user.id]);
      res.json({ id: user.id, username: user.username, display_name: name, streak_days: streak, english_level: user.english_level || 'Intermediate', job_role: user.job_role || '', language: user.language || 'en', role: user.role || 'user', topics: userTopics, isNewUser: false, avatar: user.avatar_url || picture || '', email: user.email || email });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update user level
app.put('/api/auth/level', async (req, res) => {
  try {
    const { userId, level } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    await query('UPDATE users SET english_level = ? WHERE id = ?', [level || 'Intermediate', userId]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/vocabulary/categories', async (req, res) => {
  try {
    const userId = req.query.userId;
    let sql = 'SELECT category, COUNT(*) as count FROM vocabulary';
    const params = [];
    if (userId) {
      const userTopics = await query('SELECT topic_id FROM user_topics WHERE user_id = ?', [userId]);
      if (userTopics.length > 0) {
        const topicIds = userTopics.map(t => t.topic_id);
        sql = `SELECT v.category, COUNT(DISTINCT v.id) as count FROM vocabulary v INNER JOIN vocabulary_topics vt ON v.id = vt.vocabulary_id WHERE vt.topic_id IN (${topicIds.map(() => '?').join(',')})`;
        params.push(...topicIds);
      }
    }
    sql += ' GROUP BY category ORDER BY category';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/vocabulary/by-category/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const category = req.query.category || '';
    const filter = req.query.filter || 'all'; // all | learned | unlearned

    let sql = `SELECT v.*, COALESCE(uv.learned, 0) as learned, COALESCE(uv.mastery_level, 0) as mastery_level,
      COALESCE(uv.correct_count, 0) as correct_count, COALESCE(uv.review_count, 0) as review_count
      FROM vocabulary v LEFT JOIN user_vocabulary uv ON v.id = uv.vocabulary_id AND uv.user_id = ?`;
    const params = [userId];

    const userTopics = await query('SELECT topic_id FROM user_topics WHERE user_id = ?', [userId]);
    if (userTopics.length > 0) {
      const topicIds = userTopics.map(t => t.topic_id);
      sql = `SELECT DISTINCT v.*, COALESCE(uv.learned, 0) as learned, COALESCE(uv.mastery_level, 0) as mastery_level,
        COALESCE(uv.correct_count, 0) as correct_count, COALESCE(uv.review_count, 0) as review_count
        FROM vocabulary v INNER JOIN vocabulary_topics vt ON v.id = vt.vocabulary_id
        LEFT JOIN user_vocabulary uv ON v.id = uv.vocabulary_id AND uv.user_id = ?
        WHERE vt.topic_id IN (${topicIds.map(() => '?').join(',')})`;
      params.push(...topicIds);
    }

    if (category) {
      sql += sql.includes(' WHERE ') ? ' AND v.category = ?' : ' WHERE v.category = ?';
      params.push(category);
    }
    if (filter === 'learned') {
      sql += sql.includes(' WHERE ') ? ' AND COALESCE(uv.learned, 0) = 1' : ' WHERE COALESCE(uv.learned, 0) = 1';
    } else if (filter === 'unlearned') {
      sql += sql.includes(' WHERE ') ? ' AND COALESCE(uv.learned, 0) = 0' : ' WHERE COALESCE(uv.learned, 0) = 0';
    }

    sql += ' ORDER BY v.id';
    const words = await query(sql, params);
    res.json(words);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/vocabulary/daily/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const day = parseInt(req.query.day) || 1;

    // Get user's topics
    const userTopics = await query('SELECT topic_id FROM user_topics WHERE user_id = ?', [userId]);
    
    let words;
    if (userTopics.length > 0) {
      const topicIds = userTopics.map(t => t.topic_id);
      words = await query(
        `SELECT DISTINCT v.*, COALESCE(uv.learned, 0) as learned, COALESCE(uv.mastery_level, 0) as mastery_level, COALESCE(uv.correct_count, 0) as correct_count, COALESCE(uv.review_count, 0) as review_count 
         FROM vocabulary v 
         INNER JOIN vocabulary_topics vt ON v.id = vt.vocabulary_id 
         LEFT JOIN user_vocabulary uv ON v.id = uv.vocabulary_id AND uv.user_id = ? 
         WHERE v.day_number = ? AND vt.topic_id IN (${topicIds.map(() => '?').join(',')}) 
         ORDER BY v.category, v.id`,
        [userId, day, ...topicIds]
      );
    } else {
      words = await query(`SELECT v.*, COALESCE(uv.learned, 0) as learned, COALESCE(uv.mastery_level, 0) as mastery_level, COALESCE(uv.correct_count, 0) as correct_count, COALESCE(uv.review_count, 0) as review_count FROM vocabulary v LEFT JOIN user_vocabulary uv ON v.id = uv.vocabulary_id AND uv.user_id = ? WHERE v.day_number = ? ORDER BY v.category, v.id`, [userId, day]);
    }

    res.json(words);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/vocabulary/all', async (req, res) => {
  try {
    const category = req.query.category;
    const userId = req.query.userId;
    let sql, params = [];

    if (userId) {
      const userTopics = await query('SELECT topic_id FROM user_topics WHERE user_id = ?', [userId]);
      if (userTopics.length > 0) {
        const topicIds = userTopics.map(t => t.topic_id);
        sql = `SELECT DISTINCT v.* FROM vocabulary v INNER JOIN vocabulary_topics vt ON v.id = vt.vocabulary_id WHERE vt.topic_id IN (${topicIds.map(() => '?').join(',')})`;
        params = [...topicIds];
        if (category) { sql += ' AND v.category = ?'; params.push(category); }
      } else {
        sql = 'SELECT * FROM vocabulary';
        if (category) { sql += ' WHERE category = ?'; params.push(category); }
      }
    } else {
      sql = 'SELECT * FROM vocabulary';
      if (category) { sql += ' WHERE category = ?'; params.push(category); }
    }
    sql += ' ORDER BY day_number, id';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/vocabulary/learn', async (req, res) => {
  try {
    const { userId, vocabularyId, correct } = req.body;

    const existing = await query('SELECT id, review_count, correct_count, mastery_level FROM user_vocabulary WHERE user_id = ? AND vocabulary_id = ?', [userId, vocabularyId]);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (existing.length) {
      const row = existing[0];
      const reviewCount = row.review_count + 1;
      const correctCount = row.correct_count + (correct ? 1 : 0);
      const mastery = correct ? Math.min(5, Math.floor(correctCount / 2)) : row.mastery_level;
      const learned = correct ? 1 : 0;
      await query('UPDATE user_vocabulary SET review_count = ?, correct_count = ?, mastery_level = ?, learned = ?, last_review = ? WHERE id = ?', [reviewCount, correctCount, mastery, learned, now, row.id]);
    } else {
      await query('INSERT INTO user_vocabulary (user_id, vocabulary_id, learned, review_count, correct_count, mastery_level, last_review) VALUES (?, ?, ?, 1, ?, ?, ?)', [userId, vocabularyId, correct ? 1 : 0, correct ? 1 : 0, correct ? 1 : 0, now]);
    }

    // Update daily stats
    const today = now.split(' ')[0];
    const stats = await query('SELECT id FROM daily_stats WHERE user_id = ? AND study_date = ?', [userId, today]);
    if (stats.length) {
      await query('UPDATE daily_stats SET words_learned = words_learned + 1 WHERE user_id = ? AND study_date = ?', [userId, today]);
    } else {
      await query('INSERT INTO daily_stats (user_id, study_date, words_learned) VALUES (?, ?, 1)', [userId, today]);
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===== READING ROUTES =====
const READING_TOPIC = { name: 'IT', icon: '💻' };

function normalizeReadingCategory(cat) {
  return 'IT';
}

app.get('/api/reading/topics', async (req, res) => {
  try {
    const rows = await query('SELECT COUNT(*) as total FROM reading_passages');
    res.json([{ name: READING_TOPIC.name, icon: READING_TOPIC.icon, count: rows[0]?.total || 0 }]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/reading/list', async (req, res) => {
  try {
    const category = req.query.category;
    const rows = await query('SELECT id, title, category, day_number FROM reading_passages ORDER BY id');
    let list = rows.map(r => ({ ...r, category: normalizeReadingCategory(r.category) }));
    if (category) list = list.filter(r => r.category === category);
    res.json(list);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/reading/story/:id', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM reading_passages WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const obj = rows[0];
    obj.category = normalizeReadingCategory(obj.category);
    if (typeof obj.questions === 'string') obj.questions = safeParseJson(obj.questions, []);
    res.json(obj);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/reading/:day', async (req, res) => {
  try {
    const userId = req.query.userId;
    let rows;
    if (userId) {
      const ut = await query('SELECT topic_id FROM user_topics WHERE user_id = ?', [userId]);
      if (ut.length > 0) {
        const tIds = ut.map(t => t.topic_id);
        rows = await query(`SELECT DISTINCT r.* FROM reading_passages r INNER JOIN reading_topics rt ON r.id = rt.reading_id WHERE r.day_number = ? AND rt.topic_id IN (${tIds.map(()=>'?').join(',')}) LIMIT 1`, [parseInt(req.params.day), ...tIds]);
      }
    }
    if (!rows || !rows.length) {
      rows = await query('SELECT * FROM reading_passages WHERE day_number = ? LIMIT 1', [parseInt(req.params.day)]);
    }
    if (!rows.length) return res.status(404).json({ error: 'No passage found' });
    const obj = rows[0];
    if (typeof obj.questions === 'string') obj.questions = JSON.parse(obj.questions);
    res.json(obj);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===== LISTENING ROUTES =====
app.get('/api/listening/:day', async (req, res) => {
  try {
    const userId = req.query.userId;
    let rows;
    if (userId) {
      const ut = await query('SELECT topic_id FROM user_topics WHERE user_id = ?', [userId]);
      if (ut.length > 0) {
        const tIds = ut.map(t => t.topic_id);
        rows = await query(`SELECT DISTINCT l.* FROM listening_dialogues l INNER JOIN listening_topics lt ON l.id = lt.listening_id WHERE l.day_number = ? AND lt.topic_id IN (${tIds.map(()=>'?').join(',')}) LIMIT 1`, [parseInt(req.params.day), ...tIds]);
      }
    }
    if (!rows || !rows.length) {
      rows = await query('SELECT * FROM listening_dialogues WHERE day_number = ? LIMIT 1', [parseInt(req.params.day)]);
    }
    if (!rows.length) return res.status(404).json({ error: 'No dialogue found' });
    const obj = rows[0];
    if (typeof obj.questions === 'string') obj.questions = JSON.parse(obj.questions);
    res.json(obj);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===== GRAMMAR ROUTES =====
const GRAMMAR_TYPES = [
  'Thì (Tenses)', 'Câu điều kiện (Conditionals)', 'Câu bị động (Passive Voice)',
  'Mệnh đề quan hệ (Relative Clauses)', 'Giới từ (Prepositions)', 'Liên từ (Conjunctions)',
  'Động từ khuyết thiếu (Modals)', 'Danh động từ & V-ing (Gerunds)', 'So sánh (Comparisons)'
];

app.get('/api/grammar/types', async (req, res) => {
  try {
    const lessonRows = await query('SELECT topic, COUNT(*) as count FROM grammar_lessons WHERE topic IS NOT NULL AND topic != "" GROUP BY topic');
    const exRows = await query('SELECT grammar_topic, COUNT(*) as count FROM grammar_exercises WHERE grammar_topic IS NOT NULL AND grammar_topic != "" GROUP BY grammar_topic');
    const counts = {};
    lessonRows.forEach(r => { counts[r.topic] = (counts[r.topic] || 0) + r.count; });
    exRows.forEach(r => { counts[r.grammar_topic] = (counts[r.grammar_topic] || 0) + r.count; });
    const types = [...new Set([...GRAMMAR_TYPES, ...Object.keys(counts)])];
    res.json(types.map(name => ({ name, count: counts[name] || 0 })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/grammar/lessons-by-type/:type', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM grammar_lessons WHERE topic = ? ORDER BY id', [req.params.type]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/grammar/exercises-by-type/:type', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM grammar_exercises WHERE grammar_topic = ? ORDER BY id', [req.params.type]);
    rows.forEach(r => { if (typeof r.options === 'string') r.options = JSON.parse(r.options); });
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/grammar/lessons/:day', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM grammar_lessons WHERE day_number = ? ORDER BY id', [parseInt(req.params.day)]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/grammar/lessons', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM grammar_lessons ORDER BY day_number, id');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/grammar/:day', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM grammar_exercises WHERE day_number = ?', [parseInt(req.params.day)]);
    rows.forEach(r => {
      if (typeof r.options === 'string') r.options = JSON.parse(r.options);
    });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===== WRITING ROUTES =====
app.get('/api/writing/:day', async (req, res) => {
  try {
    const userId = req.query.userId;
    let rows;
    if (userId) {
      const ut = await query('SELECT topic_id FROM user_topics WHERE user_id = ?', [userId]);
      if (ut.length > 0) {
        const tIds = ut.map(t => t.topic_id);
        rows = await query(`SELECT DISTINCT w.* FROM writing_tasks w INNER JOIN writing_topics wt ON w.id = wt.writing_id WHERE w.day_number = ? AND wt.topic_id IN (${tIds.map(()=>'?').join(',')}) LIMIT 1`, [parseInt(req.params.day), ...tIds]);
      }
    }
    if (!rows || !rows.length) {
      rows = await query('SELECT * FROM writing_tasks WHERE day_number = ? LIMIT 1', [parseInt(req.params.day)]);
    }
    if (!rows.length) return res.status(404).json({ error: 'No task found' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/writing/submit', async (req, res) => {
  try {
    const { userId, taskId, answer } = req.body;
    const wordCount = answer.trim().split(/\s+/).length;

    let feedback = '';
    let score = 0;

    if (wordCount < 50) { feedback = 'Your answer is too short. Try to write at least 100 words.'; score = 30; }
    else if (wordCount < 100) { feedback = 'Good start! Try to elaborate more on your points.'; score = 60; }
    else if (wordCount < 150) { feedback = 'Well written! You covered the main points.'; score = 80; }
    else { feedback = 'Excellent! Comprehensive and well-structured answer.'; score = 90; }

    await query('INSERT INTO user_progress (user_id, activity_type, activity_id, score, completed, answer_text, feedback) VALUES (?, ?, ?, ?, 1, ?, ?)', [userId, 'writing', taskId, score, answer, feedback]);

    const today = new Date().toISOString().split('T')[0];
    const stats = await query('SELECT id FROM daily_stats WHERE user_id = ? AND study_date = ?', [userId, today]);
    if (stats.length) {
      await query('UPDATE daily_stats SET writing_done = writing_done + 1, total_score = total_score + ? WHERE user_id = ? AND study_date = ?', [score, userId, today]);
    } else {
      await query('INSERT INTO daily_stats (user_id, study_date, writing_done, total_score) VALUES (?, ?, 1, ?)', [userId, today, score]);
    }

    const task = await query('SELECT sample_answer FROM writing_tasks WHERE id = ?', [taskId]);
    const sampleAnswer = task.length ? task[0].sample_answer : '';

    res.json({ score, feedback, wordCount, sampleAnswer });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===== SPEAKING ROUTES =====
app.get('/api/speaking/:day', async (req, res) => {
  try {
    const userId = req.query.userId;
    let rows;
    if (userId) {
      const ut = await query('SELECT topic_id FROM user_topics WHERE user_id = ?', [userId]);
      if (ut.length > 0) {
        const tIds = ut.map(t => t.topic_id);
        rows = await query(`SELECT DISTINCT s.* FROM speaking_prompts s INNER JOIN speaking_topics st ON s.id = st.speaking_id WHERE s.day_number = ? AND st.topic_id IN (${tIds.map(()=>'?').join(',')})`, [parseInt(req.params.day), ...tIds]);
      }
    }
    if (!rows || !rows.length) {
      rows = await query('SELECT * FROM speaking_prompts WHERE day_number = ?', [parseInt(req.params.day)]);
    }
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/speaking/evaluate', async (req, res) => {
  try {
    const { userId, promptId, transcript } = req.body;

    const prompts = await query('SELECT * FROM speaking_prompts WHERE id = ?', [promptId]);
    let score = 0;
    let feedback = '';

    if (prompts.length) {
      const prompt = prompts[0];
      const keyPhrases = prompt.key_phrases ? prompt.key_phrases.split('|') : [];

      const words = transcript.toLowerCase().split(/\s+/);
      const wordCount = words.length;
      let matchedPhrases = 0;
      keyPhrases.forEach(p => { if (transcript.toLowerCase().includes(p.toLowerCase())) matchedPhrases++; });

      if (wordCount < 20) { score = 40; feedback = 'Try to speak more. Aim for at least 50 words.'; }
      else if (wordCount < 50) { score = 60; feedback = 'Good attempt! Try to elaborate with more details.'; }
      else if (wordCount < 100) { score = 75; feedback = 'Well spoken! Good use of vocabulary.'; }
      else { score = 90; feedback = 'Excellent! Detailed and well-structured response.'; }

      if (matchedPhrases > 0) {
        score = Math.min(100, score + matchedPhrases * 5);
        feedback += ` You used ${matchedPhrases}/${keyPhrases.length} key phrases.`;
      }
    }

    await query('INSERT INTO user_progress (user_id, activity_type, activity_id, score, completed, answer_text, feedback) VALUES (?, ?, ?, ?, 1, ?, ?)', [userId, 'speaking', promptId, score, transcript, feedback]);

    res.json({ score, feedback });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===== PROGRESS ROUTES =====
app.get('/api/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const dailyStats = await query('SELECT * FROM daily_stats WHERE user_id = ? ORDER BY study_date DESC LIMIT 30', [userId]);
    const vocabProgress = await query('SELECT COUNT(*) as total, SUM(CASE WHEN learned = 1 THEN 1 ELSE 0 END) as learned FROM user_vocabulary WHERE user_id = ?', [userId]);
    
    // Count vocab ONLY for user's topics
    const userTopics = await query('SELECT topic_id FROM user_topics WHERE user_id = ?', [userId]);
    let totalVocab;
    if (userTopics.length > 0) {
      const topicIds = userTopics.map(t => t.topic_id);
      totalVocab = await query(`SELECT COUNT(DISTINCT v.id) as total FROM vocabulary v INNER JOIN vocabulary_topics vt ON v.id = vt.vocabulary_id WHERE vt.topic_id IN (${topicIds.map(() => '?').join(',')})`, topicIds);
    } else {
      totalVocab = await query('SELECT COUNT(*) as total FROM vocabulary');
    }
    
    const user = await query('SELECT streak_days, last_study_date FROM users WHERE id = ?', [userId]);

    const learned = vocabProgress.length ? vocabProgress[0].learned || 0 : 0;
    const total = totalVocab.length ? totalVocab[0].total : 0;
    const streak = user.length ? user[0].streak_days : 0;

    res.json({ dailyStats, vocabLearned: learned, vocabTotal: total, streak });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/progress/activity', async (req, res) => {
  try {
    const { userId, activityType, activityId, score } = req.body;

    await query('INSERT INTO user_progress (user_id, activity_type, activity_id, score, completed) VALUES (?, ?, ?, ?, 1)', [userId, activityType, activityId, score]);

    const today = new Date().toISOString().split('T')[0];
    const field = activityType + '_done';
    const validFields = ['reading_done', 'listening_done', 'speaking_done', 'writing_done', 'grammar_done', 'exercises_completed'];
    const updateField = validFields.includes(field) ? field : 'exercises_completed';

    const stats = await query('SELECT id FROM daily_stats WHERE user_id = ? AND study_date = ?', [userId, today]);
    if (stats.length) {
      await query(`UPDATE daily_stats SET ${updateField} = ${updateField} + 1, total_score = total_score + ? WHERE user_id = ? AND study_date = ?`, [score, userId, today]);
    } else {
      await query(`INSERT INTO daily_stats (user_id, study_date, ${updateField}, total_score) VALUES (?, ?, 1, ?)`, [userId, today, score]);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===== COMPANY REVIEW ROUTES =====
app.get('/api/companies', async (req, res) => {
  try {
    const rows = await query(`SELECT c.*,
      (SELECT COUNT(*) FROM company_reviews WHERE company_id = c.id) as review_count,
      COALESCE((SELECT ROUND(AVG(rating),1) FROM company_ratings WHERE company_id = c.id), c.rating) as avg_rating,
      (SELECT COUNT(*) FROM company_ratings WHERE company_id = c.id) as rating_count
      FROM companies c ORDER BY avg_rating DESC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/companies', async (req, res) => {
  try {
    const { name, salaryRange, tags, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Company name is required' });
    const existing = await query('SELECT id FROM companies WHERE name = ?', [name]);
    if (existing.length) return res.status(409).json({ error: 'Company already exists' });
    const result = await query('INSERT INTO companies (name, salary_range, rating, tags, description) VALUES (?, ?, 0, ?, ?)', [name, salaryRange || '', tags || '', description || '']);
    res.json({ success: true, id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/companies/:id/rate', async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);
    const { userId, rating } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
    const existing = await query('SELECT id FROM company_ratings WHERE company_id = ? AND user_id = ?', [companyId, userId]);
    if (existing.length) {
      await query('UPDATE company_ratings SET rating = ? WHERE company_id = ? AND user_id = ?', [rating, companyId, userId]);
    } else {
      await query('INSERT INTO company_ratings (company_id, user_id, rating) VALUES (?, ?, ?)', [companyId, userId, rating]);
    }
    const avg = await query('SELECT ROUND(AVG(rating),1) as avg_rating FROM company_ratings WHERE company_id = ?', [companyId]);
    const avgRating = avg[0].avg_rating;
    await query('UPDATE companies SET rating = ? WHERE id = ?', [avgRating, companyId]);
    res.json({ success: true, avgRating });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/companies/:id/reviews', async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);
    const rows = await query('SELECT * FROM company_reviews WHERE company_id = ? ORDER BY upvotes DESC, created_at DESC', [companyId]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/companies/:id/reviews', async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);
    const { userId, displayName, isAnonymous, question, answer, difficulty, position, result: interviewResult } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const name = isAnonymous ? 'Ẩn danh' : (displayName || 'Ẩn danh');
    await query('INSERT INTO company_reviews (company_id, user_id, display_name, is_anonymous, interview_question, suggested_answer, difficulty, position, result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [companyId, userId || null, name, isAnonymous ? 1 : 0, question, answer || '', difficulty || 'Medium', position || '', interviewResult || '']);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/companies/reviews/:reviewId/upvote', async (req, res) => {
  try {
    await query('UPDATE company_reviews SET upvotes = upvotes + 1 WHERE id = ?', [parseInt(req.params.reviewId)]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/companies/:id/my-rating', async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);
    const userId = req.query.userId;
    const rows = await query('SELECT rating FROM company_ratings WHERE company_id = ? AND user_id = ?', [companyId, userId]);
    res.json({ rating: rows.length ? rows[0].rating : 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== USER SETTINGS =====
app.put('/api/auth/language', async (req, res) => {
  try {
    const { userId, language } = req.body;
    if (!userId || !language) return res.status(400).json({ error: 'userId and language required' });
    await query('UPDATE users SET language = ? WHERE id = ?', [language, userId]);
    res.json({ success: true, language });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== CHECK-IN / ATTENDANCE =====
const BADGE_MILESTONES = [
  { days: 3, type: 'streak_3', name: '🔥 3-Day Starter', icon: '🔥' },
  { days: 7, type: 'streak_7', name: '⭐ 7-Day Warrior', icon: '⭐' },
  { days: 14, type: 'streak_14', name: '💎 14-Day Champion', icon: '💎' },
  { days: 21, type: 'streak_21', name: '🏆 21-Day Master', icon: '🏆' },
  { days: 30, type: 'streak_30', name: '👑 30-Day Legend', icon: '👑' },
];

app.post('/api/checkin', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const today = new Date().toISOString().split('T')[0];

    // Check if already checked in today
    const existing = await query('SELECT id FROM user_checkins WHERE user_id = ? AND checkin_date = ?', [userId, today]);
    if (existing.length > 0) return res.json({ alreadyCheckedIn: true, message: 'Already checked in today' });

    await query('INSERT INTO user_checkins (user_id, checkin_date) VALUES (?, ?)', [userId, today]);

    // Calculate current streak
    const checkins = await query('SELECT checkin_date FROM user_checkins WHERE user_id = ? ORDER BY checkin_date DESC', [userId]);
    let streak = 1;
    for (let i = 1; i < checkins.length; i++) {
      const prev = new Date(checkins[i - 1].checkin_date);
      const curr = new Date(checkins[i].checkin_date);
      const diff = (prev - curr) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++;
      else break;
    }

    // Update streak in users table
    await query('UPDATE users SET streak_days = ?, last_study_date = ? WHERE id = ?', [streak, today, userId]);

    // Check for new badges
    const newBadges = [];
    for (const m of BADGE_MILESTONES) {
      if (streak >= m.days) {
        const existingBadge = await query('SELECT id FROM user_badges WHERE user_id = ? AND badge_type = ?', [userId, m.type]);
        if (existingBadge.length === 0) {
          await query('INSERT INTO user_badges (user_id, badge_type, badge_name) VALUES (?, ?, ?)', [userId, m.type, m.name]);
          newBadges.push(m);
        }
      }
    }

    const totalCheckins = await query('SELECT COUNT(*) as total FROM user_checkins WHERE user_id = ?', [userId]);

    res.json({ success: true, streak, totalCheckins: totalCheckins[0].total, newBadges });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/checkin/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date().toISOString().split('T')[0];
    const todayCheck = await query('SELECT id FROM user_checkins WHERE user_id = ? AND checkin_date = ?', [userId, today]);
    const checkins = await query('SELECT checkin_date FROM user_checkins WHERE user_id = ? ORDER BY checkin_date DESC LIMIT 30', [userId]);
    const badges = await query('SELECT * FROM user_badges WHERE user_id = ? ORDER BY earned_at', [userId]);
    const totalCheckins = await query('SELECT COUNT(*) as total FROM user_checkins WHERE user_id = ?', [userId]);

    // Calculate streak
    let streak = 0;
    if (checkins.length > 0) {
      streak = 1;
      for (let i = 1; i < checkins.length; i++) {
        const prev = new Date(checkins[i - 1].checkin_date);
        const curr = new Date(checkins[i].checkin_date);
        if ((prev - curr) / (1000 * 60 * 60 * 24) === 1) streak++;
        else break;
      }
    }

    res.json({
      checkedInToday: todayCheck.length > 0,
      streak,
      totalCheckins: totalCheckins[0].total,
      recentCheckins: checkins.map(c => c.checkin_date),
      badges
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/badges/:userId', async (req, res) => {
  try {
    const badges = await query('SELECT * FROM user_badges WHERE user_id = ? ORDER BY earned_at', [req.params.userId]);
    res.json(badges);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== PUBLIC COMPANY DETAIL (no login needed) =====
app.get('/api/companies/:id/detail', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM companies WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Company not found' });
    const company = rows[0];
    const reviews = await query('SELECT * FROM company_reviews WHERE company_id = ? ORDER BY created_at DESC', [req.params.id]);
    const avgResult = await query('SELECT AVG(rating) as avg_rating, COUNT(*) as rating_count FROM company_ratings WHERE company_id = ?', [req.params.id]);
    company.avg_rating = avgResult[0].avg_rating ? parseFloat(avgResult[0].avg_rating).toFixed(1) : company.rating;
    company.rating_count = avgResult[0].rating_count || 0;
    res.json({ company, reviews });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== ADMIN ROUTES =====
// Pagination helper
function getPagination(req) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(5000, Math.max(1, parseInt(req.query.limit) || 100));
  const offset = (page - 1) * limit;
  // Inline LIMIT/OFFSET — mysql2 prepared statements often reject placeholders here
  const limitSql = ` LIMIT ${limit} OFFSET ${offset}`;
  return { page, limit, offset, limitSql };
}

function safeParseJson(val, fallback) {
  if (val == null || val === '') return fallback;
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch (_) { return fallback; }
  }
  return fallback;
}

app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const usersResult = await query('SELECT COUNT(*) as total FROM users');
    const vocabResult = await query('SELECT COUNT(*) as total FROM vocabulary');
    const grammarLessonsResult = await query('SELECT COUNT(*) as total FROM grammar_lessons');
    const grammarResult = await query('SELECT COUNT(*) as total FROM grammar_exercises');
    const readingResult = await query('SELECT COUNT(*) as total FROM reading_passages');
    const listeningResult = await query('SELECT COUNT(*) as total FROM listening_dialogues');
    const videosResult = await query('SELECT COUNT(*) as total FROM youtube_listening');

    res.json({
      totalUsers: usersResult[0].total,
      totalVocab: vocabResult[0].total,
      totalGrammarLessons: grammarLessonsResult[0].total,
      totalGrammar: grammarResult[0].total,
      totalReading: readingResult[0].total,
      totalListening: listeningResult[0].total,
      totalShadowing: videosResult[0].total || 0
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Admin Topics CRUD ---
app.get('/api/admin/topics', async (req, res) => {
  try {
    const rows = await query(`SELECT t.*, 
      (SELECT COUNT(*) FROM user_topics WHERE topic_id = t.id) as user_count,
      (SELECT COUNT(*) FROM vocabulary_topics WHERE topic_id = t.id) as vocab_count
      FROM topics t ORDER BY t.sort_order, t.name`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/topics', async (req, res) => {
  try {
    const { slug, name, icon, color, description, sort_order } = req.body;
    if (!slug || !name) return res.status(400).json({ error: 'Slug and name required' });
    const existing = await query('SELECT id FROM topics WHERE slug = ?', [slug]);
    if (existing.length) return res.status(409).json({ error: 'Topic slug already exists' });
    const result = await query('INSERT INTO topics (slug, name, icon, color, description, sort_order) VALUES (?,?,?,?,?,?)',
      [slug, name, icon || '🌍', color || '#4f46e5', description || '', sort_order || 0]);
    res.json({ success: true, id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/topics/:id', async (req, res) => {
  try {
    const { name, icon, color, description, sort_order } = req.body;
    await query('UPDATE topics SET name=?, icon=?, color=?, description=?, sort_order=? WHERE id=?',
      [name, icon, color, description, sort_order || 0, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/topics/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Don't delete 'general' topic
    const topic = await query('SELECT slug FROM topics WHERE id = ?', [id]);
    if (topic.length && topic[0].slug === 'general') return res.status(400).json({ error: 'Cannot delete general topic' });
    await query('DELETE FROM user_topics WHERE topic_id = ?', [id]);
    await query('DELETE FROM vocabulary_topics WHERE topic_id = ?', [id]);
    await query('DELETE FROM reading_topics WHERE topic_id = ?', [id]);
    await query('DELETE FROM listening_topics WHERE topic_id = ?', [id]);
    await query('DELETE FROM speaking_topics WHERE topic_id = ?', [id]);
    await query('DELETE FROM writing_topics WHERE topic_id = ?', [id]);
    await query('DELETE FROM grammar_topics_map WHERE topic_id = ?', [id]);
    await query('DELETE FROM grammar_lesson_topics WHERE topic_id = ?', [id]);
    await query('DELETE FROM topics WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Admin: Assign topics to content ---
app.post('/api/admin/vocabulary/:id/topics', async (req, res) => {
  try {
    const vocabId = parseInt(req.params.id);
    const { topicIds } = req.body;
    await query('DELETE FROM vocabulary_topics WHERE vocabulary_id = ?', [vocabId]);
    for (const tid of (topicIds || [])) {
      await query('INSERT IGNORE INTO vocabulary_topics (vocabulary_id, topic_id) VALUES (?, ?)', [vocabId, parseInt(tid)]);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/vocabulary/:id/topics', async (req, res) => {
  try {
    const rows = await query('SELECT topic_id FROM vocabulary_topics WHERE vocabulary_id = ?', [parseInt(req.params.id)]);
    res.json(rows.map(r => r.topic_id));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Generic topic assignment for other content types
const contentTopicTables = {
  reading: { table: 'reading_topics', fk: 'reading_id' },
  listening: { table: 'listening_topics', fk: 'listening_id' },
  speaking: { table: 'speaking_topics', fk: 'speaking_id' },
  writing: { table: 'writing_topics', fk: 'writing_id' },
  grammar: { table: 'grammar_topics_map', fk: 'grammar_id' },
  'grammar-lessons': { table: 'grammar_lesson_topics', fk: 'lesson_id' },
};

app.post('/api/admin/content/:type/:id/topics', async (req, res) => {
  try {
    const cfg = contentTopicTables[req.params.type];
    if (!cfg) return res.status(400).json({ error: 'Invalid content type' });
    const contentId = parseInt(req.params.id);
    const { topicIds } = req.body;
    await query(`DELETE FROM ${cfg.table} WHERE ${cfg.fk} = ?`, [contentId]);
    for (const tid of (topicIds || [])) {
      await query(`INSERT IGNORE INTO ${cfg.table} (${cfg.fk}, topic_id) VALUES (?, ?)`, [contentId, parseInt(tid)]);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Admin: User topics management ---
app.get('/api/admin/users/:id/topics', async (req, res) => {
  try {
    const rows = await query('SELECT t.* FROM topics t JOIN user_topics ut ON t.id = ut.topic_id WHERE ut.user_id = ?', [req.params.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/users/:id/topics', async (req, res) => {
  try {
    const userId = req.params.id;
    const { topicIds } = req.body;
    await query('DELETE FROM user_topics WHERE user_id = ?', [userId]);
    for (const tid of (topicIds || [])) {
      await query('INSERT IGNORE INTO user_topics (user_id, topic_id) VALUES (?, ?)', [userId, parseInt(tid)]);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- User: Update own topics ---
app.put('/api/auth/topics', async (req, res) => {
  try {
    const { userId, topicIds } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    await query('DELETE FROM user_topics WHERE user_id = ?', [userId]);
    for (const tid of (topicIds || [])) {
      await query('INSERT IGNORE INTO user_topics (user_id, topic_id) VALUES (?, ?)', [userId, parseInt(tid)]);
    }
    const userTopics = await query('SELECT t.* FROM topics t JOIN user_topics ut ON t.id = ut.topic_id WHERE ut.user_id = ? ORDER BY t.sort_order', [userId]);
    res.json({ success: true, topics: userTopics });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Admin Users CRUD ---
app.get('/api/admin/users', async (req, res) => {
  try {
    const { page, limit, limitSql } = getPagination(req);
    const search = req.query.search;
    let whereSql = '';
    const params = [];
    if (search) {
      whereSql = ' WHERE username LIKE ? OR display_name LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    const countResult = await query('SELECT COUNT(*) as total FROM users' + whereSql, params);
    const total = countResult[0].total;
    const rows = await query('SELECT id, username, display_name, role, created_at, last_login_at FROM users' + whereSql + ' ORDER BY role DESC, COALESCE(last_login_at, created_at) DESC' + limitSql, params);
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (role !== 'role_admin' && role !== 'user') {
      return res.status(400).json({ error: 'Role không hợp lệ. Chỉ chấp nhận role_admin hoặc user.' });
    }
    await query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await query('DELETE FROM user_vocabulary WHERE user_id = ?', [userId]);
    await query('DELETE FROM user_progress WHERE user_id = ?', [userId]);
    await query('DELETE FROM daily_stats WHERE user_id = ?', [userId]);
    await query('DELETE FROM user_checkins WHERE user_id = ?', [userId]);
    await query('DELETE FROM user_badges WHERE user_id = ?', [userId]);
    await query('DELETE FROM company_ratings WHERE user_id = ?', [userId]);
    await query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Admin Vocabulary CRUD ---
app.get('/api/admin/vocabulary', async (req, res) => {
  try {
    const { page, limit, limitSql } = getPagination(req);
    const cat = req.query.category;
    const search = req.query.search;
    let baseSql = 'FROM vocabulary';
    const params = [];
    const conditions = [];
    if (cat) { conditions.push('category = ?'); params.push(cat); }
    if (search) { conditions.push('(term LIKE ? OR definition_vi LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (conditions.length) baseSql += ' WHERE ' + conditions.join(' AND ');
    const countResult = await query('SELECT COUNT(*) as total ' + baseSql, params);
    const total = countResult[0].total;
    const rows = await query('SELECT * ' + baseSql + ' ORDER BY day_number, id' + limitSql, params);
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/vocabulary/categories', async (req, res) => {
  try {
    const rows = await query('SELECT DISTINCT category, COUNT(*) as count FROM vocabulary GROUP BY category ORDER BY category');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/vocabulary', async (req, res) => {
  try {
    const { term, word_type, definition_vi, definition_en, category, example1, example2, example3, day_number } = req.body;
    if (!term) return res.status(400).json({ error: 'Term is required' });
    const result = await query('INSERT INTO vocabulary (term, word_type, definition_vi, definition_en, category, example1, example2, example3, day_number) VALUES (?,?,?,?,?,?,?,?,?)',
      [term, word_type || 'n.', definition_vi || '', definition_en || '', category || 'General', example1 || '', example2 || '', example3 || '', day_number || 1]);
    res.json({ success: true, id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/vocabulary/:id', async (req, res) => {
  try {
    const { term, word_type, definition_vi, definition_en, category, example1, example2, example3, day_number } = req.body;
    await query('UPDATE vocabulary SET term=?, word_type=?, definition_vi=?, definition_en=?, category=?, example1=?, example2=?, example3=?, day_number=? WHERE id=?',
      [term, word_type, definition_vi, definition_en, category, example1, example2, example3, day_number, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/vocabulary/:id', async (req, res) => {
  try {
    await query('DELETE FROM user_vocabulary WHERE vocabulary_id = ?', [req.params.id]);
    await query('DELETE FROM vocabulary WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Admin Grammar Lessons CRUD ---
app.get('/api/admin/grammar-lessons', async (req, res) => {
  try {
    const { page, limit, limitSql } = getPagination(req);
    const countResult = await query('SELECT COUNT(*) as total FROM grammar_lessons');
    const total = countResult[0].total;
    const rows = await query('SELECT * FROM grammar_lessons ORDER BY day_number, id' + limitSql);
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/grammar-lessons', async (req, res) => {
  try {
    const { topic, title_vi, title_en, content_vi, content_en, examples_vi, examples_en, tips_vi, tips_en, day_number } = req.body;
    if (!title_vi || !content_vi) return res.status(400).json({ error: 'Vietnamese title and content required' });
    const result = await query('INSERT INTO grammar_lessons (topic, title_vi, title_en, content_vi, content_en, examples_vi, examples_en, tips_vi, tips_en, day_number) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [topic || '', title_vi, title_en || title_vi, content_vi, content_en || content_vi, examples_vi || '', examples_en || '', tips_vi || '', tips_en || '', day_number || 1]);
    res.json({ success: true, id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/grammar-lessons/:id', async (req, res) => {
  try {
    const { topic, title_vi, title_en, content_vi, content_en, examples_vi, examples_en, tips_vi, tips_en, day_number } = req.body;
    if (!title_vi || !content_vi) return res.status(400).json({ error: 'Vietnamese title and content required' });
    await query('UPDATE grammar_lessons SET topic=?, title_vi=?, title_en=?, content_vi=?, content_en=?, examples_vi=?, examples_en=?, tips_vi=?, tips_en=?, day_number=? WHERE id=?',
      [topic || '', title_vi, title_en || title_vi, content_vi, content_en || content_vi, examples_vi || '', examples_en || '', tips_vi || '', tips_en || '', day_number, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/grammar-lessons/:id', async (req, res) => {
  try {
    await query('DELETE FROM grammar_lessons WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Admin Grammar CRUD ---
app.get('/api/admin/grammar', async (req, res) => {
  try {
    const { page, limit, limitSql } = getPagination(req);
    const countResult = await query('SELECT COUNT(*) as total FROM grammar_exercises');
    const total = countResult[0].total;
    const rows = await query('SELECT * FROM grammar_exercises ORDER BY day_number, id' + limitSql);
    rows.forEach(r => { r.options = safeParseJson(r.options, []); });
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/grammar', async (req, res) => {
  try {
    const { question, options, correct_answer, explanation, grammar_topic, day_number } = req.body;
    const opts = typeof options === 'string' ? options : JSON.stringify(options);
    const result = await query('INSERT INTO grammar_exercises (question, options, correct_answer, explanation, grammar_topic, day_number) VALUES (?,?,?,?,?,?)',
      [question, opts, correct_answer, explanation || '', grammar_topic || '', day_number || 1]);
    res.json({ success: true, id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/grammar/:id', async (req, res) => {
  try {
    const { question, options, correct_answer, explanation, grammar_topic, day_number } = req.body;
    const opts = typeof options === 'string' ? options : JSON.stringify(options);
    await query('UPDATE grammar_exercises SET question=?, options=?, correct_answer=?, explanation=?, grammar_topic=?, day_number=? WHERE id=?',
      [question, opts, correct_answer, explanation, grammar_topic, day_number, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Dynamic YouTube Import ---
async function translateText(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data[0].map(x => x[0]).join('');
}

function unescapeXml(str) {
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

app.post('/api/admin/youtube-import', async (req, res) => {
  try {
    const { videoId, title, category, level, day_number } = req.body;
    if (!videoId) return res.status(400).json({ error: 'Video ID required' });
    
    // Scrape captions
    const payload = { context: { client: { clientName: "ANDROID", clientVersion: "20.10.38" } }, videoId };
    const headers = { "User-Agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 14)", "Content-Type": "application/json" };
    
    const ytRes = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", { method: "POST", headers, body: JSON.stringify(payload) });
    const data = await ytRes.json();
    const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!tracks) return res.status(400).json({ error: "No caption tracks available. Please pick a video with CC." });

    const enTrack = tracks.find(t => t.languageCode === 'en' || t.languageCode.startsWith('en')) || tracks[0];
    const enRes = await fetch(enTrack.baseUrl, { headers });
    const xml = await enRes.text();

    const regex = /<p[^>]*t="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
    let match, lines = [];
    while ((match = regex.exec(xml)) !== null) {
      const timeMs = parseInt(match[1]);
      let rawText = match[2].replace(/<[^>]+>/g, '').replace(/\n/g, ' '); 
      rawText = unescapeXml(rawText).trim();
      if (rawText && !rawText.includes('[Music]') && !rawText.includes('[Applause]')) {
        lines.push({ time: Math.floor(timeMs / 1000), text: rawText });
      }
    }

    let uniqueLines = [], lastTime = -1, currentText = '';
    for (let l of lines) {
      if (l.time > lastTime + 2) {
        if (currentText) uniqueLines.push({ time: lastTime, text: currentText.trim() });
        lastTime = l.time; currentText = l.text;
      } else {
        if (!currentText.includes(l.text)) currentText += ' ' + l.text;
      }
    }
    if (currentText) uniqueLines.push({ time: lastTime, text: currentText.trim() });
    
    uniqueLines = uniqueLines.slice(0, 50); // Small limit to ensure quick API response (approx ~2 min of speech)

    const batchSize = 10;
    for (let i = 0; i < uniqueLines.length; i += batchSize) {
      const chunk = uniqueLines.slice(i, i + batchSize);
      const chunkText = chunk.map(l => l.text).join(' ||| '); 
      try {
        const translation = await translateText(chunkText);
        const viLines = translation.split(/\s*\|\|\|\s*/);
        chunk.forEach((l, idx) => { l.vi = viLines[idx]?.trim() || ''; });
      } catch (e) {
        console.error(`Translation fail chunk ${i}:`, e.message);
      }
    }

    const durText = `${Math.floor(uniqueLines[uniqueLines.length-1]?.time / 60) || 0}:${String((uniqueLines[uniqueLines.length-1]?.time || 0) % 60).padStart(2,'0')}`;

    const r = await query('INSERT INTO youtube_listening (title, youtube_id, category, level, duration, transcript, day_number) VALUES (?,?,?,?,?,?,?)',
      [title || 'Imported Video', videoId, category || 'technique', level || 'intermediate', durText, JSON.stringify(uniqueLines), day_number || 1]);
    
    res.json({ success: true, id: r.insertId });
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
});

app.delete('/api/admin/youtube-import/:id', async (req, res) => {
  try {
    await query('DELETE FROM youtube_listening WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/admin/grammar/:id', async (req, res) => {
  try {
    await query('DELETE FROM grammar_exercises WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Admin Reading CRUD ---
app.get('/api/admin/reading', async (req, res) => {
  try {
    const { page, limit, limitSql } = getPagination(req);
    const category = req.query.category;
    const countResult = await query('SELECT COUNT(*) as total FROM reading_passages');
    const rows = await query('SELECT * FROM reading_passages ORDER BY category, id' + limitSql);
    rows.forEach(r => {
      r.category = normalizeReadingCategory(r.category);
      r.questions = safeParseJson(r.questions, []);
    });
    let data = rows;
    if (category) data = rows.filter(r => r.category === category);
    const total = category ? data.length : countResult[0].total;
    res.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/reading/:id', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM reading_passages WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    rows[0].questions = safeParseJson(rows[0].questions, []);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/reading', async (req, res) => {
  try {
    const { title, content, category, questions, day_number } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
    const cat = normalizeReadingCategory(category);
    const qs = typeof questions === 'string' ? questions : JSON.stringify(questions || []);
    const result = await query('INSERT INTO reading_passages (title, content, category, questions, day_number) VALUES (?,?,?,?,?)',
      [title, content, cat, qs, day_number || 1]);
    res.json({ success: true, id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/reading/:id', async (req, res) => {
  try {
    const { title, content, category, questions, day_number } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
    const cat = normalizeReadingCategory(category);
    const qs = typeof questions === 'string' ? questions : JSON.stringify(questions || []);
    await query('UPDATE reading_passages SET title=?, content=?, category=?, questions=?, day_number=? WHERE id=?',
      [title, content, cat, qs, day_number || 1, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/reading/:id', async (req, res) => {
  try {
    await query('DELETE FROM reading_passages WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Admin Listening CRUD ---
app.get('/api/admin/listening', async (req, res) => {
  try {
    const { page, limit, limitSql } = getPagination(req);
    const countResult = await query('SELECT COUNT(*) as total FROM listening_dialogues');
    const total = countResult[0].total;
    const rows = await query('SELECT * FROM listening_dialogues ORDER BY day_number, id' + limitSql);
    rows.forEach(r => { r.questions = safeParseJson(r.questions, []); });
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/listening/:id', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM listening_dialogues WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    rows[0].questions = safeParseJson(rows[0].questions, []);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/listening', async (req, res) => {
  try {
    const { title, dialogue, category, questions, day_number } = req.body;
    if (!title || !dialogue) return res.status(400).json({ error: 'Title and dialogue required' });
    const qs = typeof questions === 'string' ? questions : JSON.stringify(questions || []);
    const result = await query('INSERT INTO listening_dialogues (title, dialogue, category, questions, day_number) VALUES (?,?,?,?,?)',
      [title, dialogue, category || '', qs, day_number || 1]);
    res.json({ success: true, id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/listening/:id', async (req, res) => {
  try {
    const { title, dialogue, category, questions, day_number } = req.body;
    if (!title || !dialogue) return res.status(400).json({ error: 'Title and dialogue required' });
    const qs = typeof questions === 'string' ? questions : JSON.stringify(questions || []);
    await query('UPDATE listening_dialogues SET title=?, dialogue=?, category=?, questions=?, day_number=? WHERE id=?',
      [title, dialogue, category || '', qs, day_number || 1, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/listening/:id', async (req, res) => {
  try {
    await query('DELETE FROM listening_dialogues WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Admin Speaking CRUD ---
app.get('/api/admin/speaking', async (req, res) => {
  try {
    const { page, limit, limitSql } = getPagination(req);
    const countResult = await query('SELECT COUNT(*) as total FROM speaking_prompts');
    const total = countResult[0].total;
    const rows = await query('SELECT * FROM speaking_prompts ORDER BY day_number, id' + limitSql);
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/speaking/:id', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM speaking_prompts WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/speaking', async (req, res) => {
  try {
    const { prompt, sample_answer, key_phrases, category, day_number } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });
    const result = await query('INSERT INTO speaking_prompts (prompt, sample_answer, key_phrases, category, day_number) VALUES (?,?,?,?,?)',
      [prompt, sample_answer || '', key_phrases || '', category || '', day_number || 1]);
    res.json({ success: true, id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/speaking/:id', async (req, res) => {
  try {
    const { prompt, sample_answer, key_phrases, category, day_number } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });
    await query('UPDATE speaking_prompts SET prompt=?, sample_answer=?, key_phrases=?, category=?, day_number=? WHERE id=?',
      [prompt, sample_answer || '', key_phrases || '', category || '', day_number || 1, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/speaking/:id', async (req, res) => {
  try {
    await query('DELETE FROM speaking_prompts WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Admin Writing CRUD ---
app.get('/api/admin/writing', async (req, res) => {
  try {
    const { page, limit, limitSql } = getPagination(req);
    const countResult = await query('SELECT COUNT(*) as total FROM writing_tasks');
    const total = countResult[0].total;
    const rows = await query('SELECT * FROM writing_tasks ORDER BY day_number, id' + limitSql);
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/writing/:id', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM writing_tasks WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/writing', async (req, res) => {
  try {
    const { title, prompt, sample_answer, category, word_limit, day_number } = req.body;
    if (!title || !prompt) return res.status(400).json({ error: 'Title and prompt required' });
    const result = await query('INSERT INTO writing_tasks (title, prompt, sample_answer, category, word_limit, day_number) VALUES (?,?,?,?,?,?)',
      [title, prompt, sample_answer || '', category || '', word_limit || 150, day_number || 1]);
    res.json({ success: true, id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/writing/:id', async (req, res) => {
  try {
    const { title, prompt, sample_answer, category, word_limit, day_number } = req.body;
    if (!title || !prompt) return res.status(400).json({ error: 'Title and prompt required' });
    await query('UPDATE writing_tasks SET title=?, prompt=?, sample_answer=?, category=?, word_limit=?, day_number=? WHERE id=?',
      [title, prompt, sample_answer || '', category || '', word_limit || 150, day_number || 1, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/writing/:id', async (req, res) => {
  try {
    await query('DELETE FROM writing_tasks WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== DICTATION API =====
app.get('/api/dictation', async (req, res) => {
  try {
    const { category, level } = req.query;
    let sql = 'SELECT id, title, category, level, day_number FROM dictation_exercises WHERE 1=1';
    const params = [];
    if (category) { sql += ' AND category = ?'; params.push(category); }
    if (level) { sql += ' AND level = ?'; params.push(level); }
    sql += ' ORDER BY day_number ASC';
    res.json(await query(sql, params));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/dictation/:id', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM dictation_exercises WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const ex = rows[0];
    if (typeof ex.sentences === 'string') {
      try { ex.sentences = JSON.parse(ex.sentences); } catch(e2) { ex.sentences = [ex.sentences]; }
    }
    res.json(ex);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== YOUTUBE LISTENING / SHADOWING API =====
const SHADOWING_TOPICS = [
  { name: 'Hội thoại', icon: '💬' },
  { name: 'Công sở', icon: '💼' },
  { name: 'IT', icon: '💻' }
];

const LEGACY_SHADOWING_MAP = {
  'conversation': 'Hội thoại', 'Hội thoại': 'Hội thoại',
  'business': 'Công sở', 'Công sở': 'Công sở',
  'tech-conversation': 'IT', 'tech-interview': 'IT', 'IT': 'IT',
  'Công nghệ': 'IT', 'Phỏng vấn IT': 'IT', 'Phỏng vấn': 'IT'
};

function normalizeShadowingCategory(cat) {
  if (!cat) return 'Hội thoại';
  if (SHADOWING_TOPICS.some(t => t.name === cat)) return cat;
  return LEGACY_SHADOWING_MAP[cat] || 'IT';
}

app.get('/api/shadowing/topics', async (req, res) => {
  try {
    const rows = await query('SELECT category FROM youtube_listening');
    const counts = Object.fromEntries(SHADOWING_TOPICS.map(t => [t.name, 0]));
    rows.forEach(r => {
      const n = normalizeShadowingCategory(r.category);
      counts[n] = (counts[n] || 0) + 1;
    });
    res.json(SHADOWING_TOPICS.map(t => ({ name: t.name, icon: t.icon, count: counts[t.name] || 0 })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/youtube-listening', async (req, res) => {
  try {
    const { category } = req.query;
    const rows = await query('SELECT id, title, youtube_id, category, level, duration FROM youtube_listening ORDER BY id');
    let list = rows.map(r => ({ ...r, category: normalizeShadowingCategory(r.category) }));
    if (category) list = list.filter(r => r.category === category);
    res.json(list);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/youtube-listening/:id', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM youtube_listening WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const v = rows[0];
    if (typeof v.transcript === 'string') {
      try { v.transcript = JSON.parse(v.transcript); } catch(e2) { v.transcript = []; }
    }
    res.json(v);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== VIDEO NOTES API =====
app.post('/api/video-notes', async (req, res) => {
  try {
    const { user_id, video_id, youtube_id, time, text_en, text_vi, category, note_description } = req.body;
    // Check if already exists for this exact time and video
    const existing = await query('SELECT id FROM video_notes WHERE user_id=? AND video_id=? AND time=?', [user_id, video_id, time]);
    if (existing.length) {
      await query('UPDATE video_notes SET note_description = ? WHERE id = ?', [note_description, existing[0].id]);
      return res.json({ success: true, id: existing[0].id });
    }
    const result = await query(
      'INSERT INTO video_notes (user_id, video_id, youtube_id, time, text_en, text_vi, category, note_description) VALUES (?,?,?,?,?,?,?,?)',
      [user_id, video_id, youtube_id, time, text_en, text_vi || '', category || 'general', note_description || '']
    );
    res.json({ success: true, id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/video-notes/:userId', async (req, res) => {
  try {
    const notes = await query('SELECT * FROM video_notes WHERE user_id = ? ORDER BY category, created_at DESC', [req.params.userId]);
    res.json(notes);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/video-notes/:id', async (req, res) => {
  try {
    await query('DELETE FROM video_notes WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/video-notes/:id', async (req, res) => {
  try {
    await query('UPDATE video_notes SET note_description = ? WHERE id = ?', [req.body.note_description, req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ===== BLOG API =====
// Public: list all published posts
app.get('/api/blog', async (req, res) => {
  try {
    const posts = await query(`SELECT id, slug, title, meta_description, category, author, thumbnail, view_count, created_at 
      FROM blog_posts WHERE is_published = 1 ORDER BY created_at DESC`);
    // Get avg rating for each post
    for (const p of posts) {
      const ratings = await query('SELECT AVG(rating) as avg, COUNT(*) as count FROM blog_comments WHERE post_id = ? AND is_approved = 1', [p.id]);
      p.avg_rating = ratings[0]?.avg ? parseFloat(ratings[0].avg).toFixed(1) : '5.0';
      p.comment_count = ratings[0]?.count || 0;
    }
    res.json(posts);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Public: get single post by slug
app.get('/api/blog/:slug', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM blog_posts WHERE slug = ? AND is_published = 1', [req.params.slug]);
    if (!rows.length) return res.status(404).json({ error: 'Post not found' });
    // Increment view count
    await query('UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ?', [rows[0].id]);
    const post = rows[0];
    // Get comments
    const comments = await query('SELECT * FROM blog_comments WHERE post_id = ? AND is_approved = 1 ORDER BY created_at DESC', [post.id]);
    const ratings = await query('SELECT AVG(rating) as avg, COUNT(*) as count FROM blog_comments WHERE post_id = ? AND is_approved = 1', [post.id]);
    post.comments = comments;
    post.avg_rating = ratings[0]?.avg ? parseFloat(ratings[0].avg).toFixed(1) : '5.0';
    post.comment_count = ratings[0]?.count || 0;
    res.json(post);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Public: add comment
app.post('/api/blog/:slug/comments', async (req, res) => {
  try {
    const { author_name, content, rating, user_id } = req.body;
    if (!author_name || !content) return res.status(400).json({ error: 'Name and content required' });
    const posts = await query('SELECT id FROM blog_posts WHERE slug = ?', [req.params.slug]);
    if (!posts.length) return res.status(404).json({ error: 'Post not found' });
    await query('INSERT INTO blog_comments (post_id, user_id, author_name, content, rating) VALUES (?,?,?,?,?)',
      [posts[0].id, user_id || null, author_name, content, rating || 5]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: CRUD blog
app.get('/api/admin/blog', async (req, res) => {
  try { res.json(await query('SELECT * FROM blog_posts ORDER BY created_at DESC')); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/admin/blog', async (req, res) => {
  try {
    const { slug, title, meta_description, meta_keywords, content, category, author, thumbnail } = req.body;
    const result = await query('INSERT INTO blog_posts (slug, title, meta_description, meta_keywords, content, category, author, thumbnail) VALUES (?,?,?,?,?,?,?,?)',
      [slug, title, meta_description, meta_keywords, content, category || 'general', author || 'Eagle English', thumbnail || '']);
    res.json({ success: true, id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/admin/blog/:id', async (req, res) => {
  try { await query('DELETE FROM blog_posts WHERE id = ?', [req.params.id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Public configurations endpoint
app.get('/api/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    facebookAppId: process.env.FACEBOOK_APP_ID || ''
  });
});

// ===== AVATAR UPLOAD =====
app.post('/api/auth/avatar/:userId', uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.params.userId]);
    res.json({ success: true, avatar_url: avatarUrl });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== UPDATE EMAIL =====
app.put('/api/auth/email', async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) return res.status(400).json({ error: 'userId and email required' });
    await query('UPDATE users SET email = ? WHERE id = ?', [email, userId]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== PUSH NOTIFICATION SUBSCRIPTION =====
app.post('/api/notifications/subscribe', async (req, res) => {
  try {
    const { userId, subscription } = req.body;
    if (!userId || !subscription) return res.status(400).json({ error: 'Missing data' });
    // Store subscription in DB
    await query(`CREATE TABLE IF NOT EXISTS push_subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      subscription JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user (user_id)
    )`);
    await query('INSERT INTO push_subscriptions (user_id, subscription) VALUES (?, ?) ON DUPLICATE KEY UPDATE subscription = ?',
      [userId, JSON.stringify(subscription), JSON.stringify(subscription)]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== REMINDER SETTINGS =====
app.get('/api/notifications/reminder/:userId', async (req, res) => {
  try {
    await query(`CREATE TABLE IF NOT EXISTS reminder_settings (
      user_id VARCHAR(36) PRIMARY KEY,
      enabled TINYINT(1) DEFAULT 1,
      reminder_time VARCHAR(5) DEFAULT '20:30',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    const rows = await query('SELECT * FROM reminder_settings WHERE user_id = ?', [req.params.userId]);
    res.json(rows.length ? rows[0] : { enabled: true, reminder_time: '20:30' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/notifications/reminder', async (req, res) => {
  try {
    const { userId, enabled, reminder_time } = req.body;
    await query(`CREATE TABLE IF NOT EXISTS reminder_settings (
      user_id VARCHAR(36) PRIMARY KEY,
      enabled TINYINT(1) DEFAULT 1,
      reminder_time VARCHAR(5) DEFAULT '20:30',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    await query('INSERT INTO reminder_settings (user_id, enabled, reminder_time) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE enabled = ?, reminder_time = ?',
      [userId, enabled ? 1 : 0, reminder_time || '20:30', enabled ? 1 : 0, reminder_time || '20:30']);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// SPA fallback (exclude static files)
app.get('*', (req, res) => {
  if (req.path.includes('.')) return res.status(404).send('Not found');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function start() {
  try {
    // Test database connection
    await query('SELECT 1');
    console.log('✅ Connected to MySQL database');

    // Ensure avatar_url and email columns exist
    try {
      await query('ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) DEFAULT NULL');
      console.log('✅ Added avatar_url column');
    } catch (e) { /* column already exists */ }
    try {
      await query('ALTER TABLE users ADD COLUMN email VARCHAR(255) DEFAULT NULL');
      console.log('✅ Added email column');
    } catch (e) { /* column already exists */ }

    // Migrate legacy roles: teacher → user; normalize empty/null → user
    try {
      const r = await query("UPDATE users SET role = 'user' WHERE role = 'role_teacher' OR role IS NULL OR role = ''");
      if (r.affectedRows > 0) console.log(`✅ Migrated ${r.affectedRows} user(s) to role=user`);
    } catch (e) { console.warn('Role migrate skip:', e.message); }

    await ensureUserColumns();
    await ensureSampleContent();
  } catch (e) {
    console.error('❌ Failed to connect to MySQL:', e.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 IT English Learning server running at http://localhost:${PORT}`);
  });
}

start();
