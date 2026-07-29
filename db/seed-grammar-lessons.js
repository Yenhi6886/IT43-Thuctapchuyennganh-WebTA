const { query } = require('./database');

async function seedGrammarLessons() {
  // Always wipe and re-seed for this update
  await query('DELETE FROM grammar_lessons');
  await query('ALTER TABLE grammar_lessons AUTO_INCREMENT = 1');

  const lessons = [
  {
      title_vi: "Động từ nguyên thể (To V) và Danh động từ (V-ing)",
      title_en: "To-Infinitives and Gerunds",
      content_vi: "1. Dùng **To + V** (Động từ nguyên thể) để diễn tả dự định, mục đích hoặc theo sau các động từ như: want, decide, need, plan, hope, expect...\n\n2. Dùng **V-ing** (Khoản động từ) sau các động từ diễn tả sở thích, cảm xúc hoặc sự hoàn thành như: enjoy, mind, avoid, finish, suggest...",
      content_en: "1. Use **To + V** (Infinitive) to express intentions, purposes, or after verbs like: want, decide, need, plan, hope, expect...\n\n2. Use **V-ing** (Gerund) after verbs expressing preferences, feelings, or completion such as: enjoy, mind, avoid, finish, suggest...",
      examples_vi: "- I want **to learn** English (Tôi muốn học tiếng Anh).\n- She enjoys **reading** books (Cô ấy thích đọc sách).",
      examples_en: "- I want **to learn** English.\n- She enjoys **reading** books.",
      tips_vi: "Mẹo nhỏ: Hầu hết các động từ diễn tả mong muốn về tương lai (want, plan) sẽ đi với 'To V'. Các hành động đang xảy ra hoặc thói quen thường đi với 'V-ing'.",
      tips_en: "Quick Tip: Verbs expressing future desire (want, plan) usually take 'To V'. Actions already in progress or habits often take 'V-ing'.",
      day_number: 1
    },
    {
      title_vi: "Hiện tại hoàn thành (Present Perfect)",
      title_en: "Present Perfect Tense",
      content_vi: "**Hiện tại hoàn thành** dùng để diễn tả:\n1. Hành động đã xảy ra trong quá khứ nhưng kết quả vẫn còn ở hiện tại.\n2. Một trải nghiệm cho tới thời điểm hiện tại.\n3. Hành động vừa mới hoàn tất (đi với 'just').\n\n**Cấu trúc:** Chủ ngữ + have/has + Động từ phân từ 2 (V3/ed)",
      content_en: "**Present Perfect** is used to describe:\n1. An action that happened in the past but its result continues to the present.\n2. An experience up to the present time.\n3. A recently completed action (usually with 'just').\n\n**Structure:** Subject + have/has + Past Participle (V3/ed)",
      examples_vi: "- I **have worked** here for 3 years. (Tôi đã làm việc ở đây được 3 năm và giờ vẫn làm).\n- He **has just finished** his homework. (Cậu ấy vừa mới làm xong bài tập).",
      examples_en: "- I **have worked** here for 3 years.\n- He **has just finished** his homework.",
      tips_vi: "Các từ nhận biết: since (từ khi), for (trong khoảng), already (rồi), yet (chưa), just (vừa mới).",
      tips_en: "Time signals: since, for, already, yet, just.",
      day_number: 2
    },
    {
      title_vi: "Câu điều kiện (Conditionals)",
      title_en: "Conditional Sentences",
      content_vi: "1. **Câu điều kiện loại 1 (Có thể xảy ra ở hiện tại hoặc tương lai)**:\nIf + S + V (hiện tại đơn), S + will/can + V (nguyên thể).\n\n2. **Câu điều kiện loại 2 (Giả định không có thật ở hiện tại)**:\nIf + S + V (quá khứ đơn), S + would/could + V (nguyên thể).\n\n3. **Câu điều kiện loại 3 (Giả định trái ngược với quá khứ)**:\nIf + S + had + V3/ed, S + would have + V3/ed.",
      content_en: "1. **Type 1 (Possible in present/future)**:\nIf + S + V (Simple Present), S + will/can + V (Base form).\n\n2. **Type 2 (Unreal in present)**:\nIf + S + V (Simple Past), S + would/could + V (Base form).\n\n3. **Type 3 (Unreal in past)**:\nIf + S + had + V3/ed, S + would have + V3/ed.",
      examples_vi: "Loại 1: If it rains, I will stay home.\nLoại 2: If I were you, I would study harder.\nLoại 3: If I had known earlier, I would have told you.",
      examples_en: "Type 1: If it rains, I will stay home.\nType 2: If I were you, I would study harder.\nType 3: If I had known earlier, I would have told you.",
      tips_vi: "Đừng nhầm lẫn giữa loại 2 và 3. Loại 2 nói về sự thật hiển nhiên ở hiện tại, còn loại 3 nói về một sự hối tiếc trong quá khứ.",
      tips_en: "Don't confuse type 2 and 3. Type 2 is about an unreal present situation, while type 3 is about a past regret.",
      day_number: 3
    }
  ];

  for (const l of lessons) {
    await query('INSERT INTO grammar_lessons (title_vi, title_en, content_vi, content_en, examples_vi, examples_en, tips_vi, tips_en, day_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [l.title_vi, l.title_en, l.content_vi, l.content_en, l.examples_vi, l.examples_en, l.tips_vi, l.tips_en, l.day_number]);
  }

  console.log('✅ Seeded grammar lessons successfully!');
  process.exit(0);
}

seedGrammarLessons();
