const { query } = require('./database');
const crypto = require('crypto');

async function seedMassive() {
  try {
    console.log('Fetching common english words...');
    // Lấy danh sách 10000 từ tiếng Anh phổ biến
    const response = await fetch('https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt');
    const text = await response.text();
    const allWords = text.split('\n').filter(w => w.trim().length > 2); // Chỉ lấy từ có 3 chữ cái trở lên
    
    // Lấy khoảng 5000 từ để làm kho chứa
    const baseWords = allWords.slice(0, 5000);
    console.log(`Fetched ${baseWords.length} words. Inserting to vocabulary...`);

    const topics = await query('SELECT id, slug, name FROM topics');
    if (topics.length === 0) {
      console.log('No topics found. Please run migrate-topics.js first.');
      return;
    }

    // Các loại từ vựng
    const wordTypes = ['Danh từ', 'Động từ', 'Tính từ', 'Trạng từ'];
    const levels = [1, 2, 3, 4, 5, 6, 7]; // Day offset
    
    // Kiểm tra và lấy các từ vựng đã tồn tại để tránh trùng lặp tuyệt đối
    const existing = await query('SELECT term FROM vocabulary');
    const existingTerms = new Set(existing.map(r => r.term.toLowerCase()));

    // Lọc lại baseWords
    const newWords = baseWords.filter(w => !existingTerms.has(w.toLowerCase()));
    
    console.log(`Will insert ${newWords.length} new words into vocabulary.`);
    
    // Insert new words into vocabulary table
    const wordIdMap = new Map(); // map term -> db_id
    
    // Để tối ưu, insert theo batch
    const batchSize = 500;
    for (let i = 0; i < newWords.length; i += batchSize) {
      const batch = newWords.slice(i, i + batchSize);
      for (const word of batch) {
        const type = wordTypes[Math.floor(Math.random() * wordTypes.length)];
        const day = levels[Math.floor(Math.random() * levels.length)];
        
        const defVi = `Nghĩa của từ ${word} (${type})`;
        const defEn = `Meaning of ${word}`;
        const example = `This is an example sentence for the word "${word}".`;
        
        const res = await query(
          'INSERT INTO vocabulary (term, word_type, definition_vi, definition_en, example1, day_number, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [word, type, defVi, defEn, example, day, 'General']
        );
        wordIdMap.set(word, res.insertId);
      }
      process.stdout.write(`\rInserted ${Math.min(i + batchSize, newWords.length)} / ${newWords.length} words...`);
    }
    console.log('\nFinished inserting vocabulary.');

    // Nạp lại tất cả vocabulary_id (bao gồm cái cũ và mới)
    const allVocabDb = await query('SELECT id, term FROM vocabulary');
    const allVocabIds = allVocabDb.map(r => r.id);

    console.log('Assigning words to topics (approx ~1500 per topic)...');
    // Với mỗi chủ đề, lấy ngẫu nhiên 1500 từ
    for (const topic of topics) {
      // Xóa ánh xạ cũ liên quan đến các từ random? Để nguyên các mapping cũ cũng được, ta chỉ insert IGNORE.
      // Trộn ngẫu nhiên allVocabIds
      const shuffled = [...allVocabIds].sort(() => 0.5 - Math.random());
      const selectedIds = shuffled.slice(0, 1500); // Lấy 1500 từ
      
      let inserted = 0;
      for (const vId of selectedIds) {
        try {
          // Thêm IGNORE để không bị lỗi trùng khóa nếu đã có
          await query('INSERT IGNORE INTO vocabulary_topics (vocabulary_id, topic_id) VALUES (?, ?)', [vId, topic.id]);
          inserted++;
        } catch (e) {
          // Ignore
        }
      }
      console.log(`Topic: ${topic.name} (${topic.slug}) -> Assigned ${inserted} words.`);
    }

    console.log('✅ Massive seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error in massive seed:', error);
    process.exit(1);
  }
}

seedMassive();
