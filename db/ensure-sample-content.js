const { query } = require('./database');

const SAMPLE_STORIES = [
  { title: 'My First Day as a Developer', content: 'On my first day at the company, I met my [[team|đội ngũ]] and learned about the [[codebase|mã nguồn]]. The [[manager|quản lý]] explained our [[sprint|sprint]] goals. I was nervous but excited to write my first [[pull request|yêu cầu gộp mã]].' },
  { title: 'Debugging a Production Bug', content: 'At 2 AM, we got an alert. The [[database|cơ sở dữ liệu]] was slow. Our [[DevOps|DevOps]] engineer checked the [[logs|nhật ký]]. We found a [[memory leak|rò rỉ bộ nhớ]] in the [[API|API]] service and fixed it quickly.' },
  { title: 'Code Review Best Practices', content: 'During [[code review|đánh giá mã]], always be kind and constructive. Focus on [[readability|khả năng đọc]], [[performance|hiệu năng]], and [[security|bảo mật]]. Ask questions instead of making demands.' },
  { title: 'Agile Standup Meeting', content: 'Every morning we have a [[standup|họp standup]] meeting. Each developer shares what they did yesterday, what they will do today, and any [[blockers|trở ngại]]. It keeps the [[team|đội]] aligned.' },
  { title: 'Deploying to Production', content: 'Before [[deployment|triển khai]], we run all [[tests|kiểm thử]]. The [[CI/CD|CI/CD]] pipeline builds the [[Docker|Docker]] image. After [[approval|phê duyệt]], we release to [[production|môi trường production]].' },
  { title: 'Database Migration', content: 'We needed to add a new [[column|cột]] to the [[users|người dùng]] table. The [[migration|di chuyển dữ liệu]] script ran safely. We always [[backup|sao lưu]] before making schema changes.' },
  { title: 'Frontend vs Backend', content: 'The [[frontend|giao diện]] team builds what users see. The [[backend|phía server]] team handles [[API|API]] and [[database|dữ liệu]]. Good [[communication|giao tiếp]] between both sides is essential.' },
  { title: 'Security in Web Apps', content: 'Never store [[passwords|mật khẩu]] in plain text. Use [[HTTPS|HTTPS]] for all traffic. Validate all [[input|đầu vào]] to prevent [[SQL injection|SQL injection]] attacks.' },
  { title: 'Tech Interview Tips', content: 'In a [[technical interview|phỏng vấn kỹ thuật]], explain your [[thought process|quy trình suy nghĩ]]. Practice [[algorithms|thuật toán]] and [[system design|thiết kế hệ thống]]. Ask clarifying questions before coding.' },
  { title: 'Working with Git', content: 'Create a [[branch|nhánh]] for each feature. Write clear [[commit messages|thông điệp commit]]. Resolve [[merge conflicts|xung đột gộp]] carefully. Never push directly to [[main|nhánh chính]].' }
];

const SAMPLE_GRAMMAR_LESSONS = [
  { topic: 'Thì (Tenses)', title_vi: 'Thì Hiện Tại Đơn', content_vi: 'Dùng để diễn tả thói quen, sự thật hiển nhiên.\nCấu trúc: S + V(s/es)\nVí dụ: I work as a developer. / She writes code every day.', examples_vi: 'I deploy code on Fridays.\nThe server runs 24/7.', tips_vi: 'Thêm -s/-es với ngôi thứ 3 số ít.' },
  { topic: 'Thì (Tenses)', title_vi: 'Thì Hiện Tại Hoàn Thành', content_vi: 'Dùng cho hành động xảy ra trong quá khứ nhưng liên quan hiện tại.\nCấu trúc: S + have/has + V3', examples_vi: 'I have fixed the bug.\nWe have deployed the new version.', tips_vi: 'Dùng với already, just, yet, ever, never.' },
  { topic: 'Câu điều kiện (Conditionals)', title_vi: 'Câu Điều Kiện Loại 1', content_vi: 'Diễn tả điều có thể xảy ra ở hiện tại/tương lai.\nIf + S + V(hiện tại), S + will + V', examples_vi: 'If the test passes, we will deploy.\nIf you find a bug, report it immediately.', tips_vi: 'Mệnh đề If dùng thì hiện tại, mệnh đề chính dùng will.' },
  { topic: 'Câu bị động (Passive Voice)', title_vi: 'Câu Bị Động Cơ Bản', content_vi: 'Nhấn mạnh hành động hơn chủ thể.\nCấu trúc: S + be + V3 (+ by agent)', examples_vi: 'The code was reviewed by the team.\nThe bug was fixed yesterday.', tips_vi: 'Dùng nhiều trong báo cáo kỹ thuật.' },
  { topic: 'Mệnh đề quan hệ (Relative Clauses)', title_vi: 'Who / Which / That', content_vi: 'Who: người\nWhich: vật\nThat: cả người và vật', examples_vi: 'The developer who wrote this module is on leave.\nThe API which we built handles 10k requests.', tips_vi: 'Có thể bỏ who/which/that nếu là tân ngữ.' },
  { topic: 'Động từ khuyết thiếu (Modals)', title_vi: 'Can / Could / Should / Must', content_vi: 'Can: khả năng\nShould: lời khuyên\nMust: bắt buộc', examples_vi: 'You should write unit tests.\nWe must fix this before release.', tips_vi: 'Must mạnh hơn should.' }
];

const SAMPLE_GRAMMAR_EXERCISES = [
  { grammar_topic: 'Thì (Tenses)', question: 'She ___ code every morning.', options: ['write', 'writes', 'writing', 'wrote'], correct_answer: 'writes', explanation: 'Thì hiện tại đơn, ngôi thứ 3 số ít thêm -s.' },
  { grammar_topic: 'Thì (Tenses)', question: 'We ___ the new feature last week.', options: ['deploy', 'deployed', 'have deployed', 'deploying'], correct_answer: 'deployed', explanation: 'Hành động đã xong trong quá khứ → quá khứ đơn.' },
  { grammar_topic: 'Câu điều kiện (Conditionals)', question: 'If the server ___, we will restart it.', options: ['crash', 'crashes', 'crashed', 'crashing'], correct_answer: 'crashes', explanation: 'Câu điều kiện loại 1: If + hiện tại đơn.' },
  { grammar_topic: 'Câu bị động (Passive Voice)', question: 'The bug ___ by the QA team.', options: ['find', 'found', 'was found', 'is finding'], correct_answer: 'was found', explanation: 'Câu bị động quá khứ: was/were + V3.' },
  { grammar_topic: 'Mệnh đề quan hệ (Relative Clauses)', question: 'The developer ___ fixed the bug got a bonus.', options: ['which', 'who', 'where', 'whose'], correct_answer: 'who', explanation: 'Who dùng cho người.' },
  { grammar_topic: 'Động từ khuyết thiếu (Modals)', question: 'You ___ backup the database before migration.', options: ['can', 'should', 'may', 'might'], correct_answer: 'should', explanation: 'Should = lời khuyên nên làm.' },
  { grammar_topic: 'Giới từ (Prepositions)', question: 'The meeting is ___ 3 PM ___ Friday.', options: ['at / on', 'in / at', 'on / in', 'at / in'], correct_answer: 'at / on', explanation: 'At + giờ, on + ngày.' },
  { grammar_topic: 'Liên từ (Conjunctions)', question: 'I finished the task ___ I was tired.', options: ['but', 'because', 'although', 'so'], correct_answer: 'although', explanation: 'Although = mặc dù.' }
];

async function ensureSampleContent() {
  try {
    // Normalize reading categories to IT
    await query("UPDATE reading_passages SET category = 'IT' WHERE category IS NULL OR category != 'IT'");

    const readingCount = await query('SELECT COUNT(*) as c FROM reading_passages');
    if ((readingCount[0]?.c || 0) < 5) {
      for (const s of SAMPLE_STORIES) {
        await query('INSERT INTO reading_passages (title, content, category, questions, day_number) VALUES (?,?,?,?,1)',
          [s.title, s.content, 'IT', '[]']);
      }
      console.log(`✅ Seeded ${SAMPLE_STORIES.length} sample reading stories`);
    }

    const lessonCount = await query('SELECT COUNT(*) as c FROM grammar_lessons');
    if ((lessonCount[0]?.c || 0) < 3) {
      for (const l of SAMPLE_GRAMMAR_LESSONS) {
        await query('INSERT INTO grammar_lessons (topic, title_vi, content_vi, examples_vi, tips_vi, day_number) VALUES (?,?,?,?,?,1)',
          [l.topic, l.title_vi, l.content_vi, l.examples_vi, l.tips_vi]);
      }
      console.log(`✅ Seeded ${SAMPLE_GRAMMAR_LESSONS.length} grammar lessons`);
    }

    const exCount = await query('SELECT COUNT(*) as c FROM grammar_exercises');
    if ((exCount[0]?.c || 0) < 5) {
      for (const ex of SAMPLE_GRAMMAR_EXERCISES) {
        await query('INSERT INTO grammar_exercises (question, options, correct_answer, explanation, grammar_topic, day_number) VALUES (?,?,?,?,?,1)',
          [ex.question, JSON.stringify(ex.options), ex.correct_answer, ex.explanation, ex.grammar_topic]);
      }
      console.log(`✅ Seeded ${SAMPLE_GRAMMAR_EXERCISES.length} grammar exercises`);
    }

    // Normalize shadowing categories
    const videos = await query('SELECT id, category FROM youtube_listening');
    for (const v of videos) {
      let cat = v.category || 'Hội thoại';
      if (['tech-conversation', 'tech-interview', 'Công nghệ', 'Phỏng vấn IT', 'Phỏng vấn'].includes(cat)) cat = 'IT';
      else if (cat === 'conversation') cat = 'Hội thoại';
      else if (cat === 'business') cat = 'Công sở';
      if (cat !== v.category) await query('UPDATE youtube_listening SET category = ? WHERE id = ?', [cat, v.id]);
    }

    // Update grammar lessons without topic from grammar_topic patterns
    await query(`UPDATE grammar_lessons SET topic = 'Thì (Tenses)' WHERE (topic IS NULL OR topic = '') AND (title_vi LIKE '%Thì%' OR title_vi LIKE '%Present%')`);
    await query(`UPDATE grammar_lessons SET topic = 'Câu điều kiện (Conditionals)' WHERE (topic IS NULL OR topic = '') AND title_vi LIKE '%Điều kiện%'`);

  } catch (e) {
    console.warn('Sample content seed skip:', e.message);
  }
}

module.exports = { ensureSampleContent };
