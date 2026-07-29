require('dotenv').config();
const { query } = require('./database');

async function distributeContent() {
  try {
    const DAYS = 30;
    const WORDS_PER_DAY = 10;
    const MAX_WORDS = DAYS * WORDS_PER_DAY; // 300

    // Get all topics
    const topics = await query('SELECT id, name FROM topics ORDER BY id');

    for (const topic of topics) {
      // Get all vocab for this topic
      const words = await query(`
        SELECT DISTINCT v.id, v.category 
        FROM vocabulary v 
        INNER JOIN vocabulary_topics vt ON v.id = vt.vocabulary_id 
        WHERE vt.topic_id = ?
        ORDER BY v.category, v.id
      `, [topic.id]);

      if (words.length === 0) continue;

      // Limit to MAX_WORDS, keeping balanced across categories
      const cats = {};
      words.forEach(w => {
        if (!cats[w.category]) cats[w.category] = [];
        cats[w.category].push(w.id);
      });

      const catNames = Object.keys(cats);
      const wordsPerCat = Math.ceil(MAX_WORDS / catNames.length);
      
      // Select up to wordsPerCat from each category
      let selected = [];
      for (const cat of catNames) {
        const catWords = cats[cat].slice(0, wordsPerCat);
        selected.push(...catWords.map(id => ({ id, category: cat })));
      }
      
      // If we have more than MAX_WORDS, trim
      if (selected.length > MAX_WORDS) selected = selected.slice(0, MAX_WORDS);

      // Distribute evenly: interleave categories across days
      // Sort by category to group, then distribute round-robin
      const perDay = Math.ceil(selected.length / DAYS);
      
      for (let i = 0; i < selected.length; i++) {
        const dayNum = Math.floor(i / perDay) + 1;
        await query('UPDATE vocabulary SET day_number = ? WHERE id = ?', [dayNum, selected[i].id]);
      }

      // Remove excess vocab from this topic (keep only selected)
      if (words.length > MAX_WORDS) {
        const selectedIds = new Set(selected.map(s => s.id));
        const removeIds = words.filter(w => !selectedIds.has(w.id)).map(w => w.id);
        if (removeIds.length > 0) {
          // Don't delete the vocab, just unlink from this topic
          const ph = removeIds.map(() => '?').join(',');
          await query(`DELETE FROM vocabulary_topics WHERE topic_id = ? AND vocabulary_id IN (${ph})`, [topic.id, ...removeIds]);
        }
      }

      // Count final
      const final = await query(`
        SELECT v.category, COUNT(*) as cnt, MIN(v.day_number) as min_day, MAX(v.day_number) as max_day
        FROM vocabulary v INNER JOIN vocabulary_topics vt ON v.id = vt.vocabulary_id
        WHERE vt.topic_id = ? GROUP BY v.category
      `, [topic.id]);
      
      const totalFinal = final.reduce((a, c) => a + c.cnt, 0);
      console.log(`\n${topic.name}: ${totalFinal} words across ${DAYS} days (~${Math.round(totalFinal/DAYS)}/day)`);
      final.forEach(c => console.log(`  ${c.category}: ${c.cnt} (day ${c.min_day}-${c.max_day})`));
    }

    // Now distribute reading, listening, speaking, writing across 30 days
    console.log('\n--- Distributing skill content ---');
    
    const tables = [
      { name: 'reading_passages', label: 'Reading' },
      { name: 'listening_dialogues', label: 'Listening' },
      { name: 'speaking_prompts', label: 'Speaking' },
      { name: 'writing_tasks', label: 'Writing' },
    ];

    for (const t of tables) {
      const rows = await query(`SELECT id FROM ${t.name} ORDER BY id`);
      if (rows.length === 0) continue;
      
      const perDay = Math.max(1, Math.ceil(rows.length / DAYS));
      for (let i = 0; i < rows.length; i++) {
        const dayNum = Math.min(DAYS, Math.floor(i / perDay) + 1);
        await query(`UPDATE ${t.name} SET day_number = ? WHERE id = ?`, [dayNum, rows[i].id]);
      }
      console.log(`${t.label}: ${rows.length} items → ~${perDay}/day`);
    }

    console.log('\n✅ All content distributed across 30 days!');
    process.exit(0);
  } catch (e) { console.error('Error:', e); process.exit(1); }
}

distributeContent();
