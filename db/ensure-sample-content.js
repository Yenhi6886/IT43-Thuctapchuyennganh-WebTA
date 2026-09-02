const { query } = require('./database');
const { VOCAB_CATEGORIES, migrateVocabCategories } = require('./vocab-categories');

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
  { topic: 'Thì (Tenses)', title_vi: 'Thì Quá Khứ Đơn', content_vi: 'Diễn tả hành động đã hoàn thành tại một thời điểm xác định trong quá khứ.\nCấu trúc: S + V2/ed', examples_vi: 'We deployed the app last Friday.\nI attended the standup meeting yesterday.', tips_vi: 'Dùng với yesterday, last week, ago, in 2024...' },
  { topic: 'Thì (Tenses)', title_vi: 'Thì Tương Lai Hoàn Thành', content_vi: 'Diễn tả hành động sẽ hoàn thành trước một thời điểm trong tương lai.\nCấu trúc: S + will have + V3', examples_vi: 'By next month, we will have launched three new features.\nThe team will have finished testing by Friday.', tips_vi: 'Thường đi với by + thời gian.' },
  { topic: 'Câu điều kiện (Conditionals)', title_vi: 'Câu Điều Kiện Loại 1', content_vi: 'Diễn tả điều có thể xảy ra ở hiện tại/tương lai.\nIf + S + V(hiện tại), S + will + V', examples_vi: 'If the test passes, we will deploy.\nIf you find a bug, report it immediately.', tips_vi: 'Mệnh đề If dùng thì hiện tại, mệnh đề chính dùng will.' },
  { topic: 'Câu điều kiện (Conditionals)', title_vi: 'Câu Điều Kiện Loại 2 & 3', content_vi: 'Loại 2 (giả định hiện tại): If + S + V(quá khứ), S + would + V\nLoại 3 (giả định quá khứ): If + S + had + V3, S + would have + V3', examples_vi: 'Loại 2: If I were you, I would refactor the code.\nLoại 3: If we had tested earlier, we would have avoided the outage.', tips_vi: 'Loại 2 = không có thật ở hiện tại. Loại 3 = hối tiếc về quá khứ.' },
  { topic: 'Câu bị động (Passive Voice)', title_vi: 'Câu Bị Động Cơ Bản', content_vi: 'Nhấn mạnh hành động hơn chủ thể.\nCấu trúc: S + be + V3 (+ by agent)', examples_vi: 'The code was reviewed by the team.\nThe bug was fixed yesterday.', tips_vi: 'Dùng nhiều trong báo cáo kỹ thuật.' },
  { topic: 'Câu bị động (Passive Voice)', title_vi: 'Câu Bị Động với Modal', content_vi: 'Kết hợp modal verb với passive.\nCấu trúc: S + modal + be + V3', examples_vi: 'The data must be encrypted before storage.\nThe API should be tested before release.', tips_vi: 'must be = bắt buộc; should be = nên.' },
  { topic: 'Mệnh đề quan hệ (Relative Clauses)', title_vi: 'Who / Which / That', content_vi: 'Who: người\nWhich: vật\nThat: cả người và vật', examples_vi: 'The developer who wrote this module is on leave.\nThe API which we built handles 10k requests.', tips_vi: 'Có thể bỏ who/which/that nếu là tân ngữ.' },
  { topic: 'Giới từ (Prepositions)', title_vi: 'Giới Từ Thời Gian & Địa Điểm', content_vi: 'At + giờ cụ thể (at 3 PM)\nOn + ngày (on Monday)\nIn + tháng/năm/mùa (in March)\nAt + địa điểm nhỏ (at the office)\nIn + thành phố/quốc gia (in Hanoi)', examples_vi: 'The meeting is at 3 PM on Friday.\nWe work in a co-working space in District 1.', tips_vi: 'At/on/in là bộ ba hay nhầm nhất — học theo ngữ cảnh.' },
  { topic: 'Liên từ (Conjunctions)', title_vi: 'Liên Từ Nối Câu', content_vi: 'And: thêm thông tin\nBut: tương phản\nBecause: nguyên nhân\nAlthough: mặc dù\nSo: kết quả', examples_vi: 'I finished the task although I was tired.\nThe server crashed, so we rolled back the deployment.', tips_vi: 'Although vs Because: although = mặc dù (tương phản), because = vì (lý do).' },
  { topic: 'Liên từ (Conjunctions)', title_vi: 'Neither...Nor / Either...Or', content_vi: 'Neither...nor: không cái nào...cũng không\nEither...or: hoặc cái này hoặc cái kia', examples_vi: 'Neither the frontend nor the backend was ready.\nThe API returns either JSON or XML.', tips_vi: 'Neither/Either đi với danh từ số ít.' },
  { topic: 'Động từ khuyết thiếu (Modals)', title_vi: 'Can / Could / Should / Must', content_vi: 'Can: khả năng\nCould: khả năng/lịch sự\nShould: lời khuyên\nMust: bắt buộc', examples_vi: 'You should write unit tests.\nWe must fix this before release.', tips_vi: 'Must mạnh hơn should.' },
  { topic: 'Danh động từ & V-ing (Gerunds)', title_vi: 'To V vs V-ing', content_vi: 'To + V: dự định, mục đích (want to, need to, decide to)\nV-ing: sau enjoy, avoid, suggest, finish, mind', examples_vi: 'I want to learn React.\nShe enjoys pair programming.\nI suggest refactoring the legacy code.', tips_vi: 'Không dùng "enjoy to do" — luôn enjoy + V-ing.' },
  { topic: 'Danh động từ & V-ing (Gerunds)', title_vi: 'Suggest / Recommend + V-ing', content_vi: 'Suggest và recommend theo sau bởi V-ing hoặc that + clause.\nCấu trúc: suggest + V-ing / suggest + that + S + (should) + V', examples_vi: 'I suggest using Redis for caching.\nHe recommended that we should upgrade the framework.', tips_vi: 'Trong email công sở, suggest + V-ing rất phổ biến.' },
  { topic: 'So sánh (Comparisons)', title_vi: 'So sánh hơn & nhất', content_vi: 'Comparative: adj-er + than / more + adj + than\nSuperlative: the adj-est / the most + adj', examples_vi: 'This solution is faster than the old one.\nIt is the most scalable approach we have tried.', tips_vi: 'Tính từ ngắn (1 âm tiết): -er/-est. Tính từ dài: more/most.' }
];

const SAMPLE_GRAMMAR_EXERCISES = [
  { grammar_topic: 'Thì (Tenses)', question: 'She ___ code every morning.', options: ['write', 'writes', 'writing', 'wrote'], correct_answer: 'writes', explanation: 'Thì hiện tại đơn, ngôi thứ 3 số ít thêm -s.' },
  { grammar_topic: 'Thì (Tenses)', question: 'We ___ the new feature last week.', options: ['deploy', 'deployed', 'have deployed', 'deploying'], correct_answer: 'deployed', explanation: 'Hành động đã xong trong quá khứ → quá khứ đơn.' },
  { grammar_topic: 'Câu điều kiện (Conditionals)', question: 'If the server ___, we will restart it.', options: ['crash', 'crashes', 'crashed', 'crashing'], correct_answer: 'crashes', explanation: 'Câu điều kiện loại 1: If + hiện tại đơn.' },
  { grammar_topic: 'Câu bị động (Passive Voice)', question: 'The bug ___ by the QA team.', options: ['find', 'found', 'was found', 'is finding'], correct_answer: 'was found', explanation: 'Câu bị động quá khứ: was/were + V3.' },
  { grammar_topic: 'Mệnh đề quan hệ (Relative Clauses)', question: 'The developer ___ fixed the bug got a bonus.', options: ['which', 'who', 'where', 'whose'], correct_answer: 'who', explanation: 'Who dùng cho người.' },
  { grammar_topic: 'Động từ khuyết thiếu (Modals)', question: 'You ___ backup the database before migration.', options: ['can', 'should', 'may', 'might'], correct_answer: 'should', explanation: 'Should = lời khuyên nên làm.' },
  { grammar_topic: 'Giới từ (Prepositions)', question: 'The meeting is ___ 3 PM ___ Friday.', options: ['at / on', 'in / at', 'on / in', 'at / in'], correct_answer: 'at / on', explanation: 'At + giờ, on + ngày.' },
  { grammar_topic: 'Liên từ (Conjunctions)', question: 'I finished the task ___ I was tired.', options: ['but', 'because', 'although', 'so'], correct_answer: 'although', explanation: 'Although = mặc dù.' },
  { grammar_topic: 'Danh động từ & V-ing (Gerunds)', question: 'I suggest ___ the legacy module first.', options: ['refactor', 'to refactor', 'refactoring', 'refactored'], correct_answer: 'refactoring', explanation: 'Suggest + V-ing.' },
  { grammar_topic: 'So sánh (Comparisons)', question: 'This approach is ___ than the previous one.', options: ['efficient', 'more efficient', 'most efficient', 'efficiently'], correct_answer: 'more efficient', explanation: 'Comparative với tính từ dài: more + adj + than.' }
];

const GRAMMAR_TOPIC_ALIASES = {
  'Tenses': 'Thì (Tenses)', 'Conditionals': 'Câu điều kiện (Conditionals)',
  'Passive Voice': 'Câu bị động (Passive Voice)', 'Relative Clauses': 'Mệnh đề quan hệ (Relative Clauses)',
  'Prepositions': 'Giới từ (Prepositions)', 'Conjunctions': 'Liên từ (Conjunctions)',
  'Modals': 'Động từ khuyết thiếu (Modals)', 'Gerunds': 'Danh động từ & V-ing (Gerunds)',
  'Infinitives': 'Danh động từ & V-ing (Gerunds)', 'Comparisons': 'So sánh (Comparisons)',
  'Correlative Conjunctions': 'Liên từ (Conjunctions)', 'Subject-Verb Agreement': 'Thì (Tenses)'
};

const SAMPLE_VOCAB_BY_CATEGORY = {
  'Công sở': [
    { term: 'deadline', word_type: 'n.', definition_vi: 'hạn chót', definition_en: 'the latest time something must be finished', example1: 'We must meet the project deadline.' },
    { term: 'meeting', word_type: 'n.', definition_vi: 'cuộc họp', definition_en: 'an event where people discuss work', example1: 'The weekly meeting starts at 9 AM.' },
    { term: 'colleague', word_type: 'n.', definition_vi: 'đồng nghiệp', definition_en: 'a person you work with', example1: 'My colleague helped me finish the report.' },
    { term: 'presentation', word_type: 'n.', definition_vi: 'bài thuyết trình', definition_en: 'a formal talk given to an audience', example1: 'She gave a great presentation to the client.' },
    { term: 'schedule', word_type: 'n.', definition_vi: 'lịch trình', definition_en: 'a plan of activities or events', example1: 'Let me check my schedule for tomorrow.' },
    { term: 'approve', word_type: 'v.', definition_vi: 'phê duyệt', definition_en: 'to officially agree to something', example1: 'The manager approved our budget request.' },
    { term: 'report', word_type: 'n.', definition_vi: 'báo cáo', definition_en: 'a written document about work results', example1: 'Please submit the monthly report by Friday.' },
    { term: 'overtime', word_type: 'n.', definition_vi: 'làm thêm giờ', definition_en: 'extra hours worked beyond normal time', example1: 'I worked overtime to finish the task.' }
  ],
  'Giao tiếp': [
    { term: 'please', word_type: 'adv.', definition_vi: 'xin vui lòng', definition_en: 'used to make a request polite', example1: 'Could you please send me the file?' },
    { term: 'thank you', word_type: 'phrase', definition_vi: 'cảm ơn', definition_en: 'expression of gratitude', example1: 'Thank you for your help today.' },
    { term: 'sorry', word_type: 'adj.', definition_vi: 'xin lỗi', definition_en: 'feeling regret or apology', example1: 'I am sorry for being late.' },
    { term: 'excuse me', word_type: 'phrase', definition_vi: 'xin lỗi (để thu hút sự chú ý)', definition_en: 'polite phrase to get attention', example1: 'Excuse me, could you repeat that?' },
    { term: 'agree', word_type: 'v.', definition_vi: 'đồng ý', definition_en: 'to have the same opinion', example1: 'I agree with your suggestion.' },
    { term: 'disagree', word_type: 'v.', definition_vi: 'không đồng ý', definition_en: 'to have a different opinion', example1: 'They disagree about the plan.' },
    { term: 'explain', word_type: 'v.', definition_vi: 'giải thích', definition_en: 'to make something clear', example1: 'Can you explain this in simple words?' },
    { term: 'introduce', word_type: 'v.', definition_vi: 'giới thiệu', definition_en: 'to present someone or something', example1: 'Let me introduce my teammate to you.' }
  ],
  'Du lịch': [
    { term: 'airport', word_type: 'n.', definition_vi: 'sân bay', definition_en: 'a place where planes take off and land', example1: 'We arrived at the airport two hours early.' },
    { term: 'passport', word_type: 'n.', definition_vi: 'hộ chiếu', definition_en: 'an official document for international travel', example1: 'Do not forget your passport at home.' },
    { term: 'hotel', word_type: 'n.', definition_vi: 'khách sạn', definition_en: 'a place where travelers stay', example1: 'We booked a hotel near the beach.' },
    { term: 'luggage', word_type: 'n.', definition_vi: 'hành lý', definition_en: 'bags and suitcases for travel', example1: 'My luggage was lost at the airport.' },
    { term: 'ticket', word_type: 'n.', definition_vi: 'vé', definition_en: 'a paper or digital pass for travel', example1: 'I bought a train ticket online.' },
    { term: 'sightseeing', word_type: 'n.', definition_vi: 'tham quan', definition_en: 'visiting places of interest', example1: 'We went sightseeing in the old town.' },
    { term: 'reservation', word_type: 'n.', definition_vi: 'đặt chỗ', definition_en: 'an arrangement to keep a seat or room', example1: 'I made a reservation for dinner tonight.' },
    { term: 'boarding pass', word_type: 'n.', definition_vi: 'thẻ lên máy bay', definition_en: 'a document allowing you to board a plane', example1: 'Show your boarding pass at the gate.' }
  ],
  'Ăn uống': [
    { term: 'menu', word_type: 'n.', definition_vi: 'thực đơn', definition_en: 'a list of food and drinks', example1: 'Could I see the menu, please?' },
    { term: 'order', word_type: 'v.', definition_vi: 'gọi món', definition_en: 'to ask for food or drinks', example1: 'Are you ready to order?' },
    { term: 'delicious', word_type: 'adj.', definition_vi: 'ngon', definition_en: 'having a very good taste', example1: 'This soup is delicious!' },
    { term: 'bill', word_type: 'n.', definition_vi: 'hóa đơn (thanh toán)', definition_en: 'a request for payment at a restaurant', example1: 'Can we have the bill, please?' },
    { term: 'appetizer', word_type: 'n.', definition_vi: 'món khai vị', definition_en: 'a small dish served before the main course', example1: 'We shared an appetizer before dinner.' },
    { term: 'spicy', word_type: 'adj.', definition_vi: 'cay', definition_en: 'having a hot flavor', example1: 'This dish is too spicy for me.' },
    { term: 'vegetarian', word_type: 'adj.', definition_vi: 'ăn chay', definition_en: 'not containing meat', example1: 'Do you have any vegetarian options?' },
    { term: 'tip', word_type: 'n.', definition_vi: 'tiền boa', definition_en: 'extra money given for good service', example1: 'We left a tip for the waiter.' }
  ],
  'Hàng ngày': [
    { term: 'weather', word_type: 'n.', definition_vi: 'thời tiết', definition_en: 'the condition of the atmosphere', example1: 'The weather is sunny today.' },
    { term: 'neighbor', word_type: 'n.', definition_vi: 'hàng xóm', definition_en: 'a person who lives near you', example1: 'My neighbor is very friendly.' },
    { term: 'grocery', word_type: 'n.', definition_vi: 'tạp hóa / đồ ăn', definition_en: 'food and household items sold in a store', example1: 'I need to buy groceries after work.' },
    { term: 'commute', word_type: 'v.', definition_vi: 'đi làm hàng ngày', definition_en: 'to travel regularly between home and work', example1: 'I commute by bus every morning.' },
    { term: 'laundry', word_type: 'n.', definition_vi: 'giặt ủi', definition_en: 'clothes that need washing', example1: 'I do the laundry on Sundays.' },
    { term: 'appointment', word_type: 'n.', definition_vi: 'cuộc hẹn', definition_en: 'a planned meeting at a set time', example1: 'I have a dentist appointment at 3 PM.' },
    { term: 'routine', word_type: 'n.', definition_vi: 'thói quen hàng ngày', definition_en: 'a regular way of doing things', example1: 'Exercise is part of my daily routine.' },
    { term: 'weekend', word_type: 'n.', definition_vi: 'cuối tuần', definition_en: 'Saturday and Sunday', example1: 'What are your plans for the weekend?' }
  ],
  'Sức khỏe': [
    { term: 'headache', word_type: 'n.', definition_vi: 'đau đầu', definition_en: 'pain in the head', example1: 'I have a headache and need to rest.' },
    { term: 'fever', word_type: 'n.', definition_vi: 'sốt', definition_en: 'a higher than normal body temperature', example1: 'She stayed home because of a fever.' },
    { term: 'medicine', word_type: 'n.', definition_vi: 'thuốc', definition_en: 'a substance used to treat illness', example1: 'Take this medicine twice a day.' },
    { term: 'appointment', word_type: 'n.', definition_vi: 'lịch khám', definition_en: 'a scheduled visit to a doctor', example1: 'I made an appointment with the doctor.' },
    { term: 'symptom', word_type: 'n.', definition_vi: 'triệu chứng', definition_en: 'a sign of illness', example1: 'What symptoms do you have?' },
    { term: 'prescription', word_type: 'n.', definition_vi: 'đơn thuốc', definition_en: 'a doctor\'s written order for medicine', example1: 'The pharmacist filled my prescription.' },
    { term: 'exercise', word_type: 'n.', definition_vi: 'tập thể dục', definition_en: 'physical activity to stay healthy', example1: 'Regular exercise improves your health.' },
    { term: 'allergy', word_type: 'n.', definition_vi: 'dị ứng', definition_en: 'a bad reaction to certain substances', example1: 'I have an allergy to peanuts.' }
  ],
  'Mua sắm': [
    { term: 'price', word_type: 'n.', definition_vi: 'giá', definition_en: 'the amount of money for something', example1: 'What is the price of this shirt?' },
    { term: 'discount', word_type: 'n.', definition_vi: 'giảm giá', definition_en: 'a reduction in the usual price', example1: 'This store offers a 20% discount today.' },
    { term: 'receipt', word_type: 'n.', definition_vi: 'hóa đơn mua hàng', definition_en: 'proof of payment', example1: 'Keep the receipt in case you need to return it.' },
    { term: 'cash', word_type: 'n.', definition_vi: 'tiền mặt', definition_en: 'money in coins or notes', example1: 'Do you accept cash?' },
    { term: 'refund', word_type: 'n.', definition_vi: 'hoàn tiền', definition_en: 'money returned for a returned product', example1: 'I asked for a refund because the item was broken.' },
    { term: 'size', word_type: 'n.', definition_vi: 'kích cỡ', definition_en: 'how large or small something is', example1: 'What size do you wear?' },
    { term: 'bargain', word_type: 'n.', definition_vi: 'món hời', definition_en: 'something bought at a good price', example1: 'This jacket was a real bargain.' },
    { term: 'checkout', word_type: 'n.', definition_vi: 'quầy thanh toán', definition_en: 'the place where you pay in a store', example1: 'There is a long line at the checkout.' }
  ]
};

async function ensureSampleContent() {
  try {
    // Gộp danh mục từ vựng IT cũ → IT, chuẩn hóa các danh mục khác
    await migrateVocabCategories(query);
    console.log('✅ Vocabulary categories normalized');

    for (const category of VOCAB_CATEGORIES) {
      if (category === 'IT') continue;
      const countRow = await query('SELECT COUNT(*) as c FROM vocabulary WHERE category = ?', [category]);
      if ((countRow[0]?.c || 0) >= 5) continue;
      const samples = SAMPLE_VOCAB_BY_CATEGORY[category] || [];
      let inserted = 0;
      for (const w of samples) {
        const exists = await query('SELECT id FROM vocabulary WHERE term = ? AND category = ? LIMIT 1', [w.term, category]);
        if (exists.length) continue;
        await query(
          'INSERT INTO vocabulary (term, word_type, definition_vi, definition_en, category, example1, day_number) VALUES (?,?,?,?,?,?,1)',
          [w.term, w.word_type, w.definition_vi, w.definition_en, category, w.example1]
        );
        inserted++;
      }
      if (inserted) console.log(`✅ Seeded ${inserted} sample words for ${category}`);
    }

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

    let lessonsInserted = 0;
    for (const l of SAMPLE_GRAMMAR_LESSONS) {
      const exists = await query('SELECT id FROM grammar_lessons WHERE topic = ? AND title_vi = ? LIMIT 1', [l.topic, l.title_vi]);
      if (exists.length) continue;
      await query('INSERT INTO grammar_lessons (topic, title_vi, content_vi, examples_vi, tips_vi, day_number) VALUES (?,?,?,?,?,1)',
        [l.topic, l.title_vi, l.content_vi, l.examples_vi, l.tips_vi]);
      lessonsInserted++;
    }
    if (lessonsInserted) console.log(`✅ Seeded ${lessonsInserted} grammar lessons`);

    const exCount = await query('SELECT COUNT(*) as c FROM grammar_exercises');
    let exInserted = 0;
    if ((exCount[0]?.c || 0) < 20) {
      for (const ex of SAMPLE_GRAMMAR_EXERCISES) {
        const exists = await query('SELECT id FROM grammar_exercises WHERE question = ? LIMIT 1', [ex.question]);
        if (exists.length) continue;
        await query('INSERT INTO grammar_exercises (question, options, correct_answer, explanation, grammar_topic, day_number) VALUES (?,?,?,?,?,1)',
          [ex.question, JSON.stringify(ex.options), ex.correct_answer, ex.explanation, ex.grammar_topic]);
        exInserted++;
      }
      if (exInserted) console.log(`✅ Seeded ${exInserted} grammar exercises`);
    }

    // Chuẩn hóa grammar_topic cũ → tên chủ đề chuẩn
    for (const [alias, canonical] of Object.entries(GRAMMAR_TOPIC_ALIASES)) {
      await query('UPDATE grammar_exercises SET grammar_topic = ? WHERE grammar_topic = ?', [canonical, alias]);
      await query('UPDATE grammar_lessons SET topic = ? WHERE topic = ?', [canonical, alias]);
    }
    // Gộp chủ đề lạ (không thuộc 9 dạng chuẩn) vào dạng gần nhất
    const topicRules = [
      { canonical: 'Thì (Tenses)', patterns: ['%tense%', '%Tense%', '%Thì%', '%Present%', '%Past%', '%Future%'] },
      { canonical: 'Câu điều kiện (Conditionals)', patterns: ['%conditional%', '%Conditional%', '%Điều kiện%'] },
      { canonical: 'Câu bị động (Passive Voice)', patterns: ['%passive%', '%Passive%', '%bị động%'] },
      { canonical: 'Mệnh đề quan hệ (Relative Clauses)', patterns: ['%relative%', '%Relative%', '%quan hệ%'] },
      { canonical: 'Giới từ (Prepositions)', patterns: ['%preposition%', '%Preposition%', '%Giới từ%'] },
      { canonical: 'Liên từ (Conjunctions)', patterns: ['%conjunction%', '%Conjunction%', '%Liên từ%'] },
      { canonical: 'Động từ khuyết thiếu (Modals)', patterns: ['%modal%', '%Modal%'] },
      { canonical: 'Danh động từ & V-ing (Gerunds)', patterns: ['%gerund%', '%Gerund%', '%infinitive%', '%Infinitive%', '%V-ing%'] },
      { canonical: 'So sánh (Comparisons)', patterns: ['%compar%', '%Compar%', '%So sánh%'] }
    ];
    const canonicalList = topicRules.map(r => r.canonical);
    for (const rule of topicRules) {
      for (const pat of rule.patterns) {
        await query(`UPDATE grammar_exercises SET grammar_topic = ? WHERE grammar_topic NOT IN (${canonicalList.map(() => '?').join(',')}) AND (grammar_topic LIKE ? OR question LIKE ?)`,
          [rule.canonical, ...canonicalList, pat, pat]);
        await query(`UPDATE grammar_lessons SET topic = ? WHERE topic NOT IN (${canonicalList.map(() => '?').join(',')}) AND (topic LIKE ? OR title_vi LIKE ?)`,
          [rule.canonical, ...canonicalList, pat, pat]);
      }
    }
    await query(`UPDATE grammar_lessons SET topic = 'Thì (Tenses)' WHERE (topic IS NULL OR topic = '') AND (title_vi LIKE '%Thì%' OR title_vi LIKE '%Present%' OR title_vi LIKE '%Quá khứ%' OR title_vi LIKE '%Tương lai%')`);
    await query(`UPDATE grammar_lessons SET topic = 'Câu điều kiện (Conditionals)' WHERE (topic IS NULL OR topic = '') AND title_vi LIKE '%Điều kiện%'`);
    await query(`UPDATE grammar_lessons SET topic = 'Danh động từ & V-ing (Gerunds)' WHERE (topic IS NULL OR topic = '') AND (title_vi LIKE '%V-ing%' OR title_vi LIKE '%nguyên thể%')`);
    await query(`UPDATE grammar_lessons SET topic = 'Giới từ (Prepositions)' WHERE (topic IS NULL OR topic = '') AND title_vi LIKE '%Giới từ%'`);
    await query(`UPDATE grammar_lessons SET topic = 'Liên từ (Conjunctions)' WHERE (topic IS NULL OR topic = '') AND title_vi LIKE '%Liên từ%'`);
    await query(`UPDATE grammar_lessons SET topic = 'So sánh (Comparisons)' WHERE (topic IS NULL OR topic = '') AND title_vi LIKE '%So sánh%'`);

    // Normalize shadowing categories
    const videos = await query('SELECT id, category FROM youtube_listening');
    for (const v of videos) {
      let cat = v.category || 'Hội thoại';
      if (['tech-conversation', 'tech-interview', 'Công nghệ', 'Phỏng vấn IT', 'Phỏng vấn'].includes(cat)) cat = 'IT';
      else if (cat === 'conversation') cat = 'Hội thoại';
      else if (cat === 'business') cat = 'Công sở';
      if (cat !== v.category) await query('UPDATE youtube_listening SET category = ? WHERE id = ?', [cat, v.id]);
    }

  } catch (e) {
    console.warn('Sample content seed skip:', e.message);
  }
}

module.exports = { ensureSampleContent };
