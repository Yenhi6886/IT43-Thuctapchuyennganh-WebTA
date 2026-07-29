require('dotenv').config();
const { query } = require('./database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function seedReviews() {
  try {
    // 1. Create blog_comments table with star rating
    await query(`CREATE TABLE IF NOT EXISTS blog_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_id INT,
      author_name VARCHAR(100) NOT NULL,
      content TEXT NOT NULL,
      rating TINYINT DEFAULT 5,
      is_approved TINYINT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
    )`);
    console.log('✅ Created blog_comments table');

    // 2. Add more promotional articles
    const promoArticles = [
      {
        slug: 'thanh-thao-tieng-anh-30-ngay-voi-eagle-english',
        title: 'Thành Thạo Tiếng Anh Trong 30 Ngày Với Eagle English - Bí Quyết Từ Hàng Nghìn Người Đã Thành Công',
        meta_description: 'Phương pháp học tiếng Anh cực hiệu quả giúp bạn tự tin giao tiếp sau 30 ngày. Eagle English - nền tảng học tiếng Anh miễn phí #1 Việt Nam.',
        meta_keywords: 'thành thạo tiếng anh 30 ngày, học tiếng anh nhanh, eagle english review',
        category: 'feature',
        content: `<h2>🚀 30 Ngày - Từ "Xin Chào" Đến Tự Tin Giao Tiếp</h2>
<p>Nghe có vẻ không thể? Nhưng với <strong>phương pháp học được thiết kế khoa học</strong> của Eagle English, hàng nghìn người Việt đã chứng minh điều này hoàn toàn khả thi!</p>

<h2>Tại Sao Eagle English Khác Biệt?</h2>

<h3>🎯 Nội Dung Cá Nhân Hóa Theo Nghề Nghiệp</h3>
<p>Không giống các app khác dạy chung chung, Eagle English có <strong>11 chủ đề chuyên biệt</strong>:</p>
<ul>
<li>💻 <strong>Developer</strong> - Từ vựng về Algorithms, Database, Cloud, Backend, Frontend</li>
<li>🧪 <strong>Tester/QA</strong> - Testing, Automation, Bug Report, CI/CD</li>
<li>📊 <strong>BA</strong> - Requirements, Stakeholder, Process, Agile</li>
<li>⚙️ <strong>DevOps/SRE</strong> - Docker, Kubernetes, Monitoring, CI/CD</li>
<li>🖥️ <strong>SysAdmin</strong> - Networking, Security, Server, Linux</li>
<li>📱 <strong>PO</strong> - Product, Strategy, Roadmap, Backlog</li>
<li>🎨 <strong>UI/UX Designer</strong> - Design, Prototyping, Typography</li>
<li>🎓 <strong>Sinh viên</strong> - Academic, Campus Life, Career</li>
<li>💼 <strong>Người đi làm</strong> - Business, Meeting, Email, Finance</li>
<li>👶 <strong>Trẻ em</strong> - Animals, Colors, Family, School</li>
<li>🌍 <strong>General</strong> - Daily Life, Travel, Food, Nature</li>
</ul>

<h3>🤖 AI Pronunciation Check</h3>
<p>Hệ thống <strong>Speech Recognition AI</strong> kiểm tra phát âm của bạn theo thời gian thực. Bạn nói, AI chấm điểm ngay lập tức. Không cần thuê thầy giáo!</p>

<h3>📚 5000+ Từ Vựng Chuyên Ngành</h3>
<p>Mỗi ngày 10-15 từ mới với flashcard, ví dụ thực tế, và bài tập ôn tập. Sau 30 ngày bạn sẽ nắm vững <strong>300-450 từ vựng chuyên ngành</strong>!</p>

<h3>📖 Luyện Đủ 4 Kỹ Năng</h3>
<p><strong>Reading</strong> - Đọc hiểu bài viết theo chủ đề. <strong>Listening</strong> - Nghe hội thoại với nhiều giọng khác nhau. <strong>Speaking</strong> - Luyện nói với AI. <strong>Writing</strong> - Viết và được chấm điểm tự động.</p>

<h2>📅 Lộ Trình 30 Ngày Chi Tiết</h2>
<table>
<tr><th>Tuần</th><th>Mục Tiêu</th><th>Hoạt Động</th></tr>
<tr><td>Tuần 1</td><td>Xây nền tảng từ vựng</td><td>Học 15 từ/ngày, nghe dialogue cơ bản</td></tr>
<tr><td>Tuần 2</td><td>Luyện đọc & nghe</td><td>Đọc passages, nghe dialogues chuyên ngành</td></tr>
<tr><td>Tuần 3</td><td>Luyện nói & phát âm</td><td>Practice speaking với AI, pronunciation check</td></tr>
<tr><td>Tuần 4</td><td>Tổng hợp & writing</td><td>Viết email, báo cáo bằng tiếng Anh</td></tr>
</table>

<h2>💬 Người Dùng Nói Gì?</h2>
<blockquote>"Tôi là developer 5 năm kinh nghiệm nhưng tiếng Anh rất kém. Sau 30 ngày dùng Eagle English, tôi đã tự tin phỏng vấn ở công ty nước ngoài!" - <strong>Minh Tuấn, Backend Developer</strong></blockquote>
<blockquote>"Nội dung phù hợp cho tester như mình. Từ vựng thực tế, không lan man!" - <strong>Thu Hà, QA Engineer</strong></blockquote>

<h2>🎉 Bắt Đầu Ngay - Hoàn Toàn Miễn Phí!</h2>
<p><a href="https://engfordev.top">👉 Đăng ký Eagle English ngay hôm nay!</a> Không cần thẻ tín dụng, không giới hạn thời gian. Chỉ cần 15 phút mỗi ngày!</p>`
      },
      {
        slug: 'review-eagle-english-nen-tang-hoc-tieng-anh-mien-phi',
        title: 'Review Eagle English: Nền Tảng Học Tiếng Anh Miễn Phí Tốt Nhất Cho Dân IT?',
        meta_description: 'Đánh giá chi tiết Eagle English - nền tảng tự học tiếng Anh miễn phí cho developer, tester, người đi làm. So sánh với Duolingo, ELSA.',
        meta_keywords: 'review eagle english, đánh giá eagle english, so sánh eagle english duolingo',
        category: 'review',
        content: `<h2>Eagle English Là Gì?</h2>
<p><a href="https://engfordev.top"><strong>Eagle English</strong></a> là một nền tảng <strong>tự học tiếng Anh trực tuyến hoàn toàn miễn phí</strong>, được thiết kế đặc biệt cho cộng đồng IT và người đi làm tại Việt Nam.</p>

<h2>⭐ Điểm Nổi Bật</h2>

<h3>1. Nội Dung Chuyên Biệt - 10/10</h3>
<p>Điều khiến Eagle English khác biệt hoàn toàn so với Duolingo hay ELSA là <strong>nội dung được thiết kế riêng cho từng nghề nghiệp</strong>. Developer học từ vựng về algorithm, database. Tester học về testing, automation. BA học về requirements, stakeholder.</p>

<h3>2. AI Pronunciation - 9/10</h3>
<p>Tính năng kiểm tra phát âm bằng AI rất chính xác. Bạn chỉ cần nhấn mic, nói, và nhận điểm ngay. Phù hợp cho những ai cân prep phỏng vấn.</p>

<h3>3. Luyện 4 Kỹ Năng - 9/10</h3>
<p>Reading, Listening, Speaking, Writing đều có. Hội thoại Listening có nhiều giọng nói khác nhau rất tự nhiên.</p>

<h3>4. Miễn Phí 100% - 10/10</h3>
<p>Không quảng cáo, không giới hạn bài học, không paywall. Hoàn toàn miễn phí!</p>

<h2>📊 So Sánh Với Các App Khác</h2>
<table>
<tr><th>Tính năng</th><th>Eagle English</th><th>Duolingo</th><th>ELSA</th></tr>
<tr><td>Miễn phí</td><td>✅ 100%</td><td>⚠️ Có quảng cáo</td><td>❌ Premium</td></tr>
<tr><td>Nội dung IT</td><td>✅ 11 chủ đề</td><td>❌ Không</td><td>❌ Không</td></tr>
<tr><td>4 kỹ năng</td><td>✅</td><td>✅</td><td>⚠️ Chỉ speaking</td></tr>
<tr><td>AI Pronunciation</td><td>✅</td><td>❌</td><td>✅</td></tr>
<tr><td>Phỏng vấn IT</td><td>✅</td><td>❌</td><td>❌</td></tr>
</table>

<h2>🏆 Kết Luận: 9.5/10</h2>
<p>Eagle English là <strong>lựa chọn tốt nhất cho dân IT và người đi làm</strong> muốn học tiếng Anh miễn phí. Nội dung chuyên biệt, AI hiện đại, và hoàn toàn free!</p>
<p><a href="https://engfordev.top"><strong>👉 Trải nghiệm ngay tại engfordev.top</strong></a></p>`
      },
      {
        slug: 'tieng-anh-cho-tre-em-hoc-vui-moi-ngay',
        title: 'Tiếng Anh Cho Trẻ Em: Phương Pháp Học Vui Mỗi Ngày Tại Nhà',
        meta_description: 'Hướng dẫn dạy tiếng Anh cho trẻ em tại nhà miễn phí. Phương pháp học qua chơi, từ vựng theo chủ đề, phát âm chuẩn.',
        meta_keywords: 'tiếng anh cho trẻ em, dạy tiếng anh trẻ em tại nhà, tiếng anh trẻ em miễn phí',
        category: 'kids',
        content: `<h2>Tại Sao Nên Cho Trẻ Học Tiếng Anh Sớm?</h2>
<p>Nghiên cứu cho thấy trẻ em học ngôn ngữ thứ hai <strong>nhanh gấp 3-4 lần người lớn</strong>. Giai đoạn 3-12 tuổi là "cửa sổ vàng" để tiếp thu ngoại ngữ.</p>

<h2>Eagle English Cho Trẻ Em Có Gì?</h2>
<ul>
<li>🐱 <strong>Từ vựng Animals</strong> - Dog, Cat, Bird, Fish... kèm hình ảnh sinh động</li>
<li>🎨 <strong>Colors</strong> - Red, Blue, Green... qua bài tập tương tác</li>
<li>👨‍👩‍👧 <strong>Family</strong> - Mom, Dad, Brother, Sister</li>
<li>🏫 <strong>School</strong> - Book, Pen, Teacher, Classroom</li>
<li>🍕 <strong>Food</strong> - Apple, Banana, Rice, Milk</li>
</ul>

<h3>Phát Âm Chuẩn Với AI</h3>
<p>Trẻ nhấn mic, đọc từ vựng, AI chấm điểm. Phát âm sai sẽ được hướng dẫn đọc lại. Giống có một <strong>giáo viên riêng 24/7</strong>!</p>

<h2>Lịch Học Gợi Ý Cho Bé</h2>
<ul>
<li>🌅 <strong>Sáng (10 phút):</strong> Học 5 từ vựng mới</li>
<li>🌆 <strong>Chiều (10 phút):</strong> Ôn từ cũ + luyện phát âm</li>
<li>🌙 <strong>Tối (5 phút):</strong> Nghe câu chuyện tiếng Anh</li>
</ul>

<p><strong>Hoàn toàn miễn phí!</strong> Đăng ký cho bé tại <a href="https://engfordev.top">Eagle English</a>!</p>`
      },
      {
        slug: 'mastering-it-english-dictation-nghe-chep-chinh-ta',
        title: 'Mastering IT English with Dictation / Bí Quyết Luyện Nghe Chép Chính Tả Cho Dân IT',
        meta_description: 'Phương pháp luyện nghe chép chính tả (dictation) dành riêng cho dân IT. Nâng cao kỹ năng nghe tiếng Anh với Eagle English. / Improve your IT English listening with our new Dictation tool.',
        meta_keywords: 'nghe chép chính tả, dictation, luyện nghe tiếng anh, IT english listening, english for developers',
        category: 'features',
        content: `<div class="lang-en">
  <h2>🎧 Why Dictation is the Ultimate Listening Hack</h2>
  <p>Dictation is the process of listening to an audio clip and writing down exactly what you hear. For IT professionals, who often join meetings with international teams, catching every single technical term is crucial. It forces your brain to recognize word boundaries, connected speech, and subtle grammatical structures.</p>
</div>
<div class="lang-vi" style="display:none;">
  <h2>🎧 Tại sao Nghe Chép Chính Tả là phương pháp luyện nghe tốt nhất?</h2>
  <p>Nghe chép chính tả (Dictation) là quá trình nghe một đoạn âm thanh và viết lại chính xác những gì bạn nghe được. Đối với dân IT thường xuyên họp với các team quốc tế, việc bắt kịp từng thuật ngữ kỹ thuật là vô cùng quan trọng. Phương pháp này ép bộ não của bạn phải nhận diện được ranh giới các từ, hiện tượng nối âm và các cấu trúc ngữ pháp tinh tế.</p>
</div>

<div class="lang-en">
  <h2>🚀 Introducing Dictation on Eagle English</h2>
  <p>We just launched a specialized Dictation feature tailored for Developers, Testers, and IT Pros. Instead of random sentences, you will listen to real-world IT scenarios: Daily Standups, Code Reviews, and Bug Reports. The system auto-checks your typing, highlights mistakes in <span style="color:#ef4444">red</span>, and scores your accuracy instantly!</p>
</div>
<div class="lang-vi" style="display:none;">
  <h2>🚀 Giới thiệu tính năng Dictation trên Eagle English</h2>
  <p>Chúng tôi vừa ra mắt tính năng Dictation chuyên biệt dành riêng cho Developers, Testers và chuyên gia IT. Thay vì nghe những câu ngẫu nhiên, bạn sẽ được nghe các tình huống thực tế trong môi trường IT: Họp Daily Standup, Code Review và Báo Cáo Bug. Hệ thống tự động kiểm tra lỗi chính tả của bạn, bôi <span style="color:#ef4444">đỏ</span> những chỗ sai và chấm điểm chính xác ngay lập tức!</p>
</div>

<div class="lang-en">
  <h2>💡 How to practice effectively</h2>
  <ul>
    <li><strong>Step 1:</strong> Listen to the whole sentence without typing to catch the main idea.</li>
    <li><strong>Step 2:</strong> Re-listen to smaller chunks and start typing.</li>
    <li><strong>Step 3:</strong> Don't panic if you miss a word. Press "Check" to see your mistakes and learn from them!</li>
  </ul>
  <p><a href="https://engfordev.top">👉 Try the exact IT Dictation tool now at Eagle English!</a></p>
</div>
<div class="lang-vi" style="display:none;">
  <h2>💡 Cách luyện tập hiệu quả</h2>
  <ul>
    <li><strong>Bước 1:</strong> Nghe toàn bộ câu mà không gõ phím để nắm đại ý.</li>
    <li><strong>Bước 2:</strong> Nghe lại từng đoạn nhỏ và bắt đầu gõ.</li>
    <li><strong>Bước 3:</strong> Đừng hoảng sợ nếu lỡ sót một từ. Hãy ấn "Kiểm Tra" để xem lỗi sai và học từ đó!</li>
  </ul>
  <p><a href="https://engfordev.top">👉 Thử ngay công cụ Dictation chuyên IT tại Eagle English!</a></p>
</div>`
      },
      {
        slug: 'learn-english-with-youtube-dual-subtitles-hoc-tieng-anh-qua-video-song-ngu',
        title: 'Learn IT English smoothly with YouTube Dual Subtitles / Học Tiếng Anh Qua Video Youtube Song Ngữ',
        meta_description: 'Học tiếng Anh IT qua video YouTube với phụ đề song ngữ Anh-Việt đồng bộ theo thời gian thực (real-time). / Learn IT English via YouTube videos with real-time En-Vi dual subtitles.',
        meta_keywords: 'học tiếng Anh qua video, youtube dual subtitles, phụ đề song ngữ, video listening it, english conversations',
        category: 'features',
        content: `<div class="lang-en">
  <h2>📺 Learning through Real Tech Talks</h2>
  <p>Textbook English is often very different from how engineers actually speak in the workplace. To bridge this gap, Eagle English introduces the new <strong>Video Learning</strong> feature. It seamlessly integrates the best IT interviews, tech talks, and tech-company daily standups directly from YouTube!</p>
</div>
<div class="lang-vi" style="display:none;">
  <h2>📺 Học tiếng Anh qua các cuộc hội thoại công nghệ thực tế</h2>
  <p>Tiếng Anh trong sách giáo khoa thường rất khác so với cách các kỹ sư thực sự giao tiếp ở nơi làm việc. Để thu hẹp khoảng cách này, Eagle English giới thiệu tính năng <strong>Video Learning (Học qua Video)</strong> mới. Tính năng này tích hợp mượt mà các buổi phỏng vấn IT đỉnh nhất, các bài thuyết trình công nghệ và các cuộc họp hằng ngày tại các công ty công nghệ trực tiếp từ YouTube!</p>
</div>

<div class="lang-en">
  <h2>🔥 The Magic of Real-Time Dual Subtitles</h2>
  <p>What makes this feature so powerful? Every video comes with perfectly synced dual subtitles (English + Vietnamese). As the speaker talks, the exact sentence is highlighted. This approach is highly inspired by the famous "StudyPhim" methodology!</p>
  <ul>
    <li>📝 <strong>Interactive Transcripts:</strong> Click on any sentence in the transcript to instantly jump the video to that exact timestamp!</li>
    <li>⚡ <strong>Playback Control:</strong> Too fast? Slow the speaker down to 0.75x or rewind 5 seconds easily.</li>
    <li>🧠 <strong>Deep Context:</strong> You learn exactly how native speakers use idioms and tech jargon in real arguments.</li>
  </ul>
  <p>Start watching real tech conversations today and skyrocket your listening skills!</p>
  <p><a href="https://engfordev.top">👉 Access free Video Learning at Eagle English!</a></p>
</div>
<div class="lang-vi" style="display:none;">
  <h2>🔥 Điều kỳ diệu của phụ đề song ngữ Real-Time</h2>
  <p>Điều gì khiến tính năng này mạnh mẽ đến vậy? Mỗi video đều đi kèm với phụ đề song ngữ (Anh + Việt) được đồng bộ hoàn hảo. Khi người dùng nói đến đâu, câu đó sẽ được highlight sáng lên. Phương pháp này được truyền cảm hứng rất lớn từ phương pháp học qua phim nổi tiếng của "StudyPhim"!</p>
  <ul>
    <li>📝 <strong>Bảng phụ đề tương tác:</strong> Nhấp vào bất kỳ câu nào trong bảng phụ đề để tua video đến đúng thời điểm đó!</li>
    <li>⚡ <strong>Tùy chỉnh tốc độ:</strong> Quá nhanh? Giảm tốc độ người nói xuống 0.75x hoặc tua lại 5 giây dễ dàng.</li>
    <li>🧠 <strong>Hiểu sâu ngữ cảnh:</strong> Bạn học được chính xác cách người bản xứ sử dụng thành ngữ và từ lóng công nghệ trong các cuộc thảo luận thực tế.</li>
  </ul>
  <p>Bắt đầu xem các cuộc hội thoại công nghệ thực tế ngay hôm nay và nâng cao kỹ năng nghe của bạn một cách chóng mặt!</p>
  <p><a href="https://engfordev.top">👉 Truy cập hệ thống Video miễn phí tại Eagle English!</a></p>
</div>`
      }
    ];

    for (const a of promoArticles) {
      const existing = await query('SELECT id FROM blog_posts WHERE slug = ?', [a.slug]);
      if (!existing.length) {
        await query('INSERT INTO blog_posts (slug, title, meta_description, meta_keywords, category, content, author) VALUES (?,?,?,?,?,?,?)',
          [a.slug, a.title, a.meta_description, a.meta_keywords, a.category, a.content, 'Eagle English']);
        console.log(`  📝 ${a.slug}`);
      }
    }

    // 3. Create fake review accounts
    const reviewers = [
      { name: 'Minh Tuấn', username: 'minhtuan_dev', password: 'eagle2024' },
      { name: 'Thu Hà', username: 'thuha_qa', password: 'eagle2024' },
      { name: 'Hoàng Nam', username: 'hoangnam_ba', password: 'eagle2024' },
      { name: 'Phương Anh', username: 'phuonganh_student', password: 'eagle2024' },
      { name: 'Đức Trung', username: 'ductrung_devops', password: 'eagle2024' },
      { name: 'Lan Chi', username: 'lanchi_parent', password: 'eagle2024' },
    ];

    const createdUsers = [];
    for (const r of reviewers) {
      const existing = await query('SELECT id FROM users WHERE username = ?', [r.username]);
      if (existing.length) {
        createdUsers.push({ ...r, id: existing[0].id });
      } else {
        const hash = await bcrypt.hash(r.password, 10);
        const uuid = crypto.randomUUID();
        await query('INSERT INTO users (id, display_name, username, password, english_level) VALUES (?,?,?,?,?)',
          [uuid, r.name, r.username, hash, 'Intermediate']);
        createdUsers.push({ ...r, id: uuid });
      }
      console.log(`  👤 ${r.name} (${r.username})`);
    }

    // 4. Get all blog posts
    const posts = await query('SELECT id, slug FROM blog_posts');

    // 5. Seed 5-star reviews
    const reviews = [
      // Reviews for article 1 (tu-hoc-tieng-anh-cho-developer)
      { author: 'Minh Tuấn', rating: 5, content: 'Bài viết rất chi tiết! Mình là backend dev 3 năm, tiếng Anh kém lắm. Đọc xong bài này mình đăng ký Eagle English luôn. Học được 2 tuần rồi, từ vựng IT cải thiện rõ rệt. 10 điểm!' },
      { author: 'Hoàng Nam', rating: 5, content: 'Lộ trình rất rõ ràng và thực tế. Mình đã thử nhiều app nhưng Eagle English là cái phù hợp nhất cho dân IT. Nội dung chuyên ngành, không lan man.' },
      
      // Reviews for promo article
      { author: 'Thu Hà', rating: 5, content: 'Mình là QA Engineer, dùng Eagle English 1 tháng rồi. Từ vựng testing, automation chuẩn xác. AI pronunciation giúp mình tự tin hơn rất nhiều khi nói tiếng Anh trong daily standup. ⭐⭐⭐⭐⭐' },
      { author: 'Đức Trung', rating: 5, content: 'DevOps ở đây! Từ vựng Docker, Kubernetes, CI/CD có hết. Mình phỏng vấn ở Grab Singapore vòng tiếng Anh thành công nhờ luyện trên Eagle English. Recommend 100%!' },
      { author: 'Phương Anh', rating: 5, content: 'Sinh viên CNTT năm 3, tiếng Anh mất gốc hoàn toàn. Dùng Eagle English 3 tuần, giờ đã đọc được documentation không cần Google Translate nữa. App tuyệt vời!' },
      { author: 'Lan Chi', rating: 5, content: 'Cho con gái 8 tuổi học phần trẻ em. Bé rất thích vì có từ vựng Animals, Colors sinh động. Phát âm AI giúp bé nói chuẩn hơn nhiều. Cảm ơn Eagle English! 🌟' },
      
      // More reviews
      { author: 'Minh Tuấn', rating: 5, content: 'Update: Sau 30 ngày dùng Eagle English, mình đã pass phỏng vấn tiếng Anh ở FPT Software! Lương tăng 30%. Cảm ơn Eagle English rất nhiều!' },
      { author: 'Hoàng Nam', rating: 5, content: 'Tính năng phỏng vấn IT thật sự xuất sắc. Mình luyện trên đây rồi đi phỏng vấn thật, câu hỏi rất giống. BA mà biết tiếng Anh thì lương khác hẳn!' },
    ];

    for (let i = 0; i < reviews.length; i++) {
      const r = reviews[i];
      const user = createdUsers.find(u => u.name === r.author);
      const post = posts[i % posts.length];
      
      const existing = await query('SELECT id FROM blog_comments WHERE post_id = ? AND author_name = ? AND content = ?', [post.id, r.author, r.content]);
      if (!existing.length) {
        await query('INSERT INTO blog_comments (post_id, user_id, author_name, content, rating) VALUES (?,?,?,?,?)',
          [post.id, user?.id || null, r.author, r.content, r.rating]);
        console.log(`  💬 ${r.author} → ${post.slug} (${r.rating}⭐)`);
      }
    }

    console.log('\n✅ All reviews and promo articles seeded!');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

seedReviews();
